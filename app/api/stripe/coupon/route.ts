export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Interne couponcodes — werken altijd zonder Stripe
// verlooptDatum: optioneel, YYYY-MM-DD (tot en met die dag geldig)
const INTERNE_COUPONS: Record<string, { kortingPercent: number; verlooptDatum?: string }> = {
  VRIEND2026: { kortingPercent: 100 },
  DELEN26: { kortingPercent: 100, verlooptDatum: "2026-04-30" },
};

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ geldig: false });

  const upper = code.toUpperCase().trim();

  if (upper in INTERNE_COUPONS) {
    const intern = INTERNE_COUPONS[upper];
    if (intern.verlooptDatum) {
      const vandaag = new Date().toISOString().slice(0, 10);
      if (vandaag > intern.verlooptDatum) {
        return NextResponse.json({ geldig: false });
      }
    }
    return NextResponse.json({ geldig: true, kortingPercent: intern.kortingPercent });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const codes = await stripe.promotionCodes.list({ code: code.toUpperCase(), limit: 1, active: true });

    if (codes.data.length === 0) {
      return NextResponse.json({ geldig: false });
    }

    const promo = codes.data[0];
    const coupon = promo.coupon;

    let kortingPercent = 0;
    if (coupon.percent_off) {
      kortingPercent = coupon.percent_off;
    } else if (coupon.amount_off) {
      // €29,95 = 2995 cent
      kortingPercent = Math.round((coupon.amount_off / 2995) * 100);
    }

    return NextResponse.json({ geldig: true, kortingPercent });
  } catch {
    return NextResponse.json({ geldig: false });
  }
}
