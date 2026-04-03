export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sessies, fases } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const { stemmingNa } = await req.json();

  if (typeof stemmingNa !== "number" || stemmingNa < 1 || stemmingNa > 10) {
    return NextResponse.json({ error: "Ongeldige waarde" }, { status: 400 });
  }

  await db.update(sessies).set({ stemmingNa }).where(eq(sessies.id, id));
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id } = await params;
  const url = new URL(req.url);
  const faseNummer = parseInt(url.searchParams.get("fase") || "0");

  const [sessie] = await db.select().from(sessies).where(eq(sessies.id, id));
  if (!sessie) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const alleFases = await db.select().from(fases).where(eq(fases.sessieId, id)).orderBy(fases.faseNummer);

  if (faseNummer > 0) {
    const fase = alleFases.find((f) => f.faseNummer === faseNummer);
    return NextResponse.json({ fase, totalFases: alleFases.length });
  }

  return NextResponse.json({ sessie, fases: alleFases });
}
