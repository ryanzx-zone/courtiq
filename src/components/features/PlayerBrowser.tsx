"use client";

import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { filterPlayers, sortPlayers } from "@/lib/players";
import type {
  Conference,
  Player,
  PlayerSortKey,
  Position,
  Team,
} from "@/types";

interface PlayerBrowserProps {
  players: Player[];
  teams: Team[];
}

type PositionFilter = Position | "ALL";
type ConferenceFilter = Conference | "ALL";

const POSITION_FILTERS: { value: PositionFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PG", label: "PG" },
  { value: "SG", label: "SG" },
  { value: "SF", label: "SF" },
  { value: "PF", label: "PF" },
  { value: "C", label: "C" },
];

const CONFERENCE_FILTERS: { value: ConferenceFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "East", label: "East" },
  { value: "West", label: "West" },
];

const SORT_OPTIONS: { value: PlayerSortKey; label: string }[] = [
  { value: "ppg", label: "Points" },
  { value: "rpg", label: "Rebounds" },
  { value: "apg", label: "Assists" },
  { value: "spg", label: "Steals" },
  { value: "bpg", label: "Blocks" },
  { value: "per", label: "PER" },
  { value: "tsPct", label: "True Shooting %" },
  { value: "ws", label: "Win Shares" },
  { value: "vorp", label: "VORP" },
  { value: "bpm", label: "BPM" },
];

export function PlayerBrowser({ players, teams }: PlayerBrowserProps) {
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState<PositionFilter>("ALL");
  const [team, setTeam] = useState<string>("");
  const [conference, setConference] = useState<ConferenceFilter>("ALL");
  const [sortBy, setSortBy] = useState<PlayerSortKey>("ppg");

  const sortedTeams = useMemo(
    () => [...teams].sort((a, b) => a.name.localeCompare(b.name)),
    [teams],
  );

  const visible = useMemo(() => {
    const filtered = filterPlayers(players, {
      search: search || undefined,
      position: position === "ALL" ? undefined : position,
      team: team || undefined,
      conference: conference === "ALL" ? undefined : conference,
    });
    return sortPlayers(filtered, sortBy);
  }, [players, search, position, team, conference, sortBy]);

  const totalCount = players.length;
  const visibleCount = visible.length;
  const filtersActive =
    !!search || position !== "ALL" || !!team || conference !== "ALL";

  function clearFilters() {
    setSearch("");
    setPosition("ALL");
    setTeam("");
    setConference("ALL");
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search players by name..."
        size="lg"
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <PillGroup
          label="Position"
          options={POSITION_FILTERS}
          value={position}
          onChange={setPosition}
        />
        <PillGroup
          label="Conference"
          options={CONFERENCE_FILTERS}
          value={conference}
          onChange={setConference}
        />
        <Dropdown
          label="Team"
          value={team}
          onChange={setTeam}
          options={[
            { value: "", label: "All teams" },
            ...sortedTeams.map((t) => ({ value: t.id, label: t.name })),
          ]}
        />
        <Dropdown
          label="Sort by"
          value={sortBy}
          onChange={(v) => setSortBy(v as PlayerSortKey)}
          options={SORT_OPTIONS}
        />
      </div>

      {/* Result count + clear */}
      <div className="flex items-center justify-between border-b border-edge pb-3">
        <p className="font-mono text-xs uppercase tracking-wider text-slate-500">
          Showing{" "}
          <span className="text-slate-200">{visibleCount}</span> of {totalCount}{" "}
          players
        </p>
        {filtersActive && (
          <button
            type="button"
            onClick={clearFilters}
            className="font-mono text-xs uppercase tracking-wider text-orange-500 hover:text-orange-400"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-edge bg-card py-16">
          <p className="font-display text-2xl tracking-wider text-slate-300">
            No players match
          </p>
          <p className="text-sm text-slate-500">
            Try clearing some filters or searching for someone else.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>
      )}
    </div>
  );
}

interface PillGroupProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

function PillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: PillGroupProps<T>) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <div className="flex gap-1 rounded-lg border border-edge bg-card p-1">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={[
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-orange-500/20 text-orange-400"
                  : "text-slate-400 hover:text-slate-100",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface DropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

function Dropdown({ label, value, onChange, options }: DropdownProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none rounded-lg border border-edge bg-card py-2 pl-3 pr-9 text-sm text-slate-100 focus:border-orange-500/60 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-card">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
