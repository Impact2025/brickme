import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { openai, AI_MODEL, buildReflectiePrompt, EerdereFase, ThemaId } from "@/lib/ai";
import { db } from "@/lib/db";
import { fases, sessies } from "@/lib/db/schema";
import { and, eq, lt } from "drizzle-orm";
import { stripBase64Prefix } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { sessieId, faseId, fotoBase64, beschrijving } = await req.json();

  // Laad sessie + fase
  const [sessie] = await db
    .select()
    .from(sessies)
    .where(eq(sessies.id, sessieId));

  const [fase] = await db
    .select()
    .from(fases)
    .where(eq(fases.id, faseId));

  if (!sessie || !fase) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  // Laad voltooide eerdere fases voor kruisverband-context
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

  // Sla foto op in DB
  await db
    .update(fases)
    .set({ fotoBase64, gebruikersBeschrijving: beschrijving })
    .where(eq(fases.id, faseId));

  // Bouw de prompt
  const prompt = buildReflectiePrompt(
    sessie.thema as ThemaId,
    sessie.aiSessieContext || "",
    fase.faseNummer,
    fase.faseTitel,
    fase.vraag,
    beschrijving,
    eerdereFases
  );

  // Stuur naar OpenRouter Vision
  const imageData = stripBase64Prefix(fotoBase64);
  const mediaType = fotoBase64.startsWith("data:image/png") ? "image/png" : "image/jpeg";

  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    max_tokens: 600,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${mediaType};base64,${imageData}` },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const volledigeTekst = response.choices[0]?.message?.content ?? "";

  // Splits reflectie en vervolgvraag (gescheiden door lege regel + vraagteken)
  const delen = volledigeTekst.split(/\n\n+/);
  const aiReflectie = delen.slice(0, -1).join("\n\n").trim();
  const aiVervolgvraag = delen[delen.length - 1]?.trim() || "";

  // Sla op
  await db
    .update(fases)
    .set({ aiReflectie, aiVervolgvraag })
    .where(eq(fases.id, faseId));

  return NextResponse.json({ aiReflectie, aiVervolgvraag });
}
