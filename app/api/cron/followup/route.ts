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

  const resultaat = await stuurOpenFollowups();
  return NextResponse.json(resultaat);
}

export async function stuurOpenFollowups() {
  const nu = new Date();
  const openstaande = await db
    .select()
    .from(followupEmails)
    .where(and(isNull(followupEmails.verstuurdOp), lte(followupEmails.geplandVoor, nu)));

  let verstuurd = 0;
  let overgeslagen = 0;

  for (const followup of openstaande) {
    const [sessie] = await db
      .select({ themaLabel: sessies.themaLabel, thema: sessies.thema })
      .from(sessies)
      .where(eq(sessies.id, followup.sessieId))
      .limit(1);

    if (!sessie) { overgeslagen++; continue; }

    const [gebruiker] = await db
      .select({ email: gebruikers.email, naam: gebruikers.naam, emailsAfgemeld: gebruikers.emailsAfgemeld })
      .from(gebruikers)
      .where(eq(gebruikers.userId, followup.userId))
      .limit(1);

    if (!gebruiker?.email || gebruiker.emailsAfgemeld) { overgeslagen++; continue; }

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
        rapport?.eersteStap ?? "",
        followup.userId
      );
    } else if (followup.type === "dag21") {
      await sendFollowupDag21Email(
        gebruiker.naam ?? "",
        gebruiker.email,
        sessie.themaLabel,
        followup.userId
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
        sessie.thema,
        followup.userId
      );
    }

    await db
      .update(followupEmails)
      .set({ verstuurdOp: nu })
      .where(eq(followupEmails.id, followup.id));

    verstuurd++;
  }

  return { verstuurd, overgeslagen, verwerktOp: nu.toISOString() };
}
