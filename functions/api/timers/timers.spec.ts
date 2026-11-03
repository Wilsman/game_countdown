import { describe, expect, it } from "bun:test";

import { onRequest } from "./[id]";
import { onRequestPost } from "./index";
import type { SharedTimersKv } from "./shared";

const createKv = () => {
  const values = new Map<string, string>();
  const expirations = new Map<string, number | undefined>();
  const kv: SharedTimersKv = {
    get: async (key) => values.get(key) ?? null,
    put: async (key, value, options) => {
      values.set(key, value);
      expirations.set(key, options?.expiration);
    },
    delete: async (key) => {
      values.delete(key);
    },
  };
  return { kv, values, expirations };
};

const timer = {
  title: "Subathon ends",
  titleColor: "#ffffff",
  targetDate: "2027-01-01T00:00:00.000Z",
  targetTimezone: "UTC",
};

const create = async (kv: SharedTimersKv, body: unknown = timer) =>
  onRequestPost({
    request: new Request("https://example.com/api/timers", {
      method: "POST",
      body: JSON.stringify(body),
    }),
    env: { COUNTDOWNS_KV: kv },
  });

const call = (
  kv: SharedTimersKv,
  id: string,
  method = "GET",
  key?: string,
  body?: unknown,
) =>
  onRequest({
    request: new Request(`https://example.com/api/timers/${id}`, {
      method,
      headers: key ? { Authorization: `Bearer ${key}` } : {},
      body: body ? JSON.stringify(body) : undefined,
    }),
    env: { COUNTDOWNS_KV: kv },
    params: { id },
  });

describe("shared timers API", () => {
  it("is disabled without KV", async () => {
    const response = await onRequestPost({
      request: new Request("https://example.com/api/timers", {
        method: "POST",
        body: JSON.stringify(timer),
      }),
      env: {},
    });
    expect(response.status).toBe(503);
  });

  it("creates a timer anyone can read but only the key holder can edit", async () => {
    const { kv, values, expirations } = createKv();
    const created = await create(kv);
    expect(created.status).toBe(201);
    const { timer: saved, editKey } = (await created.json()) as {
      timer: { id: string; title: string };
      editKey: string;
    };

    // The raw key is never stored.
    const stored = values.get(`timer:${saved.id}`) ?? "";
    expect(stored).not.toContain(editKey);
    expect(expirations.get(`timer:${saved.id}`)).toBeGreaterThan(
      Date.parse(timer.targetDate) / 1000,
    );

    const publicRead = await call(kv, saved.id);
    const publicBody = await publicRead.json();
    expect(publicBody.timer.title).toBe("Subathon ends");
    expect(JSON.stringify(publicBody)).not.toContain("keyHash");

    const update = { ...timer, title: "Subathon ends (extended)" };
    expect((await call(kv, saved.id, "PUT", undefined, update)).status).toBe(401);
    expect(
      (await call(kv, saved.id, "PUT", "x".repeat(32), update)).status,
    ).toBe(401);

    const edited = await call(kv, saved.id, "PUT", editKey, update);
    expect(edited.status).toBe(200);
    expect((await (await call(kv, saved.id)).json()).timer.title).toBe(
      "Subathon ends (extended)",
    );

    expect((await call(kv, saved.id, "DELETE", "y".repeat(32))).status).toBe(401);
    expect((await call(kv, saved.id, "DELETE", editKey)).status).toBe(204);
    expect((await call(kv, saved.id)).status).toBe(404);
  });

  it("rejects bad input and unknown ids", async () => {
    const { kv } = createKv();
    expect((await create(kv, { ...timer, titleColor: "red" })).status).toBe(400);
    expect((await call(kv, "shared-000000000000")).status).toBe(404);
    expect((await call(kv, "not-a-timer")).status).toBe(404);
    expect((await call(kv, "shared-000000000000", "POST")).status).toBe(405);
  });
});
