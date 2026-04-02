"use client";

interface BarChartProps {
  data: { label: string; waarde: number; kleur?: string }[];
  hoogte?: number;
  eenheid?: string;
}

export function BarChart({ data, hoogte = 120, eenheid = "" }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.waarde), 1);

  return (
    <div className="w-full">
      <div className="flex items-end gap-3" style={{ height: hoogte }}>
        {data.map((item) => {
          const pct = (item.waarde / max) * 100;
          return (
            <div key={item.label} className="flex-1 flex flex-col items-center gap-1 group">
              <span className="text-xs text-[#8B7355] opacity-0 group-hover:opacity-100 transition-opacity">
                {item.waarde}{eenheid}
              </span>
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${Math.max(pct, 2)}%`,
                  backgroundColor: item.kleur ?? "#C8583A",
                  opacity: 0.85,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 mt-2">
        {data.map((item) => (
          <div key={item.label} className="flex-1 text-center">
            <span className="text-[10px] text-[#8B7355] leading-tight block truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
