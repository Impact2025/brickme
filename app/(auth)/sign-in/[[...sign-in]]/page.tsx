"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/start";

  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [fout, setFout] = useState("");
  const [bezig, setBezig] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBezig(true);
    setFout("");

    const result = await signIn("credentials", {
      email,
      wachtwoord,
      redirect: false,
    });

    if (result?.error) {
      setFout("E-mail of wachtwoord klopt niet.");
      setBezig(false);
    } else {
      router.push(callbackUrl);
    }
  }

  return (
    <main className="min-h-dvh bg-secondary flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="w-10 h-10 bg-primary rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-xl text-white">◆</span>
          </div>
          <h1 className="text-2xl font-serif text-bricktext">Welkom terug</h1>
          <p className="text-muted text-sm mt-1">Log in om je sessie te starten</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="input-base w-full"
              placeholder="••••••••"
            />
          </div>

          {fout && <p className="text-sm text-red-600">{fout}</p>}

          <button
            type="submit"
            disabled={bezig}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {bezig ? "Inloggen..." : "Inloggen →"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Nog geen account?{" "}
          <Link href="/sign-up" className="text-primary hover:underline">
            Aanmelden
          </Link>
        </p>
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
