export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { sessies, gebruikers } from "@/lib/db/schema";
import { eq, count, sql, avg, and, isNotNull, gte } from "drizzle-orm";

export async function GET() {
  await requireRol("superadmin");

  const nu = new Date();
  const vandaag = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
  const eenWeekGeleden = new Date(vandaag.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totaalGebruikers,
    totaalSessies,
    voltooideSeesies,
    sessiesVandaag,
    nieuweGebruikersWeek,
    gemStemmingDelta,
  ] = await Promise.all([
    db.select({ n: count() }).from(gebruikers),
    db.select({ n: count() }).from(sessies),
    db.select({ n: count() }).from(sessies).where(eq(sessies.status, "voltooid")),
    db.select({ n: count() }).from(sessies).where(gte(sessies.aangemaktOp, vandaag)),
    db.select({ n: count() }).from(gebruikers).where(gte(gebruikers.aangemaktOp, eenWeekGeleden)),
    db
      .select({
        gem: avg(sql<number>`${sessies.stemmingNa} - ${sessies.stemmingVoor}`),
      })
      .from(sessies)
      .where(and(isNotNull(sessies.stemmingVoor), isNotNull(sessies.stemmingNa))),
  ]);

  const totaalS = totaalSessies[0].n;
  const voltooidS = voltooideSeesies[0].n;

  return NextResponse.json({
    totaalGebruikers: totaalGebruikers[0].n,
    totaalSessies: totaalS,
    voltooideSeesies: voltooidS,
    afrondingspercentage: totaalS > 0 ? Math.round((Number(voltooidS) / Number(totaalS)) * 100) : 0,
    sessiesVandaag: sessiesVandaag[0].n,
    nieuweGebruikersWeek: nieuweGebruikersWeek[0].n,
    gemStemmingDelta: gemStemmingDelta[0].gem
      ? Number(Number(gemStemmingDelta[0].gem).toFixed(1))
      : null,
  });
}
