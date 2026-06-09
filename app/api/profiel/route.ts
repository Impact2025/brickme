export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import {
  gebruikers,
  sessies,
  betalingen,
  coachingRelaties,
  coachNotities,
  workshopDeelnemers,
  workshops,
} from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const [gebruiker] = await db
    .select({ naam: gebruikers.naam, email: gebruikers.email })
    .from(gebruikers)
    .where(eq(gebruikers.userId, userId));

  return NextResponse.json(gebruiker ?? { naam: null, email: null });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { naam, email } = await req.json();
  const updates: Record<string, string> = {};
  if (typeof naam === "string" && naam.trim()) updates.naam = naam.trim();
  if (typeof email === "string" && email.trim()) updates.email = email.trim();

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Geen geldige velden" }, { status: 400 });
  }

  await db.update(gebruikers).set(updates).where(eq(gebruikers.userId, userId));
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  // Delete in dependency order; cascades handle fases/rapporten/followupEmails
  await db.delete(coachNotities).where(
    or(eq(coachNotities.clientUserId, userId), eq(coachNotities.coachId, userId))
  );
  await db.delete(coachingRelaties).where(
    or(eq(coachingRelaties.clientUserId, userId), eq(coachingRelaties.coachId, userId))
  );
  await db.delete(workshopDeelnemers).where(eq(workshopDeelnemers.userId, userId));
  await db.delete(workshops).where(eq(workshops.facilitatorId, userId));
  await db.delete(betalingen).where(eq(betalingen.userId, userId));
  await db.delete(sessies).where(eq(sessies.userId, userId));
  await db.delete(gebruikers).where(eq(gebruikers.userId, userId));

  return NextResponse.json({ ok: true });
}
