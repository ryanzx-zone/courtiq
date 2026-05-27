"use client";

import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { RadarChart } from "@/components/charts/RadarChart";
import { StatTable } from "@/components/ui/StatTable";
import { computeRadarProfile, formatPct, formatStat } from "@/lib/stats";
import type { Player, PlayerStats } from "@/types";
import { PlayerPicker } from "./PlayerPicker";

interface ComparisonViewProps {
  players: Player[];
  initialP1?: Player | null;
  initialP2?: Player | null;
}

interface StatRow {
  key: keyof PlayerStats;
  label: string;
  format: "decimal" | "percent" | "plusMinus" | "int";
  invert?: boolean;
}

const STAT_ROWS: StatRow[] = [
  { key: "ppg", label: "PPG", format: "decimal" },
  { key: "rpg", label: "RPG", format: "decimal" },
  { key: "apg", label: "APG", format: "decimal" },
  { key: "spg", label: "SPG", format: "decimal" },
  { key: "bpg", label: "BPG", format: "decimal" },
  { key: "topg", label: "TO/G", format: "decimal", invert: true },
  { key: "fgPct", label: "FG%", format: "percent" },
  { key: "fg3Pct", label: "3P%", format: "percent" },
  { key: "ftPct", label: "FT%", format: "percent" },
  { key: "tsPct", label: "TS%", format: "percent" },
  { key: "per", label: "PER", format: "decimal" },
  { key: "usgPct", label: "USG%", format: "decimal" },
  { key: "bpm", label: "BPM", format: "plusMinus" },
  { key: "vorp", label: "VORP", format: "decimal" },
  { key: "ws", label: "Win Shares", format: "decimal" },
  { key: "ortg", label: "ORtg", format: "int" },
  { key: "drtg", label: "DRtg", format: "int", invert: true },
];

const ORANGE = "#f97316";
const BLUE = "#3b82f6";

function fmt(v: number, format: StatRow["format"]): string {
  switch (format) {
    case "decimal":
      return v.toFixed(1);
    case "percent":
      return formatPct(v);
    case "plusMinus":
      return (v > 0 ? "+" : "") + v.toFixed(1);
    case "int":
      return Math.round(v).toString();
  }
}

export function ComparisonView({
  players,
  initialP1 = null,
  initialP2 = null,
}: ComparisonViewProps) {
  const [p1, setP1] = useState<Player | null>(initialP1);
  const [p2, setP2] = useState<Player | null>(initialP2);

  const radarSeries = useMemo(() => {
    const out = [] as { name: string; values: ReturnType<typeof computeRadarProfile>; color: string }[];
    if (p1) out.push({ name: p1.name, values: computeRadarProfile(p1, players), color: ORANGE });
    if (p2) out.push({ name: p2.name, values: computeRadarProfile(p2, players), color: BLUE });
    return out;
  }, [p1, p2, players]);

  const tableRows = useMemo(() => {
    if (!p1 || !p2) return [];
    return STAT_ROWS.map((row) => {
      const aVal = p1.stats[row.key];
      const bVal = p2.stats[row.key];
      const better = row.invert
        ? aVal < bVal
          ? "a"
          : bVal < aVal
            ? "b"
            : "tie"
        : aVal > bVal
          ? "a"
          : bVal > aVal
            ? "b"
            : "tie";
      const highlights: ("win" | "loss" | null)[] =
        better === "tie"
          ? [null, null]
          : better === "a"
            ? ["win", "loss"]
            : ["loss", "win"];
      return {
        label: row.label,
        values: [fmt(aVal, row.format), fmt(bVal, row.format)],
        highlights,
      };
    });
  }, [p1, p2]);

  const both = p1 && p2;

  return (
    <div className="space-y-12">
      {/* Selectors */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PlayerPicker
          players={players}
          value={p1}
          onChange={setP1}
          placeholder="Choose first player"
          excludeIds={p2 ? [p2.id] : []}
        />
        <PlayerPicker
          players={players}
          value={p2}
          onChange={setP2}
          placeholder="Choose second player"
          excludeIds={p1 ? [p1.id] : []}
        />
      </div>

      {!both ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-edge bg-card/50 py-20">
          <p className="font-display text-2xl tracking-wider text-slate-300">
            Pick two players
          </p>
          <p className="text-sm text-slate-500">
            Choose two players above to see a head-to-head comparison.
          </p>
        </div>
      ) : (
        <>
          {/* Side-by-side header cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ComparisonHeader player={p1} accent={ORANGE} />
            <ComparisonHeader player={p2} accent={BLUE} />
          </div>

          {/* Radar */}
          <section>
            <header className="mb-4 border-b border-edge pb-3">
              <h2 className="font-display text-2xl tracking-wider text-slate-100">
                Percentile profile
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Both players ranked vs all {players.length} in the dataset.
              </p>
            </header>
            <div className="rounded-lg border border-edge bg-card p-4">
              <RadarChart series={radarSeries} height={400} />
            </div>
          </section>

          {/* Stat table */}
          <section>
            <header className="mb-4 border-b border-edge pb-3">
              <h2 className="font-display text-2xl tracking-wider text-slate-100">
                Stat-by-stat
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Green = advantage. Turnovers and DRtg are inverted (lower is
                better).
              </p>
            </header>
            <StatTable columns={[p1.name, p2.name]} rows={tableRows} />
          </section>

          {/* AI analysis stub */}
          <section>
            <header className="mb-4 border-b border-edge pb-3">
              <h2 className="font-display text-2xl tracking-wider text-slate-100">
                AI analysis
              </h2>
            </header>
            <div className="flex items-start gap-3 rounded-lg border border-dashed border-edge bg-card/50 p-6">
              <Sparkles className="h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" />
              <div>
                <p className="text-sm text-slate-300">
                  AI-generated comparison coming in Step 11 (Claude API
                  integration).
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Claude will analyze both players' profiles, identify the
                  stylistic differences, and pick a winner.
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function ComparisonHeader({
  player,
  accent,
}: {
  player: Player;
  accent: string;
}) {
  return (
    <div
      className="rounded-lg border bg-card p-5"
      style={{ borderColor: `${accent}40` }}
    >
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em]">
        <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
        <span className="text-slate-500">{player.team_full}</span>
      </div>
      <h3 className="mt-2 font-display text-3xl tracking-wider text-slate-100">
        {player.name}
      </h3>
      <p className="mt-1 font-mono text-xs text-slate-400">
        {player.position} · {player.bio.height} · Age {player.age} · {player.gp} GP
      </p>
      <dl className="mt-4 grid grid-cols-3 gap-3">
        <MiniStat label="PPG" value={formatStat(player.stats.ppg)} />
        <MiniStat label="RPG" value={formatStat(player.stats.rpg)} />
        <MiniStat label="APG" value={formatStat(player.stats.apg)} />
      </dl>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col rounded-md border border-edge bg-surface px-3 py-2">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="font-mono text-lg font-semibold text-slate-100">
        {value}
      </dd>
    </div>
  );
}
