import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { artikelen } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { ViewTracker } from "@/components/blog/ViewTracker";

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

/** Als de inhoud geen HTML-tags bevat, zet alinea's om naar <p>-elementen */
function tekstNaarHtml(inhoud: string): string {
  if (/<[a-z][\s\S]*>/i.test(inhoud)) return inhoud; // al HTML
  return inhoud
    .split(/\n{2,}/)
    .map(alinea => alinea.trim())
    .filter(Boolean)
    .map(alinea => `<p>${alinea.replace(/\n/g, "<br>")}</p>`)
    .join("\n");
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

  const artikelUrl = `https://brickme.nl/blog/${slug}`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ViewTracker slug={slug} />
      <main style={{ minHeight: "100vh", background: "var(--color-surface)" }}>
        {/* Breadcrumb */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 40px 0", fontSize: 13, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
          <Link href="/" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Brickme</Link>
          <span>/</span>
          <Link href="/blog" style={{ color: "var(--color-text-muted)", textDecoration: "none" }}>Blog</Link>
          <span>/</span>
          <span style={{ color: "var(--color-text)" }}>{artikel.titel}</span>
        </div>
        <header style={{ maxWidth: 760, margin: "0 auto", padding: "40px 40px 32px" }}>
          {artikel.categorie && (
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-primary)", margin: "0 0 16px" }}>
              {artikel.categorie}
            </p>
          )}
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 400, margin: "0 0 20px", lineHeight: 1.15, fontFamily: "var(--font-serif)" }}>{artikel.titel}</h1>
          {artikel.excerpt && (
            <p style={{ fontSize: 18, color: "var(--color-text-muted)", margin: "0 0 24px", lineHeight: 1.65 }}>{artikel.excerpt}</p>
          )}
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 16, fontSize: 13, color: "var(--color-text-muted)", paddingBottom: 28, borderBottom: "1px solid var(--color-outline)" }}>
            {artikel.gepubliceerdOp && <time dateTime={artikel.gepubliceerdOp.toISOString()}>{formatDatum(artikel.gepubliceerdOp)}</time>}
            {artikel.leestijd && <span>{artikel.leestijd} min lezen</span>}
            {/* Share buttons */}
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(artikelUrl)}`}
                target="_blank" rel="noopener noreferrer"
                title="Deel op LinkedIn"
                style={{ fontSize: 12, fontWeight: 500, padding: "5px 12px", borderRadius: 100, border: "1px solid var(--color-outline)", color: "var(--color-text-muted)", textDecoration: "none" }}
              >
                LinkedIn
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(artikelUrl)}&text=${encodeURIComponent(artikel.titel)}`}
                target="_blank" rel="noopener noreferrer"
                title="Deel op X"
                style={{ fontSize: 12, fontWeight: 500, padding: "5px 12px", borderRadius: 100, border: "1px solid var(--color-outline)", color: "var(--color-text-muted)", textDecoration: "none" }}
              >
                X
              </a>
            </div>
          </div>
        </header>
        {artikel.ogAfbeelding && (
          <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 40px 40px" }}>
            <img src={artikel.ogAfbeelding} alt={artikel.titel} style={{ width: "100%", borderRadius: 16, aspectRatio: "16/9", objectFit: "cover" }} />
          </div>
        )}
        <article className="blog-prose" style={{ maxWidth: 760, margin: "0 auto", padding: "0 40px 80px" }}
          dangerouslySetInnerHTML={{ __html: tekstNaarHtml(artikel.inhoud) }} />
        {/* Tags */}
        {artikel.tags && artikel.tags.length > 0 && (
          <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 40px 0", borderTop: "1px solid var(--color-outline)" }}>
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-muted)", margin: "0 0 12px" }}>
              Onderwerpen
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {artikel.tags.map(tag => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  style={{ fontSize: 12, fontWeight: 500, background: "var(--color-surface-high)", borderRadius: 100, padding: "5px 14px", color: "var(--color-text-muted)", textDecoration: "none", border: "1px solid var(--color-outline)" }}
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}
        {/* Terug naar blog */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 40px 80px" }}>
          <Link href="/blog" style={{ fontSize: 14, color: "var(--color-primary)", textDecoration: "none", fontWeight: 600 }}>← Terug naar alle artikelen</Link>
        </div>
      </main>
    </>
  );
}
