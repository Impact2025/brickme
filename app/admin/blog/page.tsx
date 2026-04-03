"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Artikel } from "@/types";

type ArtikelRij = Pick<Artikel, "id" | "slug" | "titel" | "excerpt" | "categorie" | "tags" | "seoScore" | "leestijd" | "gepubliceerd" | "gepubliceerdOp" | "aangemaktOp" | "bijgewerktOp">;

function SeoScoreBadge({ score }: { score: number | null }) {
  if (score == null) return <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>—</span>;
  const kleur = score >= 80 ? "#476558" : score >= 60 ? "#a03b1f" : "#8B7355";
  return (
    <span style={{
      fontSize: 12,
      fontWeight: 600,
      color: kleur,
      background: `${kleur}18`,
      borderRadius: 6,
      padding: "2px 8px",
    }}>
      {score}
    </span>
  );
}

function StatusBadge({ gepubliceerd }: { gepubliceerd: boolean }) {
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 500,
      padding: "3px 10px",
      borderRadius: 100,
      background: gepubliceerd ? "rgba(71,101,88,0.12)" : "rgba(44,31,20,0.06)",
      color: gepubliceerd ? "#476558" : "var(--color-text-muted)",
    }}>
      {gepubliceerd ? "Gepubliceerd" : "Concept"}
    </span>
  );
}

function formatDatum(datum: string | null) {
  if (!datum) return "—";
  return new Date(datum).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

export default function BlogAdminPage() {
  const [artikelen, setArtikelen] = useState<ArtikelRij[]>([]);
  const [laden, setLaden] = useState(true);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/blog")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setArtikelen(data);
        else setFout(data.error ?? "Laden mislukt");
      })
      .catch(() => setFout("Netwerkfout"))
      .finally(() => setLaden(false));
  }, []);

  const gepubliceerd = artikelen.filter(a => a.gepubliceerd).length;
  const gemScore = artikelen.filter(a => a.seoScore).length
    ? Math.round(artikelen.filter(a => a.seoScore).reduce((s, a) => s + (a.seoScore ?? 0), 0) / artikelen.filter(a => a.seoScore).length)
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-surface)" }}>
      {/* Header */}
      <div style={{
        background: "var(--color-surface-bright)",
        borderBottom: "1px solid var(--color-outline)",
        padding: "20px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <h1 style={{ fontSize: 22, margin: 0, fontWeight: 400 }}>Blog</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-muted)" }}>
            Artikelen beheren en publiceren
          </p>
        </div>
        <Link href="/admin/blog/nieuw" className="btn-primary" style={{ padding: "10px 22px", fontSize: 14 }}>
          + Nieuw artikel
        </Link>
      </div>

      <div style={{ padding: "32px 40px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Totaal", waarde: artikelen.length.toString() },
            { label: "Gepubliceerd", waarde: gepubliceerd.toString() },
            { label: "Gem. SEO score", waarde: gemScore != null ? `${gemScore}/100` : "—" },
          ].map(stat => (
            <div key={stat.label} style={{
              background: "var(--color-surface-bright)",
              borderRadius: 14,
              padding: "20px 24px",
              boxShadow: "var(--shadow-card)",
            }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: "var(--color-text)", fontFamily: "var(--font-serif)" }}>
                {stat.waarde}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Tabel */}
        {laden ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--color-text-muted)" }}>
            Laden...
          </div>
        ) : fout ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#a03b1f" }}>
            {fout}
          </div>
        ) : artikelen.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "80px 40px",
            background: "var(--color-surface-bright)",
            borderRadius: 20,
            boxShadow: "var(--shadow-card)",
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
            <h2 style={{ fontSize: 20, fontWeight: 400, margin: "0 0 8px" }}>Nog geen artikelen</h2>
            <p style={{ color: "var(--color-text-muted)", marginBottom: 24, fontSize: 15 }}>
              Schrijf je eerste artikel via Claude en plak het hier.
            </p>
            <Link href="/admin/blog/nieuw" className="btn-primary">
              + Nieuw artikel
            </Link>
          </div>
        ) : (
          <div style={{ background: "var(--color-surface-bright)", borderRadius: 16, boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--color-outline)" }}>
                  {["Artikel", "Status", "SEO", "Categorie", "Datum", ""].map(h => (
                    <th key={h} style={{
                      padding: "12px 20px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 500,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      color: "var(--color-text-muted)",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {artikelen.map((artikel, i) => (
                  <tr
                    key={artikel.id}
                    style={{
                      borderBottom: i < artikelen.length - 1 ? "1px solid var(--color-outline)" : "none",
                    }}
                  >
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: 500, fontSize: 14, color: "var(--color-text)", marginBottom: 4 }}>
                        {artikel.titel}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                        /blog/{artikel.slug}
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <StatusBadge gepubliceerd={artikel.gepubliceerd} />
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <SeoScoreBadge score={artikel.seoScore} />
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--color-text-muted)" }}>
                      {artikel.categorie ?? "—"}
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: 13, color: "var(--color-text-muted)" }}>
                      {formatDatum(artikel.gepubliceerdOp ?? artikel.aangemaktOp)}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <Link
                        href={`/admin/blog/${artikel.id}/bewerken`}
                        style={{
                          fontSize: 13,
                          color: "var(--color-primary)",
                          textDecoration: "none",
                          fontWeight: 500,
                        }}
                      >
                        Bewerken →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
