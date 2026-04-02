"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface FaseData {
  id: string;
  faseNummer: number;
  faseTitel: string;
  fotoBase64?: string;
  aiReflectie?: string;
  aiVervolgvraag?: string;
  voltooid: boolean;
}

function ReflectiePaginaInner() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const faseNummer = parseInt(params.get("fase") || "1");
  const router = useRouter();

  const [fase, setFase] = useState<FaseData | null>(null);
  const [antwoord, setAntwoord] = useState("");
  const [bezig, setBezig] = useState(false);
  const [laden, setLaden] = useState(true);
  const [totalFases, setTotalFases] = useState(3);

  useEffect(() => {
    laadFase();
  }, [id, faseNummer]);

  async function laadFase() {
    try {
      const res = await fetch(`/api/sessie/${id}?fase=${faseNummer}`);
      const data = await res.json();
      setFase(data.fase);
      setTotalFases(data.totalFases || 3);
    } finally {
      setLaden(false);
    }
  }

  async function verderGaan() {
    if (!antwoord.trim() || bezig || !fase) return;
    setBezig(true);

    try {
      await fetch(`/api/sessie/${id}/antwoord`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faseId: fase.id, antwoord }),
      });

      if (faseNummer < totalFases) {
        router.push(`/sessie/${id}/bouwen?fase=${faseNummer}`);
      } else {
        router.push(`/sessie/${id}/rapport`);
      }
    } finally {
      setBezig(false);
    }
  }

  function slaAntwoordOver() {
    if (faseNummer < totalFases) {
      router.push(`/sessie/${id}/bouwen?fase=${faseNummer}`);
    } else {
      router.push(`/sessie/${id}/rapport`);
    }
  }

  if (laden) {
    return (
      <div className="min-h-dvh bg-secondary px-6 pt-12 max-w-xl mx-auto">
        <div className="skeleton h-6 w-32 mb-8" />
        <div className="skeleton h-48 w-full rounded-3xl mb-6" />
        <div className="skeleton h-4 w-full mb-2" />
        <div className="skeleton h-4 w-3/4 mb-2" />
        <div className="skeleton h-4 w-5/6" />
      </div>
    );
  }

  if (!fase) {
    return (
      <div className="min-h-dvh bg-secondary flex items-center justify-center">
        <p className="text-muted">Fase niet gevonden.</p>
      </div>
    );
  }

  const isLaatsteFase = faseNummer >= totalFases;

  return (
    <main className="min-h-dvh bg-secondary pb-12">
      <div className="max-w-xl mx-auto px-6">
        {/* Header */}
        <header className="pt-6 pb-6">
          <p className="text-xs text-muted uppercase tracking-wider mb-1">
            Fase {faseNummer} van {totalFases} — Reflectie
          </p>
          <h2 className="text-2xl font-serif text-bricktext">{fase.faseTitel}</h2>
        </header>

        {/* Foto */}
        {fase.fotoBase64 && (
          <div className="rounded-3xl overflow-hidden aspect-video mb-6 relative">
            <img
              src={fase.fotoBase64}
              alt="Jouw bouwsel"
              className="w-full h-full object-cover"
              style={{ filter: "sepia(15%) brightness(0.97)" }}
            />
          </div>
        )}

        {/* AI Reflectie — als brief */}
        {fase.aiReflectie ? (
          <div className="animate-fade-in mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-white">◆</span>
              </div>
              <p className="text-xs text-muted uppercase tracking-wider">Jouw reflectie</p>
            </div>
            <div className="card">
              <p className="font-serif text-bricktext leading-relaxed text-lg whitespace-pre-line">
                {fase.aiReflectie}
              </p>
            </div>
          </div>
        ) : (
          <div className="card mb-6">
            <div className="space-y-3">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
              <div className="skeleton h-4 w-4/5" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          </div>
        )}

        {/* De Ene Vervolgvraag */}
        {fase.aiVervolgvraag && (
          <div className="animate-slide-up mb-6">
            <div
              className="p-5 rounded-3xl border-l-4 border-l-primary bg-surface border border-border"
            >
              <p className="text-xs text-primary uppercase tracking-wider mb-2 font-medium">
                Één vraag
              </p>
              <p className="text-bricktext font-serif text-lg leading-relaxed">
                {fase.aiVervolgvraag}
              </p>
            </div>

            {/* Antwoord veld */}
            <div className="mt-4">
              <textarea
                value={antwoord}
                onChange={(e) => setAntwoord(e.target.value)}
                placeholder="Jouw antwoord..."
                rows={3}
                className="input-base resize-none"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={verderGaan}
                disabled={bezig || !antwoord.trim()}
                className="btn-primary flex-1 py-4 disabled:opacity-40"
              >
                {bezig
                  ? "Bezig..."
                  : isLaatsteFase
                  ? "Mijn rapport bekijken →"
                  : "Volgende fase →"}
              </button>
              <button
                onClick={slaAntwoordOver}
                className="btn-ghost px-4"
              >
                Sla over
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ReflectiePagina() {
  return (
    <Suspense fallback={
      <div className="min-h-dvh bg-secondary flex items-center justify-center">
        <p className="text-muted">Laden...</p>
      </div>
    }>
      <ReflectiePaginaInner />
    </Suspense>
  );
}
