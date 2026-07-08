# World Cup Predictor — Frontend (`predict-front`)

A mobile-first Next.js app that ports the **World Cup Predictor** Claude Design into a real,
navigable application, wired to the Laravel prediction API in the parent repo
(`../docs/API.md`, `../public/openapi.yaml`).

Predict knockout-stage scores, climb the points leaderboard, settle friendly $1 bets,
and track your rank over the tournament.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **next/font** self-hosting **Manrope** (body) and **Space Grotesk** (display/numbers)
- Styling via design-token objects (`lib/theme.ts`) + inline styles + a small global CSS
  for the phone-frame chrome — a faithful port of the design's values (no UI framework)
- `flag-icons` for self-hosted SVG team crests
- Data: server-side `fetch` against `/api/v1`, Sanctum bearer token in an **httpOnly cookie**

## Getting started

The Laravel API must be running first:

```bash
cd ..  &&  php artisan serve       # http://127.0.0.1:8000
```

Then:

```bash
npm install
cp .env.example .env.local         # points at http://127.0.0.1:8000/api/v1
npm run dev                        # http://localhost:3000
npm run build                      # production build (typechecked)
```

Sign in with **mobile + password** (the API doesn't use email), or hit
**Continue as guest** for a read-only token.

### Environment

| Var | Purpose |
| --- | --- |
| `API_BASE_URL` | Base URL of the Laravel API. Server-side only — never exposed to the browser. |

## Architecture

Auth and data access are entirely server-side; the browser never sees the token.

- `lib/api.ts` — server-only fetch client. Reads the Sanctum token from an httpOnly
  cookie, throws a typed `ApiError`, and bounces a `401` through `/session/clear`
  (Server Components may not delete cookies, so a Route Handler does it).
- `lib/actions.ts` — Server Actions: `loginAction`, `guestAction`, `logoutAction`,
  `savePredictionAction`, `submitPicksAction`, `toggleDollarBetAction`. Each mutation
  refuses guests up front and `revalidatePath`s the affected screens.
- `proxy.ts` — Next 16 renamed Middleware → **Proxy**. Used only as an *optimistic*
  signed-out redirect; `requireSession()` in the data layer is the real guard.
- Pages are Server Components that fetch and hand data to a client child
  (`PredictClient`, `MatchDetailClient`, `RanksClient`) for the interactive bits.

## Routes → endpoints

| Route | Screen | API |
| --- | --- | --- |
| `/login` | Sign in / guest | `POST /login`, `POST /guest` |
| `/` | Home dashboard | `GET /dashboard` |
| `/predict` | Make Picks | `GET /matches?status=upcoming`, `POST /matches/{id}/predict` |
| `/match/[id]` | Match Detail | `GET /matches/{id}/detail`, `POST /matches/{id}/dollar-bet` |
| `/match/[id]/results` | Match Results | `GET /matches/{id}/detail` (finished) |
| `/ranks` | Leaderboard (4 tabs) | `GET /leaderboard`, `/leaderboard/dollar`, `/leaderboard/rank-trend`, `/leaderboard/stats` |
| `/profile` | Your profile | `GET /me`, `GET /leaderboard`, `GET /leaderboard/dollar` |
| `/users/[id]` | Any player's public profile | `GET /users/{id}` (404s for unknown/admin ids) |

Player names and avatars are tappable everywhere they appear (leaderboards, community
picks, match results) and open that player's public profile.

The bottom **tab bar** is persistent on the four top-level tabs and hides itself on
`/match/*`, `/users/*` and the auth screens.

> There is deliberately no root `loading.tsx`: a Suspense boundary above every route makes
> Next stream a `200` before the page runs, which silently downgrades `notFound()` and
> `redirect()` to client-side navigations. Pages are SSR'd whole instead, so
> `/users/999999` really returns `404` and a finished match really `307`s to its results.

## Notable behaviours

- **Anti-cheat.** The API returns `community_locked: true` and `community: null` until a
  match's prediction deadline. Match Detail therefore hides the win-probability bar and
  everyone's picks until kickoff, rather than inventing numbers.
- **Per-round scoring.** "Exact +N" / "Right result +N" come from each match's
  `scoring.exact_points` / `scoring.result_points` (a quarter-final is worth 15/3, a group
  game 10/2) — the original design hardcoded 5/2.
- **Flags.** The API sends emoji flags (`🇫🇷`), but Windows ships no flag glyphs — Chrome
  renders the regional-indicator pair as two letter boxes. `FlagDisc` therefore derives the
  ISO code from the emoji and paints the real flag from the self-hosted `flag-icons` SVG set,
  which looks identical on every platform. Unknown codes fall back to the design's
  deterministic per-team gradient.
- **Rank chart.** The Rank tab lists every player as a legend chip; tap to toggle that
  player's line on or off (plus "Show all" / "Only me"). The y-axis is fixed to the field
  size so it never rescales as series are toggled.
- **Guests** can browse everything but cannot predict or bet; the UI disables the controls
  and explains why instead of letting the API 403.

## Structure

```
app/
  layout.tsx            # fonts, flag CSS, phone-frame shell, metadata, persistent TabBar
  globals.css           # reset, phone chrome, form fields
  error.tsx             # error boundary
  page.tsx predict/ ranks/ profile/ login/
  match/[id]/           # detail + [id]/results/
  users/[id]/           # any player's public profile
  session/clear/        # Route Handler that expires the session cookies
components/
  Avatar FlagDisc Countdown TabBar BackButton icons ui
  PredictClient MatchDetailClient RanksClient LoginForm
lib/
  api.ts actions.ts types.ts format.ts theme.ts useScores.ts cookie-names.ts
```

## Design source

Ported from `../World Cup Predictor.html` (a bundled Claude Design export whose base64+gzip
manifest was unpacked to recover the original React source, template and mock data).
