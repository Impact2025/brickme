export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gebruikers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendInlogcodeEmail } from "@/lib/email";
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

    const emailResult = await sendInlogcodeEmail(gebruiker.naam || email, email, code);

    if (!emailResult.ok) {
      console.error("[magic-link] e-mail niet verstuurd voor:", email, emailResult.error);
      return NextResponse.json({ error: "E-mail kon niet worden verstuurd. Probeer het opnieuw." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Magic link fout:", err);
    return NextResponse.json({ error: "Server fout. Probeer opnieuw." }, { status: 500 });
  }
}
