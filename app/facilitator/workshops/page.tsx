import { requireAdminOfRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { workshops, workshopDeelnemers } from "@/lib/db/schema";
import { eq, count, desc } from "drizzle-orm";
import Link from "next/link";

export default async function FacilitatorWorkshops() {
  const gebruiker = await requireAdminOfRol("facilitator");

  const alleWorkshops = await db
    .select()
    .from(workshops)
    .where(
      gebruiker.rol === "superadmin"
        ? undefined
        : eq(workshops.facilitatorId, gebruiker.userId)
    )
    .orderBy(desc(workshops.aangemaktOp));

  const workshopMetDeelnemers = await Promise.all(
    alleWorkshops.map(async (w) => {
      const [res] = await db
        .select({ n: count() })
        .from(workshopDeelnemers)
        .where(eq(workshopDeelnemers.workshopId, w.id));
      return { ...w, aantalDeelnemers: Number(res.n) };
    })
  );

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[#2C1F14]">Workshops</h1>
          <p className="text-[#8B7355] text-sm mt-1">{alleWorkshops.length} workshops</p>
        </div>
        <Link
          href="/facilitator/workshops/nieuw"
          className="px-5 py-2.5 bg-[#C8583A] text-white rounded-xl text-sm font-medium hover:bg-[#b8482a] transition-colors"
        >
          + Nieuw
        </Link>
      </div>

      {workshopMetDeelnemers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E8DDD0] p-12 text-center">
          <p className="text-[#8B7355] mb-4">Nog geen workshops aangemaakt</p>
          <Link href="/facilitator/workshops/nieuw" className="inline-block px-5 py-2.5 bg-[#C8583A] text-white rounded-xl text-sm font-medium hover:bg-[#b8482a] transition-colors">
            Workshop aanmaken
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {workshopMetDeelnemers.map((w) => (
            <Link
              key={w.id}
              href={`/facilitator/workshops/${w.id}`}
              className="bg-white rounded-xl border border-[#E8DDD0] p-6 hover:border-[#C8583A]/50 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-serif text-lg text-[#2C1F14] group-hover:text-[#C8583A] transition-colors">{w.naam}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${w.status === "actief" ? "bg-[#2D4A3E]/15 text-[#2D4A3E]" : w.status === "afgerond" ? "bg-[#C8583A]/15 text-[#C8583A]" : "bg-[#F5F0E8] text-[#8B7355]"}
                    `}>
                      {w.status}
                    </span>
                  </div>
                  {w.beschrijving && (
                    <p className="text-sm text-[#8B7355] line-clamp-2">{w.beschrijving}</p>
                  )}
                </div>
                <span className="text-2xl font-mono font-bold text-[#C8583A] ml-4">{w.aantalDeelnemers}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-[#F5F0E8] flex items-center gap-6 text-xs text-[#8B7355]">
                <span>
                  Deelnemer-code: <span className="font-mono font-semibold text-[#2C1F14] bg-[#F5F0E8] px-1.5 py-0.5 rounded">{w.code}</span>
                </span>
                <span>{new Date(w.aangemaktOp).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
