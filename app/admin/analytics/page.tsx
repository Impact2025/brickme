import { db } from "@/lib/db";
import { sessies } from "@/lib/db/schema";
import { count, eq, sql, avg, and, isNotNull } from "drizzle-orm";
import { BarChart } from "@/components/admin/BarChart";
import { FunnelChart } from "@/components/admin/FunnelChart";
import { StatCard } from "@/components/admin/StatCard";

const THEMA_KLEUREN: Record<string, string> = {
  werk: "#C8583A",
  relatie: "#2D4A3E",
  identiteit: "#8B7355",
  verbinding: "#D4956A",
  kruispunt: "#4A6B5E",
};

async function getAnalytics() {
  const [themaVerdeling, funnel, stemmingPerThema] = await Promise.all([
    db
      .select({ thema: sessies.thema, themaLabel: sessies.themaLabel, n: count() })
      .from(sessies)
      .groupBy(sessies.thema, sessies.themaLabel)
      .orderBy(sql`count(*) desc`),

    Promise.all([
      db.select({ n: count() }).from(sessies),
      db.select({ n: count() }).from(sessies).where(sql`${sessies.status} != 'intake'`),
      db.select({ n: count() }).from(sessies).where(eq(sessies.status, "voltooid")),
    ]),

    db
      .select({
        thema: sessies.thema,
        themaLabel: sessies.themaLabel,
        gemVoor: avg(sessies.stemmingVoor),
        gemNa: avg(sessies.stemmingNa),
      })
      .from(sessies)
      .where(and(isNotNull(sessies.stemmingVoor), isNotNull(sessies.stemmingNa)))
      .groupBy(sessies.thema, sessies.themaLabel),
  ]);

  return { themaVerdeling, funnel, stemmingPerThema };
}

export default async function AdminAnalytics() {
  const { themaVerdeling, funnel, stemmingPerThema } = await getAnalytics();

  const [totaal, gestart, voltooid] = funnel;
  const totaalN = Number(totaal[0].n);
  const gestartN = Number(gestart[0].n);
  const voltooidN = Number(voltooid[0].n);

  const barData = themaVerdeling.map((t) => ({
    label: t.themaLabel ?? t.thema,
    waarde: Number(t.n),
    kleur: THEMA_KLEUREN[t.thema] ?? "#8B7355",
  }));

  const funnelData = [
    { label: "Sessie gestart", waarde: totaalN },
    { label: "Intake afgerond", waarde: gestartN },
    { label: "Rapport ontvangen", waarde: voltooidN },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#2C1F14]">Analytics</h1>
        <p className="text-[#8B7355] text-sm mt-1">Platform inzichten</p>
      </div>

      {/* Funnel + Thema's naast elkaar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sessie-funnel */}
        <div className="bg-white rounded-xl border border-[#E8DDD0] p-6">
          <h2 className="font-serif text-lg text-[#2C1F14] mb-1">Sessie-funnel</h2>
          <p className="text-xs text-[#8B7355] mb-5">Van start tot rapport</p>
          <FunnelChart stappen={funnelData} />
          <div className="mt-4 pt-4 border-t border-[#E8DDD0]">
            <p className="text-xs text-[#8B7355]">
              Afrondingspercentage:{" "}
              <span className="font-semibold text-[#2C1F14]">
                {totaalN > 0 ? Math.round((voltooidN / totaalN) * 100) : 0}%
              </span>
            </p>
          </div>
        </div>

        {/* Thema populariteit */}
        <div className="bg-white rounded-xl border border-[#E8DDD0] p-6">
          <h2 className="font-serif text-lg text-[#2C1F14] mb-1">Thema&apos;s</h2>
          <p className="text-xs text-[#8B7355] mb-5">Aantal sessies per thema</p>
          <BarChart data={barData} hoogte={140} />
        </div>
      </div>

      {/* Stemming per thema */}
      <div className="bg-white rounded-xl border border-[#E8DDD0] p-6 mb-8">
        <h2 className="font-serif text-lg text-[#2C1F14] mb-1">Stemming-effect per thema</h2>
        <p className="text-xs text-[#8B7355] mb-5">Gemiddelde voor → na (alleen voltooide sessies)</p>
        {stemmingPerThema.length === 0 ? (
          <p className="text-sm text-[#8B7355]">Nog geen data beschikbaar</p>
        ) : (
          <div className="space-y-3">
            {stemmingPerThema.map((t) => {
              const voor = Number(t.gemVoor ?? 0).toFixed(1);
              const na = Number(t.gemNa ?? 0).toFixed(1);
              const delta = Number(t.gemNa ?? 0) - Number(t.gemVoor ?? 0);
              return (
                <div key={t.thema} className="flex items-center gap-4">
                  <span className="w-36 text-sm text-[#2C1F14] truncate">{t.themaLabel ?? t.thema}</span>
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-xs text-[#8B7355] w-10 text-right">{voor}</span>
                    <div className="flex-1 h-2 bg-[#F5F0E8] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(Math.max((Number(na) / 10) * 100, 0), 100)}%`,
                          backgroundColor: delta > 0 ? "#2D4A3E" : delta < 0 ? "#C8583A" : "#8B7355",
                        }}
                      />
                    </div>
                    <span className="text-xs text-[#8B7355] w-10">{na}</span>
                    <span className={`text-xs font-medium w-12 ${delta > 0 ? "text-[#2D4A3E]" : delta < 0 ? "text-[#C8583A]" : "text-[#8B7355]"}`}>
                      {delta > 0 ? "+" : ""}{delta.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
