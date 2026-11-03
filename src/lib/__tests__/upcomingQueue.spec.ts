import { describe, expect, it } from "bun:test";

import {
  buildUpcomingQueue,
  filterQueue,
  formatRemaining,
  groupQueueByTarget,
} from "../upcomingQueue";
import type { Game } from "../../types/game";

const now = new Date("2026-11-03T12:00:00Z");

const game = (overrides: Partial<Game>): Game => ({
  id: "game-a",
  title: "A",
  titleColor: "#ffffff",
  targetDate: new Date("2026-11-10T00:00:00Z"),
  targetTimezone: "UTC",
  type: "game",
  source: "default",
  createdAt: null,
  ...overrides,
});

describe("upcoming queue", () => {
  it("drops ended countdowns and sorts soonest first", () => {
    const queue = buildUpcomingQueue(
      [
        game({ id: "later" }),
        game({ id: "past", targetDate: new Date("2026-11-01T00:00:00Z") }),
        game({ id: "soon", targetDate: new Date("2026-11-04T00:00:00Z") }),
      ],
      now,
    );
    expect(queue.map((item) => item.game.id)).toEqual(["soon", "later"]);
  });

  it("uses the next reset for looping timers", () => {
    const [item] = buildUpcomingQueue(
      [
        game({
          id: "custom-loop",
          source: "custom",
          targetDate: new Date("2026-11-01T00:00:00Z"),
          loopIntervalMinutes: 1440,
        }),
      ],
      now,
    );
    expect(item.kind).toBe("loop");
    expect(item.targetDate.toISOString()).toBe("2026-11-04T00:00:00.000Z");
  });

  it("tags kinds and filters them", () => {
    const queue = buildUpcomingQueue(
      [
        game({ id: "release" }),
        game({ id: "custom-1", source: "custom" }),
        game({ id: "shared-abc123def456", source: "custom" }),
        game({ id: "break", type: "utility" }),
      ],
      now,
    );
    expect(queue.map((item) => item.kind).sort()).toEqual([
      "custom",
      "game",
      "live",
      "utility",
    ]);
    expect(filterQueue(queue, "games")).toHaveLength(1);
    expect(filterQueue(queue, "mine")).toHaveLength(2);
    expect(filterQueue(queue, "all")).toHaveLength(3);
    expect(filterQueue(queue, "breaks")).toHaveLength(1);
  });

  it("formats remaining time", () => {
    expect(formatRemaining(3_723_000)).toBe("01:02:03");
    expect(formatRemaining(90_061_000)).toBe("1d 01h 01m");
    expect(formatRemaining(-5)).toBe("00:00:00");
  });

  it("groups countdowns that end at the same instant", () => {
    const queue = buildUpcomingQueue(
      [
        game({ id: "a" }),
        game({ id: "b" }),
        game({ id: "c", targetDate: new Date("2026-11-04T00:00:00Z") }),
      ],
      now,
    );
    const groups = groupQueueByTarget(queue);
    expect(
      groups.map((group) => group.items.map((item) => item.game.id)),
    ).toEqual([["c"], ["a", "b"]]);
  });
});
