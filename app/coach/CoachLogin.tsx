"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function CoachLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [wachtwoord, setWachtwoord] = useState("");
  const [fout, setFout] = useState("");
  const [bezig, setBezig] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBezig(true);
    setFout("");

    const result = await signIn("credentials", {
      email: email.trim(),
      wachtwoord,
      redirect: false,
    });

    if (result?.error || !result?.ok) {
      setFout("E-mailadres of wachtwoord klopt niet.");
      setBezig(false);
      return;
    }

    router.push("/coach/clienten");
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-[#2D4A3E] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo.png" alt="Brickme" width={48} height={48} unoptimized className="mb-4" />
          <h1 className="font-serif text-2xl text-white">Coach-omgeving</h1>
          <p className="text-white/50 text-sm mt-1">Log in met je coach-account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-1.5">E-mailadres</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="coach@voorbeeld.nl"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#C8583A]/60 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1.5">Wachtwoord</label>
            <input
              type="password"
              value={wachtwoord}
              onChange={(e) => setWachtwoord(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#C8583A]/60 text-sm"
            />
          </div>

          {fout && (
            <p className="text-sm text-[#C8583A] bg-[#C8583A]/10 px-3 py-2 rounded-lg">{fout}</p>
          )}

          <button
            type="submit"
            disabled={bezig || !email || !wachtwoord}
            className="w-full py-3 bg-[#C8583A] text-white font-medium rounded-xl hover:bg-[#b8482a] disabled:opacity-40 transition-colors text-sm"
          >
            {bezig ? "Inloggen…" : "Inloggen →"}
          </button>
        </form>

        <p className="text-center text-xs text-white/30 mt-8">
          Geen coach-account? Neem contact op via{" "}
          <a href="mailto:hello@brickme.nl" className="text-white/50 hover:text-white/70">
            hello@brickme.nl
          </a>
        </p>
      </div>
    </div>
  );
}
