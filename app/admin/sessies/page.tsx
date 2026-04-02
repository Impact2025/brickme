import { db } from "@/lib/db";
import { sessies } from "@/lib/db/schema";
import { desc, eq, and, gte, lte } from "drizzle-orm";
import { ProgressPipeline } from "@/components/admin/ProgressPipeline";
import Link from "next/link";

const THEMAS = [
  { id: "werk", label: "Werk & energie" },
  { id: "relatie", label: "Liefde & relatie" },
  { id: "identiteit", label: "Wie ben ik" },
  { id: "verbinding", label: "Verbinding" },
  { id: "kruispunt", label: "Kruispunt" },
];

export default async function AdminSessies({
  searchParams,
}: {
  searchParams: Promise<{ thema?: string; status?: string; van?: string; tot?: string; pagina?: string }>;
}) {
  const { thema, status, van, tot, pagina = "1" } = await searchParams;
  const perPagina = 50;
  const offset = (parseInt(pagina) - 1) * perPagina;

  const filters = [];
  if (thema) filters.push(eq(sessies.thema, thema));
  if (status) filters.push(eq(sessies.status, status));
  if (van) filters.push(gte(sessies.aangemaktOp, new Date(van)));
  if (tot) filters.push(lte(sessies.aangemaktOp, new Date(tot)));

  const rijen = await db
    .select()
    .from(sessies)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(sessies.aangemaktOp))
    .limit(perPagina)
    .offset(offset);

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#2C1F14]">Sessies</h1>
        <p className="text-[#8B7355] text-sm mt-1">Alle sessies op het platform</p>
      </div>

      {/* Filters */}
      <form className="mb-6 flex flex-wrap gap-3">
        <select
          name="thema"
          defaultValue={thema ?? ""}
          className="px-3 py-2 rounded-xl border border-[#E8DDD0] bg-white text-sm text-[#2C1F14] focus:outline-none focus:ring-2 focus:ring-[#C8583A]/30"
        >
          <option value="">Alle thema&apos;s</option>
          {THEMAS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="px-3 py-2 rounded-xl border border-[#E8DDD0] bg-white text-sm text-[#2C1F14] focus:outline-none focus:ring-2 focus:ring-[#C8583A]/30"
        >
          <option value="">Alle statussen</option>
          <option value="intake">Intake</option>
          <option value="bouwen">Bouwen</option>
          <option value="voltooid">Voltooid</option>
        </select>
        <input type="date" name="van" defaultValue={van ?? ""} className="px-3 py-2 rounded-xl border border-[#E8DDD0] bg-white text-sm text-[#2C1F14] focus:outline-none" />
        <input type="date" name="tot" defaultValue={tot ?? ""} className="px-3 py-2 rounded-xl border border-[#E8DDD0] bg-white text-sm text-[#2C1F14] focus:outline-none" />
        <button type="submit" className="px-5 py-2 bg-[#C8583A] text-white rounded-xl text-sm font-medium hover:bg-[#b8482a] transition-colors">
          Filteren
        </button>
        {(thema || status || van || tot) && (
          <Link href="/admin/sessies" className="px-4 py-2 text-sm text-[#8B7355] hover:text-[#2C1F14] transition-colors">
            Wissen
          </Link>
        )}
      </form>

      {/* Tabel */}
      <div className="rounded-xl border border-[#E8DDD0] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#FAF7F2] border-b border-[#E8DDD0]">
              <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Thema</th>
              <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Voortgang</th>
              <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Stemming ∆</th>
              <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Datum</th>
              <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide" />
            </tr>
          </thead>
          <tbody>
            {rijen.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[#8B7355]">Geen sessies gevonden</td>
              </tr>
            ) : (
              rijen.map((s) => (
                <tr key={s.id} className="border-b border-[#E8DDD0] last:border-0 hover:bg-[#FAF7F2] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#2C1F14]">{s.themaLabel}</td>
                  <td className="px-4 py-3">
                    <ProgressPipeline status={s.status} compact />
                  </td>
                  <td className="px-4 py-3 text-[#8B7355]">
                    {s.stemmingVoor != null && s.stemmingNa != null ? (
                      <span className={s.stemmingNa > s.stemmingVoor ? "text-[#2D4A3E]" : s.stemmingNa < s.stemmingVoor ? "text-[#C8583A]" : ""}>
                        {s.stemmingVoor} → {s.stemmingNa}
                        {" "}({s.stemmingNa - s.stemmingVoor > 0 ? "+" : ""}{s.stemmingNa - s.stemmingVoor})
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#8B7355]">
                    {new Date(s.aangemaktOp).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    {s.status === "voltooid" && (
                      <Link
                        href={`/sessie/${s.id}/rapport`}
                        className="text-xs text-[#C8583A] hover:underline"
                        target="_blank"
                      >
                        Rapport →
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginering */}
      {rijen.length === perPagina && (
        <div className="mt-4 flex justify-end">
          <Link
            href={`/admin/sessies?pagina=${parseInt(pagina) + 1}${thema ? `&thema=${thema}` : ""}${status ? `&status=${status}` : ""}`}
            className="px-4 py-2 text-sm text-[#C8583A] hover:underline"
          >
            Volgende pagina →
          </Link>
        </div>
      )}
    </div>
  );
}
