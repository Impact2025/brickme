export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { requireRol } from "@/lib/auth";
import { stuurOpenFollowups } from "@/app/api/cron/followup/route";

export async function POST() {
  await requireRol("superadmin");
  const resultaat = await stuurOpenFollowups();
  return NextResponse.json(resultaat);
}
