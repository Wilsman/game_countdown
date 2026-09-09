# Repository Guidelines

## Project Structure & Module Organization

- `src/` – application code.
  - `components/` (Vue SFCs, PascalCase filenames), `stores/` (Pinia, e.g., `timer.ts`), `hooks/` (composables, `use*.ts`), `lib/`, `types/`, `assets/`, `App.vue`, `main.ts`, `style.css`.
- `public/` – static files served as-is.
- `scripts/` – local utilities and one-off tasks.
- `dist/` – production build output (generated).
- Root: `index.html`, Vite/Tailwind/TS configs.

## Build, Test, and Development Commands

- `npm run dev` – start Vite dev server with HMR.
- `npm run build` – type-check (`vue-tsc -b`) then build to `dist/`.
- `npm run preview` – serve the built app locally.
- Type-check only: `npx vue-tsc --noEmit`.
- You may use `pnpm`/`bun` equivalents (e.g., `pnpm dev`, `bun run build`).

## Coding Style & Naming Conventions

- TypeScript strict mode is enabled. Fix type errors caused by the requested change; report unrelated failures without expanding scope.
- Indentation: 2 spaces; keep lines focused and readable.
- Vue 3 + `<script setup>` and Composition API preferred.
- Components: PascalCase filenames (e.g., `TimerDisplay.vue`); props/events camelCase in code, kebab-case in templates.
- Composables in `hooks/`: `useThing.ts` naming; Pinia stores: `useThingStore` in `stores/`.
- Styling: Tailwind CSS; shared styles in `src/style.css`.
- Imports: Group external libs first, then internal modules; use type-only imports when possible.

## Testing Guidelines

- Tests use Bun test framework (`bun:test`).
- Run single test: `bun test src/stores/__tests__/timer.spec.ts`
- Run all tests: `bun test`
- Location: `src/**/__tests__/*.spec.ts` or co-located `*.spec.ts`.

## Error Handling & Validation

- Store absolute instants consistently in UTC. Use `src/lib/timezones.ts` for local release-time interpretation and display; preserve timezone and DST semantics.
- Validate stored absolute release instants as ISO 8601 UTC values; convert local date/time input with the existing timezone helpers.
- Use type guards for runtime type checking in stores and components

## Commit & Pull Request Guidelines

- Follow Conventional Commits (seen in history): `feat(scope): summary`, `chore: …`, `style(Component): …`.
- Commit messages: short imperative subject; additional detail in body if needed.
- PRs must include:
  - Clear description, linked issues (e.g., `Closes #123`).
  - Screenshots/GIFs for UI changes (before/after).
  - Run `npm run build` when a build is warranted; it already performs type checking. For a narrower check, use the relevant Bun tests or type checker without duplicating a successful build check.

## Security & Configuration Tips

- Do not commit secrets. Anything in `public/` is publicly served.
- Use Vite env vars with `VITE_` prefix in `.env.local` (gitignored).

## Agent-Specific Instructions

- Keep changes minimal and focused; avoid repo-wide reformatting.
- Preserve the existing directory layout unless the task requires a change. Do not hand-edit generated build outputs; producing them with the documented build is expected. Commit outputs only if the established workflow requires it.
- Update docs when commands/behaviors change.
- Complete the requested change and relevant verification with a small, focused patch; continue authorized reversible work without repeated approval.
