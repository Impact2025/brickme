"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClientToevoegen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");
  const [succes, setSucces] = useState(false);

  async function stuurUitnodiging(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBezig(true);
    setFout("");
    setSucces(false);

    try {
      const res = await fetch("/api/coach/clienten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFout(data.error ?? "Fout bij uitnodigen");
        return;
      }
      setSucces(true);
      setEmail("");
      router.refresh();
      setTimeout(() => setSucces(false), 4000);
    } finally {
      setBezig(false);
    }
  }

  return (
    <form onSubmit={stuurUitnodiging} className="space-y-3">
      <div className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="emailadres@voorbeeld.nl"
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8DDD0] bg-[#FAF7F2] text-sm text-[#2C1F14] placeholder:text-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#C8583A]/30"
        />
        <button
          type="submit"
          disabled={bezig || !email.trim()}
          className="px-4 py-2.5 bg-[#C8583A] text-white rounded-xl text-sm font-medium hover:bg-[#b8482a] transition-colors disabled:opacity-50"
        >
          {bezig ? "…" : "Uitnodigen"}
        </button>
      </div>
      {fout && <p className="text-xs text-[#C8583A]">{fout}</p>}
      {succes && (
        <p className="text-xs text-[#2D4A3E]">
          ✓ Uitnodiging verstuurd — de cliënt moet nog accepteren
        </p>
      )}
    </form>
  );
}
