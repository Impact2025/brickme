import { requireAdminOfRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { coachingRelaties, sessies, gebruikers } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import Link from "next/link";
import { ClientToevoegen } from "./ClientToevoegen";

export default async function CoachClienten() {
  const coach = await requireAdminOfRol("coach");

  const actieveRelaties = await db
    .select()
    .from(coachingRelaties)
    .where(
      coach.rol === "superadmin"
        ? eq(coachingRelaties.status, "actief")
        : and(
            eq(coachingRelaties.coachId, coach.userId),
            eq(coachingRelaties.status, "actief")
          )
    )
    .orderBy(desc(coachingRelaties.aangemaktOp));

  const openUitnodigingen = await db
    .select()
    .from(coachingRelaties)
    .where(
      coach.rol === "superadmin"
        ? eq(coachingRelaties.status, "uitnodiging")
        : and(
            eq(coachingRelaties.coachId, coach.userId),
            eq(coachingRelaties.status, "uitnodiging")
          )
    )
    .orderBy(desc(coachingRelaties.aangemaktOp));

  const clientenData = await Promise.all(
    actieveRelaties.map(async (r) => {
      const [laasteSessie, clientInfo] = await Promise.all([
        db.select().from(sessies).where(eq(sessies.userId, r.clientUserId)).orderBy(desc(sessies.aangemaktOp)).limit(1),
        db.select({ naam: gebruikers.naam, email: gebruikers.email }).from(gebruikers).where(eq(gebruikers.userId, r.clientUserId)).limit(1),
      ]);
      return { ...r, laasteSessie: laasteSessie[0] ?? null, client: clientInfo[0] ?? null };
    })
  );

  const uitnodigingenData = await Promise.all(
    openUitnodigingen.map(async (r) => {
      const [clientInfo] = await db
        .select({ naam: gebruikers.naam, email: gebruikers.email })
        .from(gebruikers)
        .where(eq(gebruikers.userId, r.clientUserId))
        .limit(1);
      return { ...r, client: clientInfo ?? null };
    })
  );

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[#2C1F14]">Cliënten</h1>
          <p className="text-[#8B7355] text-sm mt-1">{actieveRelaties.length} actieve cliënt{actieveRelaties.length !== 1 ? "en" : ""}</p>
        </div>
      </div>

      {/* Cliënt uitnodigen */}
      <div className="bg-white rounded-xl border border-[#E8DDD0] p-5 mb-8">
        <h2 className="font-medium text-[#2C1F14] mb-1">Cliënt uitnodigen</h2>
        <p className="text-xs text-[#8B7355] mb-3">
          Vul het e-mailadres in van iemand die al een Brickme-account heeft.
          De cliënt ontvangt een uitnodiging en moet zelf akkoord gaan.
        </p>
        <ClientToevoegen />
      </div>

      {/* Openstaande uitnodigingen */}
      {uitnodigingenData.length > 0 && (
        <section className="mb-8">
          <h2 className="font-serif text-lg text-[#2C1F14] mb-3">
            Wacht op acceptatie
            <span className="ml-2 text-sm text-[#8B7355] font-sans font-normal">({uitnodigingenData.length})</span>
          </h2>
          <div className="rounded-xl border border-[#E8DDD0] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DDD0]">
                  <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Cliënt</th>
                  <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Uitgenodigd op</th>
                  <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {uitnodigingenData.map((u) => (
                  <tr key={u.id} className="border-b border-[#E8DDD0] last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#2C1F14]">{u.client?.naam ?? "—"}</p>
                      <p className="text-xs text-[#8B7355]">{u.client?.email ?? ""}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#8B7355]">
                      {new Date(u.aangemaktOp).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        In afwachting
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Actieve cliënten */}
      <section>
        <h2 className="font-serif text-lg text-[#2C1F14] mb-3">Actieve cliënten</h2>
        {clientenData.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E8DDD0] p-10 text-center">
            <p className="text-[#8B7355]">Nog geen actieve cliënten.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-[#E8DDD0] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8DDD0]">
                  <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Cliënt</th>
                  <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Laatste sessie</th>
                  <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Gekoppeld</th>
                  <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide" />
                </tr>
              </thead>
              <tbody>
                {clientenData.map((c) => (
                  <tr key={c.id} className="border-b border-[#E8DDD0] last:border-0 hover:bg-[#FAF7F2] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#2C1F14]">{c.client?.naam ?? "—"}</p>
                      <p className="text-xs text-[#8B7355]">{c.client?.email ?? ""}</p>
                    </td>
                    <td className="px-4 py-3 text-[#2C1F14]">
                      {c.laasteSessie ? c.laasteSessie.themaLabel : <span className="text-[#8B7355]">Nog geen sessie</span>}
                    </td>
                    <td className="px-4 py-3">
                      {c.laasteSessie && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          c.laasteSessie.status === "voltooid"
                            ? "bg-[#2D4A3E]/15 text-[#2D4A3E]"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {c.laasteSessie.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#8B7355]">
                      {new Date(c.aangemaktOp).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/coach/clienten/${c.clientUserId}`} className="text-xs text-[#C8583A] hover:underline">
                        Bekijken →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
