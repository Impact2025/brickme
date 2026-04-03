import type { Metadata } from "next";
import Link from "next/link";
import { db, artikelen } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export const metadata: Metadata = {
  title: "Blog — Brickme",
  description: "Artikelen over zelfreflectie, LEGO Serious Play en persoonlijke groei.",
  alternates: { canonical: "https://brickme.nl/blog" },
  openGraph: {
    title: "Blog — Brickme",
    description: "Artikelen over zelfreflectie, LEGO Serious Play en persoonlijke groei.",
    url: "https://brickme.nl/blog",
    siteName: "Brickme",
    type: "website",
  },
};

function formatDatum(datum: Date | null) {
  if (!datum) return "";
  return datum.toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPage() {
  const items = await db
    .select({
      id: artikelen.id,
      slug: artikelen.slug,
      titel: artikelen.titel,
      excerpt: artikelen.excerpt,
      categorie: artikelen.categorie,
      tags: artikelen.tags,
      leestijd: artikelen.leestijd,
      ogAfbeelding: artikelen.ogAfbeelding,
      gepubliceerdOp: artikelen.gepubliceerdOp,
    })
    .from(artikelen)
    .where(eq(artikelen.gepubliceerd, true))
    .orderBy(desc(artikelen.gepubliceerdOp));

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-surface)" }}>
      {/* Hero */}
      <section style={{
        padding: "80px 40px 60px",
        textAlign: "center",
        maxWidth: 680,
        margin: "0 auto",
      }}>
        <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 16 }}>
          Brickme Blog
        </p>
        <h1 style={{ fontSize: 48, fontWeight: 400, margin: "0 0 20px", lineHeight: 1.1 }}>
          Inzichten over reflectie & groei
        </h1>
        <p style={{ fontSize: 17, color: "var(--color-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Artikelen over zelfreflectie, LEGO Serious Play en wat het betekent om jezelf te bouwen.
        </p>
      </section>

      {/* Artikelen */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 40px 80px" }}>
        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-text-muted)" }}>
            Binnenkort verschijnen hier artikelen.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {items.map((artikel, i) => (
              <article
                key={artikel.id}
                style={{
                  borderBottom: i < items.length - 1 ? "1px solid var(--color-outline)" : "none",
                  padding: "36px 0",
                  display: "grid",
                  gridTemplateColumns: artikel.ogAfbeelding ? "1fr 200px" : "1fr",
                  gap: 32,
                  alignItems: "start",
                }}
              >
                <div>
                  {artikel.categorie && (
                    <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-primary)", margin: "0 0 10px" }}>
                      {artikel.categorie}
                    </p>
                  )}
                  <h2 style={{ fontSize: 22, fontWeight: 400, margin: "0 0 12px", lineHeight: 1.3 }}>
                    <Link
                      href={`/blog/${artikel.slug}`}
                      style={{ color: "var(--color-text)", textDecoration: "none" }}
                    >
                      {artikel.titel}
                    </Link>
                  </h2>
                  {artikel.excerpt && (
                    <p style={{ fontSize: 15, color: "var(--color-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
                      {artikel.excerpt}
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 13, color: "var(--color-text-muted)" }}>
                    {artikel.gepubliceerdOp && (
                      <time dateTime={artikel.gepubliceerdOp.toISOString()}>
                        {formatDatum(artikel.gepubliceerdOp)}
                      </time>
                    )}
                    {artikel.leestijd && (
                      <span>{artikel.leestijd} min lezen</span>
                    )}
                    <Link
                      href={`/blog/${artikel.slug}`}
                      style={{ color: "var(--color-primary)", fontWeight: 500, textDecoration: "none", marginLeft: "auto" }}
                    >
                      Lees meer →
                    </Link>
                  </div>
                </div>
                {artikel.ogAfbeelding && (
                  <img
                    src={artikel.ogAfbeelding}
                    alt={artikel.titel}
                    style={{ width: "100%", borderRadius: 12, aspectRatio: "16/9", objectFit: "cover" }}
                  />
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
