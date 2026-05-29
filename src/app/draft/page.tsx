import type { Metadata } from "next";
import { DraftAnalyzer } from "@/components/features/DraftAnalyzer";
import { getAllDraftPicks } from "@/lib/draft";

export const metadata: Metadata = {
  title: "Draft Analyzer — CourtIQ",
  description:
    "Visualize NBA draft value — the biggest steals and busts of the last decade.",
};

export default function DraftPage() {
  const picks = getAllDraftPicks();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-orange-500">
          Draft value
        </p>
        <h1 className="mt-2 font-display text-5xl tracking-wider text-slate-100">
          Draft Analyzer
        </h1>
        <p className="mt-2 text-slate-400">
          Every notable pick from 2015-2024, plotted by career value. Find the
          steals and the busts.
        </p>
      </header>

      <DraftAnalyzer picks={picks} />
    </div>
  );
}
