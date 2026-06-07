export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { followupEmails, sessies, rapporten, gebruikers } from "@/lib/db/schema";
import { and, isNull, lte, eq } from "drizzle-orm";
import { sendFollowupDag3Email, sendFollowupDag21Email, sendTerugkeerEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Niet toegestaan" }, { status: 401 });
  }

  const nu = new Date();
  const openstaande = await db
    .select()
    .from(followupEmails)
    .where(and(isNull(followupEmails.verstuurdOp), lte(followupEmails.geplandVoor, nu)));

  let verstuurd = 0;

  for (const followup of openstaande) {
    const [sessie] = await db
      .select({ themaLabel: sessies.themaLabel, thema: sessies.thema })
      .from(sessies)
      .where(eq(sessies.id, followup.sessieId))
      .limit(1);

    if (!sessie) continue;

    const [gebruiker] = await db
      .select({ email: gebruikers.email, naam: gebruikers.naam })
      .from(gebruikers)
      .where(eq(gebruikers.userId, followup.userId))
      .limit(1);

    if (!gebruiker?.email) continue;

    if (followup.type === "dag3") {
      const [rapport] = await db
        .select({ eersteStap: rapporten.eersteStap })
        .from(rapporten)
        .where(eq(rapporten.sessieId, followup.sessieId))
        .limit(1);

      await sendFollowupDag3Email(
        gebruiker.naam ?? "",
        gebruiker.email,
        sessie.themaLabel,
        rapport?.eersteStap ?? ""
      );
    } else if (followup.type === "dag21") {
      await sendFollowupDag21Email(
        gebruiker.naam ?? "",
        gebruiker.email,
        sessie.themaLabel
      );
    } else if (followup.type === "terugkeer") {
      const [rapport] = await db
        .select({ eersteStap: rapporten.eersteStap })
        .from(rapporten)
        .where(eq(rapporten.sessieId, followup.sessieId))
        .limit(1);

      await sendTerugkeerEmail(
        gebruiker.naam ?? "",
        gebruiker.email,
        sessie.themaLabel,
        rapport?.eersteStap ?? "",
        followup.sessieId,
        sessie.thema
      );
    }

    await db
      .update(followupEmails)
      .set({ verstuurdOp: nu })
      .where(eq(followupEmails.id, followup.id));

    verstuurd++;
  }

  return NextResponse.json({ verstuurd, verwerktOp: nu.toISOString() });
}
