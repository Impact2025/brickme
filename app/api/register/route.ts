export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { gebruikers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { naam, email, wachtwoord } = await req.json();

    if (!email || !wachtwoord || wachtwoord.length < 8) {
      return NextResponse.json({ error: "Vul alle velden in (wachtwoord min. 8 tekens)." }, { status: 400 });
    }

    const bestaand = await db
      .select()
      .from(gebruikers)
      .where(eq(gebruikers.email, email))
      .limit(1);

    if (bestaand.length > 0) {
      return NextResponse.json({ error: "Dit e-mailadres is al in gebruik." }, { status: 400 });
    }

    const hash = await bcrypt.hash(wachtwoord, 12);
    const userId = randomUUID();

    await db.insert(gebruikers).values({
      userId,
      naam: naam || null,
      email,
      wachtwoord: hash,
      rol: "gebruiker",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Register fout:", err);
    return NextResponse.json({ error: "Server fout. Controleer de databaseverbinding." }, { status: 500 });
  }
}
