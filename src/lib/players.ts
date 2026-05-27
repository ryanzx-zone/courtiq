import playersData from "@/data/players_2024_25.json";
import teamsData from "@/data/teams_2024_25.json";
import type {
  Conference,
  Player,
  PlayerSortKey,
  Position,
} from "@/types";

const PLAYERS = playersData as Player[];
const TEAM_CONFERENCE = new Map<string, Conference>(
  (teamsData as Array<{ id: string; conference: Conference }>).map((t) => [
    t.id,
    t.conference,
  ]),
);

export function getAllPlayers(): Player[] {
  return PLAYERS;
}

export function getPlayerById(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id);
}

export interface PlayerFilters {
  search?: string;
  position?: Position;
  team?: string;
  conference?: Conference;
}

export function filterPlayers(
  players: Player[],
  filters: PlayerFilters,
): Player[] {
  const query = filters.search?.trim().toLowerCase();

  return players.filter((p) => {
    if (query && !p.name.toLowerCase().includes(query)) return false;
    if (filters.position && p.position !== filters.position) return false;
    if (filters.team && p.team !== filters.team) return false;
    if (
      filters.conference &&
      TEAM_CONFERENCE.get(p.team) !== filters.conference
    ) {
      return false;
    }
    return true;
  });
}

export function sortPlayers(
  players: Player[],
  sortBy: PlayerSortKey,
  direction: "desc" | "asc" = "desc",
): Player[] {
  const sign = direction === "desc" ? -1 : 1;
  return [...players].sort(
    (a, b) => sign * (a.stats[sortBy] - b.stats[sortBy]),
  );
}
