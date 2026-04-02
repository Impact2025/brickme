import { NextRequest, NextResponse } from "next/server";
import { requireAdminOfRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { coachingRelaties, sessies, rapporten } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { openai } from "@/lib/ai";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const gebruiker = await requireAdminOfRol("coach");
  const { userId } = await params;

  if (gebruiker.rol !== "superadmin") {
    const relatie = await db
      .select()
      .from(coachingRelaties)
      .where(
        and(
          eq(coachingRelaties.coachId, gebruiker.userId),
          eq(coachingRelaties.clientUserId, userId),
          eq(coachingRelaties.status, "actief")
        )
      )
      .limit(1);

    if (relatie.length === 0) {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }
  }

  const alleSessies = await db
    .select()
    .from(sessies)
    .where(and(eq(sessies.userId, userId), eq(sessies.status, "voltooid")))
    .orderBy(desc(sessies.aangemaktOp))
    .limit(10);

  if (alleSessies.length === 0) {
    return NextResponse.json({ error: "Geen voltooide sessies" }, { status: 404 });
  }

  const alleRapporten = await db
    .select()
    .from(rapporten)
    .where(eq(rapporten.sessieId, alleSessies[0].id));

  const overzicht = alleSessies.map((s, i) => {
    const rapport = alleRapporten.find((r) => r.sessieId === s.id);
    return `Sessie ${i + 1} (${new Date(s.aangemaktOp).toLocaleDateString("nl-NL")}):
Thema: ${s.themaLabel}
Stemming: ${s.stemmingVoor ?? "?"}→${s.stemmingNa ?? "?"}
Inzichten: ${JSON.stringify(rapport?.inzichten ?? [])}
Eerste stap: ${rapport?.eersteStap ?? "—"}`;
  }).join("\n\n");

  const response = await openai.chat.completions.create({
    model: "anthropic/claude-sonnet-4-5",
    max_tokens: 800,
    messages: [{
      role: "user",
      content: `Je bent een ervaren coach. Analyseer de sessiegeschiedenis van één cliënt en geef een patroonanalyse in het Nederlands.

SESSIE-GESCHIEDENIS:
${overzicht}

Geef JSON terug:
{
  "terugkerendeThemas": ["thema1", "thema2"],
  "groeipatroon": "2-3 zinnen over wat er veranderd is over de sessies heen",
  "kernspanning": "1 zin over de diepste spanning die steeds terugkomt",
  "coachingTip": "1 concrete tip voor de volgende sessie"
}`,
    }],
  });

  const tekst = response.choices[0]?.message?.content ?? "";
  const jsonMatch = tekst.match(/\{[\s\S]*\}/);

  let analyse: Record<string, unknown> = {};
  if (jsonMatch) {
    try {
      analyse = JSON.parse(jsonMatch[0]);
    } catch {
      analyse = { groeipatroon: tekst };
    }
  }

  return NextResponse.json({ aantalSessies: alleSessies.length, analyse });
}
