import {
  applyCountdownOverrides,
  COUNTDOWN_OVERRIDES_KEY,
  createEmptyOverrides,
  parseCountdownOverrides,
  type CountdownOverrides,
} from "../../src/lib/countdownOverrides";
import {
  LIVE_COUNTDOWNS_PATH,
  parseLiveCountdowns,
  serializeDefaultGames,
} from "../../src/lib/liveCountdowns";
import type { GameBase } from "../../src/types/game";

// The subset of a Cloudflare KV namespace these Functions use.
export interface CountdownsKv {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

export interface CountdownsEnv {
  ASSETS: {
    fetch(input: RequestInfo | URL): Promise<Response>;
  };
  COUNTDOWNS_KV?: CountdownsKv;
}

export const jsonResponse = (
  body: unknown,
  status = 200,
  cacheControl = "no-store",
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cacheControl,
    },
  });

// Built-in countdowns from the static /countdowns.json emitted at build time.
export async function loadBuiltInCountdowns(
  request: Request,
  env: CountdownsEnv,
): Promise<GameBase[] | null> {
  try {
    const response = await env.ASSETS.fetch(
      new URL(LIVE_COUNTDOWNS_PATH, request.url),
    );
    if (!response.ok) return null;
    return parseLiveCountdowns(await response.json());
  } catch {
    return null;
  }
}

// Throws when KV is unreachable so writers never overwrite edits they could
// not read.
export async function loadOverrides(
  kv: CountdownsKv,
): Promise<CountdownOverrides> {
  const raw = await kv.get(COUNTDOWN_OVERRIDES_KEY);
  if (!raw) return createEmptyOverrides();
  try {
    return parseCountdownOverrides(JSON.parse(raw));
  } catch {
    return createEmptyOverrides();
  }
}

// Public list polled by the app and OBS overlays: built-ins plus mod edits.
export async function onRequestGet(context: {
  request: Request;
  env: CountdownsEnv;
}): Promise<Response> {
  const { request, env } = context;
  const bases = await loadBuiltInCountdowns(request, env);
  if (!bases) return jsonResponse({ error: "Countdowns unavailable" }, 502);

  let overrides = createEmptyOverrides();
  if (env.COUNTDOWNS_KV) {
    try {
      overrides = await loadOverrides(env.COUNTDOWNS_KV);
    } catch {
      // KV hiccup: serve the built-in list rather than nothing.
    }
  }

  return jsonResponse(
    serializeDefaultGames(applyCountdownOverrides(bases, overrides)),
    200,
    "no-cache",
  );
}
