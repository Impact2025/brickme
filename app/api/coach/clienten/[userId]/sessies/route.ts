export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminOfRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { coachingRelaties, sessies, fases, rapporten } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const gebruiker = await requireAdminOfRol("coach");
  const { userId } = await params;

  // Controleer coaching-relatie
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
    .where(eq(sessies.userId, userId))
    .orderBy(desc(sessies.aangemaktOp));

  const sessiesMetData = await Promise.all(
    alleSessies.map(async (s) => {
      const [alleFases, rapport] = await Promise.all([
        db.select().from(fases).where(eq(fases.sessieId, s.id)).orderBy(fases.faseNummer),
        db.select().from(rapporten).where(eq(rapporten.sessieId, s.id)).limit(1),
      ]);
      return { ...s, fases: alleFases, rapport: rapport[0] ?? null };
    })
  );

  return NextResponse.json({ sessies: sessiesMetData });
}
