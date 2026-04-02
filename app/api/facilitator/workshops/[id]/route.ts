import { NextRequest, NextResponse } from "next/server";
import { requireAdminOfRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { workshops, workshopDeelnemers, sessies } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
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

  // Deelnemers + hun laatste sessies
  const deelnemers = await db
    .select()
    .from(workshopDeelnemers)
    .where(eq(workshopDeelnemers.workshopId, id));

  const deelnemersSessies = await Promise.all(
    deelnemers.map(async (d) => {
      const laatste = await db
        .select()
        .from(sessies)
        .where(eq(sessies.userId, d.userId))
        .orderBy(desc(sessies.aangemaktOp))
        .limit(3);
      return { ...d, sessies: laatste };
    })
  );

  return NextResponse.json({ workshop, deelnemers: deelnemersSessies });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gebruiker = await requireAdminOfRol("facilitator");
  const { id } = await params;
  const body = await req.json();

  await db
    .update(workshops)
    .set({ status: body.status })
    .where(
      gebruiker.rol === "superadmin"
        ? eq(workshops.id, id)
        : and(eq(workshops.id, id), eq(workshops.facilitatorId, gebruiker.userId))
    );

  return NextResponse.json({ ok: true });
}
