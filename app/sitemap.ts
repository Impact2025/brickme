import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { artikelen } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const BASE = "https://brickme.nl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statisch: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/professionals`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/start`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/voorwaarden`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const posts = await db
      .select({ slug: artikelen.slug, bijgewerktOp: artikelen.bijgewerktOp })
      .from(artikelen)
      .where(eq(artikelen.gepubliceerd, true));

    const blogRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: p.bijgewerktOp ?? new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

    return [...statisch, ...blogRoutes];
  } catch {
    return statisch;
  }
}
