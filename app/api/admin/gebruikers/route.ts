export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { gebruikers } from "@/lib/db/schema";
import { ilike, or, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  await requireRol("superadmin");

  const { searchParams } = new URL(req.url);
  const zoek = searchParams.get("zoek") ?? "";
  const pagina = parseInt(searchParams.get("pagina") ?? "1");
  const perPagina = 50;

  let query = db.select().from(gebruikers).orderBy(desc(gebruikers.aangemaktOp));

  const rijen = await (zoek
    ? db
        .select()
        .from(gebruikers)
        .where(
          or(
            ilike(gebruikers.naam, `%${zoek}%`),
            ilike(gebruikers.email, `%${zoek}%`),
            ilike(gebruikers.userId, `%${zoek}%`)
          )
        )
        .orderBy(desc(gebruikers.aangemaktOp))
        .limit(perPagina)
        .offset((pagina - 1) * perPagina)
    : query.limit(perPagina).offset((pagina - 1) * perPagina));

  return NextResponse.json({ gebruikers: rijen });
}
