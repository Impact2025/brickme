export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { gebruikers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendVerificatieEmail, sendNieuwAccountNotificatie, sendInlogcodeEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { ok } = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!ok) return NextResponse.json({ error: "Te veel pogingen. Probeer later opnieuw." }, { status: 429 });

  try {
    const { naam, email } = await req.json();
    if (!email) return NextResponse.json({ error: "Vul je e-mailadres in." }, { status: 400 });

    const bestaand = await db
      .select()
      .from(gebruikers)
      .where(eq(gebruikers.email, email))
      .limit(1);

    if (bestaand.length > 0) {
      return NextResponse.json({ error: "Dit e-mailadres is al in gebruik." }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const userId = randomUUID();
    const verloptOp = new Date(Date.now() + 15 * 60 * 1000);

    await db.insert(gebruikers).values({
      userId,
      naam: naam || null,
      email,
      rol: "gebruiker",
      actief: false,
      verificatieCode: code,
      verificatieVerloptOp: verloptOp,
    });

    const emailResult = await sendInlogcodeEmail(naam || email, email, code);

    if (!emailResult.ok) {
      console.error("[register] verificatie-email niet verstuurd voor:", email, emailResult.error);
      return NextResponse.json({ error: "Account aangemaakt maar verificatie-email kon niet worden verstuurd. Probeer opnieuw in te loggen." }, { status: 500 });
    }

    void sendNieuwAccountNotificatie(naam || null, email);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Register fout:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Server fout. Probeer opnieuw." }, { status: 500 });
  }
}
