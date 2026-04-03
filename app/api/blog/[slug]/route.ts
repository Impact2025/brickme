export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { artikelen } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [artikel] = await db.select().from(artikelen)
    .where(and(eq(artikelen.slug, slug), eq(artikelen.gepubliceerd, true)));
  if (!artikel) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json(artikel);
}
