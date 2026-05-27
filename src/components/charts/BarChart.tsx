"use client";

import {
  Bar,
  CartesianGrid,
  Legend,
  BarChart as RechartsBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatChartValue, type ValueFormat } from "@/lib/chartFormat";
import { ChartTooltip } from "./ChartTooltip";

export interface BarSeries {
  name: string;
  color: string;
}

export interface BarRow {
  label: string;
  values: number[];
}

interface BarChartProps {
  series: BarSeries[];
  data: BarRow[];
  height?: number;
  layout?: "horizontal" | "vertical";
  valueFormat?: ValueFormat;
}

export function BarChart({
  series,
  data,
  height = 320,
  layout = "vertical",
  valueFormat = "raw",
}: BarChartProps) {
  const tickFmt = (v: number) => formatChartValue(v, valueFormat);
  const tooltipFmt = (v: number | string) => formatChartValue(v, valueFormat);
  const rechartsData = data.map((row) => {
    const entry: Record<string, string | number> = { label: row.label };
    series.forEach((s, i) => {
      entry[s.name] = row.values[i] ?? 0;
    });
    return entry;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart
        data={rechartsData}
        layout={layout}
        margin={{ top: 8, right: 16, bottom: 8, left: 16 }}
      >
        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
        {layout === "vertical" ? (
          <>
            <XAxis
              type="number"
              tick={{ fill: "#64748b", fontSize: 11 }}
              stroke="#1e293b"
              tickFormatter={tickFmt}
            />
            <YAxis
              dataKey="label"
              type="category"
              tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "var(--font-mono)" }}
              stroke="#1e293b"
              width={64}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey="label"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              stroke="#1e293b"
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 11 }}
              stroke="#1e293b"
              tickFormatter={tickFmt}
            />
          </>
        )}
        <Tooltip
          cursor={{ fill: "rgba(249, 115, 22, 0.08)" }}
          content={<ChartTooltip valueFormatter={tooltipFmt} />}
        />
        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: 12, color: "#94a3b8" }}
        />
        {series.map((s) => (
          <Bar key={s.name} dataKey={s.name} fill={s.color} radius={[2, 2, 2, 2]} />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
