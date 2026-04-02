import { requireAdminOfRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { coachingRelaties, sessies } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import Link from "next/link";
import { StatCard } from "@/components/admin/StatCard";

export default async function CoachDashboard() {
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
    relaties.slice(0, 8).map(async (r) => {
      const laasteSessies = await db
        .select()
        .from(sessies)
        .where(eq(sessies.userId, r.clientUserId))
        .orderBy(desc(sessies.aangemaktOp))
        .limit(5);

      // Bereken stemming-trend
      const metStemming = laasteSessies.filter(
        (s) => s.stemmingVoor != null && s.stemmingNa != null
      );
      const gemDelta =
        metStemming.length > 0
          ? metStemming.reduce((acc, s) => acc + (s.stemmingNa! - s.stemmingVoor!), 0) / metStemming.length
          : null;

      return {
        relatie: r,
        laasteSessie: laasteSessies[0] ?? null,
        aantalSessies: laasteSessies.length,
        gemDelta,
        stemmingReeks: laasteSessies.reverse().map((s) => s.stemmingNa).filter(Boolean) as number[],
      };
    })
  );

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#2C1F14]">Coach Dashboard</h1>
        <p className="text-[#8B7355] text-sm mt-1">Overzicht van je cliënten</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <StatCard label="Actieve cliënten" waarde={relaties.length} kleur="groen" />
        <StatCard
          label="Gem. sessies per cliënt"
          waarde={relaties.length > 0 ? (clientenData.reduce((a, c) => a + c.aantalSessies, 0) / relaties.length).toFixed(1) : 0}
          subLabel="voltooide sessies"
        />
      </div>

      {/* Cliënt-kaarten */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl text-[#2C1F14]">Cliënten</h2>
        <Link href="/coach/clienten" className="text-sm text-[#C8583A] hover:underline">
          Alle cliënten →
        </Link>
      </div>

      {clientenData.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E8DDD0] p-10 text-center">
          <p className="text-[#8B7355] mb-3">Nog geen cliënten gekoppeld</p>
          <Link
            href="/coach/clienten"
            className="inline-block px-5 py-2.5 bg-[#C8583A] text-white rounded-xl text-sm font-medium hover:bg-[#b8482a] transition-colors"
          >
            Cliënt koppelen
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {clientenData.map((c) => (
            <Link
              key={c.relatie.id}
              href={`/coach/clienten/${c.relatie.clientUserId}`}
              className="bg-white rounded-xl border border-[#E8DDD0] p-5 hover:border-[#C8583A]/50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono text-xs text-[#8B7355]">{c.relatie.clientUserId.slice(0, 18)}…</p>
                  <p className="text-sm text-[#2C1F14] mt-0.5 group-hover:text-[#C8583A] transition-colors">
                    {c.aantalSessies} sessie{c.aantalSessies !== 1 ? "s" : ""}
                    {c.laasteSessie && ` · ${c.laasteSessie.themaLabel}`}
                  </p>
                </div>
                {c.gemDelta != null && (
                  <div className={`text-right ${c.gemDelta > 0 ? "text-[#2D4A3E]" : "text-[#C8583A]"}`}>
                    <p className="text-lg font-serif font-semibold">
                      {c.gemDelta > 0 ? "+" : ""}{c.gemDelta.toFixed(1)}
                    </p>
                    <p className="text-xs opacity-70">gem. ∆</p>
                  </div>
                )}
              </div>

              {/* Mini stemming-balk */}
              {c.stemmingReeks.length > 0 && (
                <div className="flex items-end gap-0.5 h-6">
                  {c.stemmingReeks.map((v, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm bg-[#C8583A] opacity-70 transition-all"
                      style={{ height: `${(v / 10) * 100}%` }}
                    />
                  ))}
                </div>
              )}

              <p className="text-xs text-[#8B7355] mt-2">
                Gekoppeld {new Date(c.relatie.aangemaktOp).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
