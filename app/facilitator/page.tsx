import { requireAdminOfRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { workshops, workshopDeelnemers } from "@/lib/db/schema";
import { eq, count, desc } from "drizzle-orm";
import Link from "next/link";
import { StatCard } from "@/components/admin/StatCard";

export default async function FacilitatorDashboard() {
  const gebruiker = await requireAdminOfRol("facilitator");

  const mijnWorkshops = await db
    .select()
    .from(workshops)
    .where(
      gebruiker.rol === "superadmin"
        ? undefined
        : eq(workshops.facilitatorId, gebruiker.userId)
    )
    .orderBy(desc(workshops.aangemaktOp))
    .limit(5);

  const actief = mijnWorkshops.filter((w) => w.status === "actief");

  // Deelnemersaantal per workshop
  const workshopMetDeelnemers = await Promise.all(
    mijnWorkshops.map(async (w) => {
      const [res] = await db
        .select({ n: count() })
        .from(workshopDeelnemers)
        .where(eq(workshopDeelnemers.workshopId, w.id));
      return { ...w, aantalDeelnemers: Number(res.n) };
    })
  );

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#2C1F14]">Facilitator Dashboard</h1>
        <p className="text-[#8B7355] text-sm mt-1">Welkom terug</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <StatCard
          label="Actieve workshops"
          waarde={actief.length}
          kleur="groen"
        />
        <StatCard
          label="Totaal workshops"
          waarde={mijnWorkshops.length}
          subLabel="aangemaakt"
        />
      </div>

      {/* Workshops overzicht */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl text-[#2C1F14]">Recente workshops</h2>
        <Link href="/facilitator/workshops/nieuw" className="text-sm text-[#C8583A] hover:underline">
          + Nieuw
        </Link>
      </div>

      {workshopMetDeelnemers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E8DDD0] p-10 text-center">
          <p className="text-[#8B7355] mb-3">Nog geen workshops aangemaakt</p>
          <Link
            href="/facilitator/workshops/nieuw"
            className="inline-block px-5 py-2.5 bg-[#C8583A] text-white rounded-xl text-sm font-medium hover:bg-[#b8482a] transition-colors"
          >
            Eerste workshop aanmaken
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {workshopMetDeelnemers.map((w) => (
            <Link
              key={w.id}
              href={`/facilitator/workshops/${w.id}`}
              className="block bg-white rounded-xl border border-[#E8DDD0] p-5 hover:border-[#C8583A]/50 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-[#2C1F14] group-hover:text-[#C8583A] transition-colors">{w.naam}</h3>
                  {w.beschrijving && (
                    <p className="text-sm text-[#8B7355] mt-0.5 line-clamp-1">{w.beschrijving}</p>
                  )}
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${w.status === "actief" ? "bg-[#2D4A3E]/15 text-[#2D4A3E]" : "bg-[#F5F0E8] text-[#8B7355]"}
                  `}>
                    {w.status}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-[#8B7355]">
                <span>{w.aantalDeelnemers} deelnemers</span>
                <span>Code: <span className="font-mono font-semibold text-[#2C1F14]">{w.code}</span></span>
                <span>{new Date(w.aangemaktOp).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {mijnWorkshops.length >= 5 && (
        <Link href="/facilitator/workshops" className="mt-4 block text-center text-sm text-[#C8583A] hover:underline">
          Alle workshops bekijken →
        </Link>
      )}
    </div>
  );
}
