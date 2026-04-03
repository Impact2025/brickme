"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { THEMAS } from "@/lib/themas";
import { ThemaId } from "@/types";

function BetalenForm() {
  const params = useSearchParams();
  const themaId = (params.get("thema") || "werk") as ThemaId;
  const thema = THEMAS[themaId];

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

  const basisprijs = 1495; // €14,95 in centen
  const prijsNaKorting = Math.round(basisprijs * (1 - korting / 100));
  const gratis = prijsNaKorting === 0;

  async function handleBetalen() {
    setBezig(true);
    setFout("");

    if (gratis) {
      // Geen betaling nodig — direct door
      window.location.href = `/sessie/nieuw?thema=${themaId}`;
      return;
    }

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thema: themaId,
        coupon: couponStatus === "geldig" ? coupon : undefined,
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
    <main className="min-h-dvh bg-secondary flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <a href="/start" className="text-sm text-muted hover:text-bricktext block mb-8">
          ← Terug
        </a>

        <div className="w-10 h-10 bg-primary rounded-2xl mb-6 flex items-center justify-center">
          <span className="text-white">◆</span>
        </div>

        <h1 className="text-2xl font-serif text-bricktext mb-1">Jouw sessie</h1>
        <p className="text-muted text-sm mb-8">{thema.label} — {thema.ondertitel}</p>

        {/* Prijs */}
        <div className="bg-white border border-border rounded-2xl p-5 mb-6">
          <div className="flex justify-between items-center mb-1">
            <span className="text-bricktext">Brickme sessie</span>
            <span className="text-bricktext font-medium">€{(basisprijs / 100).toFixed(2).replace(".", ",")}</span>
          </div>
          {korting > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-700">Korting ({korting}%)</span>
              <span className="text-green-700">-€{((basisprijs * korting) / 100 / 100).toFixed(2).replace(".", ",")}</span>
            </div>
          )}
          <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
            <span className="font-medium text-bricktext">Totaal</span>
            <span className="text-xl font-serif text-primary">
              {gratis ? "Gratis" : `€${(prijsNaKorting / 100).toFixed(2).replace(".", ",")}`}
            </span>
          </div>
        </div>

        {/* Couponcode */}
        <div className="mb-6">
          <label className="block text-sm text-bricktext mb-2">Couponcode (optioneel)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={coupon}
              onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponStatus("idle"); setKorting(0); }}
              placeholder="bv. WELKOM50"
              className="input-base flex-1"
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
            <p className="text-sm text-green-700 mt-1">{korting}% korting toegepast!</p>
          )}
          {couponStatus === "ongeldig" && (
            <p className="text-sm text-red-600 mt-1">Ongeldige couponcode.</p>
          )}
        </div>

        {fout && <p className="text-sm text-red-600 mb-4">{fout}</p>}

        <button
          onClick={handleBetalen}
          disabled={bezig}
          className="btn-primary w-full py-4 text-lg disabled:opacity-50"
        >
          {bezig
            ? "Moment..."
            : gratis
            ? "Gratis starten →"
            : `Betalen €${(prijsNaKorting / 100).toFixed(2).replace(".", ",")} →`}
        </button>

        <p className="text-xs text-muted text-center mt-4">
          Veilig betalen via Stripe. Eenmalige betaling, geen abonnement.
        </p>
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
