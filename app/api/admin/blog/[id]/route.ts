export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { artikelen, gebruikers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

async function checkAdmin() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  const rijen = await db.select({ rol: gebruikers.rol }).from(gebruikers).where(eq(gebruikers.userId, userId)).limit(1);
  if (rijen[0]?.rol !== "superadmin") return null;
  return session;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const [artikel] = await db.select().from(artikelen).where(eq(artikelen.id, id));
  if (!artikel) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json(artikel);
}

const updateSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/).optional(),
  titel: z.string().min(1).max(200).optional(),
  inhoud: z.string().min(1).optional(),
  excerpt: z.string().max(300).nullable().optional(),
  metaTitel: z.string().max(120).nullable().optional(),
  metaBeschrijving: z.string().max(320).nullable().optional(),
  trefwoorden: z.array(z.string()).nullable().optional(),
  ogAfbeelding: z.string().nullable().optional(),
  categorie: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  interneLinks: z.array(z.object({ ankerTekst: z.string(), href: z.string(), context: z.string() })).nullable().optional(),
  schemaMarkup: z.record(z.string(), z.unknown()).nullable().optional(),
  leestijd: z.number().int().min(1).nullable().optional(),
  seoScore: z.number().int().min(0).max(100).nullable().optional(),
  gepubliceerd: z.boolean().optional(),
  gepubliceerdOp: z.string().datetime().nullable().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const bestaand = await db.select({ gepubliceerd: artikelen.gepubliceerd, gepubliceerdOp: artikelen.gepubliceerdOp })
    .from(artikelen).where(eq(artikelen.id, id));
  if (!bestaand.length) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });

  const wordtGepubliceerd = parsed.data.gepubliceerd === true && !bestaand[0].gepubliceerd;
  let nieuweGepubliceerdOp: Date | null = bestaand[0].gepubliceerdOp;
  if (parsed.data.gepubliceerdOp !== undefined) {
    nieuweGepubliceerdOp = parsed.data.gepubliceerdOp ? new Date(parsed.data.gepubliceerdOp) : null;
  } else if (wordtGepubliceerd) {
    nieuweGepubliceerdOp = new Date();
  }

  const { gepubliceerdOp: _, ...restData } = parsed.data;
  const [updated] = await db.update(artikelen).set({
    ...restData,
    gepubliceerdOp: nieuweGepubliceerdOp,
    bijgewerktOp: new Date(),
  }).where(eq(artikelen.id, id)).returning();

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const result = await db.delete(artikelen).where(eq(artikelen.id, id)).returning({ id: artikelen.id });
  if (!result.length) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
