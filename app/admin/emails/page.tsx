import { db } from "@/lib/db";
import { followupEmails, gebruikers } from "@/lib/db/schema";
import { desc, eq, isNull, isNotNull } from "drizzle-orm";
import { EmailTrigger } from "./EmailTrigger";

const TYPE_LABEL: Record<string, string> = {
  dag3: "Dag 3 — check-in",
  dag21: "Dag 21 — terugblik",
  terugkeer: "Dag 42 — terugkeersessie",
};

export default async function AdminEmailsPage() {
  const rijen = await db
    .select({
      id: followupEmails.id,
      type: followupEmails.type,
      geplandVoor: followupEmails.geplandVoor,
      verstuurdOp: followupEmails.verstuurdOp,
      userId: followupEmails.userId,
      naam: gebruikers.naam,
      email: gebruikers.email,
      emailsAfgemeld: gebruikers.emailsAfgemeld,
    })
    .from(followupEmails)
    .leftJoin(gebruikers, eq(followupEmails.userId, gebruikers.userId))
    .orderBy(desc(followupEmails.geplandVoor))
    .limit(200);

  const openstaand = rijen.filter((r) => !r.verstuurdOp);
  const verstuurd = rijen.filter((r) => r.verstuurdOp);
  const nuMs = Date.now();
  const verschuldigd = openstaand.filter((r) => new Date(r.geplandVoor).getTime() <= nuMs);

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-[#2C1F14]">Follow-up e-mails</h1>
          <p className="text-[#8B7355] text-sm mt-1">
            Cron draait dagelijks om 09:00 UTC ·{" "}
            <span className={verschuldigd.length > 0 ? "text-[#C8583A] font-medium" : ""}>
              {verschuldigd.length} klaarstaan om te versturen
            </span>
          </p>
        </div>
        <EmailTrigger />
      </div>

      {/* Statistieken */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Gepland", waarde: openstaand.length, kleur: "#2C1F14" },
          { label: "Klaar om te versturen", waarde: verschuldigd.length, kleur: verschuldigd.length > 0 ? "#C8583A" : "#2D4A3E" },
          { label: "Verstuurd", waarde: verstuurd.length, kleur: "#2D4A3E" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-[#E8DDD0] p-4">
            <p className="text-xs text-[#8B7355] uppercase tracking-wide mb-1">{s.label}</p>
            <p className="text-3xl font-serif" style={{ color: s.kleur }}>{s.waarde}</p>
          </div>
        ))}
      </div>

      {/* Openstaande emails */}
      <section className="mb-8">
        <h2 className="font-serif text-xl text-[#2C1F14] mb-3">Gepland — nog niet verstuurd</h2>
        <EmailTabel rijen={openstaand} leegTekst="Geen geplande emails" />
      </section>

      {/* Verstuurde emails */}
      <section>
        <h2 className="font-serif text-xl text-[#2C1F14] mb-3">Verstuurd</h2>
        <EmailTabel rijen={verstuurd} leegTekst="Nog niets verstuurd" />
      </section>
    </div>
  );
}

type Rij = {
  id: string;
  type: string;
  geplandVoor: Date;
  verstuurdOp: Date | null;
  userId: string;
  naam: string | null;
  email: string | null;
  emailsAfgemeld: boolean | null;
};

function EmailTabel({ rijen, leegTekst }: { rijen: Rij[]; leegTekst: string }) {
  const nuMs = Date.now();

  if (rijen.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#E8DDD0] p-8 text-center text-sm text-[#8B7355]">
        {leegTekst}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E8DDD0] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#FAF7F2] border-b border-[#E8DDD0]">
            <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Gebruiker</th>
            <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Type</th>
            <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Gepland voor</th>
            <th className="px-4 py-3 text-left text-xs text-[#8B7355] uppercase tracking-wide">Status</th>
          </tr>
        </thead>
        <tbody>
          {rijen.map((r) => {
            const isVerschuldigd = !r.verstuurdOp && new Date(r.geplandVoor).getTime() <= nuMs;
            return (
              <tr key={r.id} className="border-b border-[#E8DDD0] last:border-0 hover:bg-[#FAF7F2] transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-[#2C1F14]">{r.naam ?? "—"}</p>
                  <p className="text-xs text-[#8B7355]">{r.email ?? ""}</p>
                  {r.emailsAfgemeld && (
                    <span className="text-xs text-[#C8583A]">afgemeld</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[#2C1F14]">
                  {TYPE_LABEL[r.type] ?? r.type}
                </td>
                <td className="px-4 py-3 text-xs text-[#8B7355]">
                  {new Date(r.geplandVoor).toLocaleDateString("nl-NL", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                  {isVerschuldigd && (
                    <span className="ml-2 text-[#C8583A] font-medium">klaar</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {r.verstuurdOp ? (
                    <span className="text-xs text-[#2D4A3E] font-medium">
                      ✓ {new Date(r.verstuurdOp).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                    </span>
                  ) : r.emailsAfgemeld ? (
                    <span className="text-xs text-[#8B7355]">overgeslagen</span>
                  ) : (
                    <span className="text-xs text-[#8B7355]">wacht</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
