"use client";

import { Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RadarChart } from "@/components/charts/RadarChart";
import { Badge } from "@/components/ui/Badge";
import { StatTable } from "@/components/ui/StatTable";
import { streamAsk } from "@/lib/askClient";
import { computeRadarProfile, formatPct, formatStat } from "@/lib/stats";
import type { AskResponse, Player, PlayerStats } from "@/types";
import { renderInlineMarkdown } from "./AIResponse";
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

  // AI take — opt-in via button to control API cost; reset when matchup changes
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<AskResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const pairKey = `${p1?.id ?? ""}|${p2?.id ?? ""}`;
  const currentPairRef = useRef(pairKey);

  useEffect(() => {
    currentPairRef.current = pairKey;
    setAiText(null);
    setAiResponse(null);
    setAiError(null);
    setAiLoading(false);
  }, [pairKey]);

  const generateTake = useCallback(async () => {
    if (!p1 || !p2) return;
    const key = `${p1.id}|${p2.id}`;
    setAiLoading(true);
    setAiError(null);
    setAiResponse(null);
    setAiText("");
    try {
      const question = `Compare ${p1.name} and ${p2.name} in the 2024-25 season. Who's better, and what are the biggest differences in their games?`;
      const res = await streamAsk(question, [], (text) => {
        if (currentPairRef.current === key) setAiText(text);
      });
      if (currentPairRef.current === key) setAiResponse(res);
    } catch (err) {
      if (currentPairRef.current === key) {
        setAiError(err instanceof Error ? err.message : "Failed to generate");
      }
    } finally {
      if (currentPairRef.current === key) setAiLoading(false);
    }
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

          {/* AI analysis */}
          <section>
            <header className="mb-4 border-b border-edge pb-3">
              <h2 className="font-display text-2xl tracking-wider text-slate-100">
                AI analysis
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                CourtIQ&apos;s take on the matchup.
              </p>
            </header>

            {aiError ? (
              <div className="space-y-3 rounded-lg border border-red-500/40 bg-red-500/5 p-4">
                <p className="text-sm text-red-300">
                  <span className="font-mono text-xs uppercase tracking-wider text-red-400">
                    Error:
                  </span>{" "}
                  {aiError}
                </p>
                <button
                  type="button"
                  onClick={generateTake}
                  className="rounded-md border border-edge bg-card px-3 py-1.5 text-xs text-slate-200 hover:border-orange-500/40 hover:text-orange-400"
                >
                  Try again
                </button>
              </div>
            ) : aiResponse ? (
              <AICompareResult response={aiResponse} />
            ) : aiText !== null ? (
              <div className="space-y-3 rounded-lg border border-edge bg-card p-6">
                <BrandHeader pulsing />
                {aiText ? (
                  <div className="space-y-3 text-slate-200">
                    {aiText
                      .split(/\n{2,}/)
                      .filter(Boolean)
                      .map((para, i, arr) => (
                        <p key={i} className="leading-relaxed">
                          {renderInlineMarkdown(para)}
                          {i === arr.length - 1 && <Cursor />}
                        </p>
                      ))}
                  </div>
                ) : (
                  <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
                    Analyzing the matchup...
                  </p>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={generateTake}
                disabled={aiLoading}
                className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-orange-400 disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                Get CourtIQ&apos;s take on this matchup
              </button>
            )}
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

function BrandHeader({ pulsing }: { pulsing?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Sparkles
        className={`h-4 w-4 text-orange-500 ${pulsing ? "animate-pulse" : ""}`}
        aria-hidden="true"
      />
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-orange-500">
        CourtIQ analysis
      </span>
    </div>
  );
}

function Cursor() {
  return (
    <span className="ml-0.5 inline-block h-4 w-[3px] translate-y-0.5 animate-pulse bg-orange-500 align-middle" />
  );
}

function AICompareResult({ response }: { response: AskResponse }) {
  const paragraphs = response.analysis.split(/\n{2,}/).filter((p) => p.trim());
  return (
    <div className="space-y-5 rounded-lg border border-edge bg-card p-6">
      <BrandHeader />
      <div className="space-y-3 text-slate-200">
        {paragraphs.map((para, i) => (
          <p key={i} className="leading-relaxed">
            {renderInlineMarkdown(para)}
          </p>
        ))}
      </div>
      {response.keyStats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {response.keyStats.map((s, i) => (
            <Badge
              key={i}
              label={s.label}
              value={s.value}
              context={s.context}
              accent="orange"
            />
          ))}
        </div>
      )}
      {response.verdict && (
        <div className="border-l-2 border-orange-500 pl-4 py-1 italic text-slate-100">
          {response.verdict}
        </div>
      )}
    </div>
  );
}
