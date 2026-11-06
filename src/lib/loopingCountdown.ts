// Looping countdowns repeat on a fixed interval from an anchor instant, e.g.
// Twitch drops that reset every 24 hours. All math is on absolute UTC
// milliseconds, so a 24h loop is exactly 24h even across DST changes.

export const MAX_LOOP_INTERVAL_MINUTES = 365 * 24 * 60;

export const LOOP_INTERVAL_PRESETS = [
  { minutes: 60, label: "1h" },
  { minutes: 6 * 60, label: "6h" },
  { minutes: 12 * 60, label: "12h" },
  { minutes: 24 * 60, label: "24h" },
  { minutes: 7 * 24 * 60, label: "7 days" },
] as const;

export const isValidLoopIntervalMinutes = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value > 0 &&
  value <= MAX_LOOP_INTERVAL_MINUTES;

export const parseLoopIntervalMinutes = (
  value: string | null,
): number | null => {
  if (value === null || !/^\d+$/.test(value.trim())) return null;
  const minutes = Number(value);
  return isValidLoopIntervalMinutes(minutes) ? minutes : null;
};

// Returns the first reset strictly after `now`. Before the anchor, the anchor
// itself is the next reset, so a future start counts down to the first cycle.
// With a loopCount, it stops at the final reset (which may be in the past).
export const getNextLoopReset = (
  anchor: Date,
  intervalMinutes: number,
  now: Date,
  loopCount?: number,
): Date => {
  const anchorMs = anchor.getTime();
  const nowMs = now.getTime();
  if (nowMs < anchorMs) return new Date(anchorMs);

  const intervalMs = intervalMinutes * 60_000;
  const completedCycles = Math.floor((nowMs - anchorMs) / intervalMs) + 1;
  const next = new Date(anchorMs + completedCycles * intervalMs);
  if (!isValidLoopCount(loopCount)) return next;
  const finalReset = getFinalLoopReset(anchor, intervalMinutes, loopCount);
  return next > finalReset ? finalReset : next;
};

export const isValidLoopCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value > 0;

// 1-based cycle `now` falls in. The anchor ends cycle 1, so anything before it
// is cycle 1. With a loopCount, the cycle past the last reset is loopCount + 1.
export const getLoopCycle = (
  anchor: Date,
  intervalMinutes: number,
  now: Date,
): number => {
  const elapsedMs = now.getTime() - anchor.getTime();
  if (elapsedMs < 0) return 1;
  return Math.floor(elapsedMs / (intervalMinutes * 60_000)) + 2;
};

// The final reset of a loop limited to `loopCount` cycles.
export const getFinalLoopReset = (
  anchor: Date,
  intervalMinutes: number,
  loopCount: number,
): Date => new Date(anchor.getTime() + (loopCount - 1) * intervalMinutes * 60_000);

export const isLoopFinished = (
  anchor: Date,
  intervalMinutes: number,
  loopCount: number | undefined,
  now: Date,
): boolean =>
  isValidLoopCount(loopCount) &&
  getLoopCycle(anchor, intervalMinutes, now) > loopCount;

// "Day 2/3" for daily loops, "2/3" otherwise. Null once the loop has finished.
export const formatLoopCycle = (
  anchor: Date,
  intervalMinutes: number,
  loopCount: number,
  now: Date,
): string | null => {
  const cycle = getLoopCycle(anchor, intervalMinutes, now);
  if (cycle > loopCount) return null;
  const prefix = intervalMinutes === 24 * 60 ? "Day " : "";
  return `${prefix}${cycle}/${loopCount}`;
};

export const formatLoopInterval = (minutes: number): string => {
  const preset = LOOP_INTERVAL_PRESETS.find(
    (candidate) => candidate.minutes === minutes,
  );
  if (preset) return preset.label;
  if (minutes % 60 === 0) return `${minutes / 60}h`;
  if (minutes > 60) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  return `${minutes}m`;
};
