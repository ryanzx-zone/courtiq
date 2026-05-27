import { ArrowLeftRight, MessageCircleQuestion } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RadarChart } from "@/components/charts/RadarChart";
import { getAllPlayers, getPlayerById } from "@/lib/players";
import { computeRadarProfile, formatPct, formatStat } from "@/lib/stats";
import { getTeamById } from "@/lib/teams";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const player = getPlayerById(id);
  if (!player) return { title: "Player not found — CourtIQ" };
  return {
    title: `${player.name} — CourtIQ`,
    description: `${player.name}, ${player.position} for the ${player.team_full}. 2024-25 stats and analysis.`,
  };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function PlayerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const player = getPlayerById(id);
  if (!player) notFound();

  const allPlayers = getAllPlayers();
  const team = getTeamById(player.team);
  const radar = computeRadarProfile(player, allPlayers);

  const askHref = `/ask?q=${encodeURIComponent(`Tell me about ${player.name} this season`)}`;
  const compareHref = `/compare?p1=${player.id}`;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <Link
        href="/players"
        className="mb-8 inline-flex font-mono text-xs uppercase tracking-wider text-slate-500 hover:text-orange-500"
      >
        ← All players
      </Link>

      {/* Hero */}
      <header className="grid grid-cols-1 gap-8 md:grid-cols-[260px,1fr]">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-edge bg-card md:w-[260px]">
          {player.headshot_url ? (
            <Image
              src={player.headshot_url}
              alt={player.name}
              fill
              sizes="260px"
              className="object-cover object-top"
              unoptimized
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-7xl tracking-wider text-slate-600">
              {getInitials(player.name)}
            </div>
          )}
          <div className="absolute right-3 top-3 rounded-md bg-canvas/80 px-2.5 py-1 font-mono text-xs font-bold text-orange-400 backdrop-blur-sm">
            {player.team}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-orange-500">
              {team?.name ?? player.team_full}
              {team && ` · ${team.wins}–${team.losses}`}
            </p>
            <h1 className="mt-1 font-display text-6xl tracking-wider text-slate-100">
              {player.name}
            </h1>
            <p className="mt-1 font-mono text-sm text-slate-400">
              {player.position} · {player.bio.height} ·{" "}
              {player.bio.weight} lbs · Age {player.age}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <BioItem label="Country" value={player.bio.country} />
            <BioItem label="College" value={player.bio.college} />
            <BioItem label="Draft" value={player.bio.draft} />
            <BioItem label="2024-25 GP" value={`${player.gp}`} />
          </dl>

          <div className="mt-2 flex flex-wrap gap-3">
            <Link
              href={askHref}
              className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-orange-400"
            >
              <MessageCircleQuestion className="h-4 w-4" />
              Ask about {player.name.split(" ")[0]}
            </Link>
            <Link
              href={compareHref}
              className="inline-flex items-center gap-2 rounded-md border border-edge bg-card px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-orange-500/40 hover:text-orange-400"
            >
              <ArrowLeftRight className="h-4 w-4" />
              Compare with...
            </Link>
          </div>
        </div>
      </header>

      {/* Stat groups */}
      <section className="mt-14 space-y-8">
        <StatGroup
          title="Scoring"
          stats={[
            { label: "PPG", value: formatStat(player.stats.ppg) },
            { label: "FG%", value: formatPct(player.stats.fgPct) },
            { label: "3P%", value: formatPct(player.stats.fg3Pct) },
            { label: "FT%", value: formatPct(player.stats.ftPct) },
            { label: "TS%", value: formatPct(player.stats.tsPct) },
          ]}
        />

        <StatGroup
          title="Playmaking & Rebounding"
          stats={[
            { label: "APG", value: formatStat(player.stats.apg) },
            { label: "TO/G", value: formatStat(player.stats.topg) },
            {
              label: "AST/TO",
              value: formatStat(
                player.stats.apg / Math.max(player.stats.topg, 0.1),
                2,
              ),
            },
            { label: "RPG", value: formatStat(player.stats.rpg) },
            { label: "USG%", value: formatPct(player.stats.usgPct / 100) },
          ]}
        />

        <StatGroup
          title="Defense"
          stats={[
            { label: "SPG", value: formatStat(player.stats.spg) },
            { label: "BPG", value: formatStat(player.stats.bpg) },
            { label: "DRtg", value: formatStat(player.stats.drtg, 0) },
          ]}
        />

        <StatGroup
          title="Advanced"
          stats={[
            { label: "PER", value: formatStat(player.stats.per) },
            {
              label: "BPM",
              value:
                (player.stats.bpm > 0 ? "+" : "") +
                formatStat(player.stats.bpm),
            },
            { label: "VORP", value: formatStat(player.stats.vorp) },
            { label: "WS", value: formatStat(player.stats.ws) },
            { label: "ORtg", value: formatStat(player.stats.ortg, 0) },
            { label: "MPG", value: formatStat(player.mpg) },
          ]}
        />
      </section>

      {/* Radar */}
      <section className="mt-14">
        <header className="mb-4 border-b border-edge pb-3">
          <h2 className="font-display text-2xl tracking-wider text-slate-100">
            Statistical profile
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Percentile ranks vs all {allPlayers.length} players in the dataset.
          </p>
        </header>
        <div className="rounded-lg border border-edge bg-card p-4">
          <RadarChart
            series={[{ name: player.name, values: radar, color: "#f97316" }]}
            height={400}
          />
        </div>
      </section>
    </div>
  );
}

function BioItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-slate-200">{value}</dd>
    </div>
  );
}

interface StatBox {
  label: string;
  value: string;
}

function StatGroup({ title, stats }: { title: string; stats: StatBox[] }) {
  return (
    <div>
      <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col rounded-md border border-edge bg-card px-4 py-3"
          >
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
              {s.label}
            </span>
            <span className="font-mono text-2xl font-semibold text-slate-100">
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
