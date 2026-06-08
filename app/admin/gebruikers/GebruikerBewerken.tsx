"use client";

import { useState } from "react";

export function GebruikerBewerken({
  userId,
  huidigEmail,
  naam,
}: {
  userId: string;
  huidigEmail: string | null;
  naam: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(huidigEmail ?? "");
  const [wachtwoord, setWachtwoord] = useState("");
  const [bezig, setBezig] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "fout">("idle");

  async function opslaan(e: React.FormEvent) {
    e.preventDefault();
    setBezig(true);
    setStatus("idle");

    const body: Record<string, string> = {};
    if (email && email !== huidigEmail) body.email = email;
    if (wachtwoord) body.wachtwoord = wachtwoord;

    if (Object.keys(body).length === 0) {
      setBezig(false);
      setOpen(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/gebruikers/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setStatus("ok");
        setWachtwoord("");
        setTimeout(() => {
          setStatus("idle");
          setOpen(false);
        }, 1500);
      } else {
        setStatus("fout");
      }
    } catch {
      setStatus("fout");
    } finally {
      setBezig(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => { setOpen((v) => !v); setStatus("idle"); }}
        className="text-xs px-2 py-1.5 rounded-lg border border-[#E8DDD0] bg-white text-[#8B7355] hover:text-[#2C1F14] hover:border-[#C8583A]/40 transition-colors"
        title="Bewerken"
      >
        ✎ Bewerken
      </button>

      {open && (
        <form
          onSubmit={opslaan}
          className="mt-2 p-3 rounded-xl border border-[#E8DDD0] bg-[#FAF7F2] space-y-2 min-w-[220px]"
        >
          <p className="text-xs font-medium text-[#2C1F14] truncate">{naam ?? userId.slice(0, 16)}</p>
          <div>
            <label className="text-xs text-[#8B7355] block mb-0.5">E-mailadres</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@voorbeeld.nl"
              className="w-full text-xs px-2 py-1.5 rounded-lg border border-[#E8DDD0] bg-white text-[#2C1F14] placeholder:text-[#8B7355]/50 focus:outline-none focus:ring-2 focus:ring-[#C8583A]/30"
            />
          </div>
          <div>
            <label className="text-xs text-[#8B7355] block mb-0.5">Nieuw wachtwoord</label>
            <input
              type="password"
              value={wachtwoord}
              onChange={(e) => setWachtwoord(e.target.value)}
              placeholder="Laat leeg = niet wijzigen"
              className="w-full text-xs px-2 py-1.5 rounded-lg border border-[#E8DDD0] bg-white text-[#2C1F14] placeholder:text-[#8B7355]/50 focus:outline-none focus:ring-2 focus:ring-[#C8583A]/30"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={bezig}
              className="flex-1 text-xs py-1.5 bg-[#C8583A] text-white rounded-lg hover:bg-[#b8482a] disabled:opacity-50 transition-colors"
            >
              {bezig ? "Bezig…" : status === "ok" ? "✓ Opgeslagen" : "Opslaan"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs px-2 py-1.5 border border-[#E8DDD0] rounded-lg text-[#8B7355] hover:bg-white transition-colors"
            >
              Annuleer
            </button>
          </div>
          {status === "fout" && (
            <p className="text-xs text-red-600">Opslaan mislukt, probeer opnieuw.</p>
          )}
        </form>
      )}
    </div>
  );
}
