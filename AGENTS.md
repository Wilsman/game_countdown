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

- TypeScript strict mode enabled; fix all type errors before PR.
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

- Always handle Date objects with UTC methods for timezone consistency
- Validate game release dates using ISO 8601 format (`YYYY-MM-DDTHH:mm:ssZ`)
- Use type guards for runtime type checking in stores and components

## Commit & Pull Request Guidelines

- Follow Conventional Commits (seen in history): `feat(scope): summary`, `chore: …`, `style(Component): …`.
- Commit messages: short imperative subject; additional detail in body if needed.
- PRs must include:
  - Clear description, linked issues (e.g., `Closes #123`).
  - Screenshots/GIFs for UI changes (before/after).
  - Check that `npm run build` and type-check pass.

## Security & Configuration Tips

- Do not commit secrets. Anything in `public/` is publicly served.
- Use Vite env vars with `VITE_` prefix in `.env.local` (gitignored).

## Agent-Specific Instructions

- Keep changes minimal and focused; avoid repo-wide reformatting.
- Do not alter directory layout or build outputs without discussion.
- Update docs when commands/behaviors change.
- Prefer small, well-scoped patches that pass type-check and build.
