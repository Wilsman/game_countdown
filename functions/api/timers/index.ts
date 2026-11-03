import {
  createSharedTimerEditKey,
  createSharedTimerId,
  hashEditKey,
  validateSharedTimerInput,
} from "../../../src/lib/sharedTimers";
import {
  jsonResponse,
  notConfigured,
  publicPayload,
  readJsonBody,
  saveRecord,
  timerKey,
  type SharedTimersEnv,
} from "./shared";

// POST creates a shared timer and returns its id and edit key. The key is only
// ever returned here; the server keeps a hash of it.
export async function onRequestPost(context: {
  request: Request;
  env: SharedTimersEnv;
}): Promise<Response> {
  const { request, env } = context;
  const kv = env.COUNTDOWNS_KV;
  if (!kv) return notConfigured();

  const body = await readJsonBody(request);
  if (body === undefined) return jsonResponse({ error: "Bad request" }, 400);

  // Pick an unused id. A collision is very unlikely, so a few tries suffice.
  let id = createSharedTimerId();
  for (let attempt = 0; attempt < 3 && (await kv.get(timerKey(id))); attempt += 1) {
    id = createSharedTimerId();
  }

  const result = validateSharedTimerInput(id, body);
  if (!result.ok) return jsonResponse({ error: result.error }, 400);

  const editKey = createSharedTimerEditKey();
  const now = new Date();
  const record = await saveRecord(
    kv,
    result.timer,
    await hashEditKey(editKey),
    now.toISOString(),
    now,
  );
  return jsonResponse({ ...publicPayload(record), editKey }, 201);
}
