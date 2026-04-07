import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { artikelen } from "@/lib/db/schema";
import { eq, desc, sql, and, ne } from "drizzle-orm";
import { BlogTagFilter } from "@/components/blog/BlogTagFilter";

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

interface Props {
  searchParams: Promise<{ tag?: string }>;
}

export default async function BlogPage({ searchParams }: Props) {
  const { tag: actieveTag } = await searchParams;

  // Alle gepubliceerde artikelen ophalen
  const alleArtikelen = await db
    .select({
      id: artikelen.id,
      slug: artikelen.slug,
      titel: artikelen.titel,
      excerpt: artikelen.excerpt,
      categorie: artikelen.categorie,
      tags: artikelen.tags,
      leestijd: artikelen.leestijd,
      ogAfbeelding: artikelen.ogAfbeelding,
      kaartTitel: artikelen.kaartTitel,
      gepubliceerdOp: artikelen.gepubliceerdOp,
      weergaven: artikelen.weergaven,
    })
    .from(artikelen)
    .where(eq(artikelen.gepubliceerd, true))
    .orderBy(desc(artikelen.gepubliceerdOp));

  // Alle unieke tags verzamelen
  const alleTags = Array.from(
    new Set(alleArtikelen.flatMap((a) => a.tags ?? []))
  ).sort();

  // Gefilterde artikelen op basis van actieve tag
  const gefilterd = actieveTag
    ? alleArtikelen.filter((a) => a.tags?.includes(actieveTag))
    : alleArtikelen;

  // Uitgelicht artikel = eerste (meest recent)
  const uitgelicht = gefilterd[0] ?? null;
  const overige = gefilterd.slice(1);

  // Meest gelezen (top 4, gesorteerd op weergaven)
  const meestGelezen = [...alleArtikelen]
    .sort((a, b) => (b.weergaven ?? 0) - (a.weergaven ?? 0))
    .slice(0, 4)
    .filter((a) => (a.weergaven ?? 0) > 0);

  return (
    <main style={{ minHeight: "100vh", background: "var(--color-surface)" }}>
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section style={{ padding: "72px 40px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ maxWidth: 680 }}>
          <p style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "var(--color-primary)", marginBottom: 14,
          }}>
            Brickme Blog
          </p>
          <h1 style={{
            fontSize: "clamp(36px, 5vw, 52px)", fontWeight: 400,
            margin: "0 0 16px", lineHeight: 1.1,
            fontFamily: "var(--font-serif)",
          }}>
            Inzichten over reflectie&nbsp;&amp;&nbsp;groei
          </h1>
          <p style={{ fontSize: 17, color: "var(--color-text-muted)", lineHeight: 1.65, margin: "0 0 36px" }}>
            Artikelen over zelfreflectie, LEGO Serious Play en wat het betekent om jezelf te bouwen.
          </p>
          {alleTags.length > 0 && (
            <BlogTagFilter tags={alleTags} actieveTag={actieveTag} />
          )}
        </div>
      </section>

      {gefilterd.length === 0 ? (
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px 80px", color: "var(--color-text-muted)", fontSize: 15 }}>
          Geen artikelen gevonden voor &ldquo;{actieveTag}&rdquo;.{" "}
          <Link href="/blog" style={{ color: "var(--color-primary)", textDecoration: "none" }}>Alle artikelen →</Link>
        </section>
      ) : (
        <>
          {/* ── Uitgelicht artikel ─────────────────────────────────────── */}
          {uitgelicht && (
            <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px 56px" }}>
              <Link href={`/blog/${uitgelicht.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <article style={{
                  display: "grid",
                  gridTemplateColumns: uitgelicht.ogAfbeelding ? "1fr 1fr" : "1fr",
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "var(--color-surface-high)",
                  boxShadow: "var(--shadow-card)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}>
                  {uitgelicht.ogAfbeelding && (
                    <div style={{ position: "relative", minHeight: 340 }}>
                      <img
                        src={uitgelicht.ogAfbeelding}
                        alt={uitgelicht.titel}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </div>
                  )}
                  <div style={{ padding: "48px 48px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                      {uitgelicht.categorie && (
                        <span style={{
                          fontSize: 11, fontWeight: 600, letterSpacing: "0.1em",
                          textTransform: "uppercase", color: "var(--color-primary)",
                        }}>
                          {uitgelicht.categorie}
                        </span>
                      )}
                      <span style={{ fontSize: 11, background: "var(--color-primary)", color: "#fff", borderRadius: 4, padding: "2px 8px", fontWeight: 500 }}>
                        Nieuwste
                      </span>
                    </div>
                    <h2 style={{
                      fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 400, lineHeight: 1.2,
                      margin: "0 0 16px", fontFamily: "var(--font-serif)",
                    }}>
                      {uitgelicht.titel}
                    </h2>
                    {uitgelicht.excerpt && (
                      <p style={{ fontSize: 15, color: "var(--color-text-muted)", lineHeight: 1.65, margin: "0 0 28px" }}>
                        {uitgelicht.excerpt}
                      </p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 13, color: "var(--color-text-muted)" }}>
                      {uitgelicht.gepubliceerdOp && (
                        <time dateTime={uitgelicht.gepubliceerdOp.toISOString()}>
                          {formatDatum(uitgelicht.gepubliceerdOp)}
                        </time>
                      )}
                      {uitgelicht.leestijd && <span>{uitgelicht.leestijd} min lezen</span>}
                      <span style={{ marginLeft: "auto", color: "var(--color-primary)", fontWeight: 600, fontSize: 14 }}>
                        Lees artikel →
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </section>
          )}

          {/* ── Hoofdlayout: artikelen + sidebar ──────────────────────── */}
          <section style={{
            maxWidth: 1100, margin: "0 auto", padding: "0 40px 80px",
            display: "grid",
            gridTemplateColumns: meestGelezen.length > 0 || alleTags.length > 0 ? "1fr 300px" : "1fr",
            gap: 48,
            alignItems: "start",
          }}>
            {/* Artikelenlijst */}
            <div>
              {overige.length > 0 && (
                <>
                  <h3 style={{
                    fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "var(--color-text-muted)",
                    margin: "0 0 24px", paddingBottom: 12,
                    borderBottom: "1px solid var(--color-outline)",
                  }}>
                    {actieveTag ? `Meer over "${actieveTag}"` : "Meer artikelen"}
                  </h3>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 24,
                  }}>
                    {overige.map((artikel) => (
                      <ArtikelKaart key={artikel.id} artikel={artikel} />
                    ))}
                  </div>
                </>
              )}

              {overige.length === 0 && uitgelicht && (
                <p style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
                  Dit is momenteel het enige artikel in deze categorie.
                </p>
              )}
            </div>

            {/* Sidebar */}
            <aside style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {/* Meest gelezen */}
              {meestGelezen.length > 0 && (
                <div style={{
                  background: "var(--color-surface-high)",
                  borderRadius: 16, padding: "28px 24px",
                }}>
                  <h3 style={{
                    fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "var(--color-text-muted)",
                    margin: "0 0 20px",
                  }}>
                    Meest gelezen
                  </h3>
                  <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                    {meestGelezen.map((a, i) => (
                      <li key={a.id} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                        <span style={{
                          fontSize: 22, fontWeight: 300, color: "var(--color-outline)",
                          lineHeight: 1, minWidth: 28, fontFamily: "var(--font-serif)",
                        }}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <Link
                            href={`/blog/${a.slug}`}
                            style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text)", textDecoration: "none", lineHeight: 1.35, display: "block" }}
                          >
                            {a.titel}
                          </Link>
                          <span style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4, display: "block" }}>
                            {a.weergaven?.toLocaleString("nl-NL")} keer gelezen
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Tag cloud */}
              {alleTags.length > 0 && (
                <div>
                  <h3 style={{
                    fontSize: 12, fontWeight: 600, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "var(--color-text-muted)",
                    margin: "0 0 14px",
                  }}>
                    Onderwerpen
                  </h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {alleTags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        style={{
                          fontSize: 12, fontWeight: 500,
                          padding: "5px 12px", borderRadius: 100,
                          border: "1px solid var(--color-outline)",
                          color: tag === actieveTag ? "#fff" : "var(--color-text-muted)",
                          background: tag === actieveTag ? "var(--color-primary)" : "transparent",
                          textDecoration: "none",
                          transition: "all 0.15s",
                        }}
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA coaching */}
              <div style={{
                background: "#2D4A3E",
                borderRadius: 16, padding: "28px 24px",
                color: "#fff",
              }}>
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", margin: "0 0 10px" }}>
                  Persoonlijke groei
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 400, margin: "0 0 12px", lineHeight: 1.3, fontFamily: "var(--font-serif)", color: "#fff" }}>
                  Klaar om jezelf te bouwen?
                </h3>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", margin: "0 0 20px" }}>
                  Ontdek wat LEGO Serious Play voor jouw reflectie kan betekenen.
                </p>
                <Link
                  href="/sessie"
                  style={{
                    display: "inline-block", fontSize: 13, fontWeight: 600,
                    padding: "10px 20px", borderRadius: 100,
                    background: "var(--color-primary)", color: "#fff",
                    textDecoration: "none",
                  }}
                >
                  Start een sessie
                </Link>
              </div>
            </aside>
          </section>
        </>
      )}
    </main>
  );
}

// ── Artikel kaart component ─────────────────────────────────────────────────
type ArtikelKaartProps = {
  artikel: {
    id: string;
    slug: string;
    titel: string;
    excerpt: string | null;
    categorie: string | null;
    tags: string[] | null;
    leestijd: number | null;
    ogAfbeelding: string | null;
    kaartTitel: string | null;
    gepubliceerdOp: Date | null;
    weergaven: number;
  };
};

function ArtikelKaart({ artikel }: ArtikelKaartProps) {
  return (
    <Link href={`/blog/${artikel.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
      <article style={{
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid var(--color-outline)",
        background: "var(--color-surface-bright)",
        boxShadow: "0 1px 4px rgba(44,31,20,0.04)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}>
        {artikel.ogAfbeelding ? (
          <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
            <img
              src={artikel.ogAfbeelding}
              alt={artikel.titel}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        ) : artikel.kaartTitel ? (
          <div style={{
            aspectRatio: "16/9",
            overflow: "hidden",
            background: "linear-gradient(135deg, var(--color-primary) 0%, #e8875c 100%)",
            display: "flex",
            alignItems: "flex-end",
            padding: "24px 22px 20px",
          }}>
            <p style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 500,
              color: "white",
              lineHeight: 1.3,
              fontFamily: "var(--font-serif)",
            }}>
              {artikel.kaartTitel}
            </p>
          </div>
        ) : (
          <div style={{
            height: 8,
            background: "linear-gradient(90deg, var(--color-primary), #e8875c)",
          }} />
        )}
        <div style={{ padding: "20px 22px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
          {artikel.categorie && (
            <p style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "var(--color-primary)",
              margin: "0 0 8px",
            }}>
              {artikel.categorie}
            </p>
          )}
          <h2 style={{
            fontSize: 17, fontWeight: 500, lineHeight: 1.3,
            margin: "0 0 10px", flex: 1,
            fontFamily: "var(--font-serif)",
          }}>
            {artikel.titel}
          </h2>
          {artikel.excerpt && (
            <p style={{
              fontSize: 13, color: "var(--color-text-muted)",
              lineHeight: 1.6, margin: "0 0 16px",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical" as "vertical",
              overflow: "hidden",
            }}>
              {artikel.excerpt}
            </p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "var(--color-text-muted)", marginTop: "auto" }}>
            {artikel.gepubliceerdOp && (
              <time dateTime={artikel.gepubliceerdOp.toISOString()}>
                {formatDatum(artikel.gepubliceerdOp)}
              </time>
            )}
            {artikel.leestijd && <span>{artikel.leestijd} min</span>}
            {(artikel.weergaven ?? 0) > 0 && (
              <span style={{ marginLeft: "auto" }}>
                {artikel.weergaven?.toLocaleString("nl-NL")} ×
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
