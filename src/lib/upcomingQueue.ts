import { getNextLoopReset } from "./loopingCountdown";
import { isSharedTimerId } from "./sharedTimers";
import type { Game } from "../types/game";

export type QueueKind = "game" | "custom" | "live" | "loop" | "utility";
export type QueueFilter = "all" | "games" | "mine" | "breaks";

export interface QueueItem {
  game: Game;
  // The next instant this countdown hits zero (next reset for loops).
  targetDate: Date;
  remainingMs: number;
  kind: QueueKind;
}

export const getQueueKind = (game: Game): QueueKind => {
  if (game.loopIntervalMinutes) return "loop";
  if (isSharedTimerId(game.id)) return "live";
  if (game.source === "custom") return "custom";
  return game.type === "utility" ? "utility" : "game";
};

// Every countdown that has not ended yet, soonest first.
export function buildUpcomingQueue(games: Game[], now: Date): QueueItem[] {
  return games
    .map((game) => {
      const targetDate = game.loopIntervalMinutes
        ? getNextLoopReset(
            game.targetDate,
            game.loopIntervalMinutes,
            now,
            game.loopCount,
          )
        : game.targetDate;
      return {
        game,
        targetDate,
        remainingMs: targetDate.getTime() - now.getTime(),
        kind: getQueueKind(game),
      };
    })
    .filter((item) => item.remainingMs > 0)
    .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());
}

export const filterQueue = (
  items: QueueItem[],
  filter: QueueFilter,
): QueueItem[] => {
  if (filter === "games") return items.filter((item) => item.kind === "game");
  if (filter === "mine") {
    return items.filter((item) => item.game.source === "custom");
  }
  // Break timers always start from now, so they only show under their own tab.
  if (filter === "breaks") {
    return items.filter((item) => item.kind === "utility");
  }
  return items.filter((item) => item.kind !== "utility");
};

const pad = (value: number): string => value.toString().padStart(2, "0");

// "3d 04h 12m" for long waits, "04:12:09" inside a day.
export function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${pad(hours)}h ${pad(minutes)}m`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export interface QueueGroup {
  targetDate: Date;
  remainingMs: number;
  items: QueueItem[];
}

// Countdowns that end at the same instant, merged so the time shows once.
// Expects the queue already sorted soonest first.
export function groupQueueByTarget(items: QueueItem[]): QueueGroup[] {
  const groups: QueueGroup[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.targetDate.getTime() === item.targetDate.getTime()) {
      last.items.push(item);
    } else {
      groups.push({
        targetDate: item.targetDate,
        remainingMs: item.remainingMs,
        items: [item],
      });
    }
  }
  return groups;
}
