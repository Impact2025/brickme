import { NextResponse } from "next/server";
import { getGebruiker } from "@/lib/auth";
import { db } from "@/lib/db";
import { gebruikers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(req: Request) {
  const gebruiker = await getGebruiker();
  if (!gebruiker || (gebruiker.rol !== "coach" && gebruiker.rol !== "superadmin")) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const body = await req.json();
  const naam = typeof body.naam === "string" ? body.naam.trim() : null;

  if (!naam) {
    return NextResponse.json({ error: "Naam is verplicht" }, { status: 400 });
  }

  await db
    .update(gebruikers)
    .set({ naam })
    .where(eq(gebruikers.userId, gebruiker.userId));

  return NextResponse.json({ ok: true });
}
