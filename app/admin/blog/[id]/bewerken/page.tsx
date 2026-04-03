import { db } from "@/lib/db";
import { artikelen } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ArtikelEditor from "@/components/blog/ArtikelEditor";
import type { Artikel } from "@/types";

export default async function BewerkenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [artikel] = await db.select().from(artikelen).where(eq(artikelen.id, id));
  if (!artikel) notFound();

  const data: Partial<Artikel> = {
    ...artikel,
    schemaMarkup: artikel.schemaMarkup as object | null,
    gepubliceerdOp: artikel.gepubliceerdOp?.toISOString() ?? null,
    aangemaktOp: artikel.aangemaktOp.toISOString(),
    bijgewerktOp: artikel.bijgewerktOp.toISOString(),
  };

  return <ArtikelEditor initieel={data} artikelId={id} />;
}
