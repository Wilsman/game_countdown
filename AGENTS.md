# AGENTS.md

Instructions for AI coding agents working in this repo. Humans should start
with [README.md](README.md) and [CONTRIBUTING.md](CONTRIBUTING.md).

## Project

A Vue 3 + TypeScript single-page app of game release countdowns, deployed on
Cloudflare Pages with Pages Functions. There is no backend besides `functions/`.

## Commands

- Install: `npm install`. npm is the only package manager. Don't commit
  `bun.lock`, `pnpm-lock.yaml` or `yarn.lock`.
- Dev server: `npm run dev` (port 5173).
- Tests: `npm test`, which runs `bun test`. Run a single file with
  `bun test src/lib/__tests__/timezones.spec.ts`. Tests import from `bun:test`.
- Type-check: `npm run typecheck`.
- Before finishing: `npm run check` (tests + type-check + build). This is what
  CI runs, and it must pass.

## Layout

- `src/data/default-games.ts`: the built-in countdown list. Most changes land here.
- `src/stores/timer.ts`: Pinia store for the active timer, custom timers
  (localStorage) and URL/share-link state.
- `src/lib/`: framework-free logic (`timezones`, `loopingCountdown`,
  `liveCountdowns`, `igdb`). Put new pure logic here, with tests in
  `src/lib/__tests__/`.
- `src/components/`: Vue SFCs with PascalCase filenames. `src/hooks/`: `use*.ts` composables.
- `functions/`: Cloudflare Pages Functions. `index.ts` rewrites OG tags for
  share links, `api/og.ts` renders the OG image, and `api/igdb/releases.ts`
  proxies IGDB. `api/countdowns.ts` serves the built-in list with mod edits
  from KV merged in, and `api/mod/countdowns.ts` is the password-protected
  mod API. `vite.config.ts` mounts these handlers in dev and emits
  `/countdowns.json` at build time.
- `mod.html`, `src/mod.ts`, `src/ModApp.vue`: the mod page. Override logic
  lives in `src/lib/countdownOverrides.ts`.
- Generated files (do not edit or commit): `dist/`, `*.tsbuildinfo`,
  `vite.config.d.ts`, `functions/**/*.d.ts`.

## Rules that are easy to get wrong

- **Time is UTC.** Store absolute instants as `new Date("YYYY-MM-DDTHH:mm:ssZ")`.
  Never use `new Date(year, monthIndex, ...)`, because it uses the viewer's
  local timezone and different users would see different countdowns. Convert
  local wall-clock input and format display with `src/lib/timezones.ts`, which
  handles DST.
- **Countdown ids are public API.** Share and OBS links reference `game=<id>`.
  Don't rename or reuse ids. Remove an entry only once its event has passed.
  Mods can add ids through KV, so check the mod page before adding a built-in
  with a new id.
- **No launch hour announced:** use `T00:00:00Z`, `targetTimezone: "UTC"`
  and a `// time not announced` comment. Otherwise comment the announced local
  time.
- **URL params are user input.** Validate them with type guards in the store,
  and escape anything a Function writes into HTML.
- **Secrets** (`TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `MOD_PASSWORD`) are only read
  server-side in `functions/` or the Vite dev middleware. Never import them into
  `src/`, and never use a `VITE_` prefix for them.
- `LIVE_COUNTDOWNS_PATH` in `src/lib/liveCountdowns.ts` must match the
  filename in `vite.config.ts`.

## Style

- `<script setup lang="ts">` with the Composition API. Strict TypeScript. Avoid `any` in new code.
- 2-space indent. Imports go external first, then internal, using `import type`
  where possible.
- Tailwind for styling, with shared styles in `src/style.css`. UI must follow
  [DESIGN.md](DESIGN.md) and [docs/uncodixfy.md](docs/uncodixfy.md): plain,
  functional, no decorative gradients or gimmicks.
- Match the surrounding code's naming and comment density.

## Scope and git

- Keep changes minimal and focused. No repo-wide reformatting, no unrequested
  refactors, no new dependencies unless the task needs them.
- Fix type errors your change causes. Report unrelated failures instead of
  expanding scope.
- Don't add summary or notes markdown files. Update README.md or this file when
  commands or behaviour change.
- Use Conventional Commits, e.g. `feat(countdowns): add X release`. Branch off
  `main`. Don't push to `main` directly.
- PRs: fill in `.github/pull_request_template.md`, link issues (`Closes #123`)
  and attach screenshots for UI changes.
