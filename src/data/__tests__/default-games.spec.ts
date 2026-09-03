import { describe, expect, it } from "bun:test";

import { createDefaultGameBases } from "../default-games";

describe("default games", () => {
  it("has unique, trimmed ids", () => {
    const games = createDefaultGameBases("UTC");
    const ids = games.map((game) => game.id);

    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toBe(id.trim());
      expect(id.length).toBeGreaterThan(0);
    }
  });

  it("holds only future-dated game countdowns plus relative utility timers", () => {
    const games = createDefaultGameBases("UTC");
    const reference = new Date("2026-09-03T00:00:00Z");

    for (const game of games) {
      if (game.type === "utility") continue;
      expect(game.targetDate.getTime()).toBeGreaterThanOrEqual(
        reference.getTime(),
      );
    }
  });

  it("builds fresh utility dates on every call", () => {
    const first = createDefaultGameBases("UTC").filter(
      (game) => game.type === "utility",
    );
    const second = createDefaultGameBases("UTC").filter(
      (game) => game.type === "utility",
    );

    expect(first.length).toBeGreaterThan(0);
    expect(first.length).toBe(second.length);
    for (const game of first) {
      expect(game.targetDate.getTime()).toBeGreaterThan(Date.now());
    }
  });
});
