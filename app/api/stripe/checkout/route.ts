export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { coupons, betalingen } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { thema, coupon, type, terugkeer } = await req.json();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Interne gratis coupon check
  if (coupon && type !== "abonnement") {
    const upper = coupon.toUpperCase().trim();
    const rijen = await db.select().from(coupons).where(eq(coupons.code, upper)).limit(1);
    if (rijen.length > 0) {
      const intern = rijen[0];
      const geldig =
        intern.actief &&
        (!intern.verloptOp || intern.verloptOp > new Date()) &&
        (intern.maxGebruik === null || intern.gebruikTeller < intern.maxGebruik);

      if (geldig && intern.kortingPercent === 100) {
        await db
          .update(coupons)
          .set({ gebruikTeller: sql`${coupons.gebruikTeller} + 1` })
          .where(eq(coupons.code, upper));
        await db.insert(betalingen).values({
          userId: session.user.id,
          bedrag: 0,
          thema,
          couponCode: upper,
          status: "open",
        });
        const suffix = terugkeer ? `&terugkeer=${terugkeer}` : "";
        return NextResponse.json({ url: `${appUrl}/sessie/nieuw?thema=${thema}&betaald=1${suffix}` });
      }
    }
  }

  let params: Stripe.Checkout.SessionCreateParams;

  if (type === "abonnement") {
    params = {
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID_SUBSCRIPTION!, quantity: 1 }],
      subscription_data: {
        trial_period_days: 30,
        metadata: { userId: session.user.id },
      },
      success_url: `${appUrl}/dashboard?abonnement=gestart`,
      cancel_url: `${appUrl}/#prijzen`,
      metadata: { userId: session.user.id, type: "abonnement" },
    };
  } else {
    const terugkeerSuffix = terugkeer ? `&terugkeer=${terugkeer}` : "";
    params = {
      mode: "payment",
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${appUrl}/sessie/nieuw?thema=${thema}&betaald=1${terugkeerSuffix}`,
      cancel_url: `${appUrl}/betalen?thema=${thema}${terugkeer ? `&terugkeer=${terugkeer}` : ""}`,
      metadata: { userId: session.user.id, thema },
    };

    if (coupon) {
      const codes = await stripe.promotionCodes.list({ code: coupon.toUpperCase(), limit: 1, active: true });
      if (codes.data.length > 0) {
        params.discounts = [{ promotion_code: codes.data[0].id }];
      }
    }
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create(params);
    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Stripe fout" }, { status: 500 });
  }
}
