"use client";

import { useState } from "react";

interface GroepsrapportData {
  gedeeldeThemas: string[];
  groepspatroon: string;
  opvallendeSpanning: string;
  aanbeveling: string;
}

export function GroepsrapportClient({ workshopId, aantalSessies }: { workshopId: string; aantalSessies: number }) {
  const [bezig, setBezig] = useState(false);
  const [data, setData] = useState<GroepsrapportData | null>(null);
  const [stemmingData, setStemmingData] = useState<{ voor: number | null; na: number | null; delta: number }[]>([]);
  const [fout, setFout] = useState("");

  async function genereer() {
    setBezig(true);
    setFout("");
    try {
      const res = await fetch(`/api/facilitator/groepsrapport/${workshopId}`);
      const json = await res.json();
      if (!res.ok) {
        setFout(json.error ?? "Fout bij genereren");
        return;
      }
      setData(json.groepsrapport);
      setStemmingData(json.stemmingData ?? []);
    } finally {
      setBezig(false);
    }
  }

  const gemDelta = stemmingData.length > 0
    ? (stemmingData.reduce((s, d) => s + d.delta, 0) / stemmingData.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      {!data ? (
        <div className="text-center py-10">
          <p className="text-[#8B7355] mb-6 text-sm">
            Klik hieronder om een groepsanalyse te genereren op basis van {aantalSessies} voltooide sessies.
          </p>
          <button
            onClick={genereer}
            disabled={bezig}
            className="px-6 py-3 bg-[#2D4A3E] text-white rounded-xl font-medium hover:bg-[#1e3329] transition-colors disabled:opacity-50"
          >
            {bezig ? "Analyseren…" : "Groepsrapport genereren"}
          </button>
          {fout && <p className="text-sm text-[#C8583A] mt-3">{fout}</p>}
        </div>
      ) : (
        <>
          {/* Stemming-overzicht */}
          {stemmingData.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E8DDD0] p-6">
              <h2 className="font-serif text-lg text-[#2C1F14] mb-4">Stemming-effect groep</h2>
              <div className="flex items-center gap-6 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-serif font-bold text-[#2D4A3E]">
                    {gemDelta != null && Number(gemDelta) > 0 ? "+" : ""}{gemDelta}
                  </p>
                  <p className="text-xs text-[#8B7355]">gem. delta</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {stemmingData.slice(0, 8).map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#F5F0E8] flex items-center justify-center text-[8px] text-[#8B7355]">{i + 1}</div>
                      <div className="flex-1 h-3 bg-[#F5F0E8] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${d.delta > 0 ? "bg-[#2D4A3E]" : "bg-[#C8583A]"}`}
                          style={{ width: `${Math.min(Math.abs(d.delta) / 9 * 100, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs w-8 text-right ${d.delta > 0 ? "text-[#2D4A3E]" : "text-[#C8583A]"}`}>
                        {d.delta > 0 ? "+" : ""}{d.delta}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Gedeelde thema's */}
          {data.gedeeldeThemas?.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E8DDD0] p-6">
              <h2 className="font-serif text-lg text-[#2C1F14] mb-3">Gedeelde thema&apos;s</h2>
              <div className="flex flex-wrap gap-2">
                {data.gedeeldeThemas.map((t: string) => (
                  <span key={t} className="px-3 py-1 bg-[#F5F0E8] text-[#2C1F14] rounded-full text-sm">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Groepspatroon */}
          <div className="bg-white rounded-xl border border-[#E8DDD0] p-6">
            <h2 className="font-serif text-lg text-[#2C1F14] mb-3">Groepspatroon</h2>
            <p className="text-sm text-[#2C1F14] leading-relaxed">{data.groepspatroon}</p>
          </div>

          {/* Spanning */}
          {data.opvallendeSpanning && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
              <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Opvallende spanning</p>
              <p className="text-sm text-amber-900">{data.opvallendeSpanning}</p>
            </div>
          )}

          {/* Aanbeveling */}
          {data.aanbeveling && (
            <div className="bg-[#2D4A3E]/8 rounded-xl border border-[#2D4A3E]/20 p-5">
              <p className="text-xs font-medium text-[#2D4A3E] uppercase tracking-wide mb-1">Aanbeveling voor facilitator</p>
              <p className="text-sm text-[#2C1F14]">{data.aanbeveling}</p>
            </div>
          )}

          <button
            onClick={genereer}
            disabled={bezig}
            className="text-sm text-[#8B7355] hover:text-[#2C1F14] transition-colors"
          >
            ↻ Opnieuw genereren
          </button>
        </>
      )}
    </div>
  );
}
