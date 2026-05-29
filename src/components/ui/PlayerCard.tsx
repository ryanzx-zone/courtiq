import Link from "next/link";
import type { Player } from "@/types";
import { formatStat } from "@/lib/stats";
import { PlayerHeadshot } from "./PlayerHeadshot";

interface PlayerCardProps {
  player: Player;
  href?: string;
}

export function PlayerCard({ player, href }: PlayerCardProps) {
  const link = href ?? `/players/${player.id}`;

  return (
    <Link
      href={link}
      className="group flex flex-col overflow-hidden rounded-lg border border-edge bg-card transition-colors hover:bg-card-hover hover:border-orange-500/40"
    >
      <div className="relative aspect-[4/3] w-full bg-surface">
        <PlayerHeadshot
          name={player.name}
          url={player.headshot_url}
          sizes="(max-width: 768px) 50vw, 25vw"
          initialsClassName="text-5xl"
        />
        <div className="absolute top-2 right-2 rounded-md bg-canvas/80 px-2 py-1 font-mono text-[10px] font-bold text-orange-400 backdrop-blur-sm">
          {player.team}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-100 leading-tight group-hover:text-white">
            {player.name}
          </h3>
          <span className="shrink-0 font-mono text-[10px] text-slate-500">
            {player.position}
          </span>
        </div>

        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-edge pt-3">
          <Stat label="PPG" value={formatStat(player.stats.ppg)} />
          <Stat label="RPG" value={formatStat(player.stats.rpg)} />
          <Stat label="APG" value={formatStat(player.stats.apg)} />
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-base font-semibold text-slate-100">
        {value}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </div>
  );
}
