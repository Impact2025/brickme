export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { artikelen } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

const BASE = "https://brickme.nl";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await db
    .select({
      slug: artikelen.slug,
      titel: artikelen.titel,
      excerpt: artikelen.excerpt,
      categorie: artikelen.categorie,
      gepubliceerdOp: artikelen.gepubliceerdOp,
      bijgewerktOp: artikelen.bijgewerktOp,
      ogAfbeelding: artikelen.ogAfbeelding,
      trefwoorden: artikelen.trefwoorden,
    })
    .from(artikelen)
    .where(eq(artikelen.gepubliceerd, true))
    .orderBy(desc(artikelen.gepubliceerdOp))
    .limit(20);

  const items = posts.map((p) => {
    const url = `${BASE}/blog/${p.slug}`;
    const datum = p.gepubliceerdOp ?? p.bijgewerktOp;
    return `
    <item>
      <title>${escapeXml(p.titel)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${datum.toUTCString()}</pubDate>
      ${p.excerpt ? `<description>${escapeXml(p.excerpt)}</description>` : ""}
      ${p.categorie ? `<category>${escapeXml(p.categorie)}</category>` : ""}
      ${p.ogAfbeelding ? `<enclosure url="${escapeXml(p.ogAfbeelding)}" type="image/jpeg" length="0"/>` : ""}
      ${(p.trefwoorden ?? []).map(t => `<category>${escapeXml(t)}</category>`).join("")}
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Brickme Blog</title>
    <link>${BASE}/blog</link>
    <description>Artikelen over zelfreflectie, LEGO Serious Play en persoonlijke groei.</description>
    <language>nl</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE}/og-image.png</url>
      <title>Brickme Blog</title>
      <link>${BASE}/blog</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
