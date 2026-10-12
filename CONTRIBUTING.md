# Contributing

Thanks for helping out. This is a small project, so the process is
deliberately light.

## Workflow

1. Open an issue first if the change is bigger than a countdown update or a
   small fix, so we can agree on the approach.
2. Fork the repo, or create a branch if you have write access. Branch off
   `main` and use a short descriptive name such as `feat/looping-presets` or
   `countdown/gta-6-time`.
3. Make one focused change per pull request.
4. Run `npm run check` (tests + type-check + build) before pushing. CI runs the
   same command on every PR.
5. Open a PR against `main` and fill in the template. Include before/after
   screenshots for UI changes. Cloudflare Pages posts a preview link you can use.

PRs are squash-merged, so the PR title becomes the commit message on `main`.

## Commit and PR titles

Use [Conventional Commits](https://www.conventionalcommits.org):

```text
feat(countdowns): add Marathon season 4 launch
fix(TimerDisplay): keep seconds aligned at small sizes
docs: explain overlay params
chore(deps): bump vite
```

Common scopes are `countdowns`, a component name, `store`, `igdb`,
`functions` and `deps`.

## Updating countdowns

The most common contribution. See
[Adding or updating a countdown](README.md#adding-or-updating-a-countdown).
Please link the source for the date and time (a publisher post, store page or
official social account) in the PR description.

## Using AI coding agents

AI coding agents are welcome. Some ground rules:

- Agents read [AGENTS.md](AGENTS.md) (Claude Code reads it through `CLAUDE.md`).
  If an agent keeps making the same mistake, fix it in `AGENTS.md` as part
  of your PR.
- You are responsible for what you submit. Read the diff, run
  `npm run check`, and check the UI yourself for visual changes.
- Keep agent output focused. Avoid unrelated reformatting, drive-by refactors
  and new dependencies the change doesn't need.
- Don't commit agent scratch files or plans, and don't add new top-level
  markdown files.

## Code style

- Vue 3 `<script setup>` with TypeScript strict mode. Tailwind for styling.
- 2-space indentation, LF line endings (see `.editorconfig`).
- Put logic that doesn't need Vue in `src/lib/` and test it there.
- UI follows [DESIGN.md](DESIGN.md) and [docs/uncodixfy.md](docs/uncodixfy.md).
  Keep it plain and functional.

## Reporting bugs

Open an issue using the bug template. Include the page URL (share links
contain the full timer state), your browser and your timezone.
