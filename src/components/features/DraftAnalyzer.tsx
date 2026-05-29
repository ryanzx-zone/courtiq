"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { DraftPick } from "@/types";

// Expected cumulative Win Shares scales with BOTH pick slot and seasons played
// (WS is cumulative, so recent rookies haven't had time to accrue it).
function wsPerSeason(pick: number): number {
  return 7 * Math.pow(0.96, pick);
}
function expectedWs(p: DraftPick): number {
  return wsPerSeason(p.pick) * Math.max(p.seasons_played, 1);
}
function residual(p: DraftPick): number {
  return p.career_ws - expectedWs(p);
}
function category(p: DraftPick): "steal" | "bust" | "neutral" {
  const r = residual(p);
  if (r > 10) return "steal";
  if (r < -10) return "bust";
  return "neutral";
}

const COLORS = {
  steal: "#10b981",
  bust: "#ef4444",
  neutral: "#64748b",
} as const;

interface DraftAnalyzerProps {
  picks: DraftPick[];
}

export function DraftAnalyzer({ picks }: DraftAnalyzerProps) {
  const years = useMemo(
    () => Array.from(new Set(picks.map((p) => p.year))).sort((a, b) => a - b),
    [picks],
  );
  const [fromYear, setFromYear] = useState(years[0]);
  const [toYear, setToYear] = useState(years[years.length - 1]);

  const filtered = useMemo(
    () => picks.filter((p) => p.year >= fromYear && p.year <= toYear),
    [picks, fromYear, toYear],
  );

  const steals = filtered.filter((p) => category(p) === "steal");
  const busts = filtered.filter((p) => category(p) === "bust");
  const neutral = filtered.filter((p) => category(p) === "neutral");

  const byResidual = [...filtered].sort((a, b) => residual(b) - residual(a));
  const biggestSteal = byResidual[0];
  const biggestBust = byResidual[byResidual.length - 1];

  return (
    <div className="space-y-8">
      {/* Filters + counts */}
      <div className="flex flex-wrap items-end gap-4">
        <YearSelect
          label="From"
          value={fromYear}
          options={years.filter((y) => y <= toYear)}
          onChange={setFromYear}
        />
        <YearSelect
          label="To"
          value={toYear}
          options={years.filter((y) => y >= fromYear)}
          onChange={setToYear}
        />
        <p className="font-mono text-xs text-slate-500">
          {filtered.length} picks ·{" "}
          <span className="text-emerald-400">{steals.length} steals</span> ·{" "}
          <span className="text-red-400">{busts.length} busts</span>
        </p>
      </div>

      {/* How to read */}
      <p className="text-sm text-slate-400">
        Each dot is a draft pick.{" "}
        <span className="text-slate-200">Up</span> = more career Win Shares.{" "}
        <span className="text-slate-200">Right</span> = picked later.{" "}
        <span className="text-slate-200">Bigger</span> = more All-Star selections.{" "}
        <span className="text-emerald-400">Green</span> outperformed their draft
        slot; <span className="text-red-400">red</span> underperformed.
      </p>

      {/* Scatter */}
      <div className="rounded-lg border border-edge bg-card p-4">
        <ResponsiveContainer width="100%" height={460}>
          <ScatterChart margin={{ top: 16, right: 24, bottom: 36, left: 8 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="pick"
              name="Pick"
              domain={[0, 45]}
              tick={{ fill: "#64748b", fontSize: 11 }}
              stroke="#1e293b"
              label={{
                value: "Draft pick (later →)",
                position: "insideBottom",
                offset: -8,
                fill: "#64748b",
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="career_ws"
              name="Win Shares"
              tick={{ fill: "#64748b", fontSize: 11 }}
              stroke="#1e293b"
              label={{
                value: "Career Win Shares",
                angle: -90,
                position: "insideLeft",
                fill: "#64748b",
                fontSize: 11,
              }}
            />
            <ZAxis
              type="number"
              dataKey="all_star_selections"
              range={[50, 600]}
              name="All-Star selections"
            />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<DraftTooltip />} />
            <Scatter name="Steal" data={steals} fill={COLORS.steal} fillOpacity={0.8} />
            <Scatter
              name="As expected"
              data={neutral}
              fill={COLORS.neutral}
              fillOpacity={0.55}
            />
            <Scatter name="Bust" data={busts} fill={COLORS.bust} fillOpacity={0.8} />
          </ScatterChart>
        </ResponsiveContainer>

        {/* Custom legend — below the chart so it can't overlap the axis label */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-5 border-t border-edge pt-3 text-xs text-slate-400">
          <LegendDot color={COLORS.steal} label="Steal" />
          <LegendDot color={COLORS.neutral} label="As expected" />
          <LegendDot color={COLORS.bust} label="Bust" />
        </div>
      </div>

      {/* Insight cards */}
      {biggestSteal && biggestBust && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InsightCard kind="steal" pick={biggestSteal} />
          <InsightCard kind="bust" pick={biggestBust} />
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

function YearSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: number[];
  onChange: (y: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="appearance-none rounded-lg border border-edge bg-card py-2 pl-3 pr-9 text-sm text-slate-100 focus:border-orange-500/60 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          {options.map((y) => (
            <option key={y} value={y} className="bg-card">
              {y}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

interface DraftTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DraftPick }>;
}

function DraftTooltip({ active, payload }: DraftTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-md border border-edge bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      <div className="font-semibold text-slate-100">{p.player}</div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
        {p.year} · Pick {p.pick} · {p.team}
      </div>
      <div className="mt-1.5 font-mono text-xs text-slate-300">
        {p.career_ws} WS · {p.seasons_played} seasons
      </div>
      {p.all_star_selections > 0 && (
        <div className="font-mono text-xs text-orange-400">
          {p.all_star_selections}× All-Star
          {p.all_nba_selections > 0 ? ` · ${p.all_nba_selections}× All-NBA` : ""}
        </div>
      )}
    </div>
  );
}

function InsightCard({
  kind,
  pick,
}: {
  kind: "steal" | "bust";
  pick: DraftPick;
}) {
  const isSteal = kind === "steal";
  return (
    <div
      className={`rounded-lg border p-5 ${
        isSteal
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-red-500/30 bg-red-500/5"
      }`}
    >
      <div
        className={`font-mono text-[10px] uppercase tracking-[0.3em] ${
          isSteal ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {isSteal ? "Biggest steal" : "Biggest bust"}
      </div>
      <h3 className="mt-2 font-display text-3xl tracking-wider text-slate-100">
        {pick.player}
      </h3>
      <p className="mt-1 text-sm text-slate-400">
        {isSteal
          ? `Pick ${pick.pick} in ${pick.year} → ${pick.career_ws} career Win Shares and ${pick.all_star_selections} All-Star selection${pick.all_star_selections === 1 ? "" : "s"}. Wildly above what the #${pick.pick} slot typically returns.`
          : `Pick ${pick.pick} in ${pick.year} → just ${pick.career_ws} career Win Shares across ${pick.seasons_played} seasons. A premium pick that never panned out.`}
      </p>
    </div>
  );
}
