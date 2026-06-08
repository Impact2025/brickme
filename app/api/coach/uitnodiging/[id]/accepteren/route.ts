export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getGebruiker } from "@/lib/auth";
import { db } from "@/lib/db";
import { coachingRelaties } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gebruiker = await getGebruiker();
  if (!gebruiker) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;

  const [relatie] = await db
    .select()
    .from(coachingRelaties)
    .where(
      and(
        eq(coachingRelaties.id, id),
        eq(coachingRelaties.clientUserId, gebruiker.userId),
        eq(coachingRelaties.status, "uitnodiging")
      )
    )
    .limit(1);

  if (!relatie) {
    return NextResponse.json({ error: "Uitnodiging niet gevonden" }, { status: 404 });
  }

  await db
    .update(coachingRelaties)
    .set({ status: "actief" })
    .where(eq(coachingRelaties.id, id));

  return NextResponse.json({ ok: true });
}
