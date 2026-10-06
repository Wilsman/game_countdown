import type { GameBase, RegionalReleaseTime } from "../types/game";

// Built-in countdowns are published as a static JSON file so pages that stay
// open (OBS browser sources, tabs nobody refreshes) can pick up edits without
// reloading the app bundle.
export const LIVE_COUNTDOWNS_PATH = "/countdowns.json";
export const LIVE_COUNTDOWNS_VERSION = 1;

interface SerializedRegionalReleaseTime {
  id: string;
  label: string;
  timezone: string;
  date: string;
}

interface SerializedGameBase {
  id: string;
  title: string;
  titleColor: string;
  targetDate: string;
  targetTimezone: string;
  type: "game";
  regionalReleaseTimes?: SerializedRegionalReleaseTime[];
}

export interface LiveCountdownsPayload {
  version: typeof LIVE_COUNTDOWNS_VERSION;
  games: SerializedGameBase[];
}

const ISO_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

const parseIsoUtc = (value: unknown): Date | null => {
  if (typeof value !== "string" || !ISO_UTC_PATTERN.test(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

// Utility timers are relative to "now", so only absolute game countdowns are
// published.
export function serializeDefaultGames(bases: GameBase[]): LiveCountdownsPayload {
  return {
    version: LIVE_COUNTDOWNS_VERSION,
    games: bases
      .filter((game) => game.type === "game")
      .map((game) => ({
        id: game.id,
        title: game.title,
        titleColor: game.titleColor,
        targetDate: game.targetDate.toISOString(),
        targetTimezone: game.targetTimezone,
        type: "game" as const,
        ...(game.regionalReleaseTimes?.length
          ? {
              regionalReleaseTimes: game.regionalReleaseTimes.map(
                (regionalRelease) => ({
                  ...regionalRelease,
                  date: regionalRelease.date.toISOString(),
                }),
              ),
            }
          : {}),
      })),
  };
}

const parseRegionalReleaseTimes = (
  value: unknown,
): RegionalReleaseTime[] | null => {
  if (!Array.isArray(value)) return null;

  const parsed: RegionalReleaseTime[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") return null;
    const candidate = entry as Record<string, unknown>;
    const date = parseIsoUtc(candidate.date);
    if (
      !isNonEmptyString(candidate.id) ||
      typeof candidate.label !== "string" ||
      !isNonEmptyString(candidate.timezone) ||
      !date
    ) {
      return null;
    }
    parsed.push({
      id: candidate.id,
      label: candidate.label,
      timezone: candidate.timezone,
      date,
    });
  }
  return parsed;
};

const parseGameBase = (value: unknown): GameBase | null => {
  if (!value || typeof value !== "object") return null;
  const game = value as Record<string, unknown>;
  const targetDate = parseIsoUtc(game.targetDate);

  if (
    !isNonEmptyString(game.id) ||
    typeof game.title !== "string" ||
    typeof game.titleColor !== "string" ||
    !isNonEmptyString(game.targetTimezone) ||
    game.type !== "game" ||
    !targetDate
  ) {
    return null;
  }

  let regionalReleaseTimes: RegionalReleaseTime[] | undefined;
  if (game.regionalReleaseTimes !== undefined) {
    const parsed = parseRegionalReleaseTimes(game.regionalReleaseTimes);
    if (!parsed) return null;
    regionalReleaseTimes = parsed;
  }

  return {
    id: game.id,
    title: game.title,
    titleColor: game.titleColor,
    targetDate,
    targetTimezone: game.targetTimezone,
    type: "game",
    ...(regionalReleaseTimes ? { regionalReleaseTimes } : {}),
  };
};

// Returns null for anything unexpected so a bad deploy never wipes the list.
export function parseLiveCountdowns(value: unknown): GameBase[] | null {
  if (!value || typeof value !== "object") return null;
  const payload = value as Record<string, unknown>;
  if (payload.version !== LIVE_COUNTDOWNS_VERSION) return null;
  if (!Array.isArray(payload.games)) return null;

  const games: GameBase[] = [];
  for (const entry of payload.games) {
    const game = parseGameBase(entry);
    if (game) games.push(game);
  }
  return games;
}

// Stable fingerprint used to tell whether a published countdown changed.
export function getGameBaseSignature(game: GameBase): string {
  return JSON.stringify([
    game.title,
    game.titleColor,
    game.targetDate.toISOString(),
    game.targetTimezone,
    game.regionalReleaseTimes?.map((regionalRelease) => [
      regionalRelease.id,
      regionalRelease.label,
      regionalRelease.timezone,
      regionalRelease.date.toISOString(),
    ]) ?? null,
  ]);
}
