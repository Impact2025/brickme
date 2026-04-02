import { NextRequest, NextResponse } from "next/server";
import { requireRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { gebruikers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  rol: z.enum(["superadmin", "facilitator", "coach", "gebruiker"]),
  naam: z.string().optional(),
  email: z.string().email().optional(),
  actief: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  await requireRol("superadmin");
  const { userId } = await params;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
  }

  // Zorg dat gebruiker bestaat
  const bestaand = await db.select().from(gebruikers).where(eq(gebruikers.userId, userId)).limit(1);
  if (bestaand.length === 0) {
    await db.insert(gebruikers).values({ userId, ...parsed.data });
  } else {
    await db.update(gebruikers).set(parsed.data).where(eq(gebruikers.userId, userId));
  }

  return NextResponse.json({ ok: true });
}
