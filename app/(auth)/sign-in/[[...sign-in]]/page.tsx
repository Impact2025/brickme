"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

function SignInForm() {
  const params = useSearchParams();
  const router = useRouter();
  const callbackUrl = params.get("callbackUrl") || "/start";

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
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

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBezig(true);
    setFout("");

    const result = await signIn("credentials", {
      email,
      magicToken: code.trim(),
      redirect: false,
    });

    if (result?.error) {
      setFout("Ongeldige of verlopen code. Probeer opnieuw.");
      setBezig(false);
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <main className="min-h-dvh bg-secondary flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Brickme" width={56} height={56} className="mx-auto mb-4" />
          {!verzonden ? (
            <>
              <h1 className="text-2xl font-serif text-bricktext">Welkom terug</h1>
              <p className="text-muted text-sm mt-1">Vul je e-mailadres in om in te loggen</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-serif text-bricktext">Voer je code in</h1>
              <p className="text-muted text-sm mt-1">
                We stuurden een 6-cijferige code naar <span className="text-bricktext">{email}</span>
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
              {bezig ? "Versturen..." : "Stuur code →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-bricktext mb-1">Inlogcode</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                required
                autoFocus
                className="input-base w-full text-center text-2xl tracking-widest font-bold"
                placeholder="123456"
              />
            </div>

            {fout && <p className="text-sm text-red-600">{fout}</p>}

            <button
              type="submit"
              disabled={bezig || code.length !== 6}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {bezig ? "Bezig..." : "Inloggen →"}
            </button>

            <p className="text-center text-sm text-muted">
              Code niet ontvangen?{" "}
              <button
                type="button"
                onClick={() => { setVerzonden(false); setCode(""); setFout(""); }}
                className="text-primary hover:underline"
              >
                Opnieuw versturen
              </button>
            </p>
          </form>
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
