"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

function SignUpForm() {
  const params = useSearchParams();
  const router = useRouter();
  const callbackUrl = params.get("callbackUrl") || "/start";

  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState(params.get("email") || "");
  const [code, setCode] = useState("");
  const [fout, setFout] = useState("");
  const [bezig, setBezig] = useState(false);
  const [verzonden, setVerzonden] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBezig(true);
    setFout("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam, email }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setFout(data.error || "Er ging iets mis. Probeer opnieuw.");
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
      setFout("Ongeldige of verlopen code. Controleer je inbox.");
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
          <img src="/icon.svg" alt="Brickme" width={56} height={56} className="mx-auto mb-4" />
          {!verzonden ? (
            <>
              <h1 className="text-2xl font-serif text-bricktext">Maak een account</h1>
              <p className="text-muted text-sm mt-1">Gratis beginnen, altijd jouw data</p>
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
              <label className="block text-sm text-bricktext mb-1">Naam</label>
              <input
                type="text"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                required
                className="input-base w-full"
                placeholder="Jouw naam"
              />
            </div>
            <div>
              <label className="block text-sm text-bricktext mb-1">E-mailadres</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-base w-full"
                placeholder="jij@voorbeeld.nl"
              />
            </div>

            {fout && <p className="text-sm text-red-600">{fout}</p>}

            <button
              type="submit"
              disabled={bezig}
              className="btn-primary w-full py-3 disabled:opacity-50"
            >
              {bezig ? "Account aanmaken..." : "Account aanmaken →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-bricktext mb-1">Verificatiecode</label>
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
              {bezig ? "Bezig..." : "Account activeren →"}
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
            Al een account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              Inloggen
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-secondary" />}>
      <SignUpForm />
    </Suspense>
  );
}
