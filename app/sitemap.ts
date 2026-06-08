import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { artikelen } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

const BASE = "https://brickme.nl";

const THEMAS = ["werk", "relatie", "identiteit", "verbinding", "kruispunt", "rouw"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statisch: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/start`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/professionals`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/betalen`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/voorwaarden`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    // Thema-startpagina's
    ...THEMAS.map(t => ({
      url: `${BASE}/start?thema=${t}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];

  try {
    const posts = await db
      .select({ slug: artikelen.slug, bijgewerktOp: artikelen.bijgewerktOp, weergaven: artikelen.weergaven })
      .from(artikelen)
      .where(eq(artikelen.gepubliceerd, true))
      .orderBy(desc(artikelen.weergaven));

    // Hoogste weergaven → priority 0.8, laagste → 0.5
    const maxWeergaven = Math.max(...posts.map(p => p.weergaven ?? 0), 1);
    const blogRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: p.bijgewerktOp ?? new Date(),
      changeFrequency: "monthly" as const,
      priority: Math.round((0.5 + 0.3 * ((p.weergaven ?? 0) / maxWeergaven)) * 10) / 10,
    }));

    return [...statisch, ...blogRoutes];
  } catch {
    return statisch;
  }
}
