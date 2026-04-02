"use client";

import { useState } from "react";

const ROLLEN = ["gebruiker", "coach", "facilitator", "superadmin"] as const;
type Rol = typeof ROLLEN[number];

export function GebruikerRolSelector({ userId, huidigeRol }: { userId: string; huidigeRol: string }) {
  const [rol, setRol] = useState<Rol>(huidigeRol as Rol);
  const [bezig, setBezig] = useState(false);
  const [opgeslagen, setOpgeslagen] = useState(false);

  async function slaOp(nieuweRol: Rol) {
    setBezig(true);
    setOpgeslagen(false);
    try {
      await fetch(`/api/admin/gebruikers/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rol: nieuweRol }),
      });
      setRol(nieuweRol);
      setOpgeslagen(true);
      setTimeout(() => setOpgeslagen(false), 2000);
    } finally {
      setBezig(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={rol}
        onChange={(e) => slaOp(e.target.value as Rol)}
        disabled={bezig}
        className="text-xs px-2 py-1.5 rounded-lg border border-[#E8DDD0] bg-white text-[#2C1F14] focus:outline-none focus:ring-2 focus:ring-[#C8583A]/30 disabled:opacity-50"
      >
        {ROLLEN.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      {opgeslagen && <span className="text-xs text-[#2D4A3E]">✓</span>}
    </div>
  );
}
