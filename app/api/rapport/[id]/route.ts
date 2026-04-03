export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { sessies, fases, rapporten } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

  const { id: sessieId } = await params;

  const [rapport] = await db.select().from(rapporten).where(eq(rapporten.sessieId, sessieId));
  if (!rapport) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const [sessie] = await db.select().from(sessies).where(eq(sessies.id, sessieId));
  const fasesData = await db.select().from(fases).where(eq(fases.sessieId, sessieId)).orderBy(fases.faseNummer);

  return NextResponse.json({
    themaLabel: sessie?.themaLabel,
    stemmingVoor: sessie?.stemmingVoor,
    stemmingNa: sessie?.stemmingNa,
    samenvatting: rapport.samenvattingTekst,
    inzichten: rapport.inzichten,
    eersteStap: rapport.eersteStap,
    fases: fasesData.map((f) => ({
      faseTitel: f.faseTitel,
      fotoBase64: f.fotoBase64,
      aiReflectie: f.aiReflectie,
    })),
    aangemaktOp: sessie?.aangemaktOp || new Date(),
  });
}
