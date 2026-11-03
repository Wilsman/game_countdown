import {
  getSharedTimerExpiration,
  hashEditKey,
  hashesMatch,
  isSharedTimerEditKey,
  parseSharedTimerRecord,
  serializeSharedTimer,
  SHARED_TIMER_KV_PREFIX,
  SHARED_TIMER_VERSION,
  type SharedTimer,
  type SharedTimerRecord,
} from "../../../src/lib/sharedTimers";

// The subset of a Cloudflare KV namespace shared timers use.
export interface SharedTimersKv {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expiration?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface SharedTimersEnv {
  COUNTDOWNS_KV?: SharedTimersKv;
}

export const MAX_BODY_LENGTH = 4_000;

export const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

export const notConfigured = () =>
  jsonResponse({ error: "Shared timers are not set up. Add the COUNTDOWNS_KV binding." }, 503);

export const timerKey = (id: string) => `${SHARED_TIMER_KV_PREFIX}${id}`;

export async function loadRecord(
  kv: SharedTimersKv,
  id: string,
): Promise<SharedTimerRecord | null> {
  const raw = await kv.get(timerKey(id));
  if (!raw) return null;
  try {
    return parseSharedTimerRecord(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function saveRecord(
  kv: SharedTimersKv,
  timer: SharedTimer,
  keyHash: string,
  createdAt: string,
  now: Date = new Date(),
): Promise<SharedTimerRecord> {
  const record: SharedTimerRecord = {
    version: SHARED_TIMER_VERSION,
    timer: serializeSharedTimer(timer),
    keyHash,
    createdAt,
    updatedAt: now.toISOString(),
  };
  await kv.put(timerKey(timer.id), JSON.stringify(record), {
    expiration: getSharedTimerExpiration(timer, now),
  });
  return record;
}

export const publicPayload = (record: SharedTimerRecord) => ({
  version: record.version,
  timer: record.timer,
  updatedAt: record.updatedAt,
});

// Edit links carry the raw key; requests send it as `Bearer <key>`.
export async function hasEditKey(
  request: Request,
  record: SharedTimerRecord,
): Promise<boolean> {
  const match = (request.headers.get("Authorization") ?? "").match(/^Bearer (.+)$/);
  if (!match || !isSharedTimerEditKey(match[1])) return false;
  return hashesMatch(await hashEditKey(match[1]), record.keyHash);
}

export async function readJsonBody(request: Request): Promise<unknown> {
  const body = await request.text();
  if (body.length > MAX_BODY_LENGTH) return undefined;
  try {
    return JSON.parse(body);
  } catch {
    return undefined;
  }
}
