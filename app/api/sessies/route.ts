export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sessies, fases, rapporten } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const alleSessies = await db
    .select()
    .from(sessies)
    .where(eq(sessies.userId, userId))
    .orderBy(desc(sessies.aangemaktOp));

  // Voeg fase-info en rapport-status toe
  const resultaat = await Promise.all(
    alleSessies.map(async (s) => {
      const alleFases = await db
        .select({ faseNummer: fases.faseNummer, voltooid: fases.voltooid })
        .from(fases)
        .where(eq(fases.sessieId, s.id))
        .orderBy(fases.faseNummer);

      const huidigeFase = alleFases.find((f) => !f.voltooid)?.faseNummer ?? null;

      const rapport = await db
        .select({ id: rapporten.id })
        .from(rapporten)
        .where(eq(rapporten.sessieId, s.id))
        .limit(1);

      return {
        id: s.id,
        thema: s.thema,
        themaLabel: s.themaLabel,
        status: s.status,
        stemmingVoor: s.stemmingVoor,
        stemmingNa: s.stemmingNa,
        aangemaktOp: s.aangemaktOp,
        voltooidOp: s.voltooidOp,
        huidigeFase,
        totalFases: alleFases.length,
        heeftRapport: rapport.length > 0,
      };
    })
  );

  return NextResponse.json({ sessies: resultaat });
}
