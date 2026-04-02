"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NieuweWorkshop() {
  const router = useRouter();
  const [naam, setNaam] = useState("");
  const [beschrijving, setBeschrijving] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");

  async function maakAan(e: React.FormEvent) {
    e.preventDefault();
    if (!naam.trim()) return;
    setBezig(true);
    setFout("");

    try {
      const res = await fetch("/api/facilitator/workshops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ naam, beschrijving }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFout(data.error ?? "Fout bij aanmaken");
        return;
      }
      router.push(`/facilitator/workshops/${data.workshop.id}`);
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="font-serif text-3xl text-[#2C1F14] mb-2">Nieuwe workshop</h1>
      <p className="text-[#8B7355] text-sm mb-8">Er wordt automatisch een join-code aangemaakt</p>

      <form onSubmit={maakAan} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#2C1F14] mb-1.5">Naam</label>
          <input
            value={naam}
            onChange={(e) => setNaam(e.target.value)}
            placeholder="bijv. Teamdag Q2 2025"
            required
            className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] bg-white text-[#2C1F14] placeholder:text-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#C8583A]/30"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#2C1F14] mb-1.5">Beschrijving <span className="text-[#8B7355] font-normal">(optioneel)</span></label>
          <textarea
            value={beschrijving}
            onChange={(e) => setBeschrijving(e.target.value)}
            rows={3}
            placeholder="Korte omschrijving van de workshop..."
            className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] bg-white text-[#2C1F14] placeholder:text-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#C8583A]/30 resize-none"
          />
        </div>

        {fout && <p className="text-sm text-[#C8583A]">{fout}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={bezig || !naam.trim()}
            className="flex-1 py-3 bg-[#C8583A] text-white rounded-xl font-medium hover:bg-[#b8482a] transition-colors disabled:opacity-50"
          >
            {bezig ? "Aanmaken…" : "Workshop aanmaken"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-3 rounded-xl border border-[#E8DDD0] text-[#8B7355] hover:text-[#2C1F14] transition-colors"
          >
            Terug
          </button>
        </div>
      </form>
    </div>
  );
}
