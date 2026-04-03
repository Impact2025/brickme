export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminOfRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { workshops, workshopDeelnemers, gebruikers } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { sendWorkshopUitnodigingEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gebruiker = await requireAdminOfRol("facilitator");
  const { id } = await params;

  // Controleer eigenaarschap
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

  const schema = z.object({ userId: z.string().min(1) });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
  }

  // Voorkom duplicaten
  const bestaand = await db
    .select()
    .from(workshopDeelnemers)
    .where(and(eq(workshopDeelnemers.workshopId, id), eq(workshopDeelnemers.userId, parsed.data.userId)))
    .limit(1);

  if (bestaand.length > 0) {
    return NextResponse.json({ error: "Al uitgenodigd" }, { status: 409 });
  }

  const [deelnemer] = await db
    .insert(workshopDeelnemers)
    .values({
      workshopId: id,
      userId: parsed.data.userId,
      uitgenodigd: true,
      toegetreden: false,
    })
    .returning();

  const [uitgenodigde] = await db
    .select({ email: gebruikers.email, naam: gebruikers.naam })
    .from(gebruikers)
    .where(eq(gebruikers.userId, parsed.data.userId))
    .limit(1);

  if (uitgenodigde?.email) {
    void sendWorkshopUitnodigingEmail(
      uitgenodigde.email,
      uitgenodigde.naam ?? "",
      workshop.naam,
      workshop.code
    );
  }

  return NextResponse.json({ deelnemer });
}
