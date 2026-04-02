import { requireAdminOfRol } from "@/lib/auth";
import { db } from "@/lib/db";
import { workshops, workshopDeelnemers, sessies, rapporten } from "@/lib/db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GroepsrapportClient } from "./GroepsrapportClient";

export default async function GroepsrapportPagina({
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

  const userIds = deelnemers.map((d) => d.userId);
  const alleSessies = userIds.length > 0
    ? await db
        .select()
        .from(sessies)
        .where(and(inArray(sessies.userId, userIds), eq(sessies.status, "voltooid")))
    : [];

  return (
    <div className="p-8 max-w-3xl">
      <Link href={`/facilitator/workshops/${id}`} className="text-xs text-[#8B7355] hover:text-[#2C1F14] mb-6 block">
        ← {workshop.naam}
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-3xl text-[#2C1F14]">Groepsrapport</h1>
        <p className="text-[#8B7355] text-sm mt-1">
          {alleSessies.length} voltooide sessies · {deelnemers.length} deelnemers
        </p>
      </div>

      {alleSessies.length < 2 ? (
        <div className="rounded-xl border border-dashed border-[#E8DDD0] p-10 text-center">
          <p className="text-[#8B7355]">Er zijn minimaal 2 voltooide sessies nodig voor een groepsrapport.</p>
        </div>
      ) : (
        <GroepsrapportClient workshopId={id} aantalSessies={alleSessies.length} />
      )}
    </div>
  );
}
