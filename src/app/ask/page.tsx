import type { Metadata } from "next";
import { AskEngine } from "@/components/features/AskEngine";

export const metadata: Metadata = {
  title: "Ask CourtIQ — AI NBA analysis",
  description:
    "Ask any question about the NBA and get a data-driven answer powered by AI.",
};

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function AskPage({ searchParams }: PageProps) {
  const { q } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-orange-500">
          AI analyst
        </p>
        <h1 className="mt-2 font-display text-5xl tracking-wider text-slate-100">
          Ask CourtIQ
        </h1>
        <p className="mt-2 text-slate-400">
          Natural language NBA Q&amp;A — powered by Claude.
        </p>
      </header>

      <AskEngine initialQuestion={q} />
    </div>
  );
}
