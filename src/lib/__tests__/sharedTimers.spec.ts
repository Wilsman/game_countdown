import { describe, expect, it } from "bun:test";

import { isValidCountdownId } from "../countdownOverrides";
import {
  createSharedTimerEditKey,
  createSharedTimerId,
  getSharedTimerExpiration,
  hashEditKey,
  hashesMatch,
  isSharedTimerEditKey,
  isSharedTimerId,
  parseSharedTimerPayload,
  serializeSharedTimer,
  validateSharedTimerInput,
} from "../sharedTimers";

const id = "shared-abc123def456";
const input = {
  title: "  Subathon ends  ",
  titleColor: "#7ed2eb",
  targetDate: "2026-12-01T20:00:00.000Z",
  targetTimezone: "Europe/London",
};

describe("shared timers", () => {
  it("creates ids and keys in the expected formats", () => {
    expect(isSharedTimerId(createSharedTimerId())).toBe(true);
    expect(isSharedTimerEditKey(createSharedTimerEditKey())).toBe(true);
    expect(createSharedTimerEditKey()).not.toBe(createSharedTimerEditKey());
    expect(isSharedTimerId("shared-overlay")).toBe(false);
    expect(isSharedTimerId("custom-123")).toBe(false);
  });

  it("keeps mods from taking shared timer ids", () => {
    expect(isValidCountdownId(createSharedTimerId())).toBe(false);
  });

  it("validates and trims input, taking the id from the caller", () => {
    const result = validateSharedTimerInput(id, { ...input, id: "evil" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.timer.id).toBe(id);
    expect(result.timer.title).toBe("Subathon ends");
  });

  it("rejects bad fields", () => {
    const bad = [
      { ...input, title: " " },
      { ...input, title: "x".repeat(121) },
      { ...input, titleColor: "red" },
      { ...input, targetDate: "2026-12-01 20:00" },
      { ...input, targetTimezone: "Mars/Olympus" },
      { ...input, loopIntervalMinutes: 0 },
      null,
    ];
    for (const value of bad) {
      expect(validateSharedTimerInput(id, value).ok).toBe(false);
    }
  });

  it("round-trips a looping timer through the public payload", () => {
    const result = validateSharedTimerInput(id, { ...input, loopIntervalMinutes: 1440 });
    if (!result.ok) throw new Error(result.error);
    const payload = { version: 1, timer: serializeSharedTimer(result.timer) };
    expect(parseSharedTimerPayload(payload)).toEqual(result.timer);
    expect(parseSharedTimerPayload({ ...payload, version: 2 })).toBeNull();
  });

  it("matches only the right key hash", async () => {
    const key = createSharedTimerEditKey();
    const hash = await hashEditKey(key);
    expect(hashesMatch(await hashEditKey(key), hash)).toBe(true);
    expect(hashesMatch(await hashEditKey(createSharedTimerEditKey()), hash)).toBe(false);
  });

  it("expires 30 days after the end, or after the last edit for loops", () => {
    const now = new Date("2026-11-01T00:00:00Z");
    const result = validateSharedTimerInput(id, input);
    if (!result.ok) throw new Error(result.error);
    const day = 24 * 60 * 60;
    expect(getSharedTimerExpiration(result.timer, now)).toBe(
      Date.parse(input.targetDate) / 1000 + 30 * day,
    );
    expect(
      getSharedTimerExpiration({ ...result.timer, loopIntervalMinutes: 60 }, now),
    ).toBe(now.getTime() / 1000 + 30 * day);
  });
});
