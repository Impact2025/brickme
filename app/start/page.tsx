"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { THEMAS, ThemaId } from "@/lib/themas";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;
  const router = useRouter();
  const [geselecteerd, setGeselecteerd] = useState<ThemaId | null>(null);
  const [bezig, setBezig] = useState(false);

  async function startSessie() {
    if (!geselecteerd || !isSignedIn) return;
    setBezig(true);
    router.push(`/betalen?thema=${geselecteerd}`);
  }

  const themaLijst = Object.values(THEMAS);

  return (
    <main className="min-h-dvh bg-secondary">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 max-w-2xl mx-auto">
        <div>
          <h1 className="text-2xl font-serif text-bricktext tracking-tight">Brickme</h1>
          <p className="text-xs text-muted mt-0.5">Bouw wat je niet kunt zeggen</p>
        </div>
        {isSignedIn ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">{session.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-muted hover:text-bricktext transition-colors"
            >
              Uitloggen
            </button>
          </div>
        ) : (
          <Link href="/sign-in" className="text-sm text-primary font-medium hover:text-primary-dark transition-colors">
            Inloggen →
          </Link>
        )}
      </header>

      <div className="max-w-2xl mx-auto px-6 pb-24">
        {/* Hero */}
        <section className="pt-8 pb-12 text-center">
          <div className="w-12 h-12 bg-primary rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <span className="text-2xl">◆</span>
          </div>
          <h2 className="text-4xl font-serif text-bricktext mb-4 leading-tight">
            Waar loop jij<br />mee rond?
          </h2>
          <p className="text-muted text-lg max-w-sm mx-auto leading-relaxed">
            Kies een thema. De rest gaat vanzelf.
          </p>
        </section>

        {/* Thema tiles */}
        <section className="space-y-3">
          {themaLijst.map((thema) => {
            const isActief = geselecteerd === thema.id;
            return (
              <button
                key={thema.id}
                onClick={() => setGeselecteerd(thema.id as ThemaId)}
                className={cn(
                  "w-full text-left p-5 rounded-3xl border-2 transition-all duration-300",
                  "hover:border-primary hover:shadow-sm",
                  isActief
                    ? "border-primary bg-white shadow-md scale-[1.01]"
                    : "border-border bg-surface"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">
                      {thema.ondertitel}
                    </p>
                    <h3 className="text-xl font-serif text-bricktext mb-2">{thema.label}</h3>
                    <p className="text-sm text-muted leading-relaxed">{thema.beschrijving}</p>
                  </div>
                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 ml-4 transition-all duration-200",
                      isActief ? "border-primary bg-primary" : "border-muted-light"
                    )}
                  />
                </div>
              </button>
            );
          })}
        </section>

        {/* CTA */}
        {geselecteerd && (
          <div className="mt-8 animate-slide-up">
            {isSignedIn ? (
              <button
                onClick={startSessie}
                disabled={bezig}
                className="btn-primary w-full text-center text-lg py-4"
              >
                {bezig ? "Sessie wordt aangemaakt..." : "Begin mijn sessie →"}
              </button>
            ) : (
              <div className="space-y-3">
                <Link
                  href={`/sign-up?callbackUrl=/betalen?thema=${geselecteerd}`}
                  className="btn-primary w-full text-center text-lg py-4 block"
                >
                  Account aanmaken →
                </Link>
                <Link
                  href={`/sign-in?callbackUrl=/betalen?thema=${geselecteerd}`}
                  className="block text-center text-sm text-muted hover:text-bricktext transition-colors py-2"
                >
                  Al een account? Inloggen
                </Link>
              </div>
            )}
            <p className="text-center text-xs text-muted mt-3">
              Een sessie duurt 30–45 minuten. Je hebt blokken of huishoudspullen nodig.
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-muted-light space-y-1">
          <p>Brickme.nl — geïnspireerd op LEGO® Serious Play</p>
          <p>LEGO® is een trademark van The LEGO Group. Brickme is hier niet aan verbonden.</p>
        </footer>
      </div>
    </main>
  );
}
