import type { Player, RadarAxes } from "@/types";

interface RawAxes {
  scoring: number;
  playmaking: number;
  rebounding: number;
  defense: number;
  efficiency: number;
  impact: number;
}

function rawAxes(p: Player): RawAxes {
  const turnovers = Math.max(p.stats.topg, 0.5);
  const games = Math.max(p.gp, 1);
  return {
    scoring: p.stats.ppg + p.stats.tsPct * 30,
    playmaking: p.stats.apg + (p.stats.apg / turnovers) * 2,
    rebounding: p.stats.rpg,
    defense:
      p.stats.spg * 5 + p.stats.bpg * 5 + Math.max(0, 120 - p.stats.drtg),
    efficiency: p.stats.per + p.stats.bpm,
    impact: p.stats.vorp + (p.stats.ws / games) * 30,
  };
}

function percentileRank(value: number, sortedValues: number[]): number {
  if (sortedValues.length === 0) return 50;
  let lower = 0;
  let equal = 0;
  for (const v of sortedValues) {
    if (v < value) lower++;
    else if (v === value) equal++;
  }
  return ((lower + equal / 2) / sortedValues.length) * 100;
}

export function computeRadarProfile(
  player: Player,
  pool: Player[],
): RadarAxes {
  const poolAxes = pool.map(rawAxes);
  const sortedBy = {
    scoring: poolAxes.map((r) => r.scoring).sort((a, b) => a - b),
    playmaking: poolAxes.map((r) => r.playmaking).sort((a, b) => a - b),
    rebounding: poolAxes.map((r) => r.rebounding).sort((a, b) => a - b),
    defense: poolAxes.map((r) => r.defense).sort((a, b) => a - b),
    efficiency: poolAxes.map((r) => r.efficiency).sort((a, b) => a - b),
    impact: poolAxes.map((r) => r.impact).sort((a, b) => a - b),
  };

  const raw = rawAxes(player);
  return {
    scoring: Math.round(percentileRank(raw.scoring, sortedBy.scoring)),
    playmaking: Math.round(
      percentileRank(raw.playmaking, sortedBy.playmaking),
    ),
    rebounding: Math.round(
      percentileRank(raw.rebounding, sortedBy.rebounding),
    ),
    defense: Math.round(percentileRank(raw.defense, sortedBy.defense)),
    efficiency: Math.round(
      percentileRank(raw.efficiency, sortedBy.efficiency),
    ),
    impact: Math.round(percentileRank(raw.impact, sortedBy.impact)),
  };
}

export function formatPct(value: number): string {
  return (value * 100).toFixed(1) + "%";
}

export function formatStat(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}
