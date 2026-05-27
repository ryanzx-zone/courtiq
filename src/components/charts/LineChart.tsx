"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatChartValue, type ValueFormat } from "@/lib/chartFormat";
import { ChartTooltip } from "./ChartTooltip";

export interface LinePoint {
  x: string | number;
  y: number;
}

export interface LineSeries {
  name: string;
  color: string;
  points: LinePoint[];
}

interface LineChartProps {
  series: LineSeries[];
  height?: number;
  xLabel?: string;
  yLabel?: string;
  valueFormat?: ValueFormat;
}

export function LineChart({
  series,
  height = 320,
  valueFormat = "raw",
}: LineChartProps) {
  const tickFmt = (v: number) => formatChartValue(v, valueFormat);
  const tooltipFmt = (v: number | string) => formatChartValue(v, valueFormat);
  // Merge series into a single dataset keyed by x.
  const xMap = new Map<string | number, Record<string, string | number>>();
  for (const s of series) {
    for (const pt of s.points) {
      const existing = xMap.get(pt.x) ?? { x: pt.x };
      existing[s.name] = pt.y;
      xMap.set(pt.x, existing);
    }
  }
  const data = Array.from(xMap.values());

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 12, right: 16, bottom: 8, left: 8 }}
      >
        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
        <XAxis
          dataKey="x"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          stroke="#1e293b"
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11 }}
          stroke="#1e293b"
          tickFormatter={tickFmt}
        />
        <Tooltip content={<ChartTooltip valueFormatter={tooltipFmt} />} />
        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: 12, color: "#94a3b8" }}
        />
        {series.map((s) => (
          <Line
            key={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={s.color}
            strokeWidth={2}
            dot={{ fill: s.color, r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
