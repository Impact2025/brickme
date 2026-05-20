export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ geldig: false });

  const upper = code.toUpperCase().trim();

  // Interne DB-coupons
  const rijen = await db.select().from(coupons).where(eq(coupons.code, upper)).limit(1);
  if (rijen.length > 0) {
    const coupon = rijen[0];
    if (!coupon.actief) return NextResponse.json({ geldig: false });
    if (coupon.verloptOp && coupon.verloptOp < new Date()) return NextResponse.json({ geldig: false });
    if (coupon.maxGebruik !== null && coupon.gebruikTeller >= coupon.maxGebruik) {
      return NextResponse.json({ geldig: false });
    }
    return NextResponse.json({ geldig: true, kortingPercent: coupon.kortingPercent });
  }

  // Stripe promotion codes
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const codes = await stripe.promotionCodes.list({ code: upper, limit: 1, active: true });

    if (codes.data.length === 0) return NextResponse.json({ geldig: false });

    const promo = codes.data[0];
    const stripeCoupon = promo.coupon;

    let kortingPercent = 0;
    if (stripeCoupon.percent_off) {
      kortingPercent = stripeCoupon.percent_off;
    } else if (stripeCoupon.amount_off) {
      kortingPercent = Math.round((stripeCoupon.amount_off / 2995) * 100);
    }

    return NextResponse.json({ geldig: true, kortingPercent });
  } catch {
    return NextResponse.json({ geldig: false });
  }
}
