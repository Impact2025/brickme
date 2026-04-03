import { redirect } from "next/navigation";
import { getGebruiker } from "@/lib/auth";
import { db } from "@/lib/db";
import { sessies, fases, rapporten } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { StatCard } from "@/components/admin/StatCard";

type SessieMetInfo = {
  id: string;
  thema: string;
  themaLabel: string;
  status: string;
  stemmingVoor: number | null;
  stemmingNa: number | null;
  aangemaktOp: Date;
  voltooidOp: Date | null;
  huidigeFase: number | null;
  heeftRapport: boolean;
};

function resumeUrl(s: SessieMetInfo): string {
  if (s.status === "draft") return `/sessie/nieuw?thema=${s.thema}&sessieId=${s.id}`;
  if (s.status === "bouwen" || s.status === "reflectie" || s.status === "intake") return `/sessie/${s.id}/bouwen`;
  return `/sessie/${s.id}/rapport`;
}

function statusLabel(status: string): { tekst: string; kleur: string } {
  switch (status) {
    case "draft": return { tekst: "Intake bezig", kleur: "#B45309" };
    case "bouwen": return { tekst: "Bouwen", kleur: "#C8583A" };
    case "reflectie": return { tekst: "Reflectie", kleur: "#C8583A" };
    case "rapport": return { tekst: "Rapport klaar", kleur: "#2D4A3E" };
    case "voltooid": return { tekst: "Voltooid", kleur: "#2D4A3E" };
    default: return { tekst: status, kleur: "#8B7355" };
  }
}

function formatDatum(d: Date): string {
  return new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}

export default async function DashboardPage() {
  const gebruiker = await getGebruiker();
  if (!gebruiker) redirect("/sign-in");

  const alleSessies = await db
    .select()
    .from(sessies)
    .where(eq(sessies.userId, gebruiker.userId))
    .orderBy(desc(sessies.aangemaktOp));

  const sessiesMetInfo: SessieMetInfo[] = await Promise.all(
    alleSessies.map(async (s) => {
      const alleFases = await db
        .select({ faseNummer: fases.faseNummer, voltooid: fases.voltooid })
        .from(fases)
        .where(eq(fases.sessieId, s.id))
        .orderBy(fases.faseNummer);

      const huidigeFase = alleFases.find((f) => !f.voltooid)?.faseNummer ?? null;

      const rapport = await db
        .select({ id: rapporten.id })
        .from(rapporten)
        .where(eq(rapporten.sessieId, s.id))
        .limit(1);

      return {
        id: s.id,
        thema: s.thema,
        themaLabel: s.themaLabel,
        status: s.status,
        stemmingVoor: s.stemmingVoor,
        stemmingNa: s.stemmingNa,
        aangemaktOp: s.aangemaktOp,
        voltooidOp: s.voltooidOp,
        huidigeFase,
        heeftRapport: rapport.length > 0,
      };
    })
  );

  const actieveSessies = sessiesMetInfo.filter((s) => s.status !== "voltooid");
  const voltooide = sessiesMetInfo.filter((s) => s.status === "voltooid");
  const metStemming = voltooide.filter((s) => s.stemmingVoor != null && s.stemmingNa != null);
  const gemDelta =
    metStemming.length > 0
      ? metStemming.reduce((acc, s) => acc + (s.stemmingNa! - s.stemmingVoor!), 0) / metStemming.length
      : null;

  return (
    <div className="min-h-dvh bg-[#F5F0E8]">
      {/* Header */}
      <header className="bg-white border-b border-[#E8DDD0] px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C8583A] rounded-xl flex items-center justify-center">
              <span className="text-white text-sm">◆</span>
            </div>
            <span className="font-serif text-xl text-[#2C1F14]">Brickme</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/profiel" className="text-sm text-[#8B7355] hover:text-[#2C1F14] transition-colors">
              {gebruiker.naam || gebruiker.email || "Profiel"}
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-10">

        {/* Welkom */}
        <section>
          <h1 className="font-serif text-3xl text-[#2C1F14] mb-1">
            Welkom terug{gebruiker.naam ? `, ${gebruiker.naam.split(" ")[0]}` : ""}
          </h1>
          <p className="text-[#8B7355] text-sm">Jouw sessies en voortgang op één plek.</p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4">
          <StatCard label="Sessies gestart" waarde={alleSessies.length} />
          <StatCard label="Sessies voltooid" waarde={voltooide.length} kleur="groen" />
          {gemDelta != null && (
            <StatCard
              label="Gem. stemmingsverbetering"
              waarde={`${gemDelta > 0 ? "+" : ""}${gemDelta.toFixed(1)}`}
              kleur={gemDelta > 0 ? "groen" : "primary"}
              trend={gemDelta > 0 ? "omhoog" : "omlaag"}
              trendTekst="per sessie"
            />
          )}
        </section>

        {/* Actieve sessies */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-[#2C1F14]">Actieve sessies</h2>
          </div>

          {actieveSessies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#E8DDD0] p-8 text-center bg-white">
              <p className="text-[#8B7355] text-sm">Geen actieve sessies. Start hieronder een nieuwe.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {actieveSessies.map((s) => {
                const badge = statusLabel(s.status);
                return (
                  <div key={s.id} className="bg-white rounded-2xl border border-[#E8DDD0] p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-[#8B7355] uppercase tracking-wider mb-1">{s.themaLabel}</p>
                        <p className="text-sm text-[#2C1F14]">Gestart op {formatDatum(s.aangemaktOp)}</p>
                      </div>
                      <span
                        className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ color: badge.kleur, background: `${badge.kleur}15` }}
                      >
                        {badge.tekst}
                      </span>
                    </div>
                    {s.stemmingVoor != null && (
                      <p className="text-xs text-[#8B7355] mb-3">Stemming voor: {s.stemmingVoor}/10</p>
                    )}
                    <Link
                      href={resumeUrl(s)}
                      className="inline-block bg-[#C8583A] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#b8482a] transition-colors"
                    >
                      Ga verder →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Nieuwe sessie kopen */}
        <section className="bg-[#2C1F14] rounded-2xl p-6 text-white">
          <p className="text-xs uppercase tracking-wider text-[#8B7355] mb-2">Nieuwe sessie</p>
          <h3 className="font-serif text-xl mb-1">Klaar voor een nieuwe verkenning?</h3>
          <p className="text-sm text-[#8B7355] mb-5">Kies een thema en start een nieuwe LSP-sessie. €14,95 per sessie.</p>
          <Link
            href="/start"
            className="inline-block bg-[#C8583A] text-white text-sm font-medium px-6 py-3 rounded-xl hover:bg-[#b8482a] transition-colors"
          >
            Kies een thema →
          </Link>
        </section>

        {/* Voltooide sessies */}
        {voltooide.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-[#2C1F14]">Voltooide sessies</h2>
              <span className="text-xs text-[#8B7355]">{voltooide.length} sessie{voltooide.length !== 1 ? "s" : ""}</span>
            </div>

            <div className="space-y-3">
              {voltooide.slice(0, 10).map((s) => {
                const delta = s.stemmingVoor != null && s.stemmingNa != null ? s.stemmingNa - s.stemmingVoor : null;
                return (
                  <div key={s.id} className="bg-white rounded-2xl border border-[#E8DDD0] p-5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs text-[#8B7355] uppercase tracking-wider mb-0.5">{s.themaLabel}</p>
                      <p className="text-sm text-[#2C1F14]">
                        {s.voltooidOp ? formatDatum(s.voltooidOp) : formatDatum(s.aangemaktOp)}
                      </p>
                      {delta != null && (
                        <p
                          className="text-xs mt-1 font-medium"
                          style={{ color: delta > 0 ? "#2D4A3E" : delta < 0 ? "#C8583A" : "#8B7355" }}
                        >
                          Stemming {delta > 0 ? `+${delta}` : delta} ({s.stemmingVoor} → {s.stemmingNa})
                        </p>
                      )}
                    </div>
                    {s.heeftRapport && (
                      <Link
                        href={`/sessie/${s.id}/rapport`}
                        className="flex-shrink-0 text-xs text-[#C8583A] font-medium border border-[#C8583A]/30 px-3 py-1.5 rounded-lg hover:bg-[#C8583A]/5 transition-colors"
                      >
                        Rapport →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Stemming grafiek */}
        {metStemming.length >= 2 && (
          <section>
            <h2 className="font-serif text-xl text-[#2C1F14] mb-4">Stemmingsverloop</h2>
            <div className="bg-white rounded-2xl border border-[#E8DDD0] p-5">
              <div className="flex items-end gap-3 h-24">
                {metStemming.slice(-10).map((s, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    {/* Na */}
                    <div
                      className="w-full rounded-t-lg bg-[#C8583A]"
                      style={{ height: `${(s.stemmingNa! / 10) * 80}px` }}
                      title={`Na: ${s.stemmingNa}`}
                    />
                    {/* Voor (overlay als lijn) */}
                    <div
                      className="w-full rounded-t-lg bg-[#E8DDD0] -mt-px"
                      style={{ height: `${(s.stemmingVoor! / 10) * 80}px`, marginTop: `-${(s.stemmingNa! / 10) * 80}px`, opacity: 0.6 }}
                      title={`Voor: ${s.stemmingVoor}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-[#8B7355]">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#C8583A] inline-block" /> Na sessie
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#E8DDD0] border border-[#C8DDD0] inline-block" /> Voor sessie
                </span>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
