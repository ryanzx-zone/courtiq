import { getAllPlayers } from "./players";
import { getAllTeams } from "./teams";

function fmtBpm(v: number): string {
  return (v > 0 ? "+" : "") + v.toFixed(1);
}

function fmtNet(v: number): string {
  return (v > 0 ? "+" : "") + v.toFixed(1);
}

export function buildDataContext(): string {
  const players = getAllPlayers();
  const teams = getAllTeams();

  const playerLines = players
    .map((p) => {
      const s = p.stats;
      return (
        `${p.name} (${p.team}, ${p.position}, age ${p.age}, ${p.gp} GP, ${p.mpg.toFixed(1)} MPG): ` +
        `${s.ppg.toFixed(1)}/${s.rpg.toFixed(1)}/${s.apg.toFixed(1)} pts/reb/ast, ` +
        `${s.spg.toFixed(1)} stl, ${s.bpg.toFixed(1)} blk, ${s.topg.toFixed(1)} TO, ` +
        `${(s.fgPct * 100).toFixed(1)}% FG, ${(s.fg3Pct * 100).toFixed(1)}% 3P, ${(s.ftPct * 100).toFixed(1)}% FT, ${(s.tsPct * 100).toFixed(1)}% TS, ` +
        `PER ${s.per.toFixed(1)}, BPM ${fmtBpm(s.bpm)}, VORP ${s.vorp.toFixed(1)}, WS ${s.ws.toFixed(1)}, ` +
        `USG% ${s.usgPct.toFixed(1)}, ORtg ${s.ortg}, DRtg ${s.drtg}`
      );
    })
    .join("\n");

  const teamLines = teams
    .map((t) => {
      const s = t.stats;
      return (
        `${t.id} ${t.name} (${t.conference} #${t.conf_rank}): ` +
        `${t.wins}-${t.losses}, ${s.ppg.toFixed(1)} ppg / ${s.oppg.toFixed(1)} oppg, ` +
        `ORtg ${s.ortg.toFixed(1)}, DRtg ${s.drtg.toFixed(1)}, NetRtg ${fmtNet(s.netRtg)}, pace ${s.pace.toFixed(1)}`
      );
    })
    .join("\n");

  return `=== 2024-25 NBA SEASON DATA ===

PLAYERS (${players.length} players):
${playerLines}

TEAMS (${teams.length} teams):
${teamLines}`;
}
