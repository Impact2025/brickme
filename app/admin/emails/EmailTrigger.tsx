"use client";

import { useState } from "react";

export function EmailTrigger() {
  const [bezig, setBezig] = useState(false);
  const [resultaat, setResultaat] = useState<{ verstuurd: number; overgeslagen: number } | null>(null);
  const [fout, setFout] = useState(false);

  async function trigger() {
    setBezig(true);
    setResultaat(null);
    setFout(false);
    try {
      const res = await fetch("/api/admin/emails/trigger", { method: "POST" });
      if (res.ok) {
        setResultaat(await res.json());
      } else {
        setFout(true);
      }
    } catch {
      setFout(true);
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={trigger}
        disabled={bezig}
        className="px-5 py-2.5 bg-[#2D4A3E] text-white rounded-xl text-sm font-medium hover:bg-[#1d3a2e] disabled:opacity-50 transition-colors"
      >
        {bezig ? "Bezig…" : "Nu uitvoeren"}
      </button>
      {resultaat && (
        <p className="text-sm text-[#2D4A3E]">
          ✓ {resultaat.verstuurd} verstuurd
          {resultaat.overgeslagen > 0 && `, ${resultaat.overgeslagen} overgeslagen`}
        </p>
      )}
      {fout && <p className="text-sm text-[#C8583A]">Mislukt — probeer opnieuw</p>}
    </div>
  );
}
