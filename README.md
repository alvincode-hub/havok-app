# HavokApp

Expo / React Native client for the `server` folder API.

This README reflects the current codebase on 2026-05-20.

## Implemented app surface

The app currently ships these routes:

| Route | Screen | Purpose |
|---|---|---|
| `/` | Splash then tabs | App bootstrap |
| `/(tabs)` | Tabs layout | Main navigation |
| `/(tabs)/index` | Accueil | News, live event, upcoming events, recent Havok results |
| `/(tabs)/calendrier` | Tournois | Calendar view of tournament windows |
| `/(tabs)/players` | Joueurs | Tracked player directory |
| `/(tabs)/settings` | Reglages | Theme preference |
| `/window/[windowId]` | Tournament detail | Detail, cast, prizes, points, leaderboard pages |
| `/player/[playerId]` | Player detail | Profile metrics and recent tournaments |

## What each screen uses

### Accueil

Calls `GET /api/home` and displays:

- `actu` cards with expandable content and optional external links
- `liveTournament`
- first 3 `upcomingTournaments`
- latest tracked player placements from `lastPlayedWindow`

### Tournois

Calls `GET /api/tournaments/calendrier` and renders a month/day tournament calendar.

### Tournament detail

Loads in parallel:

- `GET /api/tournaments/window`
- `GET /api/tournaments/allWindow`
- `GET /api/tournaments/results?page=0`
- `GET /api/tournaments/results?page=0&cumulatif=1`

Implemented features:

- hero image and key facts
- expandable description
- expandable cast section with Twitch / YouTube links
- window-to-window navigation within the same event group
- prizes section
- score rules section
- leaderboard section with:
  - normal / cumulative switch when cumulative data exists
  - page navigation
  - tracked Havok players merge with `qualStatus`

### Joueurs

Calls `GET /api/players` and displays the tracked roster.

### Player detail

Calls `GET /api/player?playerId=...` and displays:

- player card
- quick metrics
- recent tournaments with navigation back to tournament detail

### Reglages

Lets the user switch between:

- `system`
- `dark`
- `light`

Theme preference is stored locally.

## Backend integration

All business requests go through `src/api/client.ts`.

### Security flow

For protected routes, the app:

1. sends `x-app-key`
2. bootstraps a short session with:
   - `POST /api/app/challenge`
   - `POST /api/app/session`
3. reuses `Authorization: Bearer <accessToken>`

Behavior implemented in the client:

- session storage in secure/local storage helpers
- automatic session reuse until close to expiry
- one automatic session reset + retry after a `401`

### Public route

`GET /api/health` is the only route called without `x-app-key`.

## Environment variables

Start from [HavokApp/.env.example](./.env.example).

Recommended local setup:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_API_KEY=replace-with-your-app-api-key
EXPO_PUBLIC_APP_ATTESTATION_MODE=development
EXPO_PUBLIC_DEBUG_API=true
```

You can use `.env` or `.env.local`.

Network notes:

- web local: `http://localhost:3000`
- Android emulator: usually `http://10.0.2.2:3000`
- iOS simulator: `http://127.0.0.1:3000` usually works
- physical device: use a LAN IP or a real HTTPS URL

Production safeguard already implemented:

- a non-dev build rejects `localhost` as `EXPO_PUBLIC_API_BASE_URL`

## Runtime notes

- the app shows a startup splash after the native splash
- runtime network config is logged at launch
- API debug logs use the `HavokDebug` prefix

## Commands

Install:

```bash
npm install
```

Run Expo:

```bash
npm start
```

Targets:

```bash
npm run web
npm run android
npm run ios
```

Checks:

```bash
npm run lint
npm run typecheck
```

## Verification status

Verified on 2026-05-20:

- `npm run lint` passes
- `npm run typecheck` passes

## Known limitation

The app currently supports `development` attestation for local/dev/preprod flows. Native production attestation for Apple / Google is still not implemented in this repo.
