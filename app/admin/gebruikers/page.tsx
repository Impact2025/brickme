import { db } from "@/lib/db";
import { gebruikers } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { RolBadge } from "@/components/admin/RolBadge";
import { GebruikerRolSelector } from "./GebruikerRolSelector";

export default async function AdminGebruikers({
  searchParams,
}: {
  searchParams: Promise<{ zoek?: string; pagina?: string }>;
}) {
  const { zoek = "", pagina = "1" } = await searchParams;
  const perPagina = 50;
  const offset = (parseInt(pagina) - 1) * perPagina;

  const rijen = await db
    .select()
    .from(gebruikers)
    .orderBy(desc(gebruikers.aangemaktOp))
    .limit(perPagina)
    .offset(offset);

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[#2C1F14]">Gebruikers</h1>
          <p className="text-[#8B7355] text-sm mt-1">{rijen.length} geregistreerde gebruikers</p>
        </div>
      </div>

      {/* Zoeken */}
      <form className="mb-6">
        <div className="flex gap-3">
          <input
            name="zoek"
            defaultValue={zoek}
            placeholder="Zoek op naam, e-mail of ID..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8DDD0] bg-white text-sm text-[#2C1F14] placeholder:text-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#C8583A]/30"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#C8583A] text-white rounded-xl text-sm font-medium hover:bg-[#b8482a] transition-colors"
          >
            Zoeken
          </button>
        </div>
      </form>

      {/* Tabel */}
      <div className="rounded-xl border border-[#E8DDD0] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#FAF7F2] border-b border-[#E8DDD0]">
              <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Gebruiker</th>
              <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Rol</th>
              <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Actief</th>
              <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Aangemeld</th>
              <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Actie</th>
            </tr>
          </thead>
          <tbody>
            {rijen.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[#8B7355]">
                  Geen gebruikers gevonden
                </td>
              </tr>
            ) : (
              rijen.map((g) => (
                <tr key={g.userId} className="border-b border-[#E8DDD0] last:border-0 hover:bg-[#FAF7F2] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#2C1F14]">{g.naam ?? "—"}</p>
                    <p className="text-xs text-[#8B7355] font-mono">{g.userId.slice(0, 20)}…</p>
                  </td>
                  <td className="px-4 py-3">
                    <RolBadge rol={g.rol} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block w-2 h-2 rounded-full ${g.actief ? "bg-[#2D4A3E]" : "bg-[#E8DDD0]"}`} />
                  </td>
                  <td className="px-4 py-3 text-xs text-[#8B7355]">
                    {new Date(g.aangemaktOp).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <GebruikerRolSelector userId={g.userId} huidigeRol={g.rol} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
