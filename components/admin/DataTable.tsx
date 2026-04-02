import { type ReactNode } from "react";

export interface Kolom<T> {
  key: string;
  header: string;
  render: (rij: T) => ReactNode;
  breedte?: string;
}

interface DataTableProps<T> {
  kolommen: Kolom<T>[];
  rijen: T[];
  leegTekst?: string;
  rijenId: (rij: T) => string;
}

export function DataTable<T>({ kolommen, rijen, leegTekst = "Geen resultaten", rijenId }: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-[#E8DDD0]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#E8DDD0] bg-[#FAF7F2]">
            {kolommen.map((k) => (
              <th
                key={k.key}
                className="px-4 py-3 text-left text-xs font-medium text-[#8B7355] uppercase tracking-wide"
                style={k.breedte ? { width: k.breedte } : {}}
              >
                {k.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rijen.length === 0 ? (
            <tr>
              <td colSpan={kolommen.length} className="px-4 py-10 text-center text-[#8B7355]">
                {leegTekst}
              </td>
            </tr>
          ) : (
            rijen.map((rij) => (
              <tr key={rijenId(rij)} className="border-b border-[#E8DDD0] last:border-0 hover:bg-[#FAF7F2] transition-colors">
                {kolommen.map((k) => (
                  <td key={k.key} className="px-4 py-3 text-[#2C1F14]">
                    {k.render(rij)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
