export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { gebruikers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendWelkomEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { ok } = checkRateLimit(`verify:${ip}`, 10, 60 * 60 * 1000); // 10 per uur per IP
  if (!ok) return NextResponse.json({ error: "Te veel pogingen. Probeer later opnieuw." }, { status: 429 });

  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Vul alle velden in." }, { status: 400 });
    }

    const [gebruiker] = await db
      .select()
      .from(gebruikers)
      .where(eq(gebruikers.email, email))
      .limit(1);

    if (!gebruiker) {
      return NextResponse.json({ error: "Ongeldige of verlopen code." }, { status: 400 });
    }

    const nu = new Date();
    const storedCode = gebruiker.verificatieCode ?? "";
    const codeGeldig =
      storedCode.length === code.length &&
      timingSafeEqual(Buffer.from(storedCode), Buffer.from(code));
    const geldig =
      codeGeldig &&
      gebruiker.verificatieVerloptOp !== null &&
      gebruiker.verificatieVerloptOp > nu;

    if (!geldig) {
      return NextResponse.json({ error: "Ongeldige of verlopen code." }, { status: 400 });
    }

    await db
      .update(gebruikers)
      .set({ actief: true, verificatieCode: null, verificatieVerloptOp: null })
      .where(eq(gebruikers.email, email));

    void sendWelkomEmail(gebruiker.naam || email, email);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Verify fout:", err);
    return NextResponse.json({ error: "Server fout. Probeer opnieuw." }, { status: 500 });
  }
}
