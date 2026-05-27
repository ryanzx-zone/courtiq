interface BadgeProps {
  label: string;
  value: string;
  context?: string;
  accent?: "default" | "orange" | "blue" | "green" | "red";
}

const ACCENTS = {
  default: "border-edge text-slate-100",
  orange: "border-orange-500/40 text-orange-400",
  blue: "border-blue-500/40 text-blue-400",
  green: "border-emerald-500/40 text-emerald-400",
  red: "border-red-500/40 text-red-400",
} as const;

export function Badge({ label, value, context, accent = "default" }: BadgeProps) {
  return (
    <div
      className={`inline-flex flex-col rounded-md border bg-card px-3 py-2 ${ACCENTS[accent]}`}
    >
      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="font-mono text-xl font-semibold leading-tight">
        {value}
      </span>
      {context && (
        <span className="text-[10px] text-slate-500 mt-0.5">{context}</span>
      )}
    </div>
  );
}
