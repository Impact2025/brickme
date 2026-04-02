import { Check, Clock, Circle } from "lucide-react";

export type PipelineStap = "intake" | "bouwen" | "reflectie" | "rapport";

const STAPPEN: { id: PipelineStap; label: string }[] = [
  { id: "intake", label: "Intake" },
  { id: "bouwen", label: "Bouwen" },
  { id: "reflectie", label: "Reflectie" },
  { id: "rapport", label: "Rapport" },
];

const statusVolgorde: Record<string, number> = {
  intake: 0,
  bouwen: 1,
  reflectie: 2,
  voltooid: 4,
};

interface ProgressPipelineProps {
  status: string;
  compact?: boolean;
}

export function ProgressPipeline({ status, compact = false }: ProgressPipelineProps) {
  const huidige = statusVolgorde[status] ?? 0;

  return (
    <div className={`flex items-center ${compact ? "gap-1" : "gap-2"}`}>
      {STAPPEN.map((stap, i) => {
        const voltooid = i < huidige;
        const actief = i === huidige;

        return (
          <div key={stap.id} className="flex items-center gap-1">
            <div className={`flex items-center justify-center rounded-full transition-colors
              ${compact ? "w-5 h-5" : "w-7 h-7"}
              ${voltooid ? "bg-[#2D4A3E] text-white" : actief ? "bg-[#C8583A] text-white" : "bg-[#F5F0E8] text-[#8B7355]"}
            `}>
              {voltooid ? (
                <Check className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
              ) : actief ? (
                <Clock className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
              ) : (
                <Circle className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
              )}
            </div>
            {!compact && (
              <span className={`text-xs ${actief ? "text-[#C8583A] font-medium" : voltooid ? "text-[#2D4A3E]" : "text-[#8B7355]"}`}>
                {stap.label}
              </span>
            )}
            {i < STAPPEN.length - 1 && (
              <div className={`${compact ? "w-3" : "w-4"} h-px ${voltooid ? "bg-[#2D4A3E]" : "bg-[#E8DDD0]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
