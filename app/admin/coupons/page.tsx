import { db } from "@/lib/db";
import { coupons } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { maakCouponAan, toggleCoupon, verwijderCoupon } from "./actions";

export default async function CouponsPage() {
  const alle = await db.select().from(coupons).orderBy(desc(coupons.aangemaktOp));

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#2C1F14]">Couponcodes</h1>
        <p className="text-[#8B7355] mt-1 text-sm">Beheer interne kortings- en gratis-toegangscodes</p>
      </div>

      {/* Nieuw formulier */}
      <div className="bg-white rounded-xl border border-[#E8DDD0] p-6 mb-8">
        <h2 className="font-serif text-lg text-[#2C1F14] mb-4">Nieuwe coupon</h2>
        <form action={maakCouponAan} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#8B7355] mb-1">Code *</label>
            <input
              name="code"
              required
              placeholder="BIJV. ZOMER2026"
              className="w-full border border-[#E8DDD0] rounded-lg px-3 py-2 text-sm text-[#2C1F14] uppercase placeholder:normal-case focus:outline-none focus:border-[#C8583A]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8B7355] mb-1">Korting % * (100 = gratis)</label>
            <input
              name="kortingPercent"
              type="number"
              min="1"
              max="100"
              required
              placeholder="100"
              className="w-full border border-[#E8DDD0] rounded-lg px-3 py-2 text-sm text-[#2C1F14] focus:outline-none focus:border-[#C8583A]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8B7355] mb-1">Beschrijving</label>
            <input
              name="beschrijving"
              placeholder="bijv. Vriendjescode voor event"
              className="w-full border border-[#E8DDD0] rounded-lg px-3 py-2 text-sm text-[#2C1F14] focus:outline-none focus:border-[#C8583A]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8B7355] mb-1">Max. gebruik (leeg = onbeperkt)</label>
            <input
              name="maxGebruik"
              type="number"
              min="1"
              placeholder="bijv. 50"
              className="w-full border border-[#E8DDD0] rounded-lg px-3 py-2 text-sm text-[#2C1F14] focus:outline-none focus:border-[#C8583A]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8B7355] mb-1">Vervaldatum (leeg = nooit)</label>
            <input
              name="verloptOp"
              type="date"
              className="w-full border border-[#E8DDD0] rounded-lg px-3 py-2 text-sm text-[#2C1F14] focus:outline-none focus:border-[#C8583A]"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-[#C8583A] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#b34d32] transition-colors"
            >
              Aanmaken
            </button>
          </div>
        </form>
      </div>

      {/* Coupon lijst */}
      <div className="rounded-xl border border-[#E8DDD0] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#FAF7F2] border-b border-[#E8DDD0]">
              <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Code</th>
              <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Korting</th>
              <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Gebruik</th>
              <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Verloopt</th>
              <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Acties</th>
            </tr>
          </thead>
          <tbody>
            {alle.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#8B7355] text-sm">
                  Nog geen coupons aangemaakt
                </td>
              </tr>
            )}
            {alle.map((c) => {
              const verlopen = c.verloptOp ? c.verloptOp < new Date() : false;
              const uitgeput = c.maxGebruik !== null && c.gebruikTeller >= c.maxGebruik;
              return (
                <tr key={c.id} className="border-b border-[#E8DDD0] last:border-0 hover:bg-[#FAF7F2] transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-[#2C1F14]">{c.code}</span>
                    {c.beschrijving && (
                      <p className="text-xs text-[#8B7355] mt-0.5">{c.beschrijving}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.kortingPercent === 100
                        ? "bg-[#2D4A3E]/15 text-[#2D4A3E]"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {c.kortingPercent === 100 ? "Gratis" : `${c.kortingPercent}% korting`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#8B7355]">
                    {c.gebruikTeller}
                    {c.maxGebruik !== null ? ` / ${c.maxGebruik}` : ""}
                  </td>
                  <td className="px-4 py-3 text-[#8B7355] text-xs">
                    {c.verloptOp
                      ? new Date(c.verloptOp).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })
                      : "Nooit"}
                  </td>
                  <td className="px-4 py-3">
                    {!c.actief ? (
                      <span className="text-xs text-[#8B7355]">Inactief</span>
                    ) : verlopen ? (
                      <span className="text-xs text-red-500">Verlopen</span>
                    ) : uitgeput ? (
                      <span className="text-xs text-red-500">Uitgeput</span>
                    ) : (
                      <span className="text-xs text-[#2D4A3E] font-medium">Actief</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <form action={toggleCoupon.bind(null, c.id, !c.actief)}>
                        <button type="submit" className="text-xs text-[#8B7355] hover:text-[#2C1F14] transition-colors">
                          {c.actief ? "Deactiveer" : "Activeer"}
                        </button>
                      </form>
                      <span className="text-[#E8DDD0]">·</span>
                      <form action={verwijderCoupon.bind(null, c.id)}>
                        <button
                          type="submit"
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                          onClick={(e) => {
                            if (!confirm(`Coupon ${c.code} verwijderen?`)) e.preventDefault();
                          }}
                        >
                          Verwijder
                        </button>
                      </form>
                    </div>
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
