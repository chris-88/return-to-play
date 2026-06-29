# Return to Play

A personal training planner for block-based athletic return-to-play programmes.

Built for athletes rebuilding fitness after a break — the app recommends the next best session based on recent training, recovery state, available time, and body composition goals.

## What it does

- **Session recommendation** — rule-based engine reviews recent sessions, recovery data, and readiness to recommend the best session to do next
- **Flexible scheduling** — no fixed training weekdays; works from a rolling 7–10 day window
- **Session & exercise logging** — log completed sessions and track sets, reps, and weights per exercise
- **Daily check-in** — quick recovery and nutrition capture (fatigue, soreness, readiness, protein, sleep)
- **Body composition tracking** — weight trend, waist, and progress photos
- **CSV export** — export all data for external coach review
- **Plan adjustment import** — import reviewed plan changes and apply them after confirmation

## Tech stack

- [Vite](https://vite.dev) + [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) (Postgres, Auth, Storage)
- [React Router](https://reactrouter.com) (HashRouter for GitHub Pages)
- [TanStack Table](https://tanstack.com/table), [Recharts](https://recharts.org), [PapaParse](https://www.papaparse.com), [Zod](https://zod.dev)
- Deployed to [GitHub Pages](https://pages.github.com)

## Getting started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project (free tier is fine)

### Setup

```bash
git clone https://github.com/<your-username>/return-to-play.git
cd return-to-play
npm install
```

Copy the environment template and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

Start the dev server:

```bash
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | TypeScript type check |
| `npm run lint` | Lint source files |
| `npm run format` | Format with Prettier |
| `npm run test` | Run tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run deploy` | Build and publish to gh-pages branch |

## Deployment

The app deploys as a static site to GitHub Pages. CI runs on every push to `main` and deploys automatically.

Set the following repository secrets in GitHub → Settings → Secrets:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Security

All data access is controlled by Supabase Row Level Security (RLS). The anon key is intentionally public — it is the Supabase publishable key and is safe to include in a static bundle. RLS policies are the actual security boundary.

Never put the `service_role` key in client code or environment variables consumed by Vite.

## Licence

MIT
