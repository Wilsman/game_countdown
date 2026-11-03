import { isValidLoopIntervalMinutes } from "./loopingCountdown";
import { parseGameBase, serializeGameBase } from "./liveCountdowns";
import type { GameBase } from "../types/game";

// Streamer timers published to KV. Anyone with the id can view one; only
// holders of its edit key (the streamer and the mods they give the edit link
// to) can change it. Served by functions/api/timers/.
export const SHARED_TIMERS_API_PATH = "/api/timers";
export const SHARED_TIMER_VERSION = 1;
export const SHARED_TIMER_ID_PREFIX = "shared-";
export const SHARED_TIMER_KV_PREFIX = "timer:";
export const MAX_SHARED_TITLE_LENGTH = 120;
// KV drops a timer this long after it ends (or after its last edit for loops).
export const SHARED_TIMER_RETENTION_DAYS = 30;

const ID_PATTERN = /^shared-[a-z0-9]{12}$/;
const EDIT_KEY_PATTERN = /^[A-Za-z0-9_-]{32}$/;
const COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const KEY_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

export interface SharedTimer extends GameBase {
  loopIntervalMinutes?: number;
}

// What the public GET returns. Never includes the key hash.
export interface SharedTimerPayload {
  version: typeof SHARED_TIMER_VERSION;
  timer: ReturnType<typeof serializeSharedTimer>;
  updatedAt: string;
}

// What is stored in KV under SHARED_TIMER_KV_PREFIX + id.
export interface SharedTimerRecord extends SharedTimerPayload {
  keyHash: string;
  createdAt: string;
}

export const isSharedTimerId = (value: unknown): value is string =>
  typeof value === "string" && ID_PATTERN.test(value);

export const isSharedTimerEditKey = (value: unknown): value is string =>
  typeof value === "string" && EDIT_KEY_PATTERN.test(value);

const randomString = (alphabet: string, length: number): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  // 64 divides 256, so keys are unbiased. Ids have a slight bias, which is
  // fine since they are public anyway.
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
};

export const createSharedTimerId = (): string =>
  `${SHARED_TIMER_ID_PREFIX}${randomString(ALPHABET, 12)}`;

export const createSharedTimerEditKey = (): string =>
  randomString(KEY_ALPHABET, 32);

export async function hashEditKey(key: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(key),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

// Constant-time compare of two equal-length hex digests.
export const hashesMatch = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) {
    difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return difference === 0;
};

export const serializeSharedTimer = (timer: SharedTimer) => ({
  ...serializeGameBase(timer),
  ...(isValidLoopIntervalMinutes(timer.loopIntervalMinutes)
    ? { loopIntervalMinutes: timer.loopIntervalMinutes }
    : {}),
});

export function parseSharedTimer(value: unknown): SharedTimer | null {
  const game = parseGameBase(value);
  if (!game || !isSharedTimerId(game.id)) return null;
  const loop = (value as Record<string, unknown>).loopIntervalMinutes;
  if (loop !== undefined && !isValidLoopIntervalMinutes(loop)) return null;
  return loop === undefined ? game : { ...game, loopIntervalMinutes: loop };
}

export function parseSharedTimerPayload(value: unknown): SharedTimer | null {
  if (!value || typeof value !== "object") return null;
  const payload = value as Record<string, unknown>;
  if (payload.version !== SHARED_TIMER_VERSION) return null;
  return parseSharedTimer(payload.timer);
}

export function parseSharedTimerRecord(value: unknown): SharedTimerRecord | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const timer = parseSharedTimerPayload(record);
  if (
    !timer ||
    typeof record.keyHash !== "string" ||
    typeof record.createdAt !== "string" ||
    typeof record.updatedAt !== "string"
  ) {
    return null;
  }
  return {
    version: SHARED_TIMER_VERSION,
    timer: serializeSharedTimer(timer),
    keyHash: record.keyHash,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

const isValidTimezone = (timezone: string): boolean => {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

// Checks the editable fields. The id comes from the URL, not the body.
export function validateSharedTimerInput(
  id: string,
  value: unknown,
): { ok: true; timer: SharedTimer } | { ok: false; error: string } {
  const timer = parseSharedTimer(
    value && typeof value === "object" ? { ...value, id, type: "game" } : null,
  );
  if (!timer) {
    return { ok: false, error: "Timer is missing fields or has a bad date." };
  }
  const title = timer.title.trim();
  if (!title || title.length > MAX_SHARED_TITLE_LENGTH) {
    return {
      ok: false,
      error: `Title must be 1-${MAX_SHARED_TITLE_LENGTH} characters.`,
    };
  }
  if (!COLOR_PATTERN.test(timer.titleColor)) {
    return { ok: false, error: "Colour must be a hex value like #7ed2eb." };
  }
  if (timer.regionalReleaseTimes?.length) {
    return { ok: false, error: "Shared timers can't have regional times." };
  }
  if (!isValidTimezone(timer.targetTimezone)) {
    return { ok: false, error: "Unknown timezone." };
  }
  return { ok: true, timer: { ...timer, title } };
}

// Absolute expiry (seconds since epoch) for KV.
export const getSharedTimerExpiration = (
  timer: SharedTimer,
  now: Date = new Date(),
): number => {
  const retentionMs = SHARED_TIMER_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const from = timer.loopIntervalMinutes
    ? now.getTime()
    : Math.max(now.getTime(), timer.targetDate.getTime());
  return Math.ceil((from + retentionMs) / 1000);
};

export const sharedTimerApiPath = (id: string): string =>
  `${SHARED_TIMERS_API_PATH}/${encodeURIComponent(id)}`;
