export const dynamic = "force-dynamic";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { artikelen, gebruikers } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
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

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await db
    .select({
      id: artikelen.id,
      slug: artikelen.slug,
      titel: artikelen.titel,
      excerpt: artikelen.excerpt,
      categorie: artikelen.categorie,
      tags: artikelen.tags,
      seoScore: artikelen.seoScore,
      leestijd: artikelen.leestijd,
      gepubliceerd: artikelen.gepubliceerd,
      gepubliceerdOp: artikelen.gepubliceerdOp,
      aangemaktOp: artikelen.aangemaktOp,
      bijgewerktOp: artikelen.bijgewerktOp,
    })
    .from(artikelen)
    .orderBy(desc(artikelen.aangemaktOp));

  return NextResponse.json(items);
}

const artikelSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  titel: z.string().min(1).max(200),
  inhoud: z.string().min(1),
  excerpt: z.string().max(500).optional().nullable(),
  metaTitel: z.string().max(120).optional().nullable(),
  metaBeschrijving: z.string().max(320).optional().nullable(),
  trefwoorden: z.array(z.string()).optional().nullable(),
  ogAfbeelding: z.string().url().optional().nullable().or(z.literal("")),
  categorie: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  interneLinks: z.array(z.object({ ankerTekst: z.string(), href: z.string(), context: z.string() })).optional().nullable(),
  schemaMarkup: z.record(z.string(), z.unknown()).optional().nullable(),
  leestijd: z.number().int().min(1).optional().nullable(),
  seoScore: z.number().int().min(0).max(100).optional().nullable(),
  gepubliceerd: z.boolean().optional(),
  gepubliceerdOp: z.string().datetime().optional().nullable(),
});

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Ongeldige JSON" }, { status: 400 });

  const parsed = artikelSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const now = new Date();
  const { gepubliceerdOp: gepubliceerdOpRaw, ...restData } = parsed.data;
  const handmatigDatum = gepubliceerdOpRaw ? new Date(gepubliceerdOpRaw) : null;
  const [artikel] = await db.insert(artikelen).values({
    ...restData,
    ogAfbeelding: restData.ogAfbeelding || null,
    gepubliceerd: restData.gepubliceerd ?? false,
    gepubliceerdOp: handmatigDatum ?? (restData.gepubliceerd ? now : null),
    aangemaktOp: now,
    bijgewerktOp: now,
  }).returning();

  return NextResponse.json(artikel, { status: 201 });
}
