"use server";
import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireRol } from "@/lib/auth";

export async function maakCouponAan(formData: FormData) {
  await requireRol("superadmin");

  const code = (formData.get("code") as string).toUpperCase().trim();
  const kortingPercent = parseInt(formData.get("kortingPercent") as string, 10);
  const beschrijving = (formData.get("beschrijving") as string) || null;
  const maxGebruikRaw = formData.get("maxGebruik") as string;
  const maxGebruik = maxGebruikRaw ? parseInt(maxGebruikRaw, 10) : null;
  const verloptOpRaw = formData.get("verloptOp") as string;
  const verloptOp = verloptOpRaw ? new Date(verloptOpRaw) : null;

  if (!code || isNaN(kortingPercent) || kortingPercent < 1 || kortingPercent > 100) return;

  await db.insert(coupons).values({ code, kortingPercent, beschrijving, maxGebruik, verloptOp });
  revalidatePath("/admin/coupons");
}

export async function toggleCoupon(id: string, actief: boolean) {
  await requireRol("superadmin");
  await db.update(coupons).set({ actief }).where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
}

export async function verwijderCoupon(id: string) {
  await requireRol("superadmin");
  await db.delete(coupons).where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
}
