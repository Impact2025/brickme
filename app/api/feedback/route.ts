export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { feedback } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { sessieId, score, waardevol, verbeterpunt } = await req.json();

  if (!sessieId || typeof score !== "number" || score < 1 || score > 5) {
    return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
  }

  await db.insert(feedback).values({
    sessieId,
    userId,
    score,
    waardevol: typeof waardevol === "string" ? waardevol.trim() || null : null,
    verbeterpunt: typeof verbeterpunt === "string" ? verbeterpunt.trim() || null : null,
  });

  return NextResponse.json({ ok: true });
}
