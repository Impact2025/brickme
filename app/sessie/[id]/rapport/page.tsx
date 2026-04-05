"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
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
        <div className="w-14 h-14 bg-primary/8 rounded-3xl flex items-center justify-center mb-6 animate-pulse-soft">
          <span className="text-3xl text-primary">◆</span>
        </div>
        <h2 className="font-serif text-bricktext text-2xl mb-2 text-center">
          {genereren ? "Jouw rapport wordt samengesteld" : "Laden..."}
        </h2>
        {genereren && (
          <p className="text-muted text-sm text-center max-w-xs leading-relaxed mt-1">
            Brickme verbindt wat je bouwde, vertelde en voelde. Even geduld.
          </p>
        )}
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
            <Image src="/logo.png" alt="Brickme" width={32} height={32} unoptimized className="animate-spin-slow" />
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

        {/* Delen */}
        <section className="py-8 border-t border-border">
          <p className="text-xs text-muted uppercase tracking-wider mb-4">Deel je ervaring</p>
          <p className="text-sm text-muted mb-4 leading-relaxed">
            Heb je iets waardevols ontdekt? Vertel het anderen — misschien heeft iemand in jouw omgeving dit ook nodig.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a
              href={`https://www.instagram.com/brickme.nl/`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted hover:text-bricktext hover:border-primary/30 transition-all"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              Instagram
            </a>
            <a
              href={`https://www.facebook.com/brickmelsp`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted hover:text-bricktext hover:border-primary/30 transition-all"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
            <a
              href={`https://x.com/BrickmeLSP`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm text-muted hover:text-bricktext hover:border-primary/30 transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X / Twitter
            </a>
          </div>
        </section>

        {/* Feedback */}
        <section className="py-6 border-t border-border">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">Hoe was je ervaring met Brickme?</p>
            <a
              href="mailto:vincent@brickme.nl?subject=Feedback Brickme sessie"
              className="text-sm text-primary hover:text-primary-dark font-medium transition-colors"
            >
              Geef feedback →
            </a>
          </div>
        </section>

        {/* Acties */}
        <div className="space-y-3 pt-4">
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="btn-ghost flex-1 text-center"
            >
              Opslaan als PDF
            </button>
            <a href="/start" className="btn-primary flex-1 text-center py-3">
              Nieuwe sessie
            </a>
          </div>
          <a
            href="/dashboard"
            className="block text-center text-sm text-muted hover:text-bricktext transition-colors py-2"
          >
            Terug naar mijn sessies →
          </a>
        </div>

        <p className="text-center text-xs text-muted-light mt-8">
          Brickme.nl — bouw wat je niet kunt zeggen
        </p>
      </div>
    </main>
  );
}
