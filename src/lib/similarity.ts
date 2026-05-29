import type { Player, PlayerStats } from "@/types";

// Per-game + rate stats that define playing style. Cumulative stats (WS, VORP)
// are excluded — they track volume/tenure, not how a player actually plays.
const FEATURES: (keyof PlayerStats)[] = [
  "ppg",
  "rpg",
  "apg",
  "spg",
  "bpg",
  "topg",
  "fg3Pct",
  "ftPct",
  "tsPct",
  "usgPct",
  "per",
  "bpm",
];

export interface SimilarPlayer {
  player: Player;
  score: number;
}

/** z-score each feature across the pool so no single stat's scale dominates. */
function standardize(players: Player[]): Map<string, number[]> {
  const means: number[] = [];
  const stds: number[] = [];
  FEATURES.forEach((f, i) => {
    const vals = players.map((p) => p.stats[f]);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const variance =
      vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
    means[i] = mean;
    stds[i] = Math.sqrt(variance) || 1;
  });

  const vectors = new Map<string, number[]>();
  for (const p of players) {
    vectors.set(
      p.id,
      FEATURES.map((f, i) => (p.stats[f] - means[i]) / stds[i]),
    );
  }
  return vectors;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

/** Players with the most similar statistical profile to `target`, best first. */
export function findSimilarPlayers(
  target: Player,
  players: Player[],
  count = 4,
): SimilarPlayer[] {
  const vectors = standardize(players);
  const targetVec = vectors.get(target.id);
  if (!targetVec) return [];

  return players
    .filter((p) => p.id !== target.id)
    .map((p) => ({
      player: p,
      score: cosineSimilarity(targetVec, vectors.get(p.id)!),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}
