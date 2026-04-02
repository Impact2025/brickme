"use client";

interface DataPunt {
  label: string;
  voor?: number | null;
  na?: number | null;
}

interface MoodChartProps {
  data: DataPunt[];
  breedte?: number;
  hoogte?: number;
}

export function MoodChart({ data, breedte = 400, hoogte = 120 }: MoodChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-[#8B7355] text-center py-6">Nog geen data</p>;
  }

  const pad = { links: 24, rechts: 12, boven: 8, onder: 20 };
  const innerB = breedte - pad.links - pad.rechts;
  const innerH = hoogte - pad.boven - pad.onder;

  const xVoor = (i: number) => pad.links + (i / Math.max(data.length - 1, 1)) * innerB;
  const yWaarde = (v: number) => pad.boven + innerH - ((v - 1) / 9) * innerH;

  const voorPunten = data.filter((d) => d.voor != null);
  const naPunten = data.filter((d) => d.na != null);

  const toPath = (punten: { i: number; v: number }[]) => {
    if (punten.length === 0) return "";
    return punten
      .map(({ i, v }, idx) => `${idx === 0 ? "M" : "L"} ${xVoor(i)} ${yWaarde(v)}`)
      .join(" ");
  };

  const voorPath = toPath(
    voorPunten.map((d) => ({ i: data.indexOf(d), v: d.voor! }))
  );
  const naPath = toPath(
    naPunten.map((d) => ({ i: data.indexOf(d), v: d.na! }))
  );

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${breedte} ${hoogte}`} className="w-full" style={{ minWidth: 200 }}>
        {/* Grid */}
        {[1, 5, 10].map((v) => (
          <g key={v}>
            <line
              x1={pad.links} y1={yWaarde(v)}
              x2={breedte - pad.rechts} y2={yWaarde(v)}
              stroke="#E8DDD0" strokeWidth={0.5}
            />
            <text x={pad.links - 4} y={yWaarde(v) + 3} textAnchor="end" fontSize={8} fill="#8B7355">{v}</text>
          </g>
        ))}

        {/* Lijnen */}
        {voorPath && (
          <path d={voorPath} fill="none" stroke="#8B7355" strokeWidth={1.5} strokeDasharray="4 2" opacity={0.7} />
        )}
        {naPath && (
          <path d={naPath} fill="none" stroke="#C8583A" strokeWidth={2} />
        )}

        {/* Punten */}
        {data.map((d, i) => (
          <g key={i}>
            {d.voor != null && (
              <circle cx={xVoor(i)} cy={yWaarde(d.voor)} r={2.5} fill="#8B7355" opacity={0.7} />
            )}
            {d.na != null && (
              <circle cx={xVoor(i)} cy={yWaarde(d.na)} r={3} fill="#C8583A" />
            )}
          </g>
        ))}

        {/* X-as labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={xVoor(i)}
            y={hoogte - 2}
            textAnchor="middle"
            fontSize={7}
            fill="#8B7355"
          >
            {d.label.slice(0, 8)}
          </text>
        ))}
      </svg>

      {/* Legenda */}
      <div className="flex gap-4 mt-1 justify-end text-xs text-[#8B7355]">
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 border-t-2 border-dashed border-[#8B7355]" />
          voor
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 border-t-2 border-[#C8583A]" />
          na
        </span>
      </div>
    </div>
  );
}
