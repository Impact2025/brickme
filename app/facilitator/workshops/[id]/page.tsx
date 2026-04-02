import { requireAdminOfRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { workshops, workshopDeelnemers, sessies, rapporten } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProgressPipeline } from "@/components/admin/ProgressPipeline";
import Link from "next/link";
import { DeelnemerToevoegen } from "./DeelnemerToevoegen";

export default async function WorkshopDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const gebruiker = await requireAdminOfRol("facilitator");
  const { id } = await params;

  const [workshop] = await db
    .select()
    .from(workshops)
    .where(
      gebruiker.rol === "superadmin"
        ? eq(workshops.id, id)
        : and(eq(workshops.id, id), eq(workshops.facilitatorId, gebruiker.userId))
    )
    .limit(1);

  if (!workshop) notFound();

  const deelnemers = await db
    .select()
    .from(workshopDeelnemers)
    .where(eq(workshopDeelnemers.workshopId, id));

  const deelnemersSessies = await Promise.all(
    deelnemers.map(async (d) => {
      const laasteSessies = await db
        .select()
        .from(sessies)
        .where(eq(sessies.userId, d.userId))
        .orderBy(desc(sessies.aangemaktOp))
        .limit(1);

      const sessie = laasteSessies[0];
      const rapport = sessie
        ? await db.select().from(rapporten).where(eq(rapporten.sessieId, sessie.id)).limit(1)
        : [];

      return { ...d, sessie: sessie ?? null, rapport: rapport[0] ?? null };
    })
  );

  const voltooide = deelnemersSessies.filter((d) => d.sessie?.status === "voltooid").length;
  const bezig = deelnemersSessies.filter(
    (d) => d.sessie && d.sessie.status !== "voltooid"
  ).length;

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/facilitator/workshops" className="text-xs text-[#8B7355] hover:text-[#2C1F14] mb-3 block">
          ← Workshops
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl text-[#2C1F14]">{workshop.naam}</h1>
            {workshop.beschrijving && (
              <p className="text-[#8B7355] text-sm mt-1">{workshop.beschrijving}</p>
            )}
          </div>
          <div className="text-right ml-4 shrink-0">
            <p className="text-xs text-[#8B7355] mb-1">Join-code</p>
            <p className="font-mono text-2xl font-bold text-[#C8583A] tracking-widest">{workshop.code}</p>
          </div>
        </div>
      </div>

      {/* Stats rij */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Deelnemers", waarde: deelnemers.length },
          { label: "Bezig", waarde: bezig },
          { label: "Afgerond", waarde: voltooide },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E8DDD0] p-4 text-center">
            <p className="text-2xl font-serif font-semibold text-[#2C1F14]">{s.waarde}</p>
            <p className="text-xs text-[#8B7355] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Deelnemer toevoegen */}
      <div className="bg-white rounded-xl border border-[#E8DDD0] p-5 mb-6">
        <h2 className="font-medium text-[#2C1F14] mb-3">Deelnemer toevoegen</h2>
        <DeelnemerToevoegen workshopId={id} />
      </div>

      {/* Deelnemers tabel */}
      <h2 className="font-serif text-xl text-[#2C1F14] mb-4">Deelnemers</h2>
      {deelnemersSessies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E8DDD0] p-8 text-center">
          <p className="text-[#8B7355]">Nog geen deelnemers. Voeg ze hierboven toe of deel de join-code.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-[#E8DDD0] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#E8DDD0]">
                <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">ID</th>
                <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Voortgang</th>
                <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Thema</th>
                <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Stemming ∆</th>
                <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide" />
              </tr>
            </thead>
            <tbody>
              {deelnemersSessies.map((d) => (
                <tr key={d.id} className="border-b border-[#E8DDD0] last:border-0 hover:bg-[#FAF7F2] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#8B7355]">{d.userId.slice(0, 16)}…</td>
                  <td className="px-4 py-3">
                    {d.sessie ? (
                      <ProgressPipeline status={d.sessie.status} compact />
                    ) : (
                      <span className="text-xs text-[#8B7355]">Niet gestart</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#2C1F14]">{d.sessie?.themaLabel ?? "—"}</td>
                  <td className="px-4 py-3 text-[#8B7355]">
                    {d.sessie?.stemmingVoor != null && d.sessie?.stemmingNa != null ? (
                      <span className={d.sessie.stemmingNa > d.sessie.stemmingVoor ? "text-[#2D4A3E]" : "text-[#C8583A]"}>
                        {d.sessie.stemmingVoor} → {d.sessie.stemmingNa}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {d.rapport && (
                      <Link
                        href={`/facilitator/deelnemers/${d.userId}`}
                        className="text-xs text-[#C8583A] hover:underline"
                      >
                        Rapport →
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Groepsrapport */}
      {voltooide >= 2 && (
        <div className="mt-6">
          <Link
            href={`/facilitator/groepsrapport/${id}`}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#2D4A3E] text-white rounded-xl text-sm font-medium hover:bg-[#1e3329] transition-colors"
          >
            Groepsrapport genereren →
          </Link>
          <p className="text-xs text-[#8B7355] mt-2">Op basis van {voltooide} voltooide sessies</p>
        </div>
      )}
    </div>
  );
}
