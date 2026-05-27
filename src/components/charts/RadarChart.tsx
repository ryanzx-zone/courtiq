"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { RadarAxes } from "@/types";
import { ChartTooltip } from "./ChartTooltip";

interface RadarSeries {
  name: string;
  values: RadarAxes;
  color: string;
}

interface RadarChartProps {
  series: RadarSeries[];
  height?: number;
}

const AXES: { key: keyof RadarAxes; label: string }[] = [
  { key: "scoring", label: "Scoring" },
  { key: "playmaking", label: "Playmaking" },
  { key: "rebounding", label: "Rebounding" },
  { key: "defense", label: "Defense" },
  { key: "efficiency", label: "Efficiency" },
  { key: "impact", label: "Impact" },
];

export function RadarChart({ series, height = 360 }: RadarChartProps) {
  const data = AXES.map(({ key, label }) => {
    const row: Record<string, string | number> = { axis: label };
    for (const s of series) {
      row[s.name] = s.values[key];
    }
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart data={data} outerRadius="75%">
        <PolarGrid stroke="#1e293b" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "#94a3b8", fontSize: 11, fontFamily: "var(--font-mono)" }}
        />
        <PolarRadiusAxis
          domain={[0, 100]}
          tick={{ fill: "#64748b", fontSize: 9 }}
          axisLine={false}
          tickCount={5}
        />
        {series.map((s) => (
          <Radar
            key={s.name}
            name={s.name}
            dataKey={s.name}
            stroke={s.color}
            fill={s.color}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        ))}
        <Tooltip
          content={
            <ChartTooltip
              valueFormatter={(v) =>
                typeof v === "number" ? `${Math.round(v)} pct` : String(v)
              }
            />
          }
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
