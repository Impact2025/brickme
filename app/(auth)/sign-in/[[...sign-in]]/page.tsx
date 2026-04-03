"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function SignInForm() {
  const params = useSearchParams();

  const [email, setEmail] = useState("");
  const [fout, setFout] = useState("");
  const [bezig, setBezig] = useState(false);
  const [verzonden, setVerzonden] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBezig(true);
    setFout("");

    const res = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 404) {
        setFout("geen_account");
      } else {
        setFout(data.error || "Er ging iets mis. Probeer opnieuw.");
      }
      setBezig(false);
      return;
    }

    setVerzonden(true);
    setBezig(false);
  }

  return (
    <main className="min-h-dvh bg-secondary flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image src="/icon.svg" alt="Brickme" width={56} height={56} unoptimized className="mx-auto mb-4" />
          {!verzonden ? (
            <>
              <h1 className="text-2xl font-serif text-bricktext">Welkom terug</h1>
              <p className="text-muted text-sm mt-1">Vul je e-mailadres in om in te loggen</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-serif text-bricktext">Check je inbox</h1>
              <p className="text-muted text-sm mt-1">
                We stuurden een inloglink naar <span className="text-bricktext">{email}</span>
              </p>
            </>
          )}
        </div>

        {!verzonden ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-bricktext mb-1">E-mailadres</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="input-base w-full"
                placeholder="jij@voorbeeld.nl"
              />
            </div>

            {fout === "geen_account" ? (
              <p className="text-sm text-red-600">
                Geen account gevonden.{" "}
                <Link
                  href={`/sign-up?email=${encodeURIComponent(email)}`}
                  className="text-primary hover:underline"
                >
                  Maak een account aan
                </Link>
              </p>
            ) : fout ? (
              <p className="text-sm text-red-600">{fout}</p>
            ) : null}

            <button
              type="submit"
              disabled={bezig}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {bezig ? "Versturen..." : "Stuur inloglink →"}
            </button>
          </form>
        ) : (
          <p className="text-center text-sm text-muted">
            De link is 15 minuten geldig.{" "}
            <button
              onClick={() => { setVerzonden(false); setEmail(""); setFout(""); }}
              className="text-primary hover:underline"
            >
              Ander e-mailadres
            </button>
          </p>
        )}

        {!verzonden && (
          <p className="text-center text-sm text-muted mt-6">
            Nog geen account?{" "}
            <Link href="/sign-up" className="text-primary hover:underline">
              Aanmelden
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-secondary" />}>
      <SignInForm />
    </Suspense>
  );
}
