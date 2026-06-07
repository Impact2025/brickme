export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { openai, AI_MODEL, buildRapportPrompt, buildVergelijkingPrompt, ThemaId, VorigeSessieRapport } from "@/lib/ai";
import { db } from "@/lib/db";
import { sessies, fases, rapporten, gebruikers, followupEmails } from "@/lib/db/schema";
import { sendRapportGereedEmail } from "@/lib/email";
import { and, eq } from "drizzle-orm";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { ok } = checkRateLimit(`rapport:${userId}`, 10, 60 * 60 * 1000); // 10 per uur per gebruiker
  if (!ok) return NextResponse.json({ error: "Te veel pogingen. Probeer later opnieuw." }, { status: 429 });

  const { sessieId } = await req.json();

  const [sessie] = await db.select().from(sessies).where(and(eq(sessies.id, sessieId), eq(sessies.userId, userId)));
  if (!sessie) return NextResponse.json({ error: "Sessie niet gevonden" }, { status: 404 });

  const fasesData = await db
    .select()
    .from(fases)
    .where(eq(fases.sessieId, sessieId))
    .orderBy(fases.faseNummer);

  const fasesVoorPrompt = fasesData.map((f) => ({
    titel: f.faseTitel,
    vraag: f.vraag,
    beschrijving: f.gebruikersBeschrijving || "",
    reflectie: f.aiReflectie || "",
    antwoord: f.gebruikersAntwoord || "",
  }));

  const prompt = buildRapportPrompt(
    sessie.thema as ThemaId,
    sessie.aiSessieContext || "",
    fasesVoorPrompt
  );

  // Vorige sessie ophalen voor vergelijking (terugkeersessie)
  let vorigeSessieRapport: VorigeSessieRapport | null = null;
  if (sessie.vorigeSessieId) {
    const [vorigeRapport] = await db
      .select()
      .from(rapporten)
      .where(eq(rapporten.sessieId, sessie.vorigeSessieId))
      .limit(1);
    const [vorigeSessie] = await db
      .select({ themaLabel: sessies.themaLabel, voltooidOp: sessies.voltooidOp })
      .from(sessies)
      .where(eq(sessies.id, sessie.vorigeSessieId))
      .limit(1);

    if (vorigeRapport && vorigeSessie) {
      vorigeSessieRapport = {
        themaLabel: vorigeSessie.themaLabel,
        samenvatting: vorigeRapport.samenvattingTekst ?? "",
        inzichten: Array.isArray(vorigeRapport.inzichten) ? vorigeRapport.inzichten as string[] : [],
        eersteStap: vorigeRapport.eersteStap ?? "",
        voltooidOp: vorigeSessie.voltooidOp
          ? new Date(vorigeSessie.voltooidOp).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })
          : "eerder",
      };
    }
  }

  let tekst = "{}";
  try {
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });
    tekst = response.choices[0]?.message?.content ?? "{}";
  } catch (err) {
    console.error("[rapport] AI call mislukt:", err);
    return NextResponse.json({ error: "AI tijdelijk niet beschikbaar. Probeer opnieuw." }, { status: 503 });
  }

  let parsed = { samenvatting: "", inzichten: [] as string[], eersteStap: "" };
  try {
    const jsonMatch = tekst.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  } catch {}

  // Vergelijkingstekst genereren voor terugkeersessie
  let vergelijkingTekst: string | null = null;
  if (vorigeSessieRapport && parsed.samenvatting) {
    try {
      const vergelijkingPrompt = buildVergelijkingPrompt(
        parsed.samenvatting,
        Array.isArray(parsed.inzichten) ? parsed.inzichten : [],
        parsed.eersteStap,
        vorigeSessieRapport
      );
      const vergResponse = await openai.chat.completions.create({
        model: AI_MODEL,
        max_tokens: 300,
        messages: [{ role: "user", content: vergelijkingPrompt }],
      });
      vergelijkingTekst = vergResponse.choices[0]?.message?.content ?? null;
    } catch (err) {
      console.error("[rapport] vergelijking genereren mislukt:", err);
    }
  }

  const [rapport] = await db
    .insert(rapporten)
    .values({
      sessieId,
      samenvattingTekst: parsed.samenvatting,
      inzichten: parsed.inzichten,
      eersteStap: parsed.eersteStap,
      vergelijkingTekst,
    })
    .onConflictDoUpdate({
      target: rapporten.sessieId,
      set: {
        samenvattingTekst: parsed.samenvatting,
        inzichten: parsed.inzichten,
        eersteStap: parsed.eersteStap,
        vergelijkingTekst,
      },
    })
    .returning();

  void rapport;

  await db
    .update(sessies)
    .set({ status: "voltooid", voltooidOp: new Date() })
    .where(eq(sessies.id, sessieId));

  const [gebruiker] = await db
    .select({ email: gebruikers.email, naam: gebruikers.naam })
    .from(gebruikers)
    .where(eq(gebruikers.userId, userId))
    .limit(1);

  if (gebruiker?.email) {
    void sendRapportGereedEmail(
      gebruiker.email,
      gebruiker.naam ?? "",
      sessie.themaLabel,
      parsed.samenvatting,
      parsed.eersteStap,
      Array.isArray(parsed.inzichten) ? parsed.inzichten : []
    );
  }

  // Follow-up e-mails inplannen
  const nu = new Date();
  const followups: typeof followupEmails.$inferInsert[] = [
    {
      sessieId,
      userId,
      type: "dag3",
      geplandVoor: new Date(nu.getTime() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      sessieId,
      userId,
      type: "dag21",
      geplandVoor: new Date(nu.getTime() + 21 * 24 * 60 * 60 * 1000),
    },
  ];

  // Terugkeersessie uitnodiging op dag 42 (alleen voor abonnees)
  const gebruikerData = await db
    .select({ abonnementStatus: gebruikers.abonnementStatus })
    .from(gebruikers)
    .where(eq(gebruikers.userId, userId))
    .limit(1);
  if (gebruikerData[0]?.abonnementStatus === "actief") {
    followups.push({
      sessieId,
      userId,
      type: "terugkeer",
      geplandVoor: new Date(nu.getTime() + 42 * 24 * 60 * 60 * 1000),
    });
  }

  void db.insert(followupEmails).values(followups).onConflictDoNothing();

  return NextResponse.json({
    themaLabel: sessie.themaLabel,
    stemmingVoor: sessie.stemmingVoor,
    stemmingNa: sessie.stemmingNa,
    samenvatting: parsed.samenvatting,
    inzichten: parsed.inzichten,
    eersteStap: parsed.eersteStap,
    vergelijkingTekst,
    isTerugkeer: !!sessie.vorigeSessieId,
    fases: fasesData.map((f) => ({
      faseTitel: f.faseTitel,
      fotoBase64: f.fotoBase64,
      aiReflectie: f.aiReflectie,
    })),
    aangemaktOp: sessie.aangemaktOp,
  });
}
