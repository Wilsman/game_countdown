# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start Vite dev server with HMR (hot module reloading)
- `npm run build` - Type-check with `vue-tsc -b` then build production files to `dist/`
- `npm run preview` - Serve the built production app locally

### Type Checking
- `npx vue-tsc --noEmit` - Run type-check only without building

### Testing
- `bun test` - Run all tests using Bun test framework
- `bun test src/stores/__tests__/timer.spec.ts` - Run a single test file
- `bun run scripts/verify-dates.ts` - Run standalone date verification script

### Alternative Package Managers
You can use `pnpm` or `bun` equivalents (e.g., `pnpm dev`, `bun run build`)

## Architecture Overview

This is a Vue 3 countdown timer application for game releases with global timezone support.

### Core Architecture Pattern
- **Vue 3 Composition API** with `<script setup>` syntax
- **Pinia** for centralized state management (single store: `timer.ts`)
- **Type-safe** with TypeScript strict mode enabled
- **Component-driven** UI with single-file components (SFCs)

### State Management Flow
The entire application state flows through `src/stores/timer.ts`:
1. **Game List Management**: Array of game timers with date/timezone info
2. **Active Game Selection**: Tracks which game countdown is currently displayed
3. **Settings**: User preferences (theme, fonts, colors, animations, OBS overlay settings)
4. **URL Parameter Handling**: Generates shareable URLs and reconstructs state from URL params
5. **Time Calculation**: Real-time countdown updates using `date-fns` for date arithmetic

### Key Component Responsibilities
- **App.vue**: Main orchestrator, handles layout modes (normal/focus/OBS), game backgrounds
- **TimerDisplay.vue**: Renders countdown digits, handles animations, timezone conversions
- **GameSelector.vue**: UI for selecting/managing game timers
- **ControlPanel.vue**: Settings and configuration controls
- **OverlayCustomizer.vue**: OBS overlay styling customization interface

### Date/Time Handling Architecture
**CRITICAL**: This app uses a UTC-first approach to ensure all users see the same absolute countdown time regardless of their timezone.

- **Storage**: All game `targetDate` values MUST use ISO 8601 UTC strings: `new Date("YYYY-MM-DDTHH:mm:ssZ")`
- **Display**: Timezone conversions happen at display time only, never in storage
- **Testing**: All date tests verify UTC values using `getUTCMonth()`, `getUTCDate()`, etc.

See TIMEZONE_FIX.md for detailed explanation of why this approach is critical.

## Coding Standards

### TypeScript
- Strict mode is enabled - fix all type errors before committing
- Use type-only imports where possible: `import type { ... }`
- Leverage Vue's type inference with Composition API

### Vue Conventions
- Components: PascalCase filenames (e.g., `TimerDisplay.vue`)
- Props/events: camelCase in code, kebab-case in templates
- Prefer `<script setup>` over Options API
- Composables: `useThing.ts` naming in `hooks/` directory
- Pinia stores: `useThingStore` pattern in `stores/`

### Styling
- **Tailwind CSS** for all styling
- Shared global styles in `src/style.css`
- Use Tailwind's dark mode class strategy (controlled via `settings.theme`)

### Code Organization
- Indentation: 2 spaces
- Group imports: external libraries first, then internal modules
- Keep lines focused and readable

## Date Handling Rules

### CRITICAL: Always Use UTC Time Strings

**❌ NEVER use the Date constructor with positional arguments:**
```typescript
// This creates dates in user's local timezone - WRONG!
new Date(2025, 9, 17, 14, 0, 0)
```

**✅ ALWAYS use ISO 8601 UTC strings:**
```typescript
// This creates dates in UTC - same for all users worldwide
targetDate: new Date("2025-10-17T13:00:00Z")
```

### Why This Matters
Using local timezone constructors causes users in different timezones to see different countdown times for the same absolute moment. For example:
- London user at 2pm BST: sees countdown to "Oct 17, 2:00pm London"
- Seoul user at 2pm KST: sees countdown to "Oct 17, 2:00pm Seoul" (8 hours later!)

With UTC strings, everyone counts down to the exact same moment in time.

### Time Conversion Reference
When converting local release times to UTC:
- **BST (British Summer Time)** = UTC+1: `2pm BST = 13:00 UTC`
- **PST (Pacific Standard Time)** = UTC-8: `midnight PST = 08:00 UTC`
- **PDT (Pacific Daylight Time)** = UTC-7: `6am PDT = 13:00 UTC`

### Adding New Game Timers
1. Add game to `defaultGames` array in `src/stores/timer.ts`
2. Use UTC string format for `targetDate`
3. Add test case in `src/stores/__tests__/timer.spec.ts`
4. Run `bun test` to verify correctness

## Testing Strategy

### Test Framework
- Uses **Bun's built-in test runner** (`bun:test`)
- Tests located in `src/**/__tests__/*.spec.ts` or co-located `*.spec.ts`

### Current Test Coverage
All game timer dates are tested to ensure:
- Correct month (accounting for 0-11 indexing)
- Correct day, year, hour
- Proper ISO string format
- Regional timezone synchronization
- Correct duration calculations between dates

### Running Tests
```bash
bun test                                        # All tests
bun test src/stores/__tests__/timer.spec.ts   # Single file
bun run scripts/verify-dates.ts                # Verification script
```

## URL Parameter System

The app supports shareable URLs with customization params. Key parameters:

### Game Selection
- `game=<id>` - Load specific game by ID
- `date=<ISO-string>` - Override target date
- `timezone=<tz>` - Override timezone
- `title=<name>` - Custom timer title
- `color=<hex>` - Title color (without #)
- `bg=1` - Enable game background

### OBS Overlay Mode
- `obs=1` - Enable OBS overlay mode (transparent, customizable)
- Extensive styling params: `dcolor`, `lcolor`, `dsize`, `lsize`, `tsize`, `gcolor`, etc.

See `handleUrlParams()` in `src/stores/timer.ts` for complete parameter list.

## Build Configuration

### Vite Config (`vite.config.ts`)
- Vue plugin with JSX support enabled
- File watching with polling for cross-platform compatibility
- Standard Vite dev server and build pipeline

### TypeScript Config
- Project references structure (split app/node configs)
- Strict mode enabled
- Separate configs: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`

### Tailwind Config
- Standard PostCSS + Tailwind setup
- Config in `tailwind.config.js` and `postcss.config.js`
- Dark mode via class strategy

## Commit Guidelines

Follow Conventional Commits format observed in project history:
- `feat(scope): add new feature`
- `fix(scope): resolve bug`
- `chore: maintenance tasks`
- `style(Component): UI/styling changes`

### Pull Request Requirements
- Clear description with linked issues (e.g., `Closes #123`)
- Screenshots/GIFs for UI changes (before/after comparison)
- Verify `npm run build` and type-check pass before submitting

## Security Notes

- Do not commit secrets or API keys
- Files in `public/` are served publicly as-is
- Use Vite env vars with `VITE_` prefix in `.env.local` (gitignored)

## Agent-Specific Instructions

- Keep changes minimal and focused; avoid repository-wide reformatting
- Do not alter directory layout or build outputs without discussion
- Update documentation when commands or behaviors change
- Prefer small, well-scoped patches that pass type-check and build
- Always verify date handling uses UTC strings, not local timezone constructors
