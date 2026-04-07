"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Artikel, SeoResultaat } from "@/types";
import type { InterneLink } from "@/lib/db/schema";
import RijkeTekstEditor from "./RijkeTekstEditor";

interface ArtikelEditorProps {
  initieel?: Partial<Artikel>;
  artikelId?: string;
}

type Veld = {
  titel: string;
  inhoud: string;
  schemaMarkup: object | null;
  slug: string;
  excerpt: string;
  metaTitel: string;
  metaBeschrijving: string;
  trefwoorden: string[];
  categorie: string;
  tags: string[];
  ogAfbeelding: string;
  kaartTitel: string;
  interneLinks: InterneLink[];
  leestijd: number;
  seoScore: number;
  verbeteringen: string[];
  gepubliceerd: boolean;
  gepubliceerdOp: string;
};

function seoScoreKleur(score: number): string {
  if (score >= 80) return "#476558";
  if (score >= 60) return "#a03b1f";
  return "#8B7355";
}

function SerpPreview({ metaTitel, metaBeschrijving, slug }: { metaTitel: string; metaBeschrijving: string; slug: string }) {
  const url = `brickme.nl/blog/${slug || "artikel-slug"}`;
  const titel = metaTitel || "Artikel titel verschijnt hier";
  const beschr = metaBeschrijving || "Meta beschrijving verschijnt hier. Schrijf een pakkende samenvatting die bezoekers aantrekt vanuit Google.";

  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: "16px 20px", border: "1px solid #e0e0e0", fontFamily: "arial, sans-serif" }}>
      <div style={{ fontSize: 12, color: "#202124", marginBottom: 2 }}>
        <span style={{ color: "#4d5156" }}>brickme.nl</span>
        <span style={{ color: "#4d5156" }}> › blog › {slug || "artikel-slug"}</span>
      </div>
      <div style={{
        fontSize: 20,
        color: "#1a0dab",
        marginBottom: 4,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: 600,
      }}>
        {titel.length > 60 ? titel.slice(0, 57) + "..." : titel}
      </div>
      <div style={{ fontSize: 14, color: "#4d5156", lineHeight: 1.58, maxWidth: 600 }}>
        {beschr.length > 160 ? beschr.slice(0, 157) + "..." : beschr}
      </div>
    </div>
  );
}


export default function ArtikelEditor({ initieel, artikelId }: ArtikelEditorProps) {
  const router = useRouter();

  const [veld, setVeld] = useState<Veld>({
    titel: initieel?.titel ?? "",
    inhoud: initieel?.inhoud ?? "",
    slug: initieel?.slug ?? "",
    excerpt: initieel?.excerpt ?? "",
    metaTitel: initieel?.metaTitel ?? "",
    metaBeschrijving: initieel?.metaBeschrijving ?? "",
    trefwoorden: initieel?.trefwoorden ?? [],
    categorie: initieel?.categorie ?? "",
    tags: initieel?.tags ?? [],
    ogAfbeelding: initieel?.ogAfbeelding ?? "",
    kaartTitel: initieel?.kaartTitel ?? "",
    interneLinks: initieel?.interneLinks ?? [],
    schemaMarkup: initieel?.schemaMarkup ?? null,
    leestijd: initieel?.leestijd ?? 0,
    seoScore: initieel?.seoScore ?? 0,
    verbeteringen: [],
    gepubliceerd: initieel?.gepubliceerd ?? false,
    gepubliceerdOp: initieel?.gepubliceerdOp
      ? new Date(initieel.gepubliceerdOp).toISOString().slice(0, 16)
      : "",
  });

  const [headerType, setHeaderType] = useState<"afbeelding" | "titel">(
    initieel?.kaartTitel && !initieel?.ogAfbeelding ? "titel" : "afbeelding"
  );
  const [aiLaden, setAiLaden] = useState(false);
  const [verbeteringLaden, setVerbeteringLaden] = useState<number | null>(null);
  const [opslaan, setOpslaan] = useState(false);
  const [fout, setFout] = useState<string | null>(null);
  const [succes, setSucces] = useState<string | null>(null);
  const [nieuwTrefwoord, setNieuwTrefwoord] = useState("");
  const [ogUploaden, setOgUploaden] = useState(false);

  async function handleOgUpload(bestand: File) {
    setOgUploaden(true);
    const form = new FormData();
    form.append("bestand", bestand);
    try {
      const res = await fetch("/api/admin/blog/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload mislukt");
      update("ogAfbeelding", data.url);
    } catch (e) {
      setFout(e instanceof Error ? e.message : "Upload mislukt");
    } finally {
      setOgUploaden(false);
    }
  }

  const update = useCallback(<K extends keyof Veld>(key: K, value: Veld[K]) => {
    setVeld(v => ({ ...v, [key]: value }));
  }, []);

  async function handleAiSeo() {
    if (!veld.titel || !veld.inhoud) {
      setFout("Vul eerst een titel en inhoud in.");
      return;
    }
    setAiLaden(true);
    setFout(null);
    try {
      const res = await fetch("/api/admin/blog/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titel: veld.titel,
          inhoud: veld.inhoud,
          huidigSlug: artikelId ? veld.slug : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "SEO genereren mislukt");
      }
      const data: SeoResultaat & { leestijd: number } = await res.json();

      // Sla basisdata op
      let huidigState = {
        metaTitel: data.metaTitel ?? veld.metaTitel,
        metaBeschrijving: data.metaBeschrijving ?? veld.metaBeschrijving,
        slug: veld.slug || data.slug || veld.slug,
        categorie: data.categorie ?? veld.categorie,
        excerpt: data.excerpt ?? veld.excerpt,
        trefwoorden: data.trefwoorden ?? veld.trefwoorden,
        interneLinks: data.interneLinks ?? veld.interneLinks,
        schemaMarkup: data.schemaMarkup ?? veld.schemaMarkup,
        leestijd: data.leestijd ?? veld.leestijd,
        seoScore: data.seoScore ?? veld.seoScore,
      };

      setVeld(v => ({ ...v, ...huidigState, verbeteringen: [] }));

      // Verbeteringen direct automatisch toepassen
      const verbeteringen = data.verbeteringen ?? [];
      for (const verbetering of verbeteringen) {
        try {
          const vRes = await fetch("/api/admin/blog/seo", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              verbetering,
              titel: veld.titel,
              inhoud: veld.inhoud,
              huidigMetaTitel: huidigState.metaTitel,
              huidigMetaBeschrijving: huidigState.metaBeschrijving,
              huidigExcerpt: huidigState.excerpt,
              huidigeTrefwoorden: huidigState.trefwoorden,
              huidigSlug: huidigState.slug,
            }),
          });
          if (vRes.ok) {
            const vData = await vRes.json();
            huidigState = {
              ...huidigState,
              metaTitel: vData.metaTitel ?? huidigState.metaTitel,
              metaBeschrijving: vData.metaBeschrijving ?? huidigState.metaBeschrijving,
              excerpt: vData.excerpt ?? huidigState.excerpt,
              trefwoorden: vData.trefwoorden ?? huidigState.trefwoorden,
              slug: vData.slug ?? huidigState.slug,
            };
            setVeld(v => ({ ...v, ...huidigState }));
          }
        } catch { /* sla mislukte verbetering over */ }
      }

      setSucces("AI SEO volledig toegepast!");
      setTimeout(() => setSucces(null), 3000);
    } catch (e) {
      setFout(e instanceof Error ? e.message : "Onbekende fout");
    } finally {
      setAiLaden(false);
    }
  }

  async function handleVerbeteringToepassen(verbetering: string, index: number) {
    setVerbeteringLaden(index);
    setFout(null);
    try {
      const res = await fetch("/api/admin/blog/seo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verbetering,
          titel: veld.titel,
          inhoud: veld.inhoud,
          huidigMetaTitel: veld.metaTitel,
          huidigMetaBeschrijving: veld.metaBeschrijving,
          huidigExcerpt: veld.excerpt,
          huidigeTrefwoorden: veld.trefwoorden,
          huidigSlug: veld.slug,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Verbetering toepassen mislukt");
      }
      const data = await res.json();
      setVeld(v => ({
        ...v,
        metaTitel: data.metaTitel ?? v.metaTitel,
        metaBeschrijving: data.metaBeschrijving ?? v.metaBeschrijving,
        excerpt: data.excerpt ?? v.excerpt,
        trefwoorden: data.trefwoorden ?? v.trefwoorden,
        slug: data.slug ?? v.slug,
        verbeteringen: v.verbeteringen.filter((_, i) => i !== index),
      }));
      setSucces("Verbetering toegepast!");
      setTimeout(() => setSucces(null), 3000);
    } catch (e) {
      setFout(e instanceof Error ? e.message : "Onbekende fout");
    } finally {
      setVerbeteringLaden(null);
    }
  }

  function maakSlug(tekst: string) {
    return tekst
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);
  }

  async function handleOpslaan(publiceer?: boolean) {
    setOpslaan(true);
    setFout(null);
    const gepubliceerd = publiceer !== undefined ? publiceer : veld.gepubliceerd;

    const slug = veld.slug || maakSlug(veld.titel);
    if (!slug) { setFout("Vul een titel of slug in."); setOpslaan(false); return; }
    if (slug !== veld.slug) update("slug", slug);

    const payload = {
      slug,
      titel: veld.titel,
      inhoud: veld.inhoud,
      excerpt: veld.excerpt || null,
      metaTitel: veld.metaTitel || null,
      metaBeschrijving: veld.metaBeschrijving || null,
      trefwoorden: veld.trefwoorden.length ? veld.trefwoorden : null,
      ogAfbeelding: veld.ogAfbeelding || null,
      kaartTitel: veld.kaartTitel || null,
      categorie: veld.categorie || null,
      tags: veld.tags.length ? veld.tags : null,
      interneLinks: veld.interneLinks.length ? veld.interneLinks : null,
      schemaMarkup: veld.schemaMarkup || null,
      leestijd: veld.leestijd || null,
      seoScore: veld.seoScore || null,
      gepubliceerd,
      gepubliceerdOp: veld.gepubliceerdOp ? new Date(veld.gepubliceerdOp).toISOString() : null,
    };

    try {
      const url = artikelId ? `/api/admin/blog/${artikelId}` : "/api/admin/blog";
      const method = artikelId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(typeof err.error === "string" ? err.error : JSON.stringify(err.error));
      }
      const data = await res.json();
      if (gepubliceerd !== veld.gepubliceerd) update("gepubliceerd", gepubliceerd);
      setSucces(publiceer ? "Gepubliceerd!" : "Opgeslagen!");
      setTimeout(() => setSucces(null), 3000);
      if (!artikelId) {
        router.push(`/admin/blog/${data.id}/bewerken`);
      }
    } catch (e) {
      setFout(e instanceof Error ? e.message : "Opslaan mislukt");
    } finally {
      setOpslaan(false);
    }
  }

  async function handleVerwijder() {
    if (!artikelId) return;
    if (!confirm("Dit artikel permanent verwijderen?")) return;
    const res = await fetch(`/api/admin/blog/${artikelId}`, { method: "DELETE" });
    if (res.ok) router.push("/admin/blog");
    else setFout("Verwijderen mislukt");
  }

  const metaTitelLengte = veld.metaTitel.length;
  const metaBeschrLengte = veld.metaBeschrijving.length;
  const scoreKleur = seoScoreKleur(veld.seoScore);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)", background: "var(--color-surface)" }}>
      {/* Linker paneel: content */}
      <div style={{ flex: "0 0 56%", display: "flex", flexDirection: "column", borderRight: "1px solid var(--color-outline)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--color-outline)", display: "flex", alignItems: "center", gap: 12, background: "var(--color-surface-bright)" }}>
          <a href="/admin/blog" style={{ color: "var(--color-text-muted)", fontSize: 14, textDecoration: "none" }}>
            ← Blog
          </a>
          <span style={{ color: "var(--color-outline)", fontSize: 20 }}>|</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-muted)" }}>
            {artikelId ? "Artikel bewerken" : "Nieuw artikel"}
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            {succes && <span style={{ fontSize: 13, color: "#476558", fontWeight: 500 }}>{succes}</span>}
            {fout && <span style={{ fontSize: 13, color: "#a03b1f" }}>{fout}</span>}
            {artikelId && (
              <button onClick={handleVerwijder} style={{ fontSize: 13, color: "#a03b1f", background: "none", border: "1px solid rgba(160,59,31,0.3)", borderRadius: 8, padding: "6px 12px", cursor: "pointer" }}>
                Verwijder
              </button>
            )}
            <button
              onClick={() => handleOpslaan()}
              disabled={opslaan}
              className="btn-secondary"
              style={{ padding: "8px 18px", fontSize: 13 }}
            >
              {opslaan ? "Opslaan..." : "Opslaan"}
            </button>
            <button
              onClick={() => handleOpslaan(!veld.gepubliceerd)}
              disabled={opslaan}
              className="btn-primary"
              style={{ padding: "8px 18px", fontSize: 13 }}
            >
              {veld.gepubliceerd ? "Depubliceer" : "Publiceer"}
            </button>
          </div>
        </div>

        {/* Titel */}
        <div style={{ padding: "20px 28px 0" }}>
          <input
            type="text"
            value={veld.titel}
            onChange={e => update("titel", e.target.value)}
            placeholder="Artikel titel..."
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: 28,
              fontFamily: "var(--font-serif)",
              fontWeight: 400,
              color: "var(--color-text)",
              background: "transparent",
              padding: "0",
            }}
          />
        </div>

        {/* Slug */}
        <div style={{ padding: "8px 28px 0", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>brickme.nl/blog/</span>
          <input
            type="text"
            value={veld.slug}
            onChange={e => update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"))}
            placeholder="artikel-slug"
            style={{
              border: "none",
              outline: "none",
              fontSize: 12,
              fontFamily: "var(--font-sans)",
              color: "var(--color-primary)",
              background: "transparent",
              padding: 0,
              minWidth: 200,
            }}
          />
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflow: "hidden", padding: "16px 28px 28px" }}>
          <RijkeTekstEditor
            waarde={veld.inhoud}
            onChange={html => update("inhoud", html)}
            onPasteVerwerkt={parsed => {
              setVeld(v => ({
                ...v,
                inhoud: parsed.inhoud,
                titel: parsed.titel || v.titel,
                metaTitel: parsed.metaTitel || v.metaTitel,
                metaBeschrijving: parsed.metaBeschrijving || v.metaBeschrijving,
                slug: parsed.slug || v.slug,
              }));
            }}
          />
        </div>
      </div>

      {/* Rechter paneel: SEO */}
      <div style={{ flex: 1, overflow: "auto", padding: "20px 24px", background: "var(--color-surface-low)" }}>
        {/* AI SEO knop */}
        <button
          onClick={handleAiSeo}
          disabled={aiLaden || !veld.titel || !veld.inhoud}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: 12,
            border: "none",
            background: aiLaden ? "var(--color-surface-high)" : "var(--color-primary)",
            color: aiLaden ? "var(--color-text-muted)" : "white",
            fontSize: 15,
            fontWeight: 500,
            cursor: aiLaden ? "not-allowed" : "pointer",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 200ms",
          }}
        >
          {aiLaden ? (
            <>
              <span style={{ display: "inline-block", animation: "pulseSoft 1.4s ease-in-out infinite" }}>●</span>
              AI analyseert...
            </>
          ) : (
            "✦ Genereer & Pas AI SEO toe"
          )}
        </button>

        {/* SEO Score */}
        {veld.seoScore > 0 && (
          <div style={{
            background: "var(--color-surface-bright)",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: `4px solid ${scoreKleur}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: scoreKleur }}>{veld.seoScore}</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>
                SEO Score
              </div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                {veld.seoScore >= 80 ? "Uitstekend" : veld.seoScore >= 60 ? "Goed, verbetering mogelijk" : "Verbetering nodig"}
              </div>
            </div>
            {veld.leestijd > 0 && (
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text)" }}>{veld.leestijd} min</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>leestijd</div>
              </div>
            )}
          </div>
        )}

        {/* SERP Preview */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: 8 }}>
            Google Voorvertoning
          </div>
          <SerpPreview metaTitel={veld.metaTitel} metaBeschrijving={veld.metaBeschrijving} slug={veld.slug} />
        </div>

        {/* Meta Titel */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)" }}>
              Meta Titel
            </label>
            <span style={{
              fontSize: 11,
              color: metaTitelLengte > 60 ? "#a03b1f" : metaTitelLengte >= 50 ? "#476558" : "var(--color-text-muted)",
            }}>
              {metaTitelLengte}/60
            </span>
          </div>
          <input
            type="text"
            value={veld.metaTitel}
            onChange={e => update("metaTitel", e.target.value)}
            placeholder="50-60 tekens — zoekwoord vooraan..."
            className="input-base"
            style={{ fontSize: 13 }}
          />
        </div>

        {/* Meta Beschrijving */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)" }}>
              Meta Beschrijving
            </label>
            <span style={{
              fontSize: 11,
              color: metaBeschrLengte > 160 ? "#a03b1f" : metaBeschrLengte >= 145 ? "#476558" : "var(--color-text-muted)",
            }}>
              {metaBeschrLengte}/160
            </span>
          </div>
          <textarea
            value={veld.metaBeschrijving}
            onChange={e => update("metaBeschrijving", e.target.value)}
            placeholder="145-160 tekens — bevat zoekwoord + CTA..."
            className="input-base"
            rows={3}
            style={{ fontSize: 13, resize: "vertical" }}
          />
        </div>

        {/* Excerpt */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>
            Excerpt (artikelkaart)
          </label>
          <textarea
            value={veld.excerpt}
            onChange={e => update("excerpt", e.target.value)}
            placeholder="Korte samenvatting voor blog overzicht..."
            className="input-base"
            rows={2}
            style={{ fontSize: 13, resize: "vertical" }}
          />
        </div>

        {/* Categorie */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>
            Categorie
          </label>
          <input
            type="text"
            value={veld.categorie}
            onChange={e => update("categorie", e.target.value)}
            placeholder="bv. LEGO Serious Play, Zelfreflectie..."
            className="input-base"
            style={{ fontSize: 13 }}
          />
        </div>

        {/* Trefwoorden */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", display: "block", marginBottom: 8 }}>
            Trefwoorden
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {veld.trefwoorden.map((t, i) => (
              <span key={i} style={{
                background: "var(--color-surface-high)",
                borderRadius: 100,
                padding: "4px 10px",
                fontSize: 12,
                color: "var(--color-text)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}>
                {t}
                <button
                  onClick={() => update("trefwoorden", veld.trefwoorden.filter((_, j) => j !== i))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: 14, padding: 0, lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={nieuwTrefwoord}
              onChange={e => setNieuwTrefwoord(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && nieuwTrefwoord.trim()) {
                  e.preventDefault();
                  update("trefwoorden", [...veld.trefwoorden, nieuwTrefwoord.trim()]);
                  setNieuwTrefwoord("");
                }
              }}
              placeholder="Voeg trefwoord toe..."
              className="input-base"
              style={{ fontSize: 13 }}
            />
          </div>
        </div>

        {/* Kaart header: afbeelding of eigen titel */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", display: "block", marginBottom: 8 }}>
            Kaart header
          </label>
          {/* Toggle */}
          <div style={{ display: "flex", gap: 4, marginBottom: 12, background: "var(--color-surface-high)", borderRadius: 8, padding: 3 }}>
            {(["afbeelding", "titel"] as const).map(type => (
              <button
                key={type}
                onClick={() => setHeaderType(type)}
                style={{
                  flex: 1, padding: "6px 0", fontSize: 12, fontWeight: 500,
                  border: "none", borderRadius: 6, cursor: "pointer",
                  background: headerType === type ? "var(--color-surface-bright)" : "transparent",
                  color: headerType === type ? "var(--color-text)" : "var(--color-text-muted)",
                  boxShadow: headerType === type ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 150ms",
                }}
              >
                {type === "afbeelding" ? "Afbeelding" : "Eigen titel"}
              </button>
            ))}
          </div>

          {headerType === "afbeelding" ? (
            <>
              {veld.ogAfbeelding ? (
                <div style={{ marginBottom: 8, position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={veld.ogAfbeelding}
                    alt="Blog afbeelding"
                    style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 10, display: "block" }}
                  />
                  <button
                    onClick={() => update("ogAfbeelding", "")}
                    style={{
                      position: "absolute", top: 6, right: 6,
                      background: "rgba(0,0,0,0.5)", color: "white", border: "none",
                      borderRadius: "50%", width: 24, height: 24, cursor: "pointer",
                      fontSize: 14, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  border: "2px dashed var(--color-outline)", borderRadius: 10, padding: "20px 12px",
                  cursor: ogUploaden ? "not-allowed" : "pointer", marginBottom: 8,
                  background: ogUploaden ? "var(--color-surface-low)" : "var(--color-surface)",
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    disabled={ogUploaden}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleOgUpload(f); }}
                  />
                  {ogUploaden
                    ? <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Uploaden...</span>
                    : <>
                        <span style={{ fontSize: 20, marginBottom: 6 }}>📷</span>
                        <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Klik om foto te uploaden</span>
                      </>
                  }
                </label>
              )}
              <input
                type="text"
                value={veld.ogAfbeelding}
                onChange={e => update("ogAfbeelding", e.target.value)}
                placeholder="Of plak een URL..."
                className="input-base"
                style={{ fontSize: 12 }}
              />
            </>
          ) : (
            <>
              <input
                type="text"
                value={veld.kaartTitel}
                onChange={e => update("kaartTitel", e.target.value)}
                placeholder="Korte titel voor de kaart..."
                className="input-base"
                style={{ fontSize: 13, marginBottom: 8 }}
                maxLength={200}
              />
              {veld.kaartTitel && (
                <div style={{
                  background: "linear-gradient(135deg, var(--color-primary) 0%, #e8875c 100%)",
                  padding: "18px 16px 14px",
                  borderRadius: 8,
                  minHeight: 70,
                  display: "flex",
                  alignItems: "flex-end",
                }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "white", lineHeight: 1.3, fontFamily: "var(--font-serif)" }}>
                    {veld.kaartTitel}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Interne Links */}
        {veld.interneLinks.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", display: "block", marginBottom: 8 }}>
              Interne Links ({veld.interneLinks.length})
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {veld.interneLinks.map((link, i) => (
                <div key={i} style={{
                  background: "var(--color-surface-bright)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: 12,
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: "#1a0dab", fontWeight: 500 }}>
                      {link.ankerTekst}
                    </span>
                    <a href={link.href} target="_blank" style={{ color: "var(--color-text-muted)", fontSize: 11 }}>
                      {link.href}
                    </a>
                  </div>
                  <div style={{ color: "var(--color-text-muted)", fontStyle: "italic", lineHeight: 1.4 }}>
                    "{link.context}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verbeteringen — toon resterende aandachtspunten die content-wijzigingen vereisen */}
        {veld.verbeteringen.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", display: "block", marginBottom: 8 }}>
              Aandachtspunten
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {veld.verbeteringen.map((v, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  fontSize: 12,
                  color: "var(--color-text)",
                  background: "var(--color-surface-bright)",
                  borderRadius: 8,
                  padding: "8px 12px",
                }}>
                  <span style={{ color: "#a03b1f", flexShrink: 0, marginTop: 1 }}>→</span>
                  <span style={{ flex: 1, lineHeight: 1.5 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Publicatiedatum */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>
            Publicatiedatum
          </label>
          <input
            type="datetime-local"
            value={veld.gepubliceerdOp}
            onChange={e => update("gepubliceerdOp", e.target.value)}
            className="input-base"
            style={{ fontSize: 13 }}
          />
          <div style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 4 }}>
            Leeg = wordt automatisch ingesteld bij publicatie
          </div>
        </div>
      </div>
    </div>
  );
}
