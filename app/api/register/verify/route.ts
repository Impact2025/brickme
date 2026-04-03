export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gebruikers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendWelkomEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
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
    const geldig =
      gebruiker.verificatieCode === code &&
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
