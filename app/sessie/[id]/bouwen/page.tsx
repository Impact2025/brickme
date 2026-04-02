"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { compressImage, cn } from "@/lib/utils";

const FASE_DUUR = 8 * 60; // 8 minuten per fase

interface Fase {
  id: string;
  faseNummer: number;
  faseTitel: string;
  vraag: string;
  voltooid: boolean;
}

export default function BouwenPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [fases, setFases] = useState<Fase[]>([]);
  const [huidigeFase, setHuidigeFase] = useState(0);
  const [vraagZichtbaar, setVraagZichtbaar] = useState(false);
  const [secondenOver, setSecondenOver] = useState(FASE_DUUR);
  const [foto, setFoto] = useState<string | null>(null);
  const [beschrijving, setBeschrijving] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");
  const [laden, setLaden] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    laadSessie();
  }, [id]);

  useEffect(() => {
    if (!laden && fases.length > 0) {
      startTimer();
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [huidigeFase, laden]);

  function startTimer() {
    setSecondenOver(FASE_DUUR);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondenOver((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);
  }

  async function laadSessie() {
    try {
      const res = await fetch(`/api/sessie/${id}`);
      const data = await res.json();
      setFases(data.fases || []);
    } finally {
      setLaden(false);
    }
  }

  async function fotoGekozen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Compress to max 1280px / 82% JPEG before storing — reduces ~12MP photo from ~5MB to ~200KB
    const base64 = await compressImage(file, 1280, 0.82);
    setFoto(base64);
  }

  async function slaFaseOp() {
    if (!foto || !beschrijving.trim() || bezig) return;
    setBezig(true);
    setFout("");
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const fase = fases[huidigeFase];
      const res = await fetch(`/api/reflectie`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessieId: id,
          faseId: fase.id,
          fotoBase64: foto,
          beschrijving,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Fout bij opslaan");
      }

      router.push(`/sessie/${id}/reflectie?fase=${huidigeFase + 1}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Er ging iets mis.";
      setFout(`${msg} Probeer opnieuw.`);
      startTimer();
    } finally {
      setBezig(false);
    }
  }

  const mins = Math.floor(secondenOver / 60);
  const secs = secondenOver % 60;
  const voortgang = (FASE_DUUR - secondenOver) / FASE_DUUR;
  const fase = fases[huidigeFase];

  if (laden) {
    return (
      <div className="min-h-dvh bg-secondary flex items-center justify-center">
        <div className="skeleton w-64 h-8" />
      </div>
    );
  }

  if (!fase) {
    return (
      <div className="min-h-dvh bg-secondary flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-muted mb-4">Sessie niet gevonden.</p>
          <a href="/" className="text-primary">← Terug</a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-secondary flex flex-col max-w-xl mx-auto">
      {/* Header — pt-safe pushes content below iOS notch/Dynamic Island */}
      <header className="px-6 pt-safe pb-4" style={{ paddingTop: "max(1.5rem, env(safe-area-inset-top))" }}>
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-muted uppercase tracking-wider">
            Fase {fase.faseNummer} van {fases.length}
          </p>
          {/* Analoge timer */}
          <div className="relative w-14 h-14">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="#E8DDD0" strokeWidth="3" />
              <circle
                cx="28" cy="28" r="24"
                fill="none"
                stroke="#C8583A"
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 24}`}
                strokeDashoffset={`${2 * Math.PI * 24 * (1 - voortgang)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-bricktext tabular-nums">
                {mins}:{secs.toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-serif text-bricktext">{fase.faseTitel}</h2>
      </header>

      <div className="flex-1 px-6 space-y-5 overflow-y-auto" style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
        {/* Verborgen vraag kaart */}
        <button
          onClick={() => setVraagZichtbaar(true)}
          className={cn(
            "w-full text-left p-5 rounded-3xl border-2 transition-all duration-500",
            vraagZichtbaar
              ? "border-primary bg-white"
              : "border-border bg-surface hover:border-primary cursor-pointer"
          )}
        >
          {vraagZichtbaar ? (
            <div className="animate-fade-in">
              <p className="text-xs text-muted uppercase tracking-wider mb-2">Jouw bouwopdracht</p>
              <p className="text-bricktext leading-relaxed">{fase.vraag}</p>
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="text-muted text-sm">Tik om de opdracht te onthullen</p>
              <p className="text-xs text-muted-light mt-1">Neem even de tijd voordat je kijkt</p>
            </div>
          )}
        </button>

        {/* Foto upload */}
        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-3">Fotografeer je bouwsel</p>

          {foto ? (
            <div className="relative rounded-3xl overflow-hidden aspect-square">
              <img src={foto} alt="Jouw bouwsel" className="w-full h-full object-cover" />
              <button
                onClick={() => setFoto(null)}
                className="absolute top-3 right-3 bg-white/80 text-bricktext rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-white transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square rounded-3xl border-2 border-dashed border-border bg-surface flex flex-col items-center justify-center gap-3 hover:border-primary transition-colors duration-200"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">📷</span>
              </div>
              <div className="text-center">
                <p className="text-bricktext font-medium">Maak een foto</p>
                <p className="text-muted text-sm mt-0.5">Of upload vanuit je galerij</p>
              </div>
            </button>
          )}
          {/* Geen capture="environment" — iOS toont dan "Maak foto" + "Kies uit bibliotheek" + "Bladeren" */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={fotoGekozen}
            className="hidden"
          />
        </div>

        {/* Beschrijving */}
        {foto && (
          <div className="animate-slide-up">
            <p className="text-xs text-muted uppercase tracking-wider mb-2">Wat zie jij in dit bouwsel?</p>
            <textarea
              value={beschrijving}
              onChange={(e) => setBeschrijving(e.target.value)}
              placeholder="Beschrijf in je eigen woorden wat je hebt gebouwd en wat het voor je betekent..."
              rows={4}
              className="input-base resize-none"
            />
            <p className="text-xs text-muted-light mt-1.5">
              {beschrijving.trim().length <= 10
                ? `Schrijf nog ${10 - beschrijving.trim().length + 1} teken${10 - beschrijving.trim().length + 1 === 1 ? "" : "s"} meer om door te gaan.`
                : "✓ Klaar om door te gaan."
              }
            </p>
          </div>
        )}

        {fout && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">{fout}</p>
        )}

        {/* Doorgaan knop */}
        {foto && beschrijving.trim().length > 10 && (
          <button
            onClick={slaFaseOp}
            disabled={bezig}
            className="btn-primary w-full py-4 text-lg animate-slide-up"
          >
            {bezig ? "Reflectie wordt gemaakt..." : "Ontvang mijn reflectie →"}
          </button>
        )}
      </div>
    </main>
  );
}
