"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ThemaId } from "@/types";
import { THEMAS } from "@/lib/themas";
import { cn } from "@/lib/utils";

interface Bericht {
  rol: "ai" | "gebruiker";
  inhoud: string;
}

// ─── Welkom scherm ─────────────────────────────────────────────────────────────
function WelkomScherm({ themaLabel, betaald, onKlaar }: { themaLabel: string; betaald: boolean; onKlaar: () => void }) {
  return (
    <main className="min-h-dvh bg-secondary flex flex-col items-center justify-center px-6 py-10">
      <div className="max-w-md w-full space-y-5">
        {/* Terug + logo */}
        <div className="flex items-center justify-between">
          <a href="/" className="text-sm text-muted hover:text-bricktext transition-colors">← Terug</a>
          <Image src="/logo.png" alt="Brickme" width={36} height={36} unoptimized />
        </div>

        {/* Betaling bevestiging */}
        {betaald && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-accent/8 border border-accent/20 animate-slide-up">
            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-sm text-accent font-medium">Betaling gelukt — je sessie staat klaar</p>
          </div>
        )}

        {/* Header */}
        <div>
          <p className="text-xs text-muted uppercase tracking-wider mb-1">{themaLabel}</p>
          <h1 className="text-3xl font-serif text-bricktext leading-tight">Welkom bij je Brickme-sessie</h1>
          <p className="text-muted mt-2 leading-relaxed text-sm">
            Je gaat werken met LEGO® Serious Play® — een methode die je handen laat denken. Zo werkt het:
          </p>
        </div>

        {/* Stappen */}
        <div className="space-y-2.5">
          {[
            {
              stap: "01",
              titel: "Intakegesprek",
              beschrijving: "Je beantwoordt een paar vragen. Zo stemmen we de sessie af op jouw situatie. Antwoord eerlijk — er is geen goed of fout.",
            },
            {
              stap: "02",
              titel: "Bouwen",
              beschrijving: "Je bouwt vier keer iets met LEGO®-blokken. Laat je handen het werk doen. Geen plan nodig — gewoon beginnen.",
            },
            {
              stap: "03",
              titel: "Foto's & reflectie",
              beschrijving: "Na elk bouwsel maak je een foto en vertel je wat je ziet. Zo krijg je aan het einde een persoonlijk rapport.",
            },
          ].map(({ stap, titel, beschrijving }) => (
            <div key={stap} className="flex gap-4 p-4 rounded-2xl bg-surface border border-border">
              <span className="text-xs font-medium text-primary tabular-nums pt-0.5 flex-shrink-0">{stap}</span>
              <div>
                <p className="font-medium text-bricktext text-sm">{titel}</p>
                <p className="text-muted text-sm leading-relaxed mt-0.5">{beschrijving}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Foto tips */}
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
          <p className="text-xs text-primary uppercase tracking-wider mb-2.5 font-medium">Tips voor de beste foto&apos;s</p>
          <ul className="text-sm text-bricktext space-y-1.5 leading-relaxed">
            <li className="flex gap-2"><span className="text-primary flex-shrink-0">·</span>Fotografeer van bovenaf of licht schuin — niet op ooghoogte</li>
            <li className="flex gap-2"><span className="text-primary flex-shrink-0">·</span>Gebruik daglicht of een heldere kamer</li>
            <li className="flex gap-2"><span className="text-primary flex-shrink-0">·</span>Houd het bouwsel centraal en vul het frame</li>
            <li className="flex gap-2"><span className="text-primary flex-shrink-0">·</span>Één bouwsel per foto — minder afleiding, meer betekenis</li>
          </ul>
        </div>

        <button
          onClick={onKlaar}
          className="btn-primary w-full py-4 text-lg animate-slide-up"
        >
          Ik ben klaar om te beginnen →
        </button>
      </div>
    </main>
  );
}

// ─── Sessie inner ──────────────────────────────────────────────────────────────
function NieuweSessieInner() {
  const router = useRouter();
  const params = useSearchParams();
  const themaId = (params.get("thema") || "werk") as ThemaId;
  const resumeSessieId = params.get("sessieId");
  const thema = THEMAS[themaId];

  const betaald = params.get("betaald") === "1";

  const [berichten, setBerichten] = useState<Bericht[]>([]);
  const [invoer, setInvoer] = useState("");
  const [bezig, setBezig] = useState(false);
  const [klaar, setKlaar] = useState(false);
  const [sessieId, setSessieId] = useState<string | null>(resumeSessieId);
  const [stemming, setStemming] = useState<number | null>(null);
  const [welkomFase, setWelkomFase] = useState(!resumeSessieId);
  const [stemmingFase, setStemmingFase] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const gestart = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [berichten]);

  useEffect(() => {
    if (!welkomFase && !stemmingFase && berichten.length === 0 && !gestart.current) {
      gestart.current = true;
      startIntake(resumeSessieId ?? undefined);
    }
  }, [welkomFase, stemmingFase]);

  async function startIntake(bestaandSessieId?: string) {
    setBezig(true);
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themaId,
          berichten: [],
          fase: "start",
          sessieId: bestaandSessieId || null,
          stemming,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fout");
      if (data.sessieId) setSessieId(data.sessieId);
      setBerichten([{ rol: "ai", inhoud: data.bericht }]);
    } catch {
      setBerichten([{ rol: "ai", inhoud: "Er ging iets mis bij het starten. Ververs de pagina." }]);
    } finally {
      setBezig(false);
    }
  }

  async function stuurBericht() {
    if (!invoer.trim() || bezig) return;
    const nieuwBericht: Bericht = { rol: "gebruiker", inhoud: invoer };
    const bijgewerkt = [...berichten, nieuwBericht];
    setBerichten(bijgewerkt);
    setInvoer("");
    setBezig(true);

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themaId,
          berichten: bijgewerkt,
          fase: "gesprek",
          sessieId,
          stemming,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fout");

      if (data.sessieId) setSessieId(data.sessieId);

      if (data.klaar && data.sessieId) {
        setKlaar(true);
      }
      setBerichten((prev) => [...prev, { rol: "ai", inhoud: data.bericht }]);
    } catch {
      setBerichten((prev) => [...prev, { rol: "ai", inhoud: "Verbinding even weg. Probeer opnieuw." }]);
    } finally {
      setBezig(false);
    }
  }

  function gaanBouwen() {
    if (sessieId) router.push(`/sessie/${sessieId}/bouwen`);
  }

  if (welkomFase) {
    return (
      <WelkomScherm
        themaLabel={thema.label}
        betaald={betaald}
        onKlaar={() => { setWelkomFase(false); setStemmingFase(true); }}
      />
    );
  }

  if (stemmingFase) {
    return (
      <main className="min-h-dvh bg-secondary flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full">
          <button onClick={() => { setStemmingFase(false); setWelkomFase(true); }} className="text-sm text-muted hover:text-bricktext mb-8 block">← Terug</button>
          <Image src="/logo.png" alt="Brickme" width={40} height={40} unoptimized className="mb-6" />
          <h2 className="text-3xl font-serif text-bricktext mb-2">Hoe voel je je nu?</h2>
          <p className="text-muted mb-8">Een schaal van 1 (zwaar) tot 10 (lekker in je vel). Dit meten we ook na de sessie.</p>

          <div className="flex gap-2 flex-wrap mb-8">
            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
              <button
                key={n}
                onClick={() => setStemming(n)}
                className={cn(
                  "w-12 h-12 rounded-2xl border-2 font-medium transition-all duration-200",
                  stemming === n
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-surface text-bricktext hover:border-primary"
                )}
              >
                {n}
              </button>
            ))}
          </div>

          {stemming && (
            <button
              onClick={() => setStemmingFase(false)}
              className="btn-primary w-full py-4 text-lg animate-slide-up"
            >
              Begin het gesprek →
            </button>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-secondary flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface sticky top-0 z-10" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
        <div>
          <p className="text-xs text-muted uppercase tracking-wider">{thema.label}</p>
          <h2 className="font-serif text-bricktext">Intake gesprek</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-24 h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${Math.min((berichten.filter(b => b.rol === "gebruiker").length / 7) * 100, 100)}%` }}
            />
          </div>
          <a href="/dashboard" className="text-xs text-muted hover:text-bricktext transition-colors">Dashboard</a>
        </div>
      </header>

      {/* Berichten */}
      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-xl mx-auto w-full space-y-4">
        {berichten.map((bericht, i) => (
          <div
            key={i}
            className={cn(
              "animate-slide-up",
              bericht.rol === "ai" ? "flex items-start gap-3" : "flex justify-end"
            )}
          >
            {bericht.rol === "ai" && (
              <div className="w-7 h-7 bg-primary rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5">
                <span className="text-xs text-white">◆</span>
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                bericht.rol === "ai"
                  ? "bg-surface border border-border text-bricktext rounded-tl-sm whitespace-pre-line"
                  : "bg-primary text-white rounded-tr-sm"
              )}
            >
              {bericht.inhoud}
            </div>
          </div>
        ))}

        {bezig && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="w-7 h-7 bg-primary rounded-lg flex-shrink-0 flex items-center justify-center">
              <span className="text-xs text-white">◆</span>
            </div>
            <div className="bg-surface border border-border px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 bg-muted-light rounded-full animate-pulse-soft" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {klaar && (
          <div className="animate-slide-up">
            <button onClick={gaanBouwen} className="btn-primary w-full py-4 text-lg mt-4">
              Ga bouwen →
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!klaar && (
        <div className="px-6 py-4 border-t border-border bg-surface sticky bottom-0" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          <div className="max-w-xl mx-auto flex gap-3">
            <input
              type="text"
              value={invoer}
              onChange={(e) => setInvoer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && stuurBericht()}
              placeholder="Schrijf je antwoord..."
              className="input-base flex-1"
              disabled={bezig}
              enterKeyHint="send"
            />
            <button
              onClick={stuurBericht}
              disabled={bezig || !invoer.trim()}
              className="btn-primary px-5 disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function NieuweSessiePage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-secondary flex items-center justify-center"><p className="text-muted">Laden...</p></div>}>
      <NieuweSessieInner />
    </Suspense>
  );
}
