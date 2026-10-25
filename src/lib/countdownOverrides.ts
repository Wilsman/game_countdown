import type { GameBase } from "../types/game";
import {
  parseGameBase,
  serializeGameBase,
  type SerializedGameBase,
} from "./liveCountdowns";

// Edits mods make on the /mod page. Stored as one JSON document in Cloudflare
// KV and merged over the built-in list by functions/api/countdowns.ts.
export const COUNTDOWN_OVERRIDES_KEY = "countdown-overrides";
export const COUNTDOWN_OVERRIDES_VERSION = 1;
export const MOD_COUNTDOWNS_API_PATH = "/api/mod/countdowns";
export const MAX_OVERRIDE_GAMES = 200;
export const MAX_TITLE_LENGTH = 120;

export interface CountdownOverrides {
  version: typeof COUNTDOWN_OVERRIDES_VERSION;
  // Edited built-ins and mod-added countdowns. Replaces any built-in with the
  // same id.
  games: SerializedGameBase[];
  // Hidden ids. Kept so an id is never reused for a different countdown.
  removed: string[];
  updatedAt: string | null;
}

export type ModAction =
  | { type: "save"; game: unknown; isNew: boolean }
  | { type: "remove"; id: string }
  | { type: "reset"; id: string };

export type ModActionResult =
  | { ok: true; overrides: CountdownOverrides }
  | { ok: false; status: 400 | 404 | 409; error: string };

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_ID_LENGTH = 64;
const COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
// Ids the app generates for local timers. Mod ids must not collide with them.
const RESERVED_ID_PREFIXES = ["custom-", "game-"];
const RESERVED_IDS = new Set(["shared-overlay"]);

export const createEmptyOverrides = (): CountdownOverrides => ({
  version: COUNTDOWN_OVERRIDES_VERSION,
  games: [],
  removed: [],
  updatedAt: null,
});

// Never throws: a corrupt document behaves like "no edits".
export function parseCountdownOverrides(value: unknown): CountdownOverrides {
  if (!value || typeof value !== "object") return createEmptyOverrides();
  const doc = value as Record<string, unknown>;
  if (doc.version !== COUNTDOWN_OVERRIDES_VERSION) return createEmptyOverrides();

  const games = Array.isArray(doc.games)
    ? doc.games
        .map(parseGameBase)
        .filter((game): game is GameBase => game !== null)
        .map(serializeGameBase)
    : [];
  const removed = Array.isArray(doc.removed)
    ? doc.removed.filter((id): id is string => typeof id === "string")
    : [];

  return {
    version: COUNTDOWN_OVERRIDES_VERSION,
    games,
    removed,
    updatedAt: typeof doc.updatedAt === "string" ? doc.updatedAt : null,
  };
}

export function applyCountdownOverrides(
  bases: GameBase[],
  overrides: CountdownOverrides,
): GameBase[] {
  const removed = new Set(overrides.removed);
  const edits = new Map<string, GameBase>();
  for (const entry of overrides.games) {
    const game = parseGameBase(entry);
    if (game) edits.set(game.id, game);
  }

  const baseIds = new Set(bases.map((game) => game.id));
  const merged = bases
    .filter((game) => !removed.has(game.id))
    .map((game) => edits.get(game.id) ?? game);
  const added = [...edits.values()].filter(
    (game) => !baseIds.has(game.id) && !removed.has(game.id),
  );

  return [...merged, ...added];
}

export const isValidCountdownId = (id: string): boolean =>
  id.length <= MAX_ID_LENGTH &&
  ID_PATTERN.test(id) &&
  !RESERVED_IDS.has(id) &&
  !RESERVED_ID_PREFIXES.some((prefix) => id.startsWith(prefix));

export const isValidTimezone = (timezone: string): boolean => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

// Suggests a readable id from the title, adding a number if it is taken.
export function createCountdownId(
  title: string,
  takenIds: Iterable<string>,
): string {
  const taken = new Set(takenIds);
  let slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_ID_LENGTH - 4)
    .replace(/-+$/, "");
  if (!slug || !isValidCountdownId(slug)) slug = `event-${slug}`.replace(/-+$/, "");
  if (!isValidCountdownId(slug)) slug = "event";

  if (!taken.has(slug)) return slug;
  for (let suffix = 2; ; suffix += 1) {
    const candidate = `${slug}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
}

export function validateCountdownInput(
  value: unknown,
): { ok: true; game: GameBase } | { ok: false; error: string } {
  const game = parseGameBase(value);
  if (!game) {
    return { ok: false, error: "Countdown is missing fields or has a bad date." };
  }

  const title = game.title.trim();
  if (!isValidCountdownId(game.id)) {
    return {
      ok: false,
      error: "Id must be lowercase letters, numbers and dashes (max 64).",
    };
  }
  if (!title || title.length > MAX_TITLE_LENGTH) {
    return { ok: false, error: `Title must be 1-${MAX_TITLE_LENGTH} characters.` };
  }
  if (!COLOR_PATTERN.test(game.titleColor)) {
    return { ok: false, error: "Colour must be a hex value like #7ed2eb." };
  }
  const timezones = [
    game.targetTimezone,
    ...(game.regionalReleaseTimes ?? []).map((release) => release.timezone),
  ];
  if (!timezones.every(isValidTimezone)) {
    return { ok: false, error: "Unknown timezone." };
  }

  return { ok: true, game: { ...game, title } };
}

// Applies one change from the mod page. Pure, so the Function only has to load
// and store the document.
export function applyModAction(
  overrides: CountdownOverrides,
  baseIds: ReadonlySet<string>,
  action: ModAction,
  now: Date = new Date(),
): ModActionResult {
  const editedIds = new Set(overrides.games.map((game) => game.id));
  const removed = new Set(overrides.removed);
  const finish = (
    games: SerializedGameBase[],
    nextRemoved: Set<string>,
  ): ModActionResult => ({
    ok: true,
    overrides: {
      version: COUNTDOWN_OVERRIDES_VERSION,
      games,
      removed: [...nextRemoved],
      updatedAt: now.toISOString(),
    },
  });

  switch (action.type) {
    case "save": {
      const result = validateCountdownInput(action.game);
      if (!result.ok) return { ok: false, status: 400, error: result.error };
      const { id } = result.game;
      const exists = (baseIds.has(id) || editedIds.has(id)) && !removed.has(id);

      if (action.isNew && (exists || removed.has(id))) {
        return { ok: false, status: 409, error: `The id "${id}" is already used.` };
      }
      if (!action.isNew && !exists) {
        return { ok: false, status: 404, error: `No countdown with id "${id}".` };
      }
      if (action.isNew && overrides.games.length >= MAX_OVERRIDE_GAMES) {
        return { ok: false, status: 409, error: "Too many mod countdowns. Remove some first." };
      }

      const serialized = serializeGameBase(result.game);
      const games = editedIds.has(id)
        ? overrides.games.map((game) => (game.id === id ? serialized : game))
        : [...overrides.games, serialized];
      return finish(games, removed);
    }

    case "remove": {
      const exists =
        (baseIds.has(action.id) || editedIds.has(action.id)) &&
        !removed.has(action.id);
      if (!exists) {
        return { ok: false, status: 404, error: `No countdown with id "${action.id}".` };
      }
      return finish(
        overrides.games.filter((game) => game.id !== action.id),
        new Set([...removed, action.id]),
      );
    }

    // Undoes edits to a built-in and un-hides it.
    case "reset": {
      if (!baseIds.has(action.id)) {
        return { ok: false, status: 404, error: "Only built-in countdowns can be reset." };
      }
      const nextRemoved = new Set(removed);
      nextRemoved.delete(action.id);
      return finish(
        overrides.games.filter((game) => game.id !== action.id),
        nextRemoved,
      );
    }
  }
}

export function parseModAction(value: unknown): ModAction | null {
  if (!value || typeof value !== "object") return null;
  const action = value as Record<string, unknown>;

  if (action.type === "save" && typeof action.isNew === "boolean") {
    return { type: "save", game: action.game, isNew: action.isNew };
  }
  if (
    (action.type === "remove" || action.type === "reset") &&
    typeof action.id === "string"
  ) {
    return { type: action.type, id: action.id };
  }
  return null;
}
