export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { stuurOpenFollowups } from "@/lib/followup";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Niet toegestaan" }, { status: 401 });
  }

  const resultaat = await stuurOpenFollowups();
  return NextResponse.json(resultaat);
}
