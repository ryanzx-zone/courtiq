export type Position = "PG" | "SG" | "SF" | "PF" | "C";
export type Conference = "East" | "West";

export interface PlayerStats {
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  topg: number;
  fgPct: number;
  fg3Pct: number;
  ftPct: number;
  tsPct: number;
  per: number;
  usgPct: number;
  bpm: number;
  vorp: number;
  ws: number;
  ortg: number;
  drtg: number;
}

export interface PlayerBio {
  height: string;
  weight: number;
  college: string;
  draft: string;
  country: string;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  team_full: string;
  position: Position;
  age: number;
  gp: number;
  mpg: number;
  stats: PlayerStats;
  bio: PlayerBio;
  headshot_url: string | null;
}

export interface TeamStats {
  ppg: number;
  oppg: number;
  pace: number;
  ortg: number;
  drtg: number;
  netRtg: number;
}

export interface Team {
  id: string;
  name: string;
  conference: Conference;
  wins: number;
  losses: number;
  pct: number;
  conf_rank: number;
  stats: TeamStats;
}

export interface DraftPick {
  year: number;
  pick: number;
  round: number;
  player: string;
  team: string;
  college: string;
  seasons_played: number;
  career_ws: number;
  all_star_selections: number;
  all_nba_selections: number;
  draft_value_score: number;
}

export interface GlossaryEntry {
  name: string;
  category: string;
  description: string;
}
export type Glossary = Record<string, GlossaryEntry>;

export interface RadarAxes {
  scoring: number;
  playmaking: number;
  rebounding: number;
  defense: number;
  efficiency: number;
  impact: number;
}

export interface KeyStat {
  label: string;
  value: string;
  context: string;
}

export interface ChartDataRow {
  label: string;
  values: number[];
}

export interface ChartDataSeries {
  name: string;
}

export interface ChartData {
  type: "radar" | "bar" | "line";
  title: string;
  /**
   * For radar: each row is an axis (e.g. "Scoring"), values[] are per-series scores.
   * For bar/line: each row is a category on the x-axis, values[] are per-series values.
   */
  data: ChartDataRow[];
  /** Series names in the order they appear in each row's values[]. */
  series: ChartDataSeries[];
}

export interface AskResponse {
  analysis: string;
  keyStats: KeyStat[];
  verdict: string;
  chartData: ChartData | null;
  followUps: string[];
}

export type PlayerSortKey =
  | "ppg"
  | "rpg"
  | "apg"
  | "spg"
  | "bpg"
  | "tsPct"
  | "per"
  | "ws"
  | "vorp"
  | "bpm";
