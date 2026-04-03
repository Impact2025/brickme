export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminOfRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { workshops, workshopDeelnemers, sessies, rapporten } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { openai } from "@/lib/ai";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gebruiker = await requireAdminOfRol("facilitator");
  const { id } = await params;

  const [workshop] = await db
    .select()
    .from(workshops)
    .where(
      gebruiker.rol === "superadmin"
        ? eq(workshops.id, id)
        : and(eq(workshops.id, id), eq(workshops.facilitatorId, gebruiker.userId))
    )
    .limit(1);

  if (!workshop) {
    return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  }

  const deelnemers = await db
    .select()
    .from(workshopDeelnemers)
    .where(eq(workshopDeelnemers.workshopId, id));

  if (deelnemers.length === 0) {
    return NextResponse.json({ error: "Geen deelnemers" }, { status: 404 });
  }

  const userIds = deelnemers.map((d) => d.userId);
  const alleSessies = await db
    .select()
    .from(sessies)
    .where(and(inArray(sessies.userId, userIds), eq(sessies.status, "voltooid")));

  const sessieIds = alleSessies.map((s) => s.id);
  const alleRapporten = sessieIds.length > 0
    ? await db.select().from(rapporten).where(inArray(rapporten.sessieId, sessieIds))
    : [];

  const overzicht = alleSessies.map((s) => {
    const rapport = alleRapporten.find((r) => r.sessieId === s.id);
    return `Thema: ${s.themaLabel}\nStemming voor: ${s.stemmingVoor ?? "?"}/10 → na: ${s.stemmingNa ?? "?"}/10\nInzichten: ${JSON.stringify(rapport?.inzichten ?? [])}\nEerste stap: ${rapport?.eersteStap ?? "—"}`;
  }).join("\n\n---\n\n");

  const response = await openai.chat.completions.create({
    model: "anthropic/claude-sonnet-4-5",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: `Je bent een ervaren LSP-facilitator. Analyseer de sessies van ${alleSessies.length} deelnemers en geef een beknopt groepsrapport in het Nederlands.

SESSIE-DATA:
${overzicht}

Geef JSON terug:
{
  "gedeeldeThemas": ["thema1", "thema2"],
  "groepspatroon": "2-3 zinnen over wat de groep gemeen heeft",
  "opvallendeSpanning": "1 zin over de meest opvallende spanning/energie in de groep",
  "aanbeveling": "1 concrete aanbeveling voor de facilitator"
}`,
    }],
  });

  const tekst = response.choices[0]?.message?.content ?? "";
  const jsonMatch = tekst.match(/\{[\s\S]*\}/);

  let groepsrapport: Record<string, unknown> = {};
  if (jsonMatch) {
    try {
      groepsrapport = JSON.parse(jsonMatch[0]);
    } catch {
      groepsrapport = { groepspatroon: tekst };
    }
  }

  return NextResponse.json({
    workshop,
    aantalDeelnemers: deelnemers.length,
    aantalVoltooide: alleSessies.length,
    stemmingData: alleSessies
      .filter((s) => s.stemmingVoor != null && s.stemmingNa != null)
      .map((s) => ({ voor: s.stemmingVoor, na: s.stemmingNa, delta: (s.stemmingNa ?? 0) - (s.stemmingVoor ?? 0) })),
    groepsrapport,
  });
}
