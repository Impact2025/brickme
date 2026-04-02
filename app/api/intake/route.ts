import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { openai, AI_MODEL, buildIntakeSystemPrompt, THEMAS, ThemaId } from "@/lib/ai";
import { db } from "@/lib/db";
import { sessies, fases } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { themaId, berichten, fase } = await req.json();
  const thema = THEMAS[themaId as ThemaId];
  if (!thema) return NextResponse.json({ error: "Ongeldig thema" }, { status: 400 });

  // Eerste bericht van AI
  if (fase === "start" || berichten.length === 0) {
    return NextResponse.json({
      bericht: "Hoe lang loop je hier al mee?",
    });
  }

  // Vertaal berichten naar OpenAI formaat
  const messages = berichten.map((b: { rol: string; inhoud: string }) => ({
    role: b.rol === "ai" ? "assistant" : "user",
    content: b.inhoud,
  }));

  let response;
  try {
    response = await openai.chat.completions.create({
      model: AI_MODEL,
      max_tokens: 500,
      messages: [
        { role: "system", content: buildIntakeSystemPrompt(themaId as ThemaId) },
        ...messages,
      ],
    });
  } catch (err) {
    console.error("[intake] AI call mislukt:", err);
    return NextResponse.json({ error: "AI tijdelijk niet beschikbaar. Probeer opnieuw." }, { status: 503 });
  }

  const tekst = response.choices[0]?.message?.content ?? "";

  // Check of intake klaar is
  let klaar = false;
  let sessieId: string | null = null;
  let zichtbareTekst = tekst;

  if (tekst.includes('"klaar": true')) {
    klaar = true;
    try {
      const jsonMatch = tekst.match(/\{[\s\S]*"klaar"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        const intakeAntwoorden = berichten
          .filter((_: unknown, i: number) => i > 0)
          .reduce((acc: Array<{vraag: string; antwoord: string}>, b: {rol: string; inhoud: string}, i: number, arr: {rol: string; inhoud: string}[]) => {
            if (b.rol === "gebruiker" && i > 0) {
              acc.push({ vraag: arr[i - 1]?.inhoud || "", antwoord: b.inhoud });
            }
            return acc;
          }, []);

        const [nieuweSessie] = await db
          .insert(sessies)
          .values({
            userId,
            thema: themaId,
            themaLabel: thema.label,
            status: "bouwen",
            aiSessieContext: parsed.context || "",
            intakeAntwoorden,
            bijgewerktOp: new Date(),
          })
          .returning();

        sessieId = nieuweSessie.id;

        const bouwvragen = thema.bouwvragen;
        const faseTitels = thema.faseTitels;

        for (let i = 0; i < 3; i++) {
          await db.insert(fases).values({
            sessieId: nieuweSessie.id,
            faseNummer: i + 1,
            faseTitel: faseTitels[i],
            vraag: bouwvragen[i],
          });
        }

        zichtbareTekst = `Goed. Ik heb genoeg om mee te werken. Je sessie staat klaar — het is tijd om te gaan bouwen.`;
      }
    } catch (err) {
      console.error("[intake] sessie aanmaken mislukt:", err);
    }
  }

  return NextResponse.json({ bericht: zichtbareTekst, klaar, sessieId });
}
