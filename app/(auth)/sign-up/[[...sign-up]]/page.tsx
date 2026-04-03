"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";

function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/start";

  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [fout, setFout] = useState("");
  const [bezig, setBezig] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBezig(true);
    setFout("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam, email, wachtwoord }),
    });

    if (!res.ok) {
      let foutmelding = "Er ging iets mis. Probeer opnieuw.";
      try {
        const data = await res.json();
        if (data.error) foutmelding = data.error;
      } catch {}
      setFout(foutmelding);
      setBezig(false);
      return;
    }

    // Direct inloggen na registratie
    const result = await signIn("credentials", {
      email,
      wachtwoord,
      redirect: false,
    });

    if (result?.error) {
      setFout("Registratie gelukt, maar inloggen mislukt. Probeer opnieuw.");
      setBezig(false);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <main className="min-h-dvh bg-secondary flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image src="/logo.png" alt="Brickme" width={56} height={56} className="mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-bricktext">Maak een account</h1>
          <p className="text-muted text-sm mt-1">Gratis beginnen, altijd jouw data</p>
        </div>

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
          <div>
            <label className="block text-sm text-bricktext mb-1">Wachtwoord</label>
            <input
              type="password"
              value={wachtwoord}
              onChange={(e) => setWachtwoord(e.target.value)}
              required
              minLength={8}
              className="input-base w-full"
              placeholder="Minimaal 8 tekens"
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

        <p className="text-center text-sm text-muted mt-6">
          Al een account?{" "}
          <Link href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="text-primary hover:underline">
            Inloggen
          </Link>
        </p>
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
