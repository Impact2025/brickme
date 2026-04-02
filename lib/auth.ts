import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { gebruikers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export type Rol = "superadmin" | "facilitator" | "coach" | "gebruiker";

export async function getGebruiker() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  if (userId === process.env.ADMIN_USER_ID) {
    const bestaand = await db
      .select()
      .from(gebruikers)
      .where(eq(gebruikers.userId, userId))
      .limit(1);

    if (bestaand.length === 0) {
      await db.insert(gebruikers).values({ userId, rol: "superadmin" });
      return { userId, rol: "superadmin" as Rol, naam: null, email: null, actief: true, aangemaktOp: new Date(), wachtwoord: null };
    }

    if (bestaand[0].rol !== "superadmin") {
      await db.update(gebruikers).set({ rol: "superadmin" }).where(eq(gebruikers.userId, userId));
    }

    return { ...bestaand[0], rol: "superadmin" as Rol };
  }

  const rijen = await db
    .select()
    .from(gebruikers)
    .where(eq(gebruikers.userId, userId))
    .limit(1);

  if (rijen.length === 0) {
    await db.insert(gebruikers).values({ userId, rol: "gebruiker" });
    return { userId, rol: "gebruiker" as Rol, naam: null, email: null, actief: true, aangemaktOp: new Date(), wachtwoord: null };
  }

  return rijen[0];
}

export async function requireRol(...rollen: Rol[]) {
  const gebruiker = await getGebruiker();
  if (!gebruiker) redirect("/sign-in");
  if (!rollen.includes(gebruiker.rol as Rol)) redirect("/start");
  return gebruiker;
}

export async function requireAdminOfRol(...rollen: Rol[]) {
  return requireRol("superadmin", ...rollen);
}

export async function isSuperAdmin() {
  const gebruiker = await getGebruiker();
  return gebruiker?.rol === "superadmin";
}
