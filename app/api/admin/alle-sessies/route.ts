export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { sessies } from "@/lib/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export async function GET(req: NextRequest) {
  await requireRol("superadmin");

  const { searchParams } = new URL(req.url);
  const thema = searchParams.get("thema");
  const status = searchParams.get("status");
  const van = searchParams.get("van");
  const tot = searchParams.get("tot");
  const pagina = parseInt(searchParams.get("pagina") ?? "1");
  const perPagina = 50;

  const filters = [];
  if (thema) filters.push(eq(sessies.thema, thema));
  if (status) filters.push(eq(sessies.status, status));
  if (van) filters.push(gte(sessies.aangemaktOp, new Date(van)));
  if (tot) filters.push(lte(sessies.aangemaktOp, new Date(tot)));

  const rijen = await db
    .select()
    .from(sessies)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(sessies.aangemaktOp))
    .limit(perPagina)
    .offset((pagina - 1) * perPagina);

  return NextResponse.json({ sessies: rijen });
}
