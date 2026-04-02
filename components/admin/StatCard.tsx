import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  waarde: string | number;
  subLabel?: string;
  trend?: "omhoog" | "omlaag" | "neutraal";
  trendTekst?: string;
  kleur?: "primary" | "groen" | "amber" | "standaard";
}

const kleurMap = {
  primary: "border-l-[#C8583A] bg-[#C8583A]/5",
  groen: "border-l-[#2D4A3E] bg-[#2D4A3E]/5",
  amber: "border-l-amber-500 bg-amber-50",
  standaard: "border-l-[#E8DDD0] bg-white",
};

export function StatCard({
  label,
  waarde,
  subLabel,
  trend,
  trendTekst,
  kleur = "standaard",
}: StatCardProps) {
  return (
    <div className={`rounded-xl border border-[#E8DDD0] border-l-4 p-5 ${kleurMap[kleur]}`}>
      <p className="text-sm text-[#8B7355] mb-1">{label}</p>
      <p className="text-3xl font-serif text-[#2C1F14] font-semibold">{waarde}</p>
      {(subLabel || trend) && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-[#8B7355]">
          {trend === "omhoog" && <TrendingUp className="w-3.5 h-3.5 text-[#2D4A3E]" />}
          {trend === "omlaag" && <TrendingDown className="w-3.5 h-3.5 text-[#C8583A]" />}
          {trend === "neutraal" && <Minus className="w-3.5 h-3.5 text-[#8B7355]" />}
          <span>{trendTekst ?? subLabel}</span>
        </div>
      )}
    </div>
  );
}
