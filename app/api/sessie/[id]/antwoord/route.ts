import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { fases } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { faseId, antwoord } = await req.json();

  await db
    .update(fases)
    .set({ gebruikersAntwoord: antwoord, voltooid: true })
    .where(eq(fases.id, faseId));

  return NextResponse.json({ ok: true });
}
