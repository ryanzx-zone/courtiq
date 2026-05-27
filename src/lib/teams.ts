import teamsData from "@/data/teams_2024_25.json";
import type { Player, Team } from "@/types";
import { getAllPlayers } from "./players";

const TEAMS = teamsData as Team[];

export function getAllTeams(): Team[] {
  return TEAMS;
}

export function getTeamById(id: string): Team | undefined {
  return TEAMS.find((t) => t.id === id);
}

export function getTeamPlayers(teamId: string): Player[] {
  return getAllPlayers().filter((p) => p.team === teamId);
}
