interface StatRow {
  label: string;
  values: (string | number)[];
  /** Optional per-column highlight: "win" (advantage) or "loss" (disadvantage). */
  highlights?: ("win" | "loss" | null)[];
}

interface StatTableProps {
  columns: string[];
  rows: StatRow[];
}

const HIGHLIGHT_CLASS = {
  win: "text-emerald-400",
  loss: "text-red-400",
} as const;

export function StatTable({ columns, rows }: StatTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-edge">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-edge bg-surface">
            <th className="px-4 py-2.5 text-left font-mono text-[10px] uppercase tracking-wider text-slate-500">
              Stat
            </th>
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-2.5 text-right font-medium text-slate-300"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.label}
              className={i % 2 === 0 ? "bg-card" : "bg-card/50"}
            >
              <td className="px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                {row.label}
              </td>
              {row.values.map((v, j) => {
                const hl = row.highlights?.[j];
                const cls = hl ? HIGHLIGHT_CLASS[hl] : "text-slate-100";
                return (
                  <td
                    key={j}
                    className={`px-4 py-2.5 text-right font-mono ${cls}`}
                  >
                    {v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
