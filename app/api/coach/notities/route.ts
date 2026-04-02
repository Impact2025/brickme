import { NextRequest, NextResponse } from "next/server";
import { requireAdminOfRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { coachNotities, coachingRelaties } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

export async function POST(req: NextRequest) {
  const gebruiker = await requireAdminOfRol("coach");

  const schema = z.object({
    clientUserId: z.string().min(1),
    sessieId: z.string().uuid().optional(),
    tekst: z.string().min(1).max(2000),
  });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
  }

  // Controleer coaching-relatie
  if (gebruiker.rol !== "superadmin") {
    const relatie = await db
      .select()
      .from(coachingRelaties)
      .where(
        and(
          eq(coachingRelaties.coachId, gebruiker.userId),
          eq(coachingRelaties.clientUserId, parsed.data.clientUserId),
          eq(coachingRelaties.status, "actief")
        )
      )
      .limit(1);

    if (relatie.length === 0) {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }
  }

  const [notitie] = await db
    .insert(coachNotities)
    .values({
      coachId: gebruiker.userId,
      clientUserId: parsed.data.clientUserId,
      sessieId: parsed.data.sessieId ?? null,
      tekst: parsed.data.tekst,
    })
    .returning();

  return NextResponse.json({ notitie });
}
