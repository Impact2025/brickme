type Kleur = "groen" | "primary" | "amber" | "standaard";
type Trend = "omhoog" | "omlaag";

type Props = {
  label: string;
  waarde: number | string;
  subLabel?: string;
  kleur?: Kleur;
  trend?: Trend;
  trendTekst?: string;
};

const kleurMap: Record<Kleur, string> = {
  groen: "#2D4A3E",
  primary: "#C8583A",
  amber: "#B45309",
  standaard: "#8B7355",
};

export function StatCard({ label, waarde, subLabel, kleur = "standaard", trend, trendTekst }: Props) {
  const kleurHex = kleurMap[kleur];

  return (
    <div className="rounded-xl border border-[#E8DDD0] bg-white p-5 flex flex-col gap-1">
      <p className="text-xs text-[#8B7355] uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-serif font-semibold" style={{ color: kleurHex }}>
        {waarde}
      </p>
      {subLabel && <p className="text-xs text-[#8B7355]">{subLabel}</p>}
      {trendTekst && (
        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: kleurHex }}>
          {trend === "omhoog" ? "↑" : "↓"} {trendTekst}
        </p>
      )}
    </div>
  );
}
