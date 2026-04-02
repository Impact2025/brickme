interface FunnelStap {
  label: string;
  waarde: number;
  kleur?: string;
}

export function FunnelChart({ stappen }: { stappen: FunnelStap[] }) {
  const max = stappen[0]?.waarde ?? 1;

  return (
    <div className="space-y-2">
      {stappen.map((stap, i) => {
        const pct = max > 0 ? (stap.waarde / max) * 100 : 0;
        const dropoff = i > 0 ? stappen[i - 1].waarde - stap.waarde : 0;
        return (
          <div key={stap.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-[#2C1F14]">{stap.label}</span>
              <span className="text-sm font-medium text-[#2C1F14]">
                {stap.waarde}
                {i > 0 && dropoff > 0 && (
                  <span className="text-xs text-[#C8583A] ml-1.5">−{dropoff}</span>
                )}
              </span>
            </div>
            <div className="h-7 bg-[#F5F0E8] rounded-md overflow-hidden">
              <div
                className="h-full rounded-md transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  backgroundColor: stap.kleur ?? (i === 0 ? "#2D4A3E" : i === stappen.length - 1 ? "#C8583A" : "#8B7355"),
                  opacity: 1 - i * 0.12,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
