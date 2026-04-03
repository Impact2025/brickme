export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { artikelen } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const items = await db
    .select({
      id: artikelen.id,
      slug: artikelen.slug,
      titel: artikelen.titel,
      excerpt: artikelen.excerpt,
      categorie: artikelen.categorie,
      tags: artikelen.tags,
      leestijd: artikelen.leestijd,
      ogAfbeelding: artikelen.ogAfbeelding,
      gepubliceerdOp: artikelen.gepubliceerdOp,
      aangemaktOp: artikelen.aangemaktOp,
    })
    .from(artikelen)
    .where(eq(artikelen.gepubliceerd, true))
    .orderBy(desc(artikelen.gepubliceerdOp));

  return NextResponse.json(items);
}
