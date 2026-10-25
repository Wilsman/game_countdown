import { describe, expect, it } from "bun:test";

import { COUNTDOWN_OVERRIDES_KEY } from "../../../src/lib/countdownOverrides";
import { serializeGameBase } from "../../../src/lib/liveCountdowns";
import { onRequestGet, type CountdownsKv } from "../countdowns";
import { onRequest } from "./countdowns";

const builtIn = {
  version: 1,
  games: [
    {
      id: "tarkov-event",
      title: "Tarkov event ends",
      titleColor: "#ffffff",
      targetDate: "2027-01-01T00:00:00.000Z",
      targetTimezone: "UTC",
      type: "game",
    },
  ],
};

const createKv = () => {
  const values = new Map<string, string>();
  const kv: CountdownsKv = {
    get: async (key) => values.get(key) ?? null,
    put: async (key, value) => {
      values.set(key, value);
    },
  };
  return { kv, values };
};

const createEnv = (kv?: CountdownsKv, password: string | null = "hunter 2!") => ({
  ASSETS: {
    fetch: async () => Response.json(builtIn),
  },
  COUNTDOWNS_KV: kv,
  MOD_PASSWORD: password ?? undefined,
});

const modRequest = (body?: unknown, token = encodeURIComponent("hunter 2!")) =>
  new Request("https://example.com/api/mod/countdowns", {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });

const publicList = async (env: ReturnType<typeof createEnv>) => {
  const response = await onRequestGet({
    request: new Request("https://example.com/api/countdowns"),
    env,
  });
  return (await response.json()) as { games: { id: string; targetDate: string }[] };
};

describe("mod countdowns API", () => {
  it("is disabled until a password and KV are configured", async () => {
    const response = await onRequest({
      request: modRequest(),
      env: createEnv(undefined),
    });
    expect(response.status).toBe(503);

    const noPassword = await onRequest({
      request: modRequest(),
      env: createEnv(createKv().kv, null),
    });
    expect(noPassword.status).toBe(503);
  });

  it("rejects a wrong or missing password", async () => {
    const env = createEnv(createKv().kv);
    expect((await onRequest({ request: modRequest(undefined, "nope"), env })).status).toBe(
      401,
    );
    const anonymous = new Request("https://example.com/api/mod/countdowns");
    expect((await onRequest({ request: anonymous, env })).status).toBe(401);
  });

  it("saves an edit that the public list then serves", async () => {
    const { kv, values } = createKv();
    const env = createEnv(kv);

    const state = await onRequest({ request: modRequest(), env });
    expect(state.status).toBe(200);
    expect(((await state.json()) as { builtIn: unknown[] }).builtIn).toHaveLength(1);

    const moved = new Date("2027-01-01T00:05:00Z");
    const save = await onRequest({
      request: modRequest({
        type: "save",
        isNew: false,
        game: serializeGameBase({
          id: "tarkov-event",
          title: "Tarkov event ends",
          titleColor: "#ffffff",
          targetDate: moved,
          targetTimezone: "UTC",
          type: "game",
        }),
      }),
      env,
    });
    expect(save.status).toBe(200);
    expect(values.has(COUNTDOWN_OVERRIDES_KEY)).toBe(true);

    const list = await publicList(env);
    expect(list.games[0].targetDate).toBe(moved.toISOString());
  });

  it("adds and removes countdowns", async () => {
    const { kv } = createKv();
    const env = createEnv(kv);
    const add = await onRequest({
      request: modRequest({
        type: "save",
        isNew: true,
        game: {
          id: "new-event",
          title: "New event",
          titleColor: "#7ed2eb",
          targetDate: "2027-02-01T18:00:00.000Z",
          targetTimezone: "Europe/London",
          type: "game",
        },
      }),
      env,
    });
    expect(add.status).toBe(200);
    expect((await publicList(env)).games.map((game) => game.id)).toEqual([
      "tarkov-event",
      "new-event",
    ]);

    await onRequest({ request: modRequest({ type: "remove", id: "tarkov-event" }), env });
    expect((await publicList(env)).games.map((game) => game.id)).toEqual(["new-event"]);

    await onRequest({ request: modRequest({ type: "reset", id: "tarkov-event" }), env });
    expect((await publicList(env)).games).toHaveLength(2);
  });

  it("rejects bad requests without touching saved edits", async () => {
    const { kv, values } = createKv();
    const env = createEnv(kv);
    expect((await onRequest({ request: modRequest({ type: "nope" }), env })).status).toBe(
      400,
    );
    expect(
      (await onRequest({ request: modRequest({ type: "remove", id: "missing" }), env }))
        .status,
    ).toBe(404);
    expect(values.size).toBe(0);

    const broken: CountdownsKv = {
      get: async () => {
        throw new Error("KV down");
      },
      put: async () => {
        throw new Error("should not write");
      },
    };
    const failed = await onRequest({
      request: modRequest({ type: "remove", id: "tarkov-event" }),
      env: createEnv(broken),
    });
    expect(failed.status).toBe(502);
    // The public list still serves built-ins when KV is down.
    expect((await publicList(createEnv(broken))).games).toHaveLength(1);
  });
});
