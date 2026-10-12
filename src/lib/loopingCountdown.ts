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
export const getNextLoopReset = (
  anchor: Date,
  intervalMinutes: number,
  now: Date,
): Date => {
  const anchorMs = anchor.getTime();
  const nowMs = now.getTime();
  if (nowMs < anchorMs) return new Date(anchorMs);

  const intervalMs = intervalMinutes * 60_000;
  const completedCycles = Math.floor((nowMs - anchorMs) / intervalMs) + 1;
  return new Date(anchorMs + completedCycles * intervalMs);
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
