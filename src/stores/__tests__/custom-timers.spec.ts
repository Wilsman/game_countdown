import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { createPinia, setActivePinia } from "pinia";

import { useTimerStore } from "../timer";

type StorageMock = {
  clear: () => void;
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
  setItem: (key: string, value: string) => void;
};

const CUSTOM_GAMES_STORAGE_KEY = "game-countdown.custom-games";

const createStorageMock = (): StorageMock => {
  const backingStore = new Map<string, string>();

  return {
    clear: () => backingStore.clear(),
    getItem: (key: string) => backingStore.get(key) ?? null,
    removeItem: (key: string) => {
      backingStore.delete(key);
    },
    setItem: (key: string, value: string) => {
      backingStore.set(key, value);
    },
  };
};

const installBrowserMocks = (storage: StorageMock, url = "https://example.com/") => {
  const parsedUrl = new URL(url);

  Object.assign(globalThis, {
    Audio: class {
      play() {
        return Promise.resolve();
      }
    },
    document: {
      documentElement: {
        style: {
          setProperty() {},
        },
      },
    },
    localStorage: storage,
    window: {
      localStorage: storage,
      location: {
        href: parsedUrl.toString(),
        search: parsedUrl.search,
      },
    },
  });
};

beforeEach(() => {
  setActivePinia(createPinia());
});

afterEach(() => {
  Reflect.deleteProperty(globalThis, "Audio");
  Reflect.deleteProperty(globalThis, "document");
  Reflect.deleteProperty(globalThis, "localStorage");
  Reflect.deleteProperty(globalThis, "window");
});

describe("custom timer persistence", () => {
  it("adds, updates, removes, and persists custom timers", () => {
    const storage = createStorageMock();
    installBrowserMocks(storage);

    const store = useTimerStore();
    const customTimer = store.addCustomTimer(
      "Stream starts",
      new Date("2026-06-01T12:00:00Z"),
      "UTC",
    );

    expect(store.customGameOptions.some((game) => game.id === customTimer.id)).toBe(
      true,
    );

    const persistedAfterCreate = JSON.parse(
      storage.getItem(CUSTOM_GAMES_STORAGE_KEY) ?? "[]",
    );
    expect(persistedAfterCreate).toHaveLength(1);
    expect(persistedAfterCreate[0].source).toBe("custom");

    store.updateCustomTimer(customTimer.id, {
      title: "Updated stream starts",
      targetDate: new Date("2026-06-01T14:00:00Z"),
      targetTimezone: "Europe/London",
    });

    expect(
      store.customGameOptions.find((game) => game.id === customTimer.id)?.title,
    ).toBe("Updated stream starts");

    store.removeCustomTimer(customTimer.id);

    expect(store.customGameOptions.some((game) => game.id === customTimer.id)).toBe(
      false,
    );
    expect(JSON.parse(storage.getItem(CUSTOM_GAMES_STORAGE_KEY) ?? "[]")).toEqual(
      [],
    );
  });

  it("hydrates saved custom timers without replacing default timers", () => {
    const storage = createStorageMock();
    installBrowserMocks(storage);

    const firstStore = useTimerStore();
    const savedTimer = firstStore.addCustomTimer(
      "Saved countdown",
      new Date("2026-08-10T18:00:00Z"),
      "UTC",
    );

    setActivePinia(createPinia());
    installBrowserMocks(storage);

    const hydratedStore = useTimerStore();

    expect(
      hydratedStore.customGameOptions.some((game) => game.id === savedTimer.id),
    ).toBe(true);
    expect(
      hydratedStore.utilityOptions.some((game) => game.id === "break-60"),
    ).toBe(true);

    hydratedStore.resetGames();

    expect(
      hydratedStore.customGameOptions.some((game) => game.id === savedTimer.id),
    ).toBe(true);
    expect(
      hydratedStore.utilityOptions.some((game) => game.id === "break-60"),
    ).toBe(true);
  });

  it("reconstructs a shared custom countdown when it is not already stored", () => {
    const storage = createStorageMock();
    installBrowserMocks(
      storage,
      "https://example.com/?game=shared-custom&date=2026-10-05T20:30:00.000Z&timezone=UTC&title=Shared%20Countdown",
    );

    const store = useTimerStore();
    store.handleUrlParams();

    const sharedGame = store.customGameOptions.find(
      (game) => game.id === "shared-custom",
    );

    expect(sharedGame?.title).toBe("Shared Countdown");
    expect(sharedGame?.targetTimezone).toBe("UTC");
    expect(sharedGame?.targetDate.toISOString()).toBe("2026-10-05T20:30:00.000Z");
    expect(JSON.parse(storage.getItem(CUSTOM_GAMES_STORAGE_KEY) ?? "[]")).toHaveLength(
      1,
    );
  });

  it("preserves layout controls in the OBS overlay URL", () => {
    const storage = createStorageMock();
    installBrowserMocks(storage);

    const store = useTimerStore();
    store.updateSettings({
      titleSize: 64,
      showTitle: false,
      showLabels: false,
      framePadding: 36,
      segmentGap: 18,
    });

    const overlayUrl = new URL(store.getObsOverlayUrl());
    expect(overlayUrl.searchParams.get("tsize")).toBe("64");
    expect(overlayUrl.searchParams.get("showtitle")).toBe("0");
    expect(overlayUrl.searchParams.get("showlabels")).toBe("0");
    expect(overlayUrl.searchParams.get("padding")).toBe("36");
    expect(overlayUrl.searchParams.get("gap")).toBe("18");

    setActivePinia(createPinia());
    installBrowserMocks(storage, overlayUrl.toString());

    const restoredStore = useTimerStore();
    restoredStore.handleUrlParams();

    expect(restoredStore.settings.titleSize).toBe(64);
    expect(restoredStore.settings.showTitle).toBe(false);
    expect(restoredStore.settings.showLabels).toBe(false);
    expect(restoredStore.settings.framePadding).toBe(36);
    expect(restoredStore.settings.segmentGap).toBe(18);
  });
});
