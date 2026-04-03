export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { gebruikers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { sendVerificatieEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { ok } = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000); // 5 per uur per IP
  if (!ok) return NextResponse.json({ error: "Te veel pogingen. Probeer later opnieuw." }, { status: 429 });
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
    const verificatieCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificatieVerloptOp = new Date(Date.now() + 15 * 60 * 1000);

    await db.insert(gebruikers).values({
      userId,
      naam: naam || null,
      email,
      wachtwoord: hash,
      rol: "gebruiker",
      actief: false,
      verificatieCode,
      verificatieVerloptOp,
    });

    void sendVerificatieEmail(naam || email, email, verificatieCode);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Register fout:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Server fout. Probeer opnieuw." }, { status: 500 });
  }
}
