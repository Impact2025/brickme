"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { THEMAS } from "@/lib/themas";
import { ThemaId } from "@/types";

const THEMA_QUOTES: Record<string, string> = {
  werk: "Na 45 minuten wist ik eindelijk waar mijn energie naartoe gaat — en waarom.",
  relatie: "Ik had woorden voor iets wat ik al twee jaar probeerde te zeggen.",
  identiteit: "Mijn handen wisten wat mijn hoofd al die tijd begreep maar niet kon verwoorden.",
  verbinding: "Pas toen ik het bouwde, zag ik hoe ik mezelf had teruggetrokken.",
  kruispunt: "Ik stond voor een keuze. Na deze sessie wist ik wat ik eigenlijk wilde.",
  rouw: "Het voelde als afscheid nemen op mijn eigen manier — zonder haast.",
};

function BetalenForm() {
  const params = useSearchParams();
  const themaId = (params.get("thema") || "werk") as ThemaId;
  const terugkeerParam = params.get("terugkeer");
  const thema = THEMAS[themaId];

  const [couponOpen, setCouponOpen] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "geldig" | "ongeldig">("idle");
  const [korting, setKorting] = useState(0);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");

  async function checkCoupon() {
    if (!coupon.trim()) return;
    const res = await fetch("/api/stripe/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon }),
    });
    const data = await res.json();
    if (res.ok && data.geldig) {
      setCouponStatus("geldig");
      setKorting(data.kortingPercent);
    } else {
      setCouponStatus("ongeldig");
      setKorting(0);
    }
  }

  const basisprijs = 1495;
  const prijsNaKorting = Math.round(basisprijs * (1 - korting / 100));
  const gratis = prijsNaKorting === 0;

  async function handleBetalen() {
    setBezig(true);
    setFout("");

    const terugkeerSuffix = terugkeerParam ? `&terugkeer=${terugkeerParam}` : "";

    if (gratis) {
      window.location.href = `/sessie/nieuw?thema=${themaId}&betaald=1${terugkeerSuffix}`;
      return;
    }

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thema: themaId,
        coupon: couponStatus === "geldig" ? coupon : undefined,
        terugkeer: terugkeerParam ?? undefined,
      }),
    });

    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setFout(data.error || "Er ging iets mis.");
      setBezig(false);
    }
  }

  return (
    <main className="min-h-dvh bg-secondary">
      <header className="px-6 py-5 flex items-center justify-between max-w-lg mx-auto">
        <a href="/start" className="text-sm text-muted hover:text-bricktext transition-colors">
          ← Terug
        </a>
        <Image src="/logo.png" alt="Brickme" width={28} height={28} unoptimized />
      </header>

      <div className="max-w-lg mx-auto px-6 pb-16 space-y-5">

        {/* Thema bevestiging */}
        <div className="text-center pt-2 pb-4">
          <div className="w-14 h-14 bg-primary rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white text-xl font-serif">◆</span>
          </div>
          <p className="text-xs font-medium text-muted uppercase tracking-[0.15em] mb-1">{thema.ondertitel}</p>
          <h1 className="text-3xl font-serif text-bricktext leading-tight mb-3">{thema.label}</h1>
          <p className="text-muted text-sm max-w-xs mx-auto leading-relaxed">{thema.beschrijving}</p>
        </div>

        {/* Wat je krijgt */}
        <div className="bg-surface border border-border rounded-2xl p-5">
          <p className="text-xs font-medium text-muted uppercase tracking-[0.15em] mb-4">Je sessie bevat</p>
          <ul className="space-y-3.5">
            {[
              { titel: "Persoonlijk intakegesprek", sub: "7–10 vragen op maat voor jouw thema" },
              { titel: "4 bouwfases met timer", sub: "Elke fase start met een verborgen vraag" },
              { titel: "AI-reflectie per bouwsel", sub: "Op basis van jouw foto — specifiek, niet generiek" },
              { titel: "Persoonlijk rapport als PDF", sub: "3 inzichten + 1 concrete eerste stap" },
            ].map((item) => (
              <li key={item.titel} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <p className="text-bricktext text-sm font-medium">{item.titel}</p>
                  <p className="text-muted text-xs mt-0.5">{item.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Testimonial */}
        <blockquote className="bg-accent/5 border border-accent/15 rounded-2xl px-5 py-4">
          <p className="font-serif text-bricktext text-sm leading-relaxed mb-2.5">
            &ldquo;{THEMA_QUOTES[themaId]}&rdquo;
          </p>
          <footer className="text-xs text-muted">
            — Brickme-gebruiker &middot; thema {thema.label}
          </footer>
        </blockquote>

        {/* Prijs */}
        <div className="bg-white border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-bricktext text-sm">Brickme sessie — {thema.label}</span>
            <span className="text-bricktext font-medium text-sm">€{(basisprijs / 100).toFixed(2).replace(".", ",")}</span>
          </div>
          {korting > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700">Korting ({korting}%)</span>
              <span className="text-green-700">−€{((basisprijs * korting) / 100 / 100).toFixed(2).replace(".", ",")}</span>
            </div>
          )}
          <div className="border-t border-border mt-3 pt-3 flex items-center justify-between">
            <span className="font-medium text-bricktext text-sm">Totaal</span>
            <span className="text-2xl font-serif text-primary">
              {gratis ? "Gratis" : `€${(prijsNaKorting / 100).toFixed(2).replace(".", ",")}`}
            </span>
          </div>
        </div>

        {/* Coupon — verborgen tot klik */}
        <div>
          {!couponOpen ? (
            <button
              onClick={() => setCouponOpen(true)}
              className="text-sm text-muted hover:text-bricktext transition-colors underline underline-offset-2"
            >
              Heb je een couponcode?
            </button>
          ) : (
            <div className="space-y-2 animate-slide-up">
              <label className="block text-sm text-bricktext">Couponcode</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => {
                    setCoupon(e.target.value.toUpperCase());
                    setCouponStatus("idle");
                    setKorting(0);
                  }}
                  placeholder="bv. WELKOM50"
                  className="input-base flex-1"
                  autoFocus
                />
                <button
                  onClick={checkCoupon}
                  disabled={!coupon.trim()}
                  className="px-4 py-2 border border-border rounded-xl text-sm text-bricktext hover:border-primary transition-colors disabled:opacity-40"
                >
                  Toepassen
                </button>
              </div>
              {couponStatus === "geldig" && (
                <p className="text-sm text-green-700">{korting}% korting toegepast!</p>
              )}
              {couponStatus === "ongeldig" && (
                <p className="text-sm text-red-600">Ongeldige couponcode.</p>
              )}
            </div>
          )}
        </div>

        {fout && <p className="text-sm text-red-600">{fout}</p>}

        <button
          onClick={handleBetalen}
          disabled={bezig}
          className="btn-primary w-full py-4 text-lg disabled:opacity-50"
        >
          {bezig
            ? "Moment..."
            : gratis
            ? "Gratis starten →"
            : `Begin mijn sessie — €${(prijsNaKorting / 100).toFixed(2).replace(".", ",")} →`}
        </button>

        <div className="flex items-center justify-center gap-4 text-xs text-muted flex-wrap">
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Veilig via Stripe
          </span>
          <span className="w-px h-3 bg-border hidden sm:block" />
          <span>Eenmalig · geen abonnement</span>
          <span className="w-px h-3 bg-border hidden sm:block" />
          <span>45–75 min sessie</span>
        </div>
      </div>
    </main>
  );
}

export default function BetalenPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-secondary" />}>
      <BetalenForm />
    </Suspense>
  );
}
