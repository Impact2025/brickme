"use client";

import { useState } from "react";
import { TrendingUp, AlertCircle, Lightbulb, Star, ArrowRight, RefreshCw } from "lucide-react";

interface AnalyseData {
  terugkerendeThemas?: string[];
  kernspanning?: string;
  groeipatroon?: string;
  sterkePunten?: string[];
  opvallendMoment?: string;
  coachingTip?: string;
  aanbevelingType?: "terugkeer" | "nieuwThema" | "pauze";
  aanbevelingToelichting?: string;
}

const AANBEVELING: Record<string, { label: string; classes: string }> = {
  terugkeer: {
    label: "Terugkeersessie aanbevolen",
    classes: "bg-[#2D4A3E]/8 border-[#2D4A3E]/25 text-[#2D4A3E]",
  },
  nieuwThema: {
    label: "Nieuw thema verkennen",
    classes: "bg-[#C8583A]/8 border-[#C8583A]/25 text-[#C8583A]",
  },
  pauze: {
    label: "Ruimte geven — nog geen nieuwe sessie",
    classes: "bg-amber-50 border-amber-200 text-amber-800",
  },
};

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
      if (!res.ok) { setFout(json.error ?? "Fout bij ophalen analyse"); return; }
      setData(json.analyse);
    } finally {
      setBezig(false);
    }
  }

  const aanbeveling = data?.aanbevelingType ? AANBEVELING[data.aanbevelingType] : null;

  return (
    <div className="bg-[#2D4A3E]/6 rounded-xl border border-[#2D4A3E]/20 p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="font-serif text-lg text-[#2C1F14]">AI Patroonanalyse</h2>
          <p className="text-xs text-[#8B7355] mt-0.5">Op basis van {aantalSessies} voltooide sessies</p>
        </div>
        <button
          onClick={genereer}
          disabled={bezig}
          className="flex items-center gap-2 px-4 py-2 bg-[#2D4A3E] text-white text-sm rounded-xl hover:bg-[#1e3329] transition-colors disabled:opacity-50 flex-shrink-0"
        >
          <RefreshCw size={13} className={bezig ? "animate-spin" : ""} />
          {bezig ? "Analyseren…" : data ? "Opnieuw" : "Analyseren"}
        </button>
      </div>

      {fout && <p className="text-sm text-[#C8583A]">{fout}</p>}

      {data && (
        <div className="space-y-5 pt-4 border-t border-[#2D4A3E]/15">

          {/* Terugkerende thema's */}
          {!!data.terugkerendeThemas?.length && (
            <div>
              <p className="text-[10px] font-semibold text-[#2D4A3E] uppercase tracking-widest mb-2">
                Terugkerende thema&apos;s
              </p>
              <div className="flex flex-wrap gap-2">
                {data.terugkerendeThemas.map(t => (
                  <span key={t} className="px-2.5 py-1 bg-[#2D4A3E]/12 text-[#2D4A3E] rounded-full text-xs font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Kernspanning */}
          {data.kernspanning && (
            <div className="flex gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200">
              <AlertCircle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-widest mb-1">Kernspanning</p>
                <p className="text-sm text-amber-900 leading-relaxed">{data.kernspanning}</p>
              </div>
            </div>
          )}

          {/* Groeipatroon */}
          {data.groeipatroon && (
            <div className="flex gap-3">
              <TrendingUp size={15} className="text-[#2D4A3E] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-[#2D4A3E] uppercase tracking-widest mb-1">Groeipatroon</p>
                <p className="text-sm text-[#2C1F14] leading-relaxed">{data.groeipatroon}</p>
              </div>
            </div>
          )}

          {/* Sterke punten */}
          {!!data.sterkePunten?.length && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Star size={12} className="text-[#C8583A]" />
                <p className="text-[10px] font-semibold text-[#C8583A] uppercase tracking-widest">Sterke punten</p>
              </div>
              <ul className="space-y-1.5">
                {data.sterkePunten.map(p => (
                  <li key={p} className="flex gap-2 text-sm text-[#2C1F14] leading-snug">
                    <span className="text-[#C8583A] flex-shrink-0">·</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Opvallend moment */}
          {data.opvallendMoment && (
            <div className="flex gap-3">
              <Lightbulb size={15} className="text-[#8B7355] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-[#8B7355] uppercase tracking-widest mb-1">Opvallend</p>
                <p className="text-sm text-[#2C1F14] leading-relaxed italic">{data.opvallendMoment}</p>
              </div>
            </div>
          )}

          {/* Coaching tip */}
          {data.coachingTip && (
            <div className="p-3.5 bg-white rounded-xl border border-[#E8DDD0]">
              <p className="text-[10px] font-semibold text-[#C8583A] uppercase tracking-widest mb-1.5">
                Tip voor het volgende gesprek
              </p>
              <p className="text-sm text-[#2C1F14] leading-relaxed">{data.coachingTip}</p>
            </div>
          )}

          {/* Aanbeveling */}
          {aanbeveling && (
            <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${aanbeveling.classes}`}>
              <ArrowRight size={14} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold leading-tight">{aanbeveling.label}</p>
                {data.aanbevelingToelichting && (
                  <p className="text-xs mt-0.5 leading-relaxed opacity-75">{data.aanbevelingToelichting}</p>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
