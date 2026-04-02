import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { openai, AI_MODEL, buildRapportPrompt, ThemaId } from "@/lib/ai";
import { db } from "@/lib/db";
import { sessies, fases, rapporten } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { sessieId } = await req.json();

  const [sessie] = await db.select().from(sessies).where(eq(sessies.id, sessieId));
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

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  const tekst = response.choices[0]?.message?.content ?? "{}";

  let parsed = { samenvatting: "", inzichten: [], eersteStap: "" };
  try {
    const jsonMatch = tekst.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  } catch {}

  // Sla rapport op
  const [rapport] = await db
    .insert(rapporten)
    .values({
      sessieId,
      samenvattingTekst: parsed.samenvatting,
      inzichten: parsed.inzichten,
      eersteStap: parsed.eersteStap,
    })
    .onConflictDoUpdate({
      target: rapporten.sessieId,
      set: {
        samenvattingTekst: parsed.samenvatting,
        inzichten: parsed.inzichten,
        eersteStap: parsed.eersteStap,
      },
    })
    .returning();

  // Update sessie status
  await db
    .update(sessies)
    .set({ status: "voltooid", voltooidOp: new Date() })
    .where(eq(sessies.id, sessieId));

  return NextResponse.json({
    themaLabel: sessie.themaLabel,
    stemmingVoor: sessie.stemmingVoor,
    samenvatting: parsed.samenvatting,
    inzichten: parsed.inzichten,
    eersteStap: parsed.eersteStap,
    fases: fasesData.map((f) => ({
      faseTitel: f.faseTitel,
      fotoBase64: f.fotoBase64,
      aiReflectie: f.aiReflectie,
    })),
    aangemaktOp: sessie.aangemaktOp,
  });
}
