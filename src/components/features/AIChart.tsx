"use client";

import {
  Bar,
  CartesianGrid,
  Legend,
  Line,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadar,
  BarChart as RechartsBar,
  LineChart as RechartsLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import type { ChartData } from "@/types";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#a855f7", "#ef4444"];

interface AIChartProps {
  chart: ChartData;
  height?: number;
}

export function AIChart({ chart, height = 320 }: AIChartProps) {
  // Defensive validation — if shape is broken, render nothing
  if (!Array.isArray(chart.data) || chart.data.length === 0) return null;
  if (!Array.isArray(chart.series) || chart.series.length === 0) return null;
  for (const row of chart.data) {
    if (!Array.isArray(row.values) || row.values.length !== chart.series.length) {
      return null;
    }
  }

  // Reshape into Recharts row format: [{label: "X", "Series1": v, "Series2": v}, ...]
  const rows = chart.data.map((row) => {
    const out: Record<string, string | number> = { label: row.label };
    chart.series.forEach((s, i) => {
      out[s.name] = row.values[i];
    });
    return out;
  });

  if (chart.type === "radar") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RechartsRadar data={rows} outerRadius="75%">
          <PolarGrid stroke="#1e293b" />
          <PolarAngleAxis
            dataKey="label"
            tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "var(--font-mono)" }}
          />
          <PolarRadiusAxis
            tick={{ fill: "#64748b", fontSize: 9 }}
            axisLine={false}
            tickCount={5}
          />
          {chart.series.map((s, i) => {
            const color = COLORS[i % COLORS.length];
            return (
              <Radar
                key={s.name}
                name={s.name}
                dataKey={s.name}
                stroke={color}
                fill={color}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            );
          })}
          <Tooltip content={<ChartTooltip />} />
        </RechartsRadar>
      </ResponsiveContainer>
    );
  }

  if (chart.type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBar data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            stroke="#1e293b"
          />
          <YAxis tick={{ fill: "#64748b", fontSize: 11 }} stroke="#1e293b" />
          <Tooltip
            cursor={{ fill: "rgba(249, 115, 22, 0.08)" }}
            content={<ChartTooltip />}
          />
          {chart.series.length > 1 && (
            <Legend wrapperStyle={{ paddingTop: 8, fontSize: 11, color: "#94a3b8" }} />
          )}
          {chart.series.map((s, i) => (
            <Bar
              key={s.name}
              dataKey={s.name}
              fill={COLORS[i % COLORS.length]}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </RechartsBar>
      </ResponsiveContainer>
    );
  }

  // line
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLine data={rows} margin={{ top: 12, right: 16, bottom: 8, left: 8 }}>
        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          stroke="#1e293b"
        />
        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} stroke="#1e293b" />
        <Tooltip content={<ChartTooltip />} />
        {chart.series.length > 1 && (
          <Legend wrapperStyle={{ paddingTop: 8, fontSize: 11, color: "#94a3b8" }} />
        )}
        {chart.series.map((s, i) => (
          <Line
            key={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ fill: COLORS[i % COLORS.length], r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </RechartsLine>
    </ResponsiveContainer>
  );
}
