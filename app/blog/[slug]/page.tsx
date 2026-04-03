import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { artikelen } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [artikel] = await db
    .select({ titel: artikelen.titel, metaTitel: artikelen.metaTitel, metaBeschrijving: artikelen.metaBeschrijving, ogAfbeelding: artikelen.ogAfbeelding, trefwoorden: artikelen.trefwoorden, gepubliceerdOp: artikelen.gepubliceerdOp })
    .from(artikelen)
    .where(and(eq(artikelen.slug, slug), eq(artikelen.gepubliceerd, true)));

  if (!artikel) return { title: "Niet gevonden" };

  const titel = artikel.metaTitel ?? artikel.titel;
  const beschrijving = artikel.metaBeschrijving ?? undefined;
  const url = `https://brickme.nl/blog/${slug}`;

  return {
    title: titel,
    description: beschrijving,
    keywords: artikel.trefwoorden ?? undefined,
    alternates: { canonical: url },
    openGraph: { title: titel, description: beschrijving, url, siteName: "Brickme", type: "article", publishedTime: artikel.gepubliceerdOp?.toISOString(), images: artikel.ogAfbeelding ? [{ url: artikel.ogAfbeelding, width: 1200, height: 630 }] : undefined },
    twitter: { card: "summary_large_image", title: titel, description: beschrijving, images: artikel.ogAfbeelding ? [artikel.ogAfbeelding] : undefined },
  };
}

function formatDatum(datum: Date | null) {
  if (!datum) return "";
  return datum.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

export default async function ArtikelPage({ params }: Props) {
  const { slug } = await params;
  const [artikel] = await db.select().from(artikelen).where(and(eq(artikelen.slug, slug), eq(artikelen.gepubliceerd, true)));
  if (!artikel) notFound();

  const jsonLd = artikel.schemaMarkup ?? {
    "@context": "https://schema.org", "@type": "Article",
    headline: artikel.metaTitel ?? artikel.titel,
    description: artikel.metaBeschrijving ?? artikel.excerpt ?? "",
    author: { "@type": "Organization", name: "Brickme", url: "https://brickme.nl" },
    publisher: { "@type": "Organization", name: "Brickme", url: "https://brickme.nl" },
    datePublished: artikel.gepubliceerdOp?.toISOString(),
    dateModified: artikel.bijgewerktOp.toISOString(),
    url: `https://brickme.nl/blog/${slug}`,
    ...(artikel.ogAfbeelding ? { image: artikel.ogAfbeelding } : {}),
    keywords: artikel.trefwoorden?.join(", "),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main style={{ minHeight: "100vh", background: "var(--color-surface)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 40px 0", fontSize: 13, color: "var(--color-text-muted)" }}>
          <Link href="/" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Brickme</Link>
          {" / "}
          <Link href="/blog" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Blog</Link>
          {" / "}
          <span style={{ color: "var(--color-text)" }}>{artikel.titel}</span>
        </div>
        <header style={{ maxWidth: 760, margin: "0 auto", padding: "40px 40px 32px" }}>
          {artikel.categorie && (
            <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-primary)", margin: "0 0 16px" }}>
              {artikel.categorie}
            </p>
          )}
          <h1 style={{ fontSize: 42, fontWeight: 400, margin: "0 0 20px", lineHeight: 1.15 }}>{artikel.titel}</h1>
          {artikel.excerpt && (
            <p style={{ fontSize: 18, color: "var(--color-text-muted)", margin: "0 0 24px", lineHeight: 1.6 }}>{artikel.excerpt}</p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 13, color: "var(--color-text-muted)", paddingBottom: 32, borderBottom: "1px solid var(--color-outline)" }}>
            {artikel.gepubliceerdOp && <time dateTime={artikel.gepubliceerdOp.toISOString()}>{formatDatum(artikel.gepubliceerdOp)}</time>}
            {artikel.leestijd && <span>{artikel.leestijd} min lezen</span>}
          </div>
        </header>
        {artikel.ogAfbeelding && (
          <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 40px 40px" }}>
            <img src={artikel.ogAfbeelding} alt={artikel.titel} style={{ width: "100%", borderRadius: 16, aspectRatio: "16/9", objectFit: "cover" }} />
          </div>
        )}
        <article style={{ maxWidth: 760, margin: "0 auto", padding: "0 40px 80px", fontSize: 17, lineHeight: 1.8, color: "var(--color-text)" }}
          dangerouslySetInnerHTML={{ __html: artikel.inhoud }} />
        {artikel.tags && artikel.tags.length > 0 && (
          <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 40px 60px", borderTop: "1px solid var(--color-outline)" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {artikel.tags.map(tag => (
                <span key={tag} style={{ fontSize: 12, background: "var(--color-surface-high)", borderRadius: 100, padding: "4px 12px", color: "var(--color-text-muted)" }}>{tag}</span>
              ))}
            </div>
          </div>
        )}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 40px 80px", borderTop: "1px solid var(--color-outline)" }}>
          <Link href="/blog" style={{ fontSize: 15, color: "var(--color-primary)", textDecoration: "none", fontWeight: 500 }}>← Alle artikelen</Link>
        </div>
      </main>
    </>
  );
}
