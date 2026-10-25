import { describe, expect, it } from "bun:test";

import type { GameBase } from "../../types/game";
import {
  applyCountdownOverrides,
  applyModAction,
  createCountdownId,
  createEmptyOverrides,
  isValidCountdownId,
  parseCountdownOverrides,
  parseModAction,
  type CountdownOverrides,
} from "../countdownOverrides";
import { serializeGameBase } from "../liveCountdowns";

const game = (id: string, overrides: Partial<GameBase> = {}): GameBase => ({
  id,
  title: id.toUpperCase(),
  titleColor: "#ffffff",
  targetDate: new Date("2027-01-01T00:00:00Z"),
  targetTimezone: "UTC",
  type: "game",
  ...overrides,
});

const bases = [game("alpha"), game("beta")];
const baseIds = new Set(bases.map((entry) => entry.id));
const now = new Date("2026-10-25T12:00:00Z");

const mustApply = (
  overrides: CountdownOverrides,
  action: Parameters<typeof applyModAction>[2],
): CountdownOverrides => {
  const result = applyModAction(overrides, baseIds, action, now);
  if (!result.ok) throw new Error(result.error);
  return result.overrides;
};

describe("countdown overrides", () => {
  it("treats bad documents as no edits", () => {
    expect(parseCountdownOverrides(null)).toEqual(createEmptyOverrides());
    expect(parseCountdownOverrides({ version: 2, games: [] })).toEqual(
      createEmptyOverrides(),
    );
    const parsed = parseCountdownOverrides({
      version: 1,
      games: [serializeGameBase(game("alpha")), { id: "broken" }],
      removed: ["beta", 5],
      updatedAt: "2026-10-25T00:00:00.000Z",
    });
    expect(parsed.games.map((entry) => entry.id)).toEqual(["alpha"]);
    expect(parsed.removed).toEqual(["beta"]);
  });

  it("edits a built-in in place and appends new countdowns", () => {
    const moved = new Date("2027-01-01T00:05:00Z");
    let overrides = mustApply(createEmptyOverrides(), {
      type: "save",
      isNew: false,
      game: serializeGameBase(game("alpha", { targetDate: moved })),
    });
    overrides = mustApply(overrides, {
      type: "save",
      isNew: true,
      game: serializeGameBase(game("gamma")),
    });

    const merged = applyCountdownOverrides(bases, overrides);
    expect(merged.map((entry) => entry.id)).toEqual(["alpha", "beta", "gamma"]);
    expect(merged[0].targetDate.toISOString()).toBe(moved.toISOString());
    expect(overrides.updatedAt).toBe(now.toISOString());
  });

  it("hides, restores and never reuses ids", () => {
    let overrides = mustApply(createEmptyOverrides(), {
      type: "save",
      isNew: true,
      game: serializeGameBase(game("gamma")),
    });
    overrides = mustApply(overrides, { type: "remove", id: "gamma" });
    overrides = mustApply(overrides, { type: "remove", id: "beta" });
    expect(applyCountdownOverrides(bases, overrides).map((entry) => entry.id)).toEqual(
      ["alpha"],
    );

    const reused = applyModAction(
      overrides,
      baseIds,
      { type: "save", isNew: true, game: serializeGameBase(game("gamma")) },
      now,
    );
    expect(reused).toMatchObject({ ok: false, status: 409 });
    expect(applyModAction(overrides, baseIds, { type: "reset", id: "gamma" }, now))
      .toMatchObject({ ok: false, status: 404 });

    overrides = mustApply(overrides, { type: "reset", id: "beta" });
    expect(applyCountdownOverrides(bases, overrides).map((entry) => entry.id)).toEqual(
      ["alpha", "beta"],
    );
  });

  it("reset drops edits to a built-in", () => {
    let overrides = mustApply(createEmptyOverrides(), {
      type: "save",
      isNew: false,
      game: serializeGameBase(game("alpha", { title: "Edited" })),
    });
    overrides = mustApply(overrides, { type: "reset", id: "alpha" });
    expect(overrides.games).toEqual([]);
  });

  it("rejects bad input", () => {
    const save = (entry: unknown, isNew = true) =>
      applyModAction(createEmptyOverrides(), baseIds, { type: "save", isNew, game: entry }, now);

    expect(save(serializeGameBase(game("alpha")))).toMatchObject({ status: 409 });
    expect(save(serializeGameBase(game("missing")), false)).toMatchObject({
      status: 404,
    });
    expect(save(serializeGameBase(game("custom-123")))).toMatchObject({ status: 400 });
    expect(save(serializeGameBase(game("ok", { title: "  " })))).toMatchObject({
      status: 400,
    });
    expect(save(serializeGameBase(game("ok", { titleColor: "red" })))).toMatchObject({
      status: 400,
    });
    expect(
      save(serializeGameBase(game("ok", { targetTimezone: "Mars/Base" }))),
    ).toMatchObject({ status: 400 });
    expect(save({ id: "ok" })).toMatchObject({ status: 400 });
  });

  it("validates ids and suggests free ones", () => {
    expect(isValidCountdownId("tarkov-event-end")).toBe(true);
    expect(isValidCountdownId("Tarkov")).toBe(false);
    expect(isValidCountdownId("shared-overlay")).toBe(false);
    expect(isValidCountdownId("game-1")).toBe(false);
    expect(createCountdownId("Tarkov: Event Ends!", [])).toBe("tarkov-event-ends");
    expect(createCountdownId("Tarkov", ["tarkov", "tarkov-2"])).toBe("tarkov-3");
    expect(createCountdownId("!!!", [])).toBe("event");
    expect(createCountdownId("Game Night", [])).toBe("event-game-night");
  });

  it("parses mod actions", () => {
    expect(parseModAction({ type: "remove", id: "alpha" })).toEqual({
      type: "remove",
      id: "alpha",
    });
    expect(parseModAction({ type: "save", game: {} })).toBeNull();
    expect(parseModAction({ type: "drop", id: "alpha" })).toBeNull();
    expect(parseModAction("save")).toBeNull();
  });
});
