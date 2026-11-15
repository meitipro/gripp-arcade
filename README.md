# Gripp Arcade

A community-built game hub for PrismaX (unofficial): twenty small games, one operator card, a cast of small robots, squads, a pixel wall and quests. Built from the "Gripp Arcade / PrismaX Game Hub Plan v1.0".

> Community-built. Not an official PrismaX product. Hub Points are a community game score, not an official PrismaX reward.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # points, levels, streaks, card, awards, optics
npm run build
```

No environment variables are required. See `.env.example` for optional ones.

## What is in the box

- **20 games** behind one contract (`src/games/types.ts`): Pick & Place, Lag Lab, Claw Club, Prism Bender, Servo, Tabletop Tower, Calibrate, Intent Check, Route Planner, Replay, Rail Dash, Prism Pop, Command Line, Whitepaper Duel, Blind Operator, Pixel Wall, Region Rally, Guess the Amplifier, Caption Bench, Fleet Idle.
- **Run pipeline**: `/api/run/start` issues a seed and a signed single-use run id, the game runs in the browser with only the seed as input, `/api/run/submit` verifies (signature, expiry, single use, human time floor, score range) and holds suspicious runs quietly.
- **Points ledger** (`src/lib/points.ts`, `src/lib/store.ts`): HP by score band, personal best, Daily Five, variety bonus, soft cap, ten ranked runs a day, XP and levels from the plan formula, tiers I to V, gentle streaks with a weekly pause, quests and badges. Every point is a ledger row, runs can be reversed or released by staff.
- **Operator card**: pure SVG renderer (`src/lib/card.ts`), PNG download, and a public share image at `/api/card/image`.
- **Community**: Wall of Amplifiers with robot faces drawn from the handle, twelve squads with a top-20% war score, quests, boards, rules page with every number, staff console, settings with one-click delete.
- **Servo** keeps its answer on the server (`/api/servo`); the browser only gets per-letter results.
- **Season 0**: eight-week calendar, Glitch Hunt boss bar (every ranked run deals score/10 damage, 5% per-member cap), the five-character cast, public sample cards at `/card/[handle]`, toasts, sound mute, PWA manifest and OG image.
- English and Persian (right to left) shell.

## Honest scope

This first release is **local-first**: your profile, ledger, bests and wall tiles live in your browser (`localStorage`). The sample community (placeholder handles) fills boards, the wall and squads. Shared boards switch on automatically when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set. Not yet built: Discord sign in (NextAuth), Neon Postgres, multiplayer server state (duel, rally, blind operator, wall are single-player simulations here), Dot bot webhooks, and the boss event. See `DECISIONS.md`.

## Discord bot

Slash-command bot served by this app at /api/discord/interactions (Ed25519 verified, no SDK, no message access). Commands: /stats [member], /leaderboard, /daily, /link, /about. Members link with a 6 digit code from /link on the /discord page; after that each run syncs a clamped summary (points, level, tier, runs, streak, badges, bests, wall tiles, boss damage). Needs Upstash Redis. Setup steps are on the /discord page; register commands once with scripts/register-commands.mjs.

## Final polish (v1.0)

Drawn icon per game, light/dark theme toggle, first-run onboarding, PNG share cards (/api/card/png, used by the Discord embed), custom 404 and error pages, search in the catalog, more Persian strings, sitemap and robots, and a midnight cron (vercel.json) where Dot posts the Daily Five to a Discord webhook when DISCORD_WEBHOOK_URL is set.
