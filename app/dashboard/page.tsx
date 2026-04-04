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

        {/* Volg ons */}
        <section className="border-t border-[#E8DDD0] pt-8 pb-2">
          <p className="text-xs uppercase tracking-wider text-[#8B7355] mb-4">Volg Brickme</p>
          <div className="flex items-center gap-3">
            <a href="https://www.instagram.com/brickme.nl/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-xl bg-white border border-[#E8DDD0] flex items-center justify-center text-[#8B7355] hover:text-[#C8583A] hover:border-[#C8583A]/30 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://www.facebook.com/brickmelsp" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-xl bg-white border border-[#E8DDD0] flex items-center justify-center text-[#8B7355] hover:text-[#C8583A] hover:border-[#C8583A]/30 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://x.com/BrickmeLSP" target="_blank" rel="noopener noreferrer" aria-label="X / Twitter" className="w-9 h-9 rounded-xl bg-white border border-[#E8DDD0] flex items-center justify-center text-[#8B7355] hover:text-[#C8583A] hover:border-[#C8583A]/30 transition-all">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://www.pinterest.com/brickmeLSP" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="w-9 h-9 rounded-xl bg-white border border-[#E8DDD0] flex items-center justify-center text-[#8B7355] hover:text-[#C8583A] hover:border-[#C8583A]/30 transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
