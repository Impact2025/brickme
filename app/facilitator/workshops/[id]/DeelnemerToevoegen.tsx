"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeelnemerToevoegen({ workshopId }: { workshopId: string }) {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");
  const [succes, setSucces] = useState(false);

  async function voegToe(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) return;
    setBezig(true);
    setFout("");
    setSucces(false);

    try {
      const res = await fetch(`/api/facilitator/workshops/${workshopId}/uitnodigen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFout(data.error ?? "Fout bij toevoegen");
        return;
      }
      setSucces(true);
      setUserId("");
      router.refresh();
      setTimeout(() => setSucces(false), 3000);
    } finally {
      setBezig(false);
    }
  }

  return (
    <form onSubmit={voegToe} className="flex gap-3">
      <input
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="Clerk User ID (user_xxx...)"
        className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8DDD0] bg-[#FAF7F2] text-sm text-[#2C1F14] placeholder:text-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#C8583A]/30 font-mono"
      />
      <button
        type="submit"
        disabled={bezig || !userId.trim()}
        className="px-4 py-2.5 bg-[#C8583A] text-white rounded-xl text-sm font-medium hover:bg-[#b8482a] transition-colors disabled:opacity-50"
      >
        {bezig ? "…" : "Toevoegen"}
      </button>
      {fout && <p className="text-xs text-[#C8583A] self-center">{fout}</p>}
      {succes && <p className="text-xs text-[#2D4A3E] self-center">✓ Toegevoegd</p>}
    </form>
  );
}
