import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { artikelen } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  await db
    .update(artikelen)
    .set({ weergaven: sql`${artikelen.weergaven} + 1` })
    .where(eq(artikelen.slug, slug));

  return NextResponse.json({ ok: true });
}
