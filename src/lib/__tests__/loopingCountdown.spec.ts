import { describe, expect, it } from "bun:test";

import {
  formatLoopInterval,
  getNextLoopReset,
  parseLoopIntervalMinutes,
} from "../loopingCountdown";

const anchor = new Date("2026-10-01T18:00:00Z");
const DAY = 24 * 60;

describe("getNextLoopReset", () => {
  it("counts down to the anchor while it is still upcoming", () => {
    const now = new Date("2026-09-30T12:00:00Z");
    expect(getNextLoopReset(anchor, DAY, now).toISOString()).toBe(
      "2026-10-01T18:00:00.000Z",
    );
  });

  it("rolls forward to the next cycle after the anchor", () => {
    const now = new Date("2026-10-12T09:30:00Z");
    expect(getNextLoopReset(anchor, DAY, now).toISOString()).toBe(
      "2026-10-12T18:00:00.000Z",
    );
  });

  it("starts a fresh cycle exactly at a reset", () => {
    const now = new Date("2026-10-12T18:00:00Z");
    expect(getNextLoopReset(anchor, DAY, now).toISOString()).toBe(
      "2026-10-13T18:00:00.000Z",
    );
  });

  it("keeps absolute spacing across a DST change", () => {
    const now = new Date("2026-10-26T12:00:00Z");
    expect(getNextLoopReset(anchor, 12 * 60, now).toISOString()).toBe(
      "2026-10-26T18:00:00.000Z",
    );
  });
});

describe("parseLoopIntervalMinutes", () => {
  it("accepts positive whole minutes", () => {
    expect(parseLoopIntervalMinutes("1440")).toBe(1440);
  });

  it("rejects missing, invalid, and out-of-range values", () => {
    for (const value of [null, "", "0", "-60", "1.5", "abc", "999999999"]) {
      expect(parseLoopIntervalMinutes(value)).toBeNull();
    }
  });
});

describe("formatLoopInterval", () => {
  it("labels presets and custom lengths", () => {
    expect(formatLoopInterval(DAY)).toBe("24h");
    expect(formatLoopInterval(7 * DAY)).toBe("7 days");
    expect(formatLoopInterval(90)).toBe("1h 30m");
    expect(formatLoopInterval(45)).toBe("45m");
    expect(formatLoopInterval(18 * 60)).toBe("18h");
  });
});
