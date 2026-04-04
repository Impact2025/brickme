export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { openai, AI_MODEL, buildProbeVraagPrompt } from "@/lib/ai";

const FALLBACK_VRAAG = "Welk element in je bouwsel valt je het meest op, en waarom staat het precies op die plek?";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { beschrijving, faseTitel, thema } = await req.json();

  if (!beschrijving || !faseTitel || !thema) {
    return NextResponse.json({ vraag: FALLBACK_VRAAG });
  }

  try {
    const systemPrompt = buildProbeVraagPrompt(faseTitel, thema, beschrijving);

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      max_tokens: 100,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: `Fase: ${faseTitel}\n\nBeschrijving van de bouwer: "${beschrijving}"`,
        },
      ],
    });

    const vraag = response.choices[0]?.message?.content?.trim() || FALLBACK_VRAAG;
    return NextResponse.json({ vraag });
  } catch (err) {
    console.error("[probe-vraag] AI call mislukt:", err);
    return NextResponse.json({ vraag: FALLBACK_VRAAG });
  }
}
