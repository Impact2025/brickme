import { db } from "@/lib/db";
import { betalingen, gebruikers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { THEMAS } from "@/lib/themas";
import type { ThemaId } from "@/types";

export const dynamic = "force-dynamic";

function bedragLabel(cents: number | null) {
  if (cents === null || cents === 0) return "Gratis";
  return `€ ${(cents / 100).toFixed(2)}`;
}

function statusBadge(status: string) {
  const base = "inline-block px-2 py-0.5 rounded text-xs font-medium";
  if (status === "open") return <span className={`${base} bg-yellow-100 text-yellow-800`}>Open</span>;
  if (status === "gebruikt") return <span className={`${base} bg-green-100 text-green-700`}>Gebruikt</span>;
  if (status === "terugbetaald") return <span className={`${base} bg-red-100 text-red-700`}>Terugbetaald</span>;
  return <span className={`${base} bg-gray-100 text-gray-600`}>{status}</span>;
}

export default async function BetalingenPage() {
  const rijen = await db
    .select({
      id: betalingen.id,
      userId: betalingen.userId,
      naam: gebruikers.naam,
      email: gebruikers.email,
      thema: betalingen.thema,
      bedrag: betalingen.bedrag,
      couponCode: betalingen.couponCode,
      stripeSessionId: betalingen.stripeSessionId,
      status: betalingen.status,
      sessieId: betalingen.sessieId,
      aangemaktOp: betalingen.aangemaktOp,
    })
    .from(betalingen)
    .leftJoin(gebruikers, eq(betalingen.userId, gebruikers.userId))
    .orderBy(betalingen.aangemaktOp);

  const totaalOmzet = rijen
    .filter(r => r.status !== "terugbetaald" && r.bedrag !== null)
    .reduce((s, r) => s + (r.bedrag ?? 0), 0);

  const openCount = rijen.filter(r => r.status === "open").length;
  const gebruiktCount = rijen.filter(r => r.status === "gebruikt").length;

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-serif text-[#2C1F14] mb-6">Betalingen</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-[#E8E0D5] p-5">
          <p className="text-xs text-[#8B7355] uppercase tracking-wider mb-1">Totaal</p>
          <p className="text-2xl font-semibold text-[#2C1F14]">{rijen.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E0D5] p-5">
          <p className="text-xs text-[#8B7355] uppercase tracking-wider mb-1">Open</p>
          <p className="text-2xl font-semibold text-yellow-700">{openCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E8E0D5] p-5">
          <p className="text-xs text-[#8B7355] uppercase tracking-wider mb-1">Omzet (excl. gratis)</p>
          <p className="text-2xl font-semibold text-[#2C1F14]">€ {(totaalOmzet / 100).toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E8E0D5] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-[#E8E0D5] bg-[#FAF7F2]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#8B7355] uppercase tracking-wider">Gebruiker</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#8B7355] uppercase tracking-wider">Thema</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#8B7355] uppercase tracking-wider">Bedrag</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#8B7355] uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#8B7355] uppercase tracking-wider">Methode</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[#8B7355] uppercase tracking-wider">Datum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E0D5]">
            {rijen.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#8B7355]">Nog geen betalingen</td>
              </tr>
            )}
            {rijen.map((r) => {
              const themaLabel = THEMAS[r.thema as ThemaId]?.label ?? r.thema;
              return (
                <tr key={r.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#2C1F14]">{r.naam ?? "—"}</p>
                    <p className="text-xs text-[#8B7355]">{r.email ?? r.userId}</p>
                  </td>
                  <td className="px-4 py-3 text-[#2C1F14]">{themaLabel}</td>
                  <td className="px-4 py-3 font-mono text-[#2C1F14]">{bedragLabel(r.bedrag)}</td>
                  <td className="px-4 py-3">{statusBadge(r.status)}</td>
                  <td className="px-4 py-3 text-[#8B7355]">
                    {r.couponCode
                      ? <span className="font-mono text-xs bg-[#F5F0E8] px-1.5 py-0.5 rounded">{r.couponCode}</span>
                      : r.stripeSessionId
                        ? <span className="text-xs">Stripe</span>
                        : "—"}
                  </td>
                  <td className="px-4 py-3 text-[#8B7355] text-xs whitespace-nowrap">
                    {r.aangemaktOp.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
