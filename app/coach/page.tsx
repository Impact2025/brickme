import { getGebruiker } from "@/lib/auth";
import { db } from "@/lib/db";
import { coachingRelaties, sessies, gebruikers } from "@/lib/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import Link from "next/link";
import { CoachLogin } from "./CoachLogin";
import { TrendingUp, Users, ArrowRight } from "lucide-react";

export default async function CoachDashboard() {
  const gebruiker = await getGebruiker();
  if (!gebruiker || (gebruiker.rol !== "coach" && gebruiker.rol !== "superadmin")) {
    return <CoachLogin />;
  }

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

  // Haal cliëntgegevens op
  const clientIds = relaties.map((r) => r.clientUserId);
  const clientGebruikers =
    clientIds.length > 0
      ? await db
          .select({ userId: gebruikers.userId, naam: gebruikers.naam, email: gebruikers.email })
          .from(gebruikers)
          .where(inArray(gebruikers.userId, clientIds))
      : [];

  const clientenData = await Promise.all(
    relaties.slice(0, 8).map(async (r) => {
      const laasteSessies = await db
        .select()
        .from(sessies)
        .where(eq(sessies.userId, r.clientUserId))
        .orderBy(desc(sessies.aangemaktOp))
        .limit(5);

      const metStemming = laasteSessies.filter(
        (s) => s.stemmingVoor != null && s.stemmingNa != null
      );
      const gemDelta =
        metStemming.length > 0
          ? metStemming.reduce(
              (acc, s) => acc + (s.stemmingNa! - s.stemmingVoor!),
              0
            ) / metStemming.length
          : null;

      const clientInfo = clientGebruikers.find((g) => g.userId === r.clientUserId);

      return {
        relatie: r,
        laasteSessie: laasteSessies[0] ?? null,
        aantalSessies: laasteSessies.length,
        gemDelta,
        stemmingReeks: laasteSessies
          .slice()
          .reverse()
          .map((s) => s.stemmingNa)
          .filter(Boolean) as number[],
        clientNaam: clientInfo?.naam || null,
        clientEmail: clientInfo?.email || null,
      };
    })
  );

  const totaalSessies = clientenData.reduce((a, c) => a + c.aantalSessies, 0);
  const gemSessiesPerClient =
    relaties.length > 0 ? (totaalSessies / relaties.length).toFixed(1) : "0";
  const posieveDeltas = clientenData.filter((c) => c.gemDelta != null && c.gemDelta > 0).length;

  const naam = gebruiker.naam || gebruiker.email?.split("@")[0] || "Coach";

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-[#8B7355] uppercase tracking-widest mb-1">Welkom terug</p>
        <h1 className="font-serif text-3xl text-[#2C1F14]">{naam}</h1>
        <p className="text-[#8B7355] text-sm mt-1">
          {relaties.length === 0
            ? "Nog geen cliënten gekoppeld"
            : `${relaties.length} actieve cliënt${relaties.length !== 1 ? "en" : ""} · ${totaalSessies} sessie${totaalSessies !== 1 ? "s" : ""} totaal`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="rounded-2xl border border-[#E8DDD0] bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#8B7355] uppercase tracking-wide">Actieve cliënten</p>
            <div className="w-8 h-8 rounded-full bg-[#2D4A3E]/10 flex items-center justify-center">
              <Users size={14} className="text-[#2D4A3E]" />
            </div>
          </div>
          <p className="text-3xl font-serif font-semibold text-[#2D4A3E]">{relaties.length}</p>
        </div>

        <div className="rounded-2xl border border-[#E8DDD0] bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#8B7355] uppercase tracking-wide">Gem. sessies</p>
            <div className="w-8 h-8 rounded-full bg-[#C8583A]/10 flex items-center justify-center">
              <span className="text-xs font-bold text-[#C8583A]">∅</span>
            </div>
          </div>
          <p className="text-3xl font-serif font-semibold text-[#C8583A]">{gemSessiesPerClient}</p>
          <p className="text-xs text-[#8B7355] mt-1">per cliënt</p>
        </div>

        <div className="rounded-2xl border border-[#E8DDD0] bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-[#8B7355] uppercase tracking-wide">Positieve trend</p>
            <div className="w-8 h-8 rounded-full bg-[#2D4A3E]/10 flex items-center justify-center">
              <TrendingUp size={14} className="text-[#2D4A3E]" />
            </div>
          </div>
          <p className="text-3xl font-serif font-semibold text-[#2D4A3E]">{posieveDeltas}</p>
          <p className="text-xs text-[#8B7355] mt-1">
            {clientenData.filter((c) => c.gemDelta != null).length > 0
              ? `van ${clientenData.filter((c) => c.gemDelta != null).length} gemeten`
              : "cliënten"}
          </p>
        </div>
      </div>

      {/* Cliënten */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-serif text-xl text-[#2C1F14]">Cliënten</h2>
        <Link
          href="/coach/clienten"
          className="flex items-center gap-1.5 text-sm text-[#C8583A] hover:text-[#b8482a] transition-colors"
        >
          Alle cliënten <ArrowRight size={14} />
        </Link>
      </div>

      {clientenData.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#E8DDD0] p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-[#E8DDD0] flex items-center justify-center mx-auto mb-4">
            <Users size={22} className="text-[#8B7355]" />
          </div>
          <p className="text-[#8B7355] mb-1 font-medium">Nog geen cliënten gekoppeld</p>
          <p className="text-[#8B7355] text-sm mb-5 opacity-70">
            Koppel een cliënt om te beginnen met coachen
          </p>
          <Link
            href="/coach/clienten"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C8583A] text-white rounded-xl text-sm font-medium hover:bg-[#b8482a] transition-colors"
          >
            Cliënt koppelen <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {clientenData.map((c) => {
            const label =
              c.clientNaam ||
              (c.clientEmail ? c.clientEmail.split("@")[0] : null) ||
              c.relatie.clientUserId.slice(0, 12) + "…";
            const subLabel = c.clientEmail && c.clientNaam ? c.clientEmail : null;
            const isPositief = c.gemDelta != null && c.gemDelta > 0;
            const isNegatief = c.gemDelta != null && c.gemDelta < 0;

            return (
              <Link
                key={c.relatie.id}
                href={`/coach/clienten/${c.relatie.clientUserId}`}
                className="bg-white rounded-2xl border border-[#E8DDD0] p-5 hover:border-[#C8583A]/40 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F5F0E8] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-[#8B7355]">
                        {label.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#2C1F14] group-hover:text-[#C8583A] transition-colors leading-tight">
                        {label}
                      </p>
                      {subLabel && (
                        <p className="text-xs text-[#8B7355] mt-0.5 truncate max-w-[140px]">
                          {subLabel}
                        </p>
                      )}
                    </div>
                  </div>

                  {c.gemDelta != null && (
                    <div
                      className={`flex flex-col items-end ${
                        isPositief
                          ? "text-[#2D4A3E]"
                          : isNegatief
                          ? "text-[#C8583A]"
                          : "text-[#8B7355]"
                      }`}
                    >
                      <p className="text-lg font-serif font-semibold leading-none">
                        {c.gemDelta > 0 ? "+" : ""}
                        {c.gemDelta.toFixed(1)}
                      </p>
                      <p className="text-[10px] opacity-60 mt-0.5">gem. ∆</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-[#8B7355]">
                    {c.aantalSessies} sessie{c.aantalSessies !== 1 ? "s" : ""}
                  </span>
                  {c.laasteSessie && (
                    <>
                      <span className="text-[#E8DDD0]">·</span>
                      <span className="text-xs text-[#8B7355]">{c.laasteSessie.themaLabel}</span>
                    </>
                  )}
                </div>

                {/* Stemming sparkline */}
                {c.stemmingReeks.length > 0 ? (
                  <div className="flex items-end gap-0.5 h-7 mb-3">
                    {c.stemmingReeks.map((v, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-all"
                        style={{
                          height: `${(v / 10) * 100}%`,
                          backgroundColor:
                            v >= 7
                              ? "#2D4A3E"
                              : v >= 5
                              ? "#C8583A"
                              : "#E8DDD0",
                          opacity: 0.75,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-7 mb-3 flex items-center">
                    <div className="w-full h-px bg-[#E8DDD0]" />
                  </div>
                )}

                <p className="text-[11px] text-[#8B7355] opacity-60">
                  Gekoppeld{" "}
                  {new Date(c.relatie.aangemaktOp).toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
