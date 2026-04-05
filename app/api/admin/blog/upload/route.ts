import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { isSuperAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
  }

  const formData = await req.formData();
  const bestand = formData.get("bestand") as File | null;

  if (!bestand) {
    return NextResponse.json({ error: "Geen bestand" }, { status: 400 });
  }

  const toegestaan = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
  if (!toegestaan.includes(bestand.type)) {
    return NextResponse.json({ error: "Alleen afbeeldingen (jpg, png, webp, gif)" }, { status: 400 });
  }

  if (bestand.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Maximaal 5 MB" }, { status: 400 });
  }

  const extensie = bestand.name.split(".").pop() ?? "jpg";
  const bestandsnaam = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${extensie}`;

  const blob = await put(bestandsnaam, bestand, {
    access: "public",
    contentType: bestand.type,
  });

  return NextResponse.json({ url: blob.url });
}
