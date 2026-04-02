"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  clientUserId: string;
  sessieId?: string;
  compact?: boolean;
}

export function NotitiesToevoegen({ clientUserId, sessieId, compact = false }: Props) {
  const router = useRouter();
  const [tekst, setTekst] = useState("");
  const [bezig, setBezig] = useState(false);
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [open, setOpen] = useState(false);

  async function slaOp(e: React.FormEvent) {
    e.preventDefault();
    if (!tekst.trim()) return;
    setBezig(true);
    try {
      await fetch("/api/coach/notities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientUserId, sessieId, tekst }),
      });
      setTekst("");
      setOpgeslagen(true);
      setOpen(false);
      router.refresh();
      setTimeout(() => setOpgeslagen(false), 3000);
    } finally {
      setBezig(false);
    }
  }

  if (compact) {
    return (
      <div className="mt-3">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="text-xs text-[#8B7355] hover:text-[#C8583A] transition-colors"
          >
            + Notitie toevoegen
          </button>
        ) : (
          <form onSubmit={slaOp} className="flex gap-2 mt-1">
            <input
              autoFocus
              value={tekst}
              onChange={(e) => setTekst(e.target.value)}
              placeholder="Notitie bij deze sessie..."
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#E8DDD0] bg-[#FAF7F2] text-[#2C1F14] placeholder:text-[#8B7355] focus:outline-none focus:ring-1 focus:ring-[#C8583A]/30"
            />
            <button type="submit" disabled={bezig || !tekst.trim()} className="px-3 py-1.5 bg-[#C8583A] text-white text-xs rounded-lg disabled:opacity-50">
              {bezig ? "…" : "Opslaan"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-[#8B7355] px-1">×</button>
          </form>
        )}
        {opgeslagen && <p className="text-xs text-[#2D4A3E] mt-1">✓ Opgeslagen</p>}
      </div>
    );
  }

  return (
    <form onSubmit={slaOp} className="space-y-3">
      <textarea
        value={tekst}
        onChange={(e) => setTekst(e.target.value)}
        rows={3}
        placeholder="Voeg een privé notitie toe..."
        className="w-full px-4 py-3 rounded-xl border border-[#E8DDD0] bg-[#FAF7F2] text-sm text-[#2C1F14] placeholder:text-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#C8583A]/30 resize-none"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={bezig || !tekst.trim()}
          className="px-4 py-2 bg-[#C8583A] text-white rounded-xl text-sm font-medium hover:bg-[#b8482a] transition-colors disabled:opacity-50"
        >
          {bezig ? "Opslaan…" : "Notitie opslaan"}
        </button>
        {opgeslagen && <span className="text-sm text-[#2D4A3E]">✓ Opgeslagen</span>}
      </div>
    </form>
  );
}
