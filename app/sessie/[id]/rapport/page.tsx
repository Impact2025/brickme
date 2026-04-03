"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { formatDatum } from "@/lib/utils";

interface RapportData {
  themaLabel: string;
  stemmingVoor?: number;
  stemmingNa?: number;
  samenvatting?: string;
  inzichten?: string[];
  eersteStap?: string;
  fases: Array<{
    faseTitel: string;
    fotoBase64?: string;
    aiReflectie?: string;
  }>;
  aangemaktOp: string;
}

export default function RapportPagina() {
  const { id } = useParams<{ id: string }>();
  const [rapport, setRapport] = useState<RapportData | null>(null);
  const [laden, setLaden] = useState(true);
  const [genereren, setGenereren] = useState(false);

  useEffect(() => {
    laadRapport();
  }, [id]);

  async function laadRapport() {
    try {
      const res = await fetch(`/api/rapport/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRapport(data);
      } else {
        await genereerRapport();
      }
    } finally {
      setLaden(false);
    }
  }

  async function genereerRapport() {
    setGenereren(true);
    try {
      const res = await fetch(`/api/rapport`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessieId: id }),
      });
      const data = await res.json();
      setRapport(data);
    } finally {
      setGenereren(false);
    }
  }

  if (laden || genereren) {
    return (
      <div className="min-h-dvh bg-secondary flex flex-col items-center justify-center px-6">
        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 animate-pulse-soft">
          <span className="text-2xl">◆</span>
        </div>
        <h2 className="font-serif text-bricktext text-xl mb-2">
          {genereren ? "Rapport wordt samengesteld..." : "Laden..."}
        </h2>
        <p className="text-muted text-sm">
          {genereren ? "Brickme verbindt de draden. Even geduld." : ""}
        </p>
      </div>
    );
  }

  if (!rapport) {
    return (
      <div className="min-h-dvh bg-secondary flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-muted mb-4">Rapport kon niet worden geladen.</p>
          <button onClick={genereerRapport} className="btn-primary">Opnieuw proberen</button>
        </div>
      </div>
    );
  }

  const datum = new Date(rapport.aangemaktOp);
  const stemmingVerschil = rapport.stemmingNa && rapport.stemmingVoor
    ? rapport.stemmingNa - rapport.stemmingVoor
    : null;

  return (
    <main className="min-h-dvh bg-secondary pb-16">
      <div className="max-w-xl mx-auto px-6">
        {/* Document header */}
        <header className="pt-10 pb-8 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <g fill="#C8583A">
                <path transform="translate(33,33) rotate(-45)" d="M -28,-24 A 14,14,0,0,0,0,-24 A 14,14,0,0,0,28,-24 Q 28,0 0,24 Q -28,0 -28,-24 Z"/>
                <path transform="translate(67,33) rotate(45)"  d="M -28,-24 A 14,14,0,0,0,0,-24 A 14,14,0,0,0,28,-24 Q 28,0 0,24 Q -28,0 -28,-24 Z"/>
                <path transform="translate(33,67) rotate(225)" d="M -28,-24 A 14,14,0,0,0,0,-24 A 14,14,0,0,0,28,-24 Q 28,0 0,24 Q -28,0 -28,-24 Z"/>
                <path transform="translate(67,67) rotate(135)" d="M -28,-24 A 14,14,0,0,0,0,-24 A 14,14,0,0,0,28,-24 Q 28,0 0,24 Q -28,0 -28,-24 Z"/>
              </g>
            </svg>
            <p className="text-xs text-muted">{formatDatum(datum)}</p>
          </div>
          <p className="text-xs text-muted uppercase tracking-wider mb-1">{rapport.themaLabel}</p>
          <h1 className="text-3xl font-serif text-bricktext">Jouw reflectierapport</h1>
        </header>

        {/* Stemming boog */}
        {stemmingVerschil !== null && rapport.stemmingVoor && rapport.stemmingNa && (
          <section className="py-8 border-b border-border">
            <p className="text-xs text-muted uppercase tracking-wider mb-4">Hoe je je voelde</p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-border flex items-center justify-center mb-1">
                  <span className="text-xl font-serif text-bricktext">{rapport.stemmingVoor}</span>
                </div>
                <p className="text-xs text-muted">Voor</p>
              </div>
              <div className="flex-1 h-0.5 bg-border relative">
                <div
                  className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${Math.max(20, (rapport.stemmingNa / 10) * 100)}%` }}
                />
              </div>
              <div className="text-center">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-1 ${
                    stemmingVerschil > 0 ? "bg-accent/10" : "bg-border"
                  }`}
                >
                  <span className="text-xl font-serif text-bricktext">{rapport.stemmingNa}</span>
                </div>
                <p className="text-xs text-muted">Na</p>
              </div>
              {stemmingVerschil !== 0 && (
                <p className="text-sm font-medium text-accent ml-2">
                  {stemmingVerschil > 0 ? `+${stemmingVerschil}` : stemmingVerschil}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Samenvatting */}
        {rapport.samenvatting && (
          <section className="py-8 border-b border-border">
            <p className="text-xs text-muted uppercase tracking-wider mb-4">Samenvatting</p>
            <p className="font-serif text-bricktext text-lg leading-relaxed">
              {rapport.samenvatting}
            </p>
          </section>
        )}

        {/* Foto grid + reflecties */}
        <section className="py-8 border-b border-border">
          <p className="text-xs text-muted uppercase tracking-wider mb-4">Jouw bouwsels</p>
          <div className="space-y-8">
            {rapport.fases.map((fase, i) => (
              <div key={i} className="space-y-3">
                <p className="text-sm font-medium text-muted">{fase.faseTitel}</p>
                {fase.fotoBase64 && (
                  <div className="rounded-2xl overflow-hidden aspect-video">
                    <img
                      src={fase.fotoBase64}
                      alt={fase.faseTitel}
                      className="w-full h-full object-cover"
                      style={{ filter: "sepia(10%) brightness(0.98)" }}
                    />
                  </div>
                )}
                {fase.aiReflectie && (
                  <p className="text-sm text-bricktext leading-relaxed font-serif">
                    {fase.aiReflectie}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Inzichten */}
        {rapport.inzichten && rapport.inzichten.length > 0 && (
          <section className="py-8 border-b border-border">
            <p className="text-xs text-muted uppercase tracking-wider mb-4">Wat naar voren kwam</p>
            <ul className="space-y-3">
              {rapport.inzichten.map((inzicht, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-primary">◆</span>
                  </div>
                  <p className="text-bricktext leading-relaxed">{inzicht}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Eerste stap — de kern */}
        {rapport.eersteStap && (
          <section className="py-8">
            <p className="text-xs text-muted uppercase tracking-wider mb-4">Jouw eerste stap</p>
            <div className="bg-accent text-secondary rounded-3xl p-6">
              <p className="font-serif text-xl leading-relaxed">{rapport.eersteStap}</p>
            </div>
          </section>
        )}

        {/* Acties */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => window.print()}
            className="btn-ghost flex-1 text-center"
          >
            Opslaan als PDF
          </button>
          <a href="/" className="btn-primary flex-1 text-center py-3">
            Nieuwe sessie
          </a>
        </div>

        <p className="text-center text-xs text-muted-light mt-8">
          Brickme.nl — bouw wat je niet kunt zeggen
        </p>
      </div>
    </main>
  );
}
