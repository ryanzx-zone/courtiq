# CourtIQ — AI-Powered NBA Analytics

Ask anything about the NBA and get a data-driven answer powered by Claude.

**[Live demo →](https://courtiq-ryanzx-zoneout.vercel.app)**

## Features

- **AI Ask Engine** — Natural-language basketball Q&A with structured analysis, key stats, hot-take verdicts, and follow-up suggestions
- **Player Comparison** — Side-by-side radar overlap and 17-stat advantage table with green/red highlights (inverted for negative stats like turnovers)
- **Player Browser** — Search, filter, and sort 61 NBA players by position, team, conference, and any of 10 sort metrics
- **Player Profiles** — Per-player deep dive with grouped stat sections and percentile-rank radar across 6 composite axes

## Tech Stack

| Layer | What |
|---|---|
| Framework | Next.js 16 (App Router, React Server Components) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (CSS-first config via `@theme`) |
| Charts | Recharts 3 |
| AI | Anthropic Claude API (`claude-opus-4-7`) with structured outputs + prompt caching |
| Icons | Lucide |
| Data | Static JSON (no database) |
| Deployment | Vercel |

## Architecture

- **Server components by default** — data loading happens server-side, client components only where interactivity is needed
- **Static JSON data layer** — 61 players, 30 teams, 63 draft picks loaded at build time; no database, no flaky API dependencies
- **Claude API integration** — server-side proxy route at `/api/ask` with `output_config.format` enforcing typed `AskResponse` shape, plus prompt caching that drops repeat-query cost ~90%
- **Composite stat utilities** — percentile-rank radar profiles computed across the player pool (Scoring / Playmaking / Rebounding / Defense / Efficiency / Impact)

## Local Development

```bash
git clone https://github.com/YOUR_USERNAME/courtiq.git
cd courtiq
npm install
cp .env.example .env.local
# Edit .env.local — add your ANTHROPIC_API_KEY from console.anthropic.com
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                 # Next.js App Router routes
│   ├── ask/             # AI Q&A page
│   ├── compare/         # Head-to-head comparison
│   ├── players/[id]/    # Player profile (dynamic)
│   ├── api/ask/         # Claude API proxy route
│   └── page.tsx         # Landing page
├── components/
│   ├── charts/          # Recharts wrappers (radar, bar, line)
│   ├── features/        # Page-specific complex components
│   ├── layout/          # Navbar
│   └── ui/              # Reusable primitives (SearchBar, PlayerCard, etc.)
├── data/                # Static JSON datasets
├── lib/                 # Data loaders, stat utilities, Claude prompts
└── types/               # TypeScript interfaces
```

## Built by

[Your Name] — Computer Engineering, National University of Singapore
