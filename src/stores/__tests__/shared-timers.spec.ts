import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createPinia, setActivePinia } from "pinia";

import { onRequest } from "../../../functions/api/timers/[id]";
import { onRequestPost } from "../../../functions/api/timers/index";
import type { SharedTimersKv } from "../../../functions/api/timers/shared";
import { useTimerStore } from "../timer";

const KEYS_STORAGE_KEY = "game-countdown.shared-timer-keys";
const originalFetch = globalThis.fetch;

const createStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
    clear: () => values.clear(),
  };
};

const createKv = (): SharedTimersKv => {
  const values = new Map<string, string>();
  return {
    get: async (key) => values.get(key) ?? null,
    put: async (key, value) => {
      values.set(key, value);
    },
    delete: async (key) => {
      values.delete(key);
    },
  };
};

// Routes fetch calls to the Functions so the store talks to the real API code.
const installApi = (kv: SharedTimersKv) => {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(new URL(String(input), "https://example.com"), init);
    const path = new URL(request.url).pathname;
    if (path === "/api/timers") {
      return onRequestPost({ request, env: { COUNTDOWNS_KV: kv } });
    }
    const id = path.replace("/api/timers/", "");
    return onRequest({ request, env: { COUNTDOWNS_KV: kv }, params: { id } });
  }) as typeof fetch;
};

const installBrowser = (
  storage: ReturnType<typeof createStorage>,
  url = "https://example.com/",
) => {
  const parsed = new URL(url);
  const location = {
    href: parsed.toString(),
    search: parsed.search,
    hash: parsed.hash,
    pathname: parsed.pathname,
  };
  Object.assign(globalThis, {
    Audio: class {
      play() {
        return Promise.resolve();
      }
    },
    document: { documentElement: { style: { setProperty() {} } } },
    localStorage: storage,
    window: {
      localStorage: storage,
      location,
      history: {
        state: null,
        replaceState: (_state: unknown, _title: string, next: string) => {
          const nextUrl = new URL(next, parsed);
          location.href = nextUrl.toString();
          location.hash = nextUrl.hash;
        },
      },
    },
  });
  return location;
};

beforeEach(() => {
  setActivePinia(createPinia());
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const key of ["Audio", "document", "localStorage", "window"]) {
    Reflect.deleteProperty(globalThis, key);
  }
});

describe("shared timers in the store", () => {
  it("publishes a custom timer and lets an edit link holder change it", async () => {
    const kv = createKv();
    installApi(kv);

    // Streamer's browser.
    const streamerStorage = createStorage();
    installBrowser(streamerStorage);
    const streamer = useTimerStore();
    const local = streamer.addCustomTimer(
      "Subathon ends",
      new Date("2027-01-01T00:00:00Z"),
      "UTC",
    );
    const shared = await streamer.publishCustomTimer(local.id);
    expect(shared.id).toMatch(/^shared-/);
    expect(streamer.activeGame.id).toBe(shared.id);
    expect(streamer.canEditSharedTimer(shared.id)).toBe(true);
    expect(streamer.getObsOverlayUrl()).toContain(`game=${shared.id}`);
    const editUrl = streamer.getSharedTimerEditUrl(shared.id);
    expect(editUrl).toContain("#key=");

    // A mod opens the edit link in another browser.
    setActivePinia(createPinia());
    const modStorage = createStorage();
    const modLocation = installBrowser(modStorage, editUrl);
    const mod = useTimerStore();
    mod.handleUrlParams();
    expect(modLocation.hash).toBe("");
    expect(mod.canEditSharedTimer(shared.id)).toBe(true);
    expect(mod.followedSharedTimerId).toBe(shared.id);
    expect(JSON.parse(modStorage.getItem(KEYS_STORAGE_KEY) ?? "{}")).toHaveProperty(
      shared.id,
    );

    const response = await fetch(`/api/timers/${shared.id}`);
    const payload = await response.json();
    mod.applySharedTimer(
      { ...payload.timer, targetDate: new Date(payload.timer.targetDate) },
      payload.updatedAt,
    );
    expect(mod.activeGame.id).toBe(shared.id);

    mod.updateCustomTimer(shared.id, {
      title: "Subathon ends (extended)",
      targetDate: new Date("2027-01-01T02:00:00Z"),
      targetTimezone: "UTC",
    });
    await mod.pushSharedTimer(shared.id);

    const after = await (await fetch(`/api/timers/${shared.id}`)).json();
    expect(after.timer.title).toBe("Subathon ends (extended)");
  });

  it("is read-only for viewers and ignores stale polls", async () => {
    const kv = createKv();
    installApi(kv);
    installBrowser(createStorage());
    const owner = useTimerStore();
    const local = owner.addCustomTimer("Stream", new Date("2027-01-01T00:00:00Z"), "UTC");
    const { id } = await owner.publishCustomTimer(local.id);

    setActivePinia(createPinia());
    installBrowser(createStorage(), `https://example.com/?game=${id}`);
    const viewer = useTimerStore();
    viewer.handleUrlParams();
    expect(viewer.canEditSharedTimer(id)).toBe(false);
    await expect(viewer.pushSharedTimer(id)).rejects.toThrow();

    const base = {
      id,
      title: "Stream",
      titleColor: "#ffffff",
      targetDate: new Date("2027-01-01T00:00:00Z"),
      targetTimezone: "UTC",
      type: "game" as const,
    };
    expect(viewer.applySharedTimer(base, "2026-11-03T10:00:00.000Z")).toBe(true);
    expect(viewer.activeGame.id).toBe(id);
    expect(
      viewer.applySharedTimer({ ...base, title: "New" }, "2026-11-03T10:05:00.000Z"),
    ).toBe(true);
    // An older copy from a lagging KV edge does not undo the newer one.
    expect(
      viewer.applySharedTimer({ ...base, title: "Old" }, "2026-11-03T10:01:00.000Z"),
    ).toBe(false);
    expect(viewer.activeGame.title).toBe("New");
  });

  it("stops sharing and keeps the timer locally", async () => {
    const kv = createKv();
    installApi(kv);
    installBrowser(createStorage());
    const store = useTimerStore();
    const local = store.addCustomTimer("Stream", new Date("2027-01-01T00:00:00Z"), "UTC");
    const { id } = await store.publishCustomTimer(local.id);

    await store.unpublishSharedTimer(id);
    expect(store.activeGame.id).toMatch(/^custom-/);
    expect(store.activeGame.title).toBe("Stream");
    expect((await fetch(`/api/timers/${id}`)).status).toBe(404);
  });
});
