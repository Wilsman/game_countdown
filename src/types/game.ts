export type GameSource = "default" | "custom";

export interface RegionalReleaseTime {
  id: string;
  label: string;
  timezone: string;
  date: Date;
}

export interface Game {
  id: string;
  title: string;
  titleColor: string;
  targetDate: Date;
  targetTimezone: string;
  type: "game" | "utility";
  source: GameSource;
  createdAt: Date | null;
  regionalReleaseTimes?: RegionalReleaseTime[];
  // When set, targetDate is the anchor and the countdown resets on this cycle.
  loopIntervalMinutes?: number;
}

export type GameBase = Omit<Game, "source" | "createdAt">;
