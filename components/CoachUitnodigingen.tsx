"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Uitnodiging = {
  id: string;
  coachNaam: string | null;
  coachEmail: string | null;
  aangemaktOp: Date;
};

export function CoachUitnodigingen({ uitnodigingen }: { uitnodigingen: Uitnodiging[] }) {
  const router = useRouter();
  const [bezig, setBezig] = useState<string | null>(null);
  const [verwerkt, setVerwerkt] = useState<Set<string>>(new Set());

  async function reageer(id: string, actie: "accepteren" | "weigeren") {
    setBezig(id);
    try {
      await fetch(`/api/coach/uitnodiging/${id}/${actie}`, { method: "POST" });
      setVerwerkt((prev) => new Set([...prev, id]));
      router.refresh();
    } finally {
      setBezig(null);
    }
  }

  const zichtbaar = uitnodigingen.filter((u) => !verwerkt.has(u.id));
  if (zichtbaar.length === 0) return null;

  return (
    <section className="space-y-3">
      {zichtbaar.map((u) => (
        <div
          key={u.id}
          className="bg-white rounded-2xl border-2 border-[#C8583A]/20 p-5"
        >
          <p className="text-xs text-[#C8583A] uppercase tracking-wider font-medium mb-2">
            Coach-uitnodiging
          </p>
          <p className="font-medium text-[#2C1F14] mb-1">
            {u.coachNaam ?? u.coachEmail ?? "Een coach"} wil jou begeleiden
          </p>
          <p className="text-sm text-[#8B7355] mb-4 leading-relaxed">
            Als je accepteert, kan deze coach jouw Brickme-sessies en reflecties inzien.
            Je kunt dit later altijd intrekken.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => reageer(u.id, "accepteren")}
              disabled={bezig === u.id}
              className="px-4 py-2 bg-[#2D4A3E] text-white text-sm font-medium rounded-xl hover:bg-[#1d3a2e] disabled:opacity-50 transition-colors"
            >
              {bezig === u.id ? "…" : "Accepteren"}
            </button>
            <button
              onClick={() => reageer(u.id, "weigeren")}
              disabled={bezig === u.id}
              className="px-4 py-2 border border-[#E8DDD0] text-[#8B7355] text-sm rounded-xl hover:border-[#C8583A]/30 hover:text-[#2C1F14] disabled:opacity-50 transition-colors"
            >
              Weigeren
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
