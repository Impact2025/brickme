export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { gebruikers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId) break;

      if (session.mode === "subscription" && session.subscription && session.customer) {
        await db.update(gebruikers).set({
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          abonnementStatus: "actief",
        }).where(eq(gebruikers.userId, userId));
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (!userId) break;

      const isActief = subscription.status === "active" || subscription.status === "trialing";
      await db.update(gebruikers).set({
        abonnementStatus: isActief ? "actief" : "gepauzeerd",
      }).where(eq(gebruikers.userId, userId));
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (!userId) break;

      await db.update(gebruikers).set({
        abonnementStatus: "geannuleerd",
        stripeSubscriptionId: null,
      }).where(eq(gebruikers.userId, userId));
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
