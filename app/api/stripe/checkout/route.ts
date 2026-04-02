import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  const { thema, coupon } = await req.json();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "payment",
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/sessie/nieuw?thema=${thema}&betaald=1`,
    cancel_url: `${appUrl}/betalen?thema=${thema}`,
    metadata: { userId: session.user.id, thema },
  };

  // Coupon toepassen via Stripe promotion codes
  if (coupon) {
    const codes = await stripe.promotionCodes.list({ code: coupon, limit: 1, active: true });
    if (codes.data.length > 0) {
      params.discounts = [{ promotion_code: codes.data[0].id }];
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create(params);
  return NextResponse.json({ url: checkoutSession.url });
}
