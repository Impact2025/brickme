"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function ProfielPage() {
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [bezig, setBezig] = useState(false);
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [fout, setFout] = useState("");
  const [verwijderStap, setVerwijderStap] = useState<0 | 1 | 2>(0);
  const [verwijderBezig, setVerwijderBezig] = useState(false);

  useEffect(() => {
    fetch("/api/profiel")
      .then((r) => r.json())
      .then((d) => {
        setNaam(d.naam || "");
        setEmail(d.email || "");
      })
      .catch(() => {});
  }, []);

  async function verwijderAccount() {
    setVerwijderBezig(true);
    try {
      const res = await fetch("/api/profiel", { method: "DELETE" });
      if (!res.ok) throw new Error();
      await signOut({ callbackUrl: "/" });
    } catch {
      setVerwijderBezig(false);
      setVerwijderStap(0);
    }
  }

  async function opslaan(e: React.FormEvent) {
    e.preventDefault();
    setBezig(true);
    setFout("");
    setOpgeslagen(false);

    try {
      const res = await fetch("/api/profiel", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naam, email }),
      });
      if (!res.ok) throw new Error("Opslaan mislukt");
      setOpgeslagen(true);
      setTimeout(() => setOpgeslagen(false), 3000);
    } catch {
      setFout("Er ging iets mis. Probeer opnieuw.");
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[#F5F0E8]">
      <header className="bg-white border-b border-[#E8DDD0] px-6 py-5">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-[#8B7355] hover:text-[#2C1F14] transition-colors">
            ← Dashboard
          </Link>
          <span className="font-serif text-lg text-[#2C1F14]">Profiel</span>
          <div className="w-16" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-8">
        <form onSubmit={opslaan} className="bg-white rounded-2xl border border-[#E8DDD0] p-6 space-y-5">
          <div>
            <label className="block text-xs text-[#8B7355] uppercase tracking-wider mb-2">Naam</label>
            <input
              type="text"
              value={naam}
              onChange={(e) => setNaam(e.target.value)}
              placeholder="Jouw naam"
              className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] bg-[#F5F0E8] text-[#2C1F14] text-sm focus:outline-none focus:border-[#C8583A] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-[#8B7355] uppercase tracking-wider mb-2">E-mailadres</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jouw@email.nl"
              className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] bg-[#F5F0E8] text-[#2C1F14] text-sm focus:outline-none focus:border-[#C8583A] transition-colors"
            />
          </div>

          {fout && <p className="text-sm text-[#C8583A]">{fout}</p>}

          <button
            type="submit"
            disabled={bezig}
            className="w-full bg-[#C8583A] text-white text-sm font-medium py-3 rounded-xl hover:bg-[#b8482a] transition-colors disabled:opacity-50"
          >
            {bezig ? "Opslaan..." : opgeslagen ? "Opgeslagen ✓" : "Opslaan"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-[#8B7355] hover:text-[#2C1F14] transition-colors"
          >
            Uitloggen
          </button>
        </div>

        <div className="mt-8 border-t border-[#E8DDD0] pt-6">
          {verwijderStap === 0 && (
            <button
              onClick={() => setVerwijderStap(1)}
              className="w-full text-sm text-[#8B7355] hover:text-[#C8583A] transition-colors py-2"
            >
              Account verwijderen
            </button>
          )}

          {verwijderStap === 1 && (
            <div className="bg-white rounded-2xl border border-[#E8DDD0] p-5 space-y-4">
              <p className="text-sm text-[#2C1F14] font-medium">Weet je het zeker?</p>
              <p className="text-sm text-[#8B7355] leading-relaxed">
                Al je sessies, foto&apos;s, rapporten en persoonlijke gegevens worden permanent verwijderd. Dit kan niet ongedaan worden gemaakt.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setVerwijderStap(0)}
                  className="flex-1 text-sm text-[#8B7355] border border-[#E8DDD0] py-2.5 rounded-xl hover:border-[#C8583A] transition-colors"
                >
                  Annuleren
                </button>
                <button
                  onClick={() => setVerwijderStap(2)}
                  className="flex-1 text-sm text-[#C8583A] border border-[#C8583A] py-2.5 rounded-xl hover:bg-[#C8583A] hover:text-white transition-colors"
                >
                  Ja, verwijder alles
                </button>
              </div>
            </div>
          )}

          {verwijderStap === 2 && (
            <div className="bg-white rounded-2xl border border-[#C8583A] p-5 space-y-4">
              <p className="text-sm text-[#2C1F14] font-medium">Laatste kans</p>
              <p className="text-sm text-[#8B7355]">
                Na bevestiging wordt je account direct verwijderd en word je uitgelogd.
              </p>
              <button
                onClick={verwijderAccount}
                disabled={verwijderBezig}
                className="w-full bg-[#C8583A] text-white text-sm font-medium py-3 rounded-xl hover:bg-[#b8482a] transition-colors disabled:opacity-50"
              >
                {verwijderBezig ? "Bezig met verwijderen..." : "Account definitief verwijderen"}
              </button>
              <button
                onClick={() => setVerwijderStap(0)}
                disabled={verwijderBezig}
                className="w-full text-sm text-[#8B7355] py-2 hover:text-[#2C1F14] transition-colors disabled:opacity-50"
              >
                Toch niet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
