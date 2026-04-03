export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminOfRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { workshops } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

function genereerCode(): string {
  const tekens = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => tekens[Math.floor(Math.random() * tekens.length)]).join("");
}

export async function GET() {
  const gebruiker = await requireAdminOfRol("facilitator");

  const rijen = await db
    .select()
    .from(workshops)
    .where(
      gebruiker.rol === "superadmin"
        ? undefined
        : eq(workshops.facilitatorId, gebruiker.userId)
    )
    .orderBy(desc(workshops.aangemaktOp));

  return NextResponse.json({ workshops: rijen });
}

export async function POST(req: NextRequest) {
  const gebruiker = await requireAdminOfRol("facilitator");

  const schema = z.object({
    naam: z.string().min(2).max(100),
    beschrijving: z.string().max(500).optional(),
  });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ongeldige invoer" }, { status: 400 });
  }

  // Zorg voor unieke code
  let code = genereerCode();
  let pogingen = 0;
  while (pogingen < 10) {
    const bestaand = await db.select().from(workshops).where(eq(workshops.code, code)).limit(1);
    if (bestaand.length === 0) break;
    code = genereerCode();
    pogingen++;
  }

  const [workshop] = await db
    .insert(workshops)
    .values({
      facilitatorId: gebruiker.userId,
      naam: parsed.data.naam,
      beschrijving: parsed.data.beschrijving,
      code,
      status: "actief",
    })
    .returning();

  return NextResponse.json({ workshop });
}
