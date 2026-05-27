import type { Metadata } from "next";
import { PlayerBrowser } from "@/components/features/PlayerBrowser";
import { getAllPlayers } from "@/lib/players";
import { getAllTeams } from "@/lib/teams";

export const metadata: Metadata = {
  title: "Players — CourtIQ",
  description:
    "Browse, search, and filter every NBA player from the 2024-25 season.",
};

export default function PlayersPage() {
  const players = getAllPlayers();
  const teams = getAllTeams();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-orange-500">
          The roster
        </p>
        <h1 className="mt-2 font-display text-5xl tracking-wider text-slate-100">
          Players
        </h1>
        <p className="mt-2 text-slate-400">
          Search, filter, and sort all{" "}
          <span className="text-slate-200">{players.length}</span> players from
          the 2024-25 season.
        </p>
      </header>

      <PlayerBrowser players={players} teams={teams} />
    </div>
  );
}
