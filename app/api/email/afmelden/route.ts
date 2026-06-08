export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gebruikers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://brickme.nl";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(`${APP_URL}/afmelden?fout=1`);
  }

  let userId: string;
  try {
    userId = Buffer.from(token, "base64url").toString("utf-8");
    if (!userId) throw new Error("leeg");
  } catch {
    return NextResponse.redirect(`${APP_URL}/afmelden?fout=1`);
  }

  await db
    .update(gebruikers)
    .set({ emailsAfgemeld: true })
    .where(eq(gebruikers.userId, userId));

  return NextResponse.redirect(`${APP_URL}/afmelden?ok=1`);
}
