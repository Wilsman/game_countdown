import {
  isSharedTimerId,
  validateSharedTimerInput,
} from "../../../src/lib/sharedTimers";
import {
  hasEditKey,
  jsonResponse,
  loadRecord,
  notConfigured,
  publicPayload,
  readJsonBody,
  saveRecord,
  timerKey,
  type SharedTimersEnv,
} from "./shared";

// GET is public (viewers and OBS overlays poll it). PUT and DELETE need the
// timer's edit key.
export async function onRequest(context: {
  request: Request;
  env: SharedTimersEnv;
  params: { id?: string | string[] };
}): Promise<Response> {
  const { request, env, params } = context;
  if (!["GET", "PUT", "DELETE"].includes(request.method)) {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const kv = env.COUNTDOWNS_KV;
  if (!kv) return notConfigured();

  const id = params.id;
  if (!isSharedTimerId(id)) return jsonResponse({ error: "Not found" }, 404);

  let record;
  try {
    record = await loadRecord(kv, id);
  } catch {
    return jsonResponse({ error: "Could not read the timer. Try again." }, 502);
  }
  if (!record) return jsonResponse({ error: "Not found" }, 404);

  if (request.method === "GET") return jsonResponse(publicPayload(record));

  if (!(await hasEditKey(request, record))) {
    return jsonResponse({ error: "This edit link is not valid for this timer." }, 401);
  }

  if (request.method === "DELETE") {
    await kv.delete(timerKey(id));
    return new Response(null, { status: 204 });
  }

  const body = await readJsonBody(request);
  if (body === undefined) return jsonResponse({ error: "Bad request" }, 400);
  const result = validateSharedTimerInput(id, body);
  if (!result.ok) return jsonResponse({ error: result.error }, 400);

  const saved = await saveRecord(kv, result.timer, record.keyHash, record.createdAt);
  return jsonResponse(publicPayload(saved));
}
