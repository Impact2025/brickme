import { NextResponse } from "next/server";
import { requireRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { sessies } from "@/lib/db/schema";
import { eq, count, sql, avg, and, isNotNull } from "drizzle-orm";

export async function GET() {
  await requireRol("superadmin");

  const [themaVerdeling, stemmingData, dagelijkse] = await Promise.all([
    // Sessies per thema
    db
      .select({ thema: sessies.thema, themaLabel: sessies.themaLabel, n: count() })
      .from(sessies)
      .groupBy(sessies.thema, sessies.themaLabel)
      .orderBy(sql`count(*) desc`),

    // Gemiddelde stemming voor/na per thema
    db
      .select({
        thema: sessies.thema,
        gemVoor: avg(sessies.stemmingVoor),
        gemNa: avg(sessies.stemmingNa),
      })
      .from(sessies)
      .where(and(isNotNull(sessies.stemmingVoor), isNotNull(sessies.stemmingNa)))
      .groupBy(sessies.thema),

    // Sessies per dag (laatste 30 dagen)
    db
      .select({
        dag: sql<string>`DATE(${sessies.aangemaktOp})`,
        totaal: count(),
        voltooid: sql<number>`COUNT(*) FILTER (WHERE ${sessies.status} = 'voltooid')`,
      })
      .from(sessies)
      .where(sql`${sessies.aangemaktOp} >= NOW() - INTERVAL '30 days'`)
      .groupBy(sql`DATE(${sessies.aangemaktOp})`)
      .orderBy(sql`DATE(${sessies.aangemaktOp})`),
  ]);

  return NextResponse.json({ themaVerdeling, stemmingData, dagelijkse });
}
