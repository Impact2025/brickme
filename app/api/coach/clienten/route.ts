export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminOfRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { coachingRelaties, sessies, gebruikers } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

export async function GET() {
  const gebruiker = await requireAdminOfRol("coach");

  const relaties = await db
    .select()
    .from(coachingRelaties)
    .where(
      gebruiker.rol === "superadmin"
        ? undefined
        : and(
            eq(coachingRelaties.coachId, gebruiker.userId),
            eq(coachingRelaties.status, "actief")
          )
    )
    .orderBy(desc(coachingRelaties.aangemaktOp));

  const clienten = await Promise.all(
    relaties.map(async (r) => {
      const laasteSessies = await db
        .select()
        .from(sessies)
        .where(eq(sessies.userId, r.clientUserId))
        .orderBy(desc(sessies.aangemaktOp))
        .limit(5);

      return {
        relatie: r,
        sessies: laasteSessies,
        aantalSessies: laasteSessies.length,
        laasteSessie: laasteSessies[0] ?? null,
      };
    })
  );

  return NextResponse.json({ clienten });
}

export async function POST(req: NextRequest) {
  const gebruiker = await requireAdminOfRol("coach");

  const schema = z.object({ clientUserId: z.string().min(1) });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
  }

  // Voorkom duplicaten
  const bestaand = await db
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

  if (bestaand.length > 0) {
    return NextResponse.json({ error: "Al gekoppeld" }, { status: 409 });
  }

  const [relatie] = await db
    .insert(coachingRelaties)
    .values({
      coachId: gebruiker.userId,
      clientUserId: parsed.data.clientUserId,
      status: "actief",
    })
    .returning();

  return NextResponse.json({ relatie });
}
