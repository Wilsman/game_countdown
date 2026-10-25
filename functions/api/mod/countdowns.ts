import {
  applyModAction,
  COUNTDOWN_OVERRIDES_KEY,
  parseModAction,
  type CountdownOverrides,
} from "../../../src/lib/countdownOverrides";
import { serializeDefaultGames } from "../../../src/lib/liveCountdowns";
import type { GameBase } from "../../../src/types/game";
import {
  jsonResponse,
  loadBuiltInCountdowns,
  loadOverrides,
  type CountdownsEnv,
} from "../countdowns";

interface Env extends CountdownsEnv {
  MOD_PASSWORD?: string;
}

const MAX_BODY_LENGTH = 32_000;

const sha256 = async (text: string): Promise<Uint8Array> =>
  new Uint8Array(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)),
  );

// The mod page sends `Bearer <encodeURIComponent(password)>` because header
// values must be ASCII. Hashing first makes the comparison constant-length.
export async function isAuthorized(
  request: Request,
  password: string,
): Promise<boolean> {
  const match = (request.headers.get("Authorization") ?? "").match(
    /^Bearer (.+)$/,
  );
  if (!match) return false;

  const [given, expected] = await Promise.all([
    sha256(match[1]),
    sha256(encodeURIComponent(password)),
  ]);
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= given[index] ^ expected[index];
  }
  return difference === 0;
}

const stateResponse = (bases: GameBase[], overrides: CountdownOverrides) =>
  jsonResponse({
    builtIn: serializeDefaultGames(bases).games,
    overrides,
  });

// GET returns the built-in list and current edits. POST applies one change.
export async function onRequest(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;
  if (request.method !== "GET" && request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const kv = env.COUNTDOWNS_KV;
  if (!env.MOD_PASSWORD || !kv) {
    return jsonResponse(
      { error: "Mod editing is not set up. Add MOD_PASSWORD and the COUNTDOWNS_KV binding." },
      503,
    );
  }
  if (!(await isAuthorized(request, env.MOD_PASSWORD))) {
    return jsonResponse({ error: "Wrong password" }, 401);
  }

  const bases = await loadBuiltInCountdowns(request, env);
  if (!bases) return jsonResponse({ error: "Built-in countdowns unavailable" }, 502);

  let overrides: CountdownOverrides;
  try {
    overrides = await loadOverrides(kv);
  } catch {
    return jsonResponse({ error: "Could not read saved edits. Try again." }, 502);
  }

  if (request.method === "GET") return stateResponse(bases, overrides);

  const body = await request.text();
  if (body.length > MAX_BODY_LENGTH) {
    return jsonResponse({ error: "Request too large" }, 413);
  }
  let action;
  try {
    action = parseModAction(JSON.parse(body));
  } catch {
    action = null;
  }
  if (!action) return jsonResponse({ error: "Bad request" }, 400);

  const result = applyModAction(
    overrides,
    new Set(bases.map((game) => game.id)),
    action,
  );
  if (!result.ok) return jsonResponse({ error: result.error }, result.status);

  await kv.put(COUNTDOWN_OVERRIDES_KEY, JSON.stringify(result.overrides));
  return stateResponse(bases, result.overrides);
}
