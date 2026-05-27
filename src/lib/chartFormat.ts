export type ValueFormat = "decimal" | "percent" | "plusMinus" | "int" | "raw";

export function formatChartValue(
  v: number | string,
  fmt: ValueFormat = "raw",
): string {
  if (typeof v !== "number") return String(v);
  switch (fmt) {
    case "decimal":
      return v.toFixed(1);
    case "percent":
      return (v * 100).toFixed(1) + "%";
    case "plusMinus":
      return (v > 0 ? "+" : "") + v.toFixed(1);
    case "int":
      return Math.round(v).toString();
    default:
      return String(v);
  }
}
