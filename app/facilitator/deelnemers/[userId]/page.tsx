import { requireAdminOfRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { sessies, fases, rapporten } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function DeelnemerRapport({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdminOfRol("facilitator");
  const { userId } = await params;

  const alleSessies = await db
    .select()
    .from(sessies)
    .where(eq(sessies.userId, userId))
    .orderBy(desc(sessies.aangemaktOp));

  if (alleSessies.length === 0) notFound();

  const voltooide = alleSessies.filter((s) => s.status === "voltooid");
  const laatste = alleSessies[0];

  const [alleFases, rapport] = await Promise.all([
    db.select().from(fases).where(eq(fases.sessieId, laatste.id)).orderBy(fases.faseNummer),
    db.select().from(rapporten).where(eq(rapporten.sessieId, laatste.id)).limit(1),
  ]);

  const inzichten = rapport[0]?.inzichten as string[] | undefined;

  return (
    <div className="p-8 max-w-3xl">
      <Link href="javascript:history.back()" className="text-xs text-[#8B7355] hover:text-[#2C1F14] mb-6 block">
        ← Terug
      </Link>

      <div className="mb-8">
        <p className="text-xs font-mono text-[#8B7355] mb-1">{userId}</p>
        <h1 className="font-serif text-3xl text-[#2C1F14]">Sessie-overzicht</h1>
        <p className="text-[#8B7355] text-sm mt-1">{voltooide.length} voltooide sessie(s)</p>
      </div>

      {/* Laatste sessie rapport */}
      {rapport[0] && (
        <div className="bg-white rounded-xl border border-[#E8DDD0] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-[#2C1F14]">Laatste rapport</h2>
            <span className="text-xs text-[#8B7355]">{laatste.themaLabel}</span>
          </div>

          {/* Stemming */}
          {laatste.stemmingVoor != null && laatste.stemmingNa != null && (
            <div className="mb-4 flex items-center gap-4 p-3 bg-[#FAF7F2] rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-serif font-semibold text-[#8B7355]">{laatste.stemmingVoor}</p>
                <p className="text-xs text-[#8B7355]">voor</p>
              </div>
              <div className="flex-1 h-px bg-[#E8DDD0]" />
              <div className={`text-center ${laatste.stemmingNa > laatste.stemmingVoor ? "text-[#2D4A3E]" : "text-[#C8583A]"}`}>
                <p className="text-sm font-medium">
                  {laatste.stemmingNa > laatste.stemmingVoor ? "+" : ""}{laatste.stemmingNa - laatste.stemmingVoor}
                </p>
                <p className="text-xs">delta</p>
              </div>
              <div className="flex-1 h-px bg-[#E8DDD0]" />
              <div className="text-center">
                <p className="text-2xl font-serif font-semibold text-[#2C1F14]">{laatste.stemmingNa}</p>
                <p className="text-xs text-[#8B7355]">na</p>
              </div>
            </div>
          )}

          {rapport[0].samenvattingTekst && (
            <p className="text-sm text-[#2C1F14] leading-relaxed mb-4">{rapport[0].samenvattingTekst}</p>
          )}

          {inzichten && inzichten.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-[#8B7355] uppercase tracking-wide mb-2">Inzichten</p>
              <ul className="space-y-1.5">
                {inzichten.map((inzicht, i) => (
                  <li key={i} className="text-sm text-[#2C1F14] flex gap-2">
                    <span className="text-[#C8583A] shrink-0">·</span>
                    {inzicht}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {rapport[0].eersteStap && (
            <div className="p-3 bg-[#2D4A3E]/8 rounded-lg border border-[#2D4A3E]/20">
              <p className="text-xs font-medium text-[#2D4A3E] uppercase tracking-wide mb-1">Eerste stap</p>
              <p className="text-sm text-[#2C1F14]">{rapport[0].eersteStap}</p>
            </div>
          )}
        </div>
      )}

      {/* Alle sessies overzicht */}
      <h2 className="font-serif text-xl text-[#2C1F14] mb-4">Alle sessies</h2>
      <div className="space-y-2">
        {alleSessies.map((s) => (
          <div key={s.id} className="flex items-center justify-between bg-white rounded-xl border border-[#E8DDD0] px-5 py-3">
            <div>
              <p className="text-sm font-medium text-[#2C1F14]">{s.themaLabel}</p>
              <p className="text-xs text-[#8B7355]">{new Date(s.aangemaktOp).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <div className="flex items-center gap-3">
              {s.stemmingVoor != null && s.stemmingNa != null && (
                <span className={`text-xs ${s.stemmingNa > s.stemmingVoor ? "text-[#2D4A3E]" : "text-[#C8583A]"}`}>
                  {s.stemmingVoor}→{s.stemmingNa}
                </span>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === "voltooid" ? "bg-[#2D4A3E]/15 text-[#2D4A3E]" : "bg-amber-100 text-amber-700"}`}>
                {s.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
