"use client";

import { useState } from "react";

interface AnalyseData {
  terugkerendeThemas: string[];
  groeipatroon: string;
  kernspanning: string;
  coachingTip: string;
}

export function PatroonAnalyse({ clientUserId, aantalSessies }: { clientUserId: string; aantalSessies: number }) {
  const [bezig, setBezig] = useState(false);
  const [data, setData] = useState<AnalyseData | null>(null);
  const [fout, setFout] = useState("");

  async function genereer() {
    setBezig(true);
    setFout("");
    try {
      const res = await fetch(`/api/coach/patroonanalyse/${clientUserId}`);
      const json = await res.json();
      if (!res.ok) {
        setFout(json.error ?? "Fout");
        return;
      }
      setData(json.analyse);
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="bg-[#2D4A3E]/6 rounded-xl border border-[#2D4A3E]/20 p-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-serif text-lg text-[#2C1F14]">AI Patroonanalyse</h2>
          <p className="text-xs text-[#8B7355]">Op basis van {aantalSessies} voltooide sessies</p>
        </div>
        <button
          onClick={genereer}
          disabled={bezig}
          className="px-4 py-2 bg-[#2D4A3E] text-white text-sm rounded-xl hover:bg-[#1e3329] transition-colors disabled:opacity-50"
        >
          {bezig ? "Analyseren…" : data ? "↻ Opnieuw" : "Analyseren"}
        </button>
      </div>

      {fout && <p className="text-sm text-[#C8583A]">{fout}</p>}

      {data && (
        <div className="space-y-4 mt-4">
          {data.terugkerendeThemas?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[#2D4A3E] uppercase tracking-wide mb-1.5">Terugkerende thema&apos;s</p>
              <div className="flex flex-wrap gap-2">
                {data.terugkerendeThemas.map((t: string) => (
                  <span key={t} className="px-3 py-1 bg-[#2D4A3E]/10 text-[#2D4A3E] rounded-full text-xs font-medium">{t}</span>
                ))}
              </div>
            </div>
          )}

          {data.groeipatroon && (
            <div>
              <p className="text-xs font-medium text-[#8B7355] uppercase tracking-wide mb-1">Groeipatroon</p>
              <p className="text-sm text-[#2C1F14] leading-relaxed">{data.groeipatroon}</p>
            </div>
          )}

          {data.kernspanning && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Kernspanning</p>
              <p className="text-sm text-amber-900">{data.kernspanning}</p>
            </div>
          )}

          {data.coachingTip && (
            <div className="p-3 bg-white rounded-lg border border-[#E8DDD0]">
              <p className="text-xs font-medium text-[#C8583A] uppercase tracking-wide mb-1">Tip voor volgende sessie</p>
              <p className="text-sm text-[#2C1F14]">{data.coachingTip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
