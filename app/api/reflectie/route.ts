export const dynamic = "force-dynamic";
export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { openai, AI_MODEL, buildReflectiePrompt, EerdereFase, ThemaId, THEMAS, FaseType } from "@/lib/ai";
import { db } from "@/lib/db";
import { fases, sessies } from "@/lib/db/schema";
import { and, eq, lt } from "drizzle-orm";
import { stripBase64Prefix } from "@/lib/utils";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { ok } = checkRateLimit(`reflectie:${userId}`, 20, 60 * 60 * 1000); // 20 per uur per gebruiker
  if (!ok) return NextResponse.json({ error: "Te veel pogingen. Probeer later opnieuw." }, { status: 429 });

  const { sessieId, faseId, fotoBase64, zijfotoBase64, beschrijving, probeVraag, probeAntwoord } = await req.json();

  const [sessie] = await db.select().from(sessies).where(and(eq(sessies.id, sessieId), eq(sessies.userId, userId)));
  const [fase] = await db.select().from(fases).where(and(eq(fases.id, faseId), eq(fases.sessieId, sessieId)));

  if (!sessie || !fase) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  const eerdereFasesRaw = fase.faseNummer > 1
    ? await db
        .select()
        .from(fases)
        .where(and(eq(fases.sessieId, sessieId), lt(fases.faseNummer, fase.faseNummer)))
        .orderBy(fases.faseNummer)
    : [];

  const eerdereFases: EerdereFase[] = eerdereFasesRaw
    .filter((f) => f.aiReflectie)
    .map((f) => ({
      faseNummer: f.faseNummer,
      faseTitel: f.faseTitel,
      beschrijving: f.gebruikersBeschrijving || "",
      aiReflectie: f.aiReflectie || "",
    }));

  // Sla foto's op vóór AI-call zodat data nooit verloren gaat
  await db
    .update(fases)
    .set({ fotoBase64, zijfotoBase64: zijfotoBase64 || null, gebruikersBeschrijving: beschrijving })
    .where(eq(fases.id, faseId));

  const themaConfig = THEMAS[sessie.thema as ThemaId];
  const faseType = (themaConfig.faseTypes[fase.faseNummer - 1] ?? "situatie") as FaseType;

  const prompt = buildReflectiePrompt(
    sessie.thema as ThemaId,
    sessie.aiSessieContext || "",
    fase.faseNummer,
    fase.faseTitel,
    fase.vraag,
    beschrijving,
    eerdereFases,
    faseType,
    probeVraag,
    probeAntwoord
  );

  const imageData = stripBase64Prefix(fotoBase64);
  const mediaType = fotoBase64.startsWith("data:image/png") ? "image/png" : "image/jpeg";

  type ContentPart =
    | { type: "image_url"; image_url: { url: string } }
    | { type: "text"; text: string };

  const imageContent: ContentPart[] = [
    { type: "image_url", image_url: { url: `data:${mediaType};base64,${imageData}` } },
  ];

  if (zijfotoBase64) {
    const zijImageData = stripBase64Prefix(zijfotoBase64);
    const zijMediaType = zijfotoBase64.startsWith("data:image/png") ? "image/png" : "image/jpeg";
    imageContent.push({ type: "image_url", image_url: { url: `data:${zijMediaType};base64,${zijImageData}` } });
  }

  imageContent.push({ type: "text", text: prompt });

  let volledigeTekst = "";
  try {
    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      max_tokens: 600,
      messages: [
        {
          role: "user",
          content: imageContent,
        },
      ],
    });
    volledigeTekst = response.choices[0]?.message?.content ?? "";
  } catch (err) {
    console.error("[reflectie] AI call mislukt:", err);
    return NextResponse.json({ error: "AI tijdelijk niet beschikbaar. Probeer opnieuw." }, { status: 503 });
  }

  const delen = volledigeTekst.split(/\n\n+/);
  const aiReflectie = delen.slice(0, -1).join("\n\n").trim() || volledigeTekst.trim();
  const aiVervolgvraag = delen.length > 1 ? (delen[delen.length - 1]?.trim() || "") : "";

  await db
    .update(fases)
    .set({ aiReflectie, aiVervolgvraag })
    .where(eq(fases.id, faseId));

  return NextResponse.json({ aiReflectie, aiVervolgvraag });
}
