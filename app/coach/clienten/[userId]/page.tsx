import { requireAdminOfRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { coachingRelaties, sessies, fases, rapporten, coachNotities } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MoodChart } from "@/components/admin/MoodChart";
import { ProgressPipeline } from "@/components/admin/ProgressPipeline";
import { PatroonAnalyse } from "./PatroonAnalyse";
import { NotitiesToevoegen } from "./NotitiesToevoegen";

export default async function ClientDetail({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const gebruiker = await requireAdminOfRol("coach");
  const { userId } = await params;

  // Controleer relatie
  if (gebruiker.rol !== "superadmin") {
    const relatie = await db
      .select()
      .from(coachingRelaties)
      .where(
        and(
          eq(coachingRelaties.coachId, gebruiker.userId),
          eq(coachingRelaties.clientUserId, userId),
          eq(coachingRelaties.status, "actief")
        )
      )
      .limit(1);

    if (relatie.length === 0) notFound();
  }

  const alleSessies = await db
    .select()
    .from(sessies)
    .where(eq(sessies.userId, userId))
    .orderBy(desc(sessies.aangemaktOp));

  if (alleSessies.length === 0) {
    return (
      <div className="p-8 max-w-3xl">
        <Link href="/coach/clienten" className="text-xs text-[#8B7355] hover:text-[#2C1F14] mb-6 block">← Cliënten</Link>
        <h1 className="font-serif text-3xl text-[#2C1F14] mb-4">Cliënt</h1>
        <p className="text-[#8B7355]">Deze cliënt heeft nog geen sessies.</p>
      </div>
    );
  }

  // Notities ophalen
  const notities = await db
    .select()
    .from(coachNotities)
    .where(and(eq(coachNotities.coachId, gebruiker.userId), eq(coachNotities.clientUserId, userId)))
    .orderBy(desc(coachNotities.aangemaktOp));

  // Sessies met rapporten ophalen
  const sessiesMetRapporten = await Promise.all(
    alleSessies.map(async (s) => {
      const rapport = await db.select().from(rapporten).where(eq(rapporten.sessieId, s.id)).limit(1);
      return { ...s, rapport: rapport[0] ?? null };
    })
  );

  // Stemming-chart data
  const moodData = [...sessiesMetRapporten]
    .reverse()
    .filter((s) => s.stemmingVoor != null || s.stemmingNa != null)
    .map((s) => ({
      label: new Date(s.aangemaktOp).toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
      voor: s.stemmingVoor,
      na: s.stemmingNa,
    }));

  const voltooide = alleSessies.filter((s) => s.status === "voltooid");
  const gemDelta =
    voltooide.filter((s) => s.stemmingVoor != null && s.stemmingNa != null).length > 0
      ? voltooide
          .filter((s) => s.stemmingVoor != null && s.stemmingNa != null)
          .reduce((acc, s) => acc + (s.stemmingNa! - s.stemmingVoor!), 0) /
        voltooide.filter((s) => s.stemmingVoor != null).length
      : null;

  return (
    <div className="p-8 max-w-3xl">
      <Link href="/coach/clienten" className="text-xs text-[#8B7355] hover:text-[#2C1F14] mb-6 block">
        ← Cliënten
      </Link>

      <div className="mb-8">
        <p className="font-mono text-xs text-[#8B7355] mb-1">{userId}</p>
        <h1 className="font-serif text-3xl text-[#2C1F14]">Cliënt-overzicht</h1>
        <div className="flex items-center gap-4 mt-2 text-sm text-[#8B7355]">
          <span>{alleSessies.length} sessies</span>
          <span>{voltooide.length} voltooid</span>
          {gemDelta != null && (
            <span className={gemDelta > 0 ? "text-[#2D4A3E]" : "text-[#C8583A]"}>
              Gem. ∆ {gemDelta > 0 ? "+" : ""}{gemDelta.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Stemming-chart */}
      {moodData.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E8DDD0] p-6 mb-6">
          <h2 className="font-serif text-lg text-[#2C1F14] mb-4">Stemming over tijd</h2>
          <MoodChart data={moodData} breedte={500} hoogte={130} />
        </div>
      )}

      {/* AI Patroonanalyse */}
      {voltooide.length >= 2 && (
        <div className="mb-6">
          <PatroonAnalyse clientUserId={userId} aantalSessies={voltooide.length} />
        </div>
      )}

      {/* Sessie-tijdlijn */}
      <h2 className="font-serif text-xl text-[#2C1F14] mb-4">Sessie-tijdlijn</h2>
      <div className="space-y-3 mb-8">
        {sessiesMetRapporten.map((s) => {
          const inzichten = s.rapport?.inzichten as string[] | undefined;
          return (
            <div key={s.id} className="bg-white rounded-xl border border-[#E8DDD0] overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#2C1F14]">{s.themaLabel}</p>
                  <p className="text-xs text-[#8B7355] mt-0.5">
                    {new Date(s.aangemaktOp).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {s.stemmingVoor != null && s.stemmingNa != null && (
                    <span className={`text-sm font-medium ${s.stemmingNa > s.stemmingVoor ? "text-[#2D4A3E]" : "text-[#C8583A]"}`}>
                      {s.stemmingVoor}→{s.stemmingNa}
                    </span>
                  )}
                  <ProgressPipeline status={s.status} compact />
                </div>
              </div>
              {s.rapport && (
                <div className="px-5 pb-4 border-t border-[#F5F0E8]">
                  <p className="text-sm text-[#2C1F14] mt-3 leading-relaxed">{s.rapport.samenvattingTekst}</p>
                  {inzichten && inzichten.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {inzichten.map((inzicht, i) => (
                        <li key={i} className="text-xs text-[#8B7355] flex gap-1.5">
                          <span className="text-[#C8583A]">·</span> {inzicht}
                        </li>
                      ))}
                    </ul>
                  )}
                  {s.rapport.eersteStap && (
                    <p className="mt-2 text-xs text-[#2D4A3E] font-medium">
                      Eerste stap: {s.rapport.eersteStap}
                    </p>
                  )}
                  {/* Notitie bij sessie */}
                  <NotitiesToevoegen clientUserId={userId} sessieId={s.id} compact />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Privé notities */}
      <div className="bg-white rounded-xl border border-[#E8DDD0] p-6">
        <h2 className="font-serif text-lg text-[#2C1F14] mb-4">Privé notities</h2>
        <NotitiesToevoegen clientUserId={userId} />

        {notities.length > 0 && (
          <div className="mt-4 space-y-3">
            {notities.map((n) => (
              <div key={n.id} className="p-3 bg-[#FAF7F2] rounded-lg">
                <p className="text-sm text-[#2C1F14] leading-relaxed">{n.tekst}</p>
                <p className="text-xs text-[#8B7355] mt-1">
                  {new Date(n.aangemaktOp).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
