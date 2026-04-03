export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gebruikers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendVerificatieEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { ok } = checkRateLimit(`magic:${ip}`, 5, 15 * 60 * 1000); // 5 per kwartier per IP
  if (!ok) return NextResponse.json({ error: "Te veel pogingen. Probeer later opnieuw." }, { status: 429 });

  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Vul je e-mailadres in." }, { status: 400 });

    const [gebruiker] = await db
      .select()
      .from(gebruikers)
      .where(eq(gebruikers.email, email))
      .limit(1);

    if (!gebruiker) {
      return NextResponse.json({ error: "Geen account gevonden. Maak eerst een account aan." }, { status: 404 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const verloptOp = new Date(Date.now() + 15 * 60 * 1000);

    await db
      .update(gebruikers)
      .set({ verificatieCode: code, verificatieVerloptOp: verloptOp })
      .where(eq(gebruikers.userId, gebruiker.userId));

    void sendVerificatieEmail(gebruiker.naam || email, email, code);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Magic link fout:", err);
    return NextResponse.json({ error: "Server fout. Probeer opnieuw." }, { status: 500 });
  }
}
