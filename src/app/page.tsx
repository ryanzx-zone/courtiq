import {
  ArrowRight,
  GitCompareArrows,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { getAllPlayers } from "@/lib/players";
import { getAllTeams } from "@/lib/teams";
import draftData from "@/data/draft_history.json";

export default function Home() {
  const playerCount = getAllPlayers().length;
  const teamCount = getAllTeams().length;
  const draftCount = (draftData as unknown[]).length;

  return (
    <>
      {/* HERO */}
      <section className="px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-orange-500">
            AI-powered NBA analytics
          </p>
          <h1 className="mt-5 font-display text-6xl tracking-wider text-slate-100 sm:text-7xl">
            Ask anything
            <br />
            <span className="text-orange-500">about the NBA.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 sm:text-xl">
            Natural-language analysis, side-by-side comparisons, and stat-backed
            takes — powered by Claude.
          </p>

          {/* Hero search — native form, no client state needed */}
          <form action="/ask" method="get" className="mt-10">
            <label htmlFor="hero-q" className="sr-only">
              Ask CourtIQ a basketball question
            </label>
            <div className="relative mx-auto max-w-2xl">
              <Search
                className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <input
                id="hero-q"
                name="q"
                type="text"
                required
                placeholder="Who is the MVP this season?"
                className="h-16 w-full rounded-xl border border-edge bg-card pl-14 pr-32 text-base text-slate-100 placeholder:text-slate-500 focus:border-orange-500/60 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-orange-400"
              >
                Ask
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
          <p className="mt-4 text-xs text-slate-600">
            Press Enter, or try one of the examples below.
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              "Compare SGA and Jokic",
              "Best draft steal since 2015",
              "Most efficient scorer in the league",
            ].map((q) => (
              <Link
                key={q}
                href={`/ask?q=${encodeURIComponent(q)}`}
                className="rounded-full border border-edge bg-card px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-orange-500/40 hover:text-orange-400"
              >
                {q}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <header className="mb-10 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-orange-500">
              The toolkit
            </p>
            <h2 className="mt-2 font-display text-4xl tracking-wider text-slate-100">
              Three ways to explore
            </h2>
          </header>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FeatureCard
              href="/ask"
              icon={Sparkles}
              title="Ask AI"
              desc="Natural language Q&A. Throw any basketball question at it — comparisons, rankings, hot takes."
            />
            <FeatureCard
              href="/compare"
              icon={GitCompareArrows}
              title="Compare"
              desc="Side-by-side head-to-head with radar overlap and green/red advantage table across 17 stats."
            />
            <FeatureCard
              href="/players"
              icon={Users}
              title="Players"
              desc={`Browse, search, and sort all ${playerCount} players from the 2024-25 season.`}
            />
          </div>
        </div>
      </section>

      {/* SAMPLE ANALYSIS — real Claude response as social proof */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <header className="mb-8">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-orange-500">
              In action
            </p>
            <h2 className="mt-2 font-display text-4xl tracking-wider text-slate-100">
              Real analysis, real takes
            </h2>
            <p className="mt-2 text-slate-400">
              An actual Claude-generated response to a real question.
            </p>
          </header>

          <div className="rounded-lg border border-edge bg-card p-6">
            <div className="mb-5 flex justify-end">
              <div className="max-w-[80%] rounded-lg border border-edge bg-card/60 px-4 py-2.5 text-sm text-slate-100">
                Who is the MVP frontrunner this season and why?
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Sparkles
                  className="h-4 w-4 text-orange-500"
                  aria-hidden="true"
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-orange-500">
                  CourtIQ analysis
                </span>
              </div>

              <div className="space-y-3 text-slate-200">
                <p className="leading-relaxed">
                  This was the closest, most contentious MVP race in years.{" "}
                  <strong className="font-semibold text-white">
                    Shai Gilgeous-Alexander won the actual award
                  </strong>
                  , and the case is airtight on the surface: he led the NBA in
                  scoring at{" "}
                  <strong className="font-semibold text-white">
                    32.7 PPG on 63.8% true shooting
                  </strong>{" "}
                  while quarterbacking a{" "}
                  <strong className="font-semibold text-white">
                    68-win Thunder juggernaut
                  </strong>{" "}
                  with the league&apos;s best net rating.
                </p>
                <p className="leading-relaxed">
                  That said, if you&apos;re being honest about the advanced
                  metrics,{" "}
                  <strong className="font-semibold text-white">
                    Nikola Jokić had the better individual season
                  </strong>
                  . A <strong className="font-semibold text-white">
                    30/13/10
                  </strong>{" "}
                  average is something literally only Oscar Robertson has ever
                  done over a full season, and Jokić did it on 66.1% true
                  shooting.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  label="SGA PPG"
                  value="32.7"
                  context="Scoring champ"
                  accent="orange"
                />
                <Badge
                  label="Jokić BPM"
                  value="+13.7"
                  context="Top-10 all-time"
                  accent="orange"
                />
                <Badge
                  label="OKC NetRtg"
                  value="+12.6"
                  context="Best in NBA"
                  accent="orange"
                />
              </div>

              <div className="border-l-2 border-orange-500 pl-4 py-1 italic text-slate-100">
                SGA got the trophy and earned it on a 68-win team, but Jokić
                had the statistically superior season — a coronation of
                narrative over numbers.
              </div>
            </div>

            <div className="mt-8 flex justify-center border-t border-edge pt-5">
              <Link
                href="/ask"
                className="inline-flex items-center gap-1.5 rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-canvas transition-colors hover:bg-orange-400"
              >
                Try it yourself
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STATS FOOTER */}
      <section className="border-t border-edge px-6 py-12 mt-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="grid grid-cols-3 gap-10 text-center font-mono">
            <Stat value={playerCount} label="Players" />
            <Stat value={teamCount} label="Teams" />
            <Stat value={draftCount} label="Draft picks" />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Powered by Claude · Built with Next.js
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  href,
  icon: Icon,
  title,
  desc,
}: {
  href: string;
  icon: typeof Sparkles;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-lg border border-edge bg-card p-6 transition-all hover:border-orange-500/40 hover:bg-card-hover"
    >
      <Icon
        className="h-6 w-6 text-orange-500 transition-transform group-hover:scale-110"
        aria-hidden="true"
      />
      <h3 className="font-display text-2xl tracking-wider text-slate-100">
        {title}
      </h3>
      <p className="text-sm text-slate-400">{desc}</p>
      <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-orange-500 transition-transform group-hover:translate-x-1">
        Explore
        <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-2xl font-semibold text-slate-100">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
    </div>
  );
}
