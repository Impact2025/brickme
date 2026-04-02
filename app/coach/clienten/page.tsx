import { requireAdminOfRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { coachingRelaties, sessies } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import Link from "next/link";
import { ClientToevoegen } from "./ClientToevoegen";

export default async function CoachClienten() {
  const gebruiker = await requireAdminOfRol("coach");

  const relaties = await db
    .select()
    .from(coachingRelaties)
    .where(
      gebruiker.rol === "superadmin"
        ? undefined
        : and(
            eq(coachingRelaties.coachId, gebruiker.userId),
            eq(coachingRelaties.status, "actief")
          )
    )
    .orderBy(desc(coachingRelaties.aangemaktOp));

  const clientenData = await Promise.all(
    relaties.map(async (r) => {
      const laasteSessie = await db
        .select()
        .from(sessies)
        .where(eq(sessies.userId, r.clientUserId))
        .orderBy(desc(sessies.aangemaktOp))
        .limit(1);
      return { ...r, laasteSessie: laasteSessie[0] ?? null };
    })
  );

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[#2C1F14]">Cliënten</h1>
          <p className="text-[#8B7355] text-sm mt-1">{relaties.length} actieve cliënt{relaties.length !== 1 ? "en" : ""}</p>
        </div>
      </div>

      {/* Cliënt koppelen */}
      <div className="bg-white rounded-xl border border-[#E8DDD0] p-5 mb-8">
        <h2 className="font-medium text-[#2C1F14] mb-1">Cliënt toevoegen</h2>
        <p className="text-xs text-[#8B7355] mb-3">Vul het Clerk User ID van de cliënt in</p>
        <ClientToevoegen />
      </div>

      {/* Cliëntenlijst */}
      {clientenData.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E8DDD0] p-10 text-center">
          <p className="text-[#8B7355]">Nog geen cliënten. Voeg er één toe via het formulier hierboven.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#E8DDD0] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E8DDD0]">
                <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Cliënt</th>
                <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Laatste sessie</th>
                <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Gekoppeld</th>
                <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide" />
              </tr>
            </thead>
            <tbody>
              {clientenData.map((c) => (
                <tr key={c.id} className="border-b border-[#E8DDD0] last:border-0 hover:bg-[#FAF7F2] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs text-[#8B7355]">{c.clientUserId.slice(0, 20)}…</p>
                  </td>
                  <td className="px-4 py-3 text-[#2C1F14]">
                    {c.laasteSessie ? (
                      <span>{c.laasteSessie.themaLabel}</span>
                    ) : (
                      <span className="text-[#8B7355]">Nog geen sessie</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.laasteSessie && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        c.laasteSessie.status === "voltooid"
                          ? "bg-[#2D4A3E]/15 text-[#2D4A3E]"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {c.laasteSessie.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#8B7355]">
                    {new Date(c.aangemaktOp).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/coach/clienten/${c.clientUserId}`}
                      className="text-xs text-[#C8583A] hover:underline"
                    >
                      Bekijken →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
