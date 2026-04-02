import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Geen signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Ongeldige webhook signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    // Betaling geslaagd — hier kun je optioneel iets opslaan in de DB
    // De sessie wordt aangemaakt na redirect naar /sessie/nieuw
  }

  return NextResponse.json({ ok: true });
}
