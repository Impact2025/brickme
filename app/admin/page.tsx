import { StatCard } from "@/components/admin/StatCard";
import { db } from "@/lib/db";
import { sessies, gebruikers } from "@/lib/db/schema";
import { count, eq, sql, avg, and, isNotNull, gte } from "drizzle-orm";

async function getStats() {
  const nu = new Date();
  const vandaag = new Date(nu.getFullYear(), nu.getMonth(), nu.getDate());
  const eenWeekGeleden = new Date(vandaag.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [totaalG, totaalS, voltooid, vandaagS, weekG, deltaStem] = await Promise.all([
    db.select({ n: count() }).from(gebruikers),
    db.select({ n: count() }).from(sessies),
    db.select({ n: count() }).from(sessies).where(eq(sessies.status, "voltooid")),
    db.select({ n: count() }).from(sessies).where(gte(sessies.aangemaktOp, vandaag)),
    db.select({ n: count() }).from(gebruikers).where(gte(gebruikers.aangemaktOp, eenWeekGeleden)),
    db
      .select({ gem: avg(sql<number>`${sessies.stemmingNa} - ${sessies.stemmingVoor}`) })
      .from(sessies)
      .where(and(isNotNull(sessies.stemmingVoor), isNotNull(sessies.stemmingNa))),
  ]);

  const totaalSN = Number(totaalS[0].n);
  const voltooidN = Number(voltooid[0].n);

  return {
    totaalGebruikers: Number(totaalG[0].n),
    totaalSessies: totaalSN,
    afrondingspercentage: totaalSN > 0 ? Math.round((voltooidN / totaalSN) * 100) : 0,
    sessiesVandaag: Number(vandaagS[0].n),
    nieuweGebruikersWeek: Number(weekG[0].n),
    gemDelta: deltaStem[0].gem ? Number(Number(deltaStem[0].gem).toFixed(1)) : null,
  };
}

async function getLaatsteSessies() {
  return db
    .select()
    .from(sessies)
    .orderBy(sql`${sessies.aangemaktOp} desc`)
    .limit(8);
}

export default async function AdminDashboard() {
  const [stats, laatste] = await Promise.all([getStats(), getLaatsteSessies()]);

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#2C1F14]">Dashboard</h1>
        <p className="text-[#8B7355] mt-1 text-sm">Platform-overzicht</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard
          label="Totaal gebruikers"
          waarde={stats.totaalGebruikers}
          kleur="groen"
          trend="omhoog"
          trendTekst={`+${stats.nieuweGebruikersWeek} deze week`}
        />
        <StatCard
          label="Sessies vandaag"
          waarde={stats.sessiesVandaag}
          kleur="primary"
        />
        <StatCard
          label="Totaal sessies"
          waarde={stats.totaalSessies}
          subLabel={`${stats.afrondingspercentage}% afgerond`}
        />
        <StatCard
          label="Afrondingspercentage"
          waarde={`${stats.afrondingspercentage}%`}
          kleur={stats.afrondingspercentage >= 60 ? "groen" : "amber"}
          trend={stats.afrondingspercentage >= 60 ? "omhoog" : "omlaag"}
        />
        <StatCard
          label="Gem. stemming-delta"
          waarde={stats.gemDelta != null ? `+${stats.gemDelta}` : "—"}
          subLabel="voor → na sessie"
          kleur={stats.gemDelta != null && stats.gemDelta > 0 ? "groen" : "standaard"}
        />
        <StatCard
          label="Actieve sessies"
          waarde={stats.totaalSessies - stats.afrondingspercentage > 0 ? stats.totaalSessies - Math.round(stats.totaalSessies * stats.afrondingspercentage / 100) : 0}
          subLabel="niet voltooid"
        />
      </div>

      {/* Laatste sessies */}
      <div>
        <h2 className="font-serif text-xl text-[#2C1F14] mb-4">Laatste sessies</h2>
        <div className="rounded-xl border border-[#E8DDD0] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E8DDD0]">
                <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Thema</th>
                <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Stemming ∆</th>
                <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Datum</th>
              </tr>
            </thead>
            <tbody>
              {laatste.map((s) => (
                <tr key={s.id} className="border-b border-[#E8DDD0] last:border-0 hover:bg-[#FAF7F2] transition-colors">
                  <td className="px-4 py-3 text-[#2C1F14] font-medium">{s.themaLabel}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${s.status === "voltooid" ? "bg-[#2D4A3E]/15 text-[#2D4A3E]" : "bg-amber-100 text-amber-700"}
                    `}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#8B7355]">
                    {s.stemmingVoor != null && s.stemmingNa != null
                      ? `${s.stemmingVoor} → ${s.stemmingNa} (${s.stemmingNa - s.stemmingVoor > 0 ? "+" : ""}${s.stemmingNa - s.stemmingVoor})`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-[#8B7355] text-xs">
                    {new Date(s.aangemaktOp).toLocaleDateString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
