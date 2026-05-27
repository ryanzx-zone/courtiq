import type { Metadata } from "next";
import { ComparisonView } from "@/components/features/ComparisonView";
import { getAllPlayers, getPlayerById } from "@/lib/players";

export const metadata: Metadata = {
  title: "Compare — CourtIQ",
  description:
    "Head-to-head NBA player comparison with radar overlay and stat-by-stat breakdown.",
};

interface PageProps {
  searchParams: Promise<{ p1?: string; p2?: string }>;
}

export default async function ComparePage({ searchParams }: PageProps) {
  const { p1, p2 } = await searchParams;
  const players = getAllPlayers();
  const initialP1 = p1 ? (getPlayerById(p1) ?? null) : null;
  const initialP2 = p2 ? (getPlayerById(p2) ?? null) : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-orange-500">
          Head to head
        </p>
        <h1 className="mt-2 font-display text-5xl tracking-wider text-slate-100">
          Compare players
        </h1>
        <p className="mt-2 text-slate-400">
          Pick any two players to see them side-by-side with radar overlay and
          stat highlights.
        </p>
      </header>

      <ComparisonView
        players={players}
        initialP1={initialP1}
        initialP2={initialP2}
      />
    </div>
  );
}
