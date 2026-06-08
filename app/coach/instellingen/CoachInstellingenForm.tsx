"use client";

import { useState } from "react";

type Props = {
  huidigNaam: string;
  huidigEmail: string;
};

export default function CoachInstellingenForm({ huidigNaam, huidigEmail }: Props) {
  const [naam, setNaam] = useState(huidigNaam);
  const [bezig, setBezig] = useState(false);
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [fout, setFout] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBezig(true);
    setFout("");
    setOpgeslagen(false);

    const res = await fetch("/api/coach/profiel", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam: naam.trim() }),
    });

    setBezig(false);
    if (res.ok) {
      setOpgeslagen(true);
      setTimeout(() => setOpgeslagen(false), 3000);
    } else {
      setFout("Er ging iets mis. Probeer het opnieuw.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-[#8B7355] uppercase tracking-wide mb-1.5">
          Naam
        </label>
        <input
          type="text"
          value={naam}
          onChange={(e) => setNaam(e.target.value)}
          placeholder="Je weergavenaam"
          className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD0] bg-[#FAF7F2] text-sm text-[#2C1F14] placeholder:text-[#8B7355]/50 focus:outline-none focus:ring-2 focus:ring-[#C8583A]/30 focus:border-[#C8583A]/50 transition"
        />
      </div>

      <div>
        <label className="block text-xs text-[#8B7355] uppercase tracking-wide mb-1.5">
          E-mailadres
        </label>
        <input
          type="email"
          value={huidigEmail}
          disabled
          className="w-full px-4 py-2.5 rounded-xl border border-[#E8DDD0] bg-[#F5F0E8] text-sm text-[#8B7355] cursor-not-allowed"
        />
        <p className="text-xs text-[#8B7355] opacity-60 mt-1">
          E-mailadres kan niet worden gewijzigd
        </p>
      </div>

      {fout && (
        <p className="text-sm text-[#C8583A] bg-[#C8583A]/10 px-3 py-2 rounded-lg">{fout}</p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={bezig || naam.trim() === huidigNaam}
          className="px-5 py-2.5 bg-[#C8583A] text-white text-sm font-medium rounded-xl hover:bg-[#b8482a] disabled:opacity-40 transition-colors"
        >
          {bezig ? "Opslaan…" : "Opslaan"}
        </button>
        {opgeslagen && (
          <span className="text-sm text-[#2D4A3E] transition-opacity">
            ✓ Opgeslagen
          </span>
        )}
      </div>
    </form>
  );
}
