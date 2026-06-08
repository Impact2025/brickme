export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminOfRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { coachingRelaties, sessies, gebruikers } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { sendCoachUitnodigingEmail } from "@/lib/email";

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
  const coach = await requireAdminOfRol("coach");

  const schema = z.object({ email: z.string().email() });
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Vul een geldig e-mailadres in" }, { status: 400 });
  }

  // Zoek cliënt op e-mail
  const [client] = await db
    .select()
    .from(gebruikers)
    .where(eq(gebruikers.email, parsed.data.email))
    .limit(1);

  if (!client) {
    return NextResponse.json({ error: "Geen Brickme-account gevonden met dit e-mailadres" }, { status: 404 });
  }

  if (client.userId === coach.userId) {
    return NextResponse.json({ error: "Je kunt jezelf niet als cliënt toevoegen" }, { status: 400 });
  }

  // Voorkom duplicaten (actief of al uitgenodigd)
  const bestaand = await db
    .select()
    .from(coachingRelaties)
    .where(
      and(
        eq(coachingRelaties.coachId, coach.userId),
        eq(coachingRelaties.clientUserId, client.userId)
      )
    )
    .limit(1);

  if (bestaand.length > 0) {
    const status = bestaand[0].status;
    if (status === "actief") return NextResponse.json({ error: "Al gekoppeld" }, { status: 409 });
    if (status === "uitnodiging") return NextResponse.json({ error: "Uitnodiging staat al open" }, { status: 409 });
  }

  const [relatie] = await db
    .insert(coachingRelaties)
    .values({
      coachId: coach.userId,
      clientUserId: client.userId,
      status: "uitnodiging",
    })
    .returning();

  void sendCoachUitnodigingEmail(client.email!, client.naam ?? "", coach.naam ?? null);

  return NextResponse.json({ relatie });
}
