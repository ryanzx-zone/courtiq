"use client";

interface TooltipPayload {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: TooltipPayload[];
  valueFormatter?: (value: number | string) => string;
}

export function ChartTooltip({
  active,
  label,
  payload,
  valueFormatter,
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-md border border-edge bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      {label !== undefined && (
        <div className="mb-1 font-mono text-[10px] uppercase tracking-wider text-slate-500">
          {label}
        </div>
      )}
      <ul className="space-y-0.5">
        {payload.map((entry, i) => (
          <li
            key={i}
            className="flex items-center gap-2 font-mono text-xs"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: entry.color }}
              aria-hidden="true"
            />
            <span className="text-slate-400">{entry.name}:</span>
            <span className="font-semibold text-slate-100">
              {entry.value !== undefined && valueFormatter
                ? valueFormatter(entry.value)
                : entry.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
