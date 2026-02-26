<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

import { useTimerStore } from "../stores/timer";

const DAY_MS = 24 * 60 * 60 * 1000;
const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const store = useTimerStore();
type GameOption = (typeof store.gameOptions)[number];

const now = ref(new Date());
const selectedDateKey = ref("");
const displayedMonth = ref(startOfUtcMonth(now.value));

let nowTicker: number | null = null;

function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function startOfUtcWeek(date: Date): Date {
  const weekStart = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
  weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
  return weekStart;
}

function toUtcDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromUtcDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

const upcomingGames = computed(() => {
  const nowTime = now.value.getTime();
  return [...store.gameOptions]
    .filter((game) => game.targetDate.getTime() > nowTime)
    .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());
});

const eventsByDate = computed(() => {
  const map = new Map<string, GameOption[]>();
  upcomingGames.value.forEach((game) => {
    const key = toUtcDateKey(game.targetDate);
    const bucket = map.get(key) ?? [];
    bucket.push(game);
    map.set(key, bucket);
  });

  map.forEach((games, key) => {
    map.set(
      key,
      [...games].sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())
    );
  });

  return map;
});

const monthLabel = computed(() => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(displayedMonth.value);
});

const monthCells = computed(() => {
  const monthStart = startOfUtcMonth(displayedMonth.value);
  const leadingDays = monthStart.getUTCDay();
  const gridStart = new Date(monthStart.getTime() - leadingDays * DAY_MS);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart.getTime() + index * DAY_MS);
    const key = toUtcDateKey(date);

    return {
      date,
      key,
      dayNumber: date.getUTCDate(),
      inCurrentMonth: date.getUTCMonth() === monthStart.getUTCMonth(),
      isToday: key === toUtcDateKey(now.value),
      events: eventsByDate.value.get(key) ?? [],
    };
  });
});

const currentWeekStart = computed(() => startOfUtcWeek(now.value));
const currentWeekEnd = computed(
  () => new Date(currentWeekStart.value.getTime() + 7 * DAY_MS)
);

const weeklyGames = computed(() => {
  const start = currentWeekStart.value.getTime();
  const end = currentWeekEnd.value.getTime();

  return [...store.gameOptions]
    .filter((game) => {
      const gameTime = game.targetDate.getTime();
      return gameTime >= start && gameTime < end;
    })
    .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime());
});

const weeklyRangeLabel = computed(() => {
  const weekStart = currentWeekStart.value;
  const weekEnd = new Date(currentWeekEnd.value.getTime() - DAY_MS);
  return `${formatUtcDate(toUtcDateKey(weekStart))} - ${formatUtcDate(
    toUtcDateKey(weekEnd)
  )}`;
});

const activeGameId = computed(() => store.activeGame?.id ?? "");

function formatUtcDate(key: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(fromUtcDateKey(key));
}

function formatEventDate(game: GameOption): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: game.targetTimezone || "UTC",
  }).format(game.targetDate);
}

function getDaysUntil(game: GameOption): number {
  const nowDate = now.value;
  const nowUtc = Date.UTC(
    nowDate.getUTCFullYear(),
    nowDate.getUTCMonth(),
    nowDate.getUTCDate()
  );
  const gameUtc = Date.UTC(
    game.targetDate.getUTCFullYear(),
    game.targetDate.getUTCMonth(),
    game.targetDate.getUTCDate()
  );

  return Math.round((gameUtc - nowUtc) / DAY_MS);
}

function formatDaysUntil(game: GameOption): string {
  const days = getDaysUntil(game);
  if (days < 0) {
    const abs = Math.abs(days);
    return abs === 1 ? "1 day ago" : `${abs} days ago`;
  }
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

function isPastGame(game: GameOption): boolean {
  return game.targetDate.getTime() < now.value.getTime();
}

function shiftMonth(direction: -1 | 1): void {
  displayedMonth.value = new Date(
    Date.UTC(
      displayedMonth.value.getUTCFullYear(),
      displayedMonth.value.getUTCMonth() + direction,
      1
    )
  );
}

function jumpToCurrentMonth(): void {
  displayedMonth.value = startOfUtcMonth(now.value);
  selectedDateKey.value = toUtcDateKey(now.value);
}

function jumpToFirstUpcoming(): void {
  const first = upcomingGames.value[0];
  if (!first) return;
  displayedMonth.value = startOfUtcMonth(first.targetDate);
  selectedDateKey.value = toUtcDateKey(first.targetDate);
}

function selectDate(key: string): void {
  selectedDateKey.value = key;
}

function activateGame(gameId: string): void {
  const index = store.games.findIndex((game) => game.id === gameId);
  if (index >= 0) {
    store.setActiveGameIndex(index);
  }
}

onMounted(() => {
  nowTicker = window.setInterval(() => {
    now.value = new Date();
  }, 30_000);

  const firstUpcoming = upcomingGames.value[0];
  if (firstUpcoming) {
    displayedMonth.value = startOfUtcMonth(firstUpcoming.targetDate);
    selectedDateKey.value = toUtcDateKey(firstUpcoming.targetDate);
    return;
  }

  selectedDateKey.value = toUtcDateKey(now.value);
});

onUnmounted(() => {
  if (nowTicker) {
    window.clearInterval(nowTicker);
  }
});
</script>

<template>
  <section class="calendar-shell glass-section mt-8 w-full px-4 py-5 sm:px-6 sm:py-6">
    <header class="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div class="space-y-1">
        <p class="calendar-kicker">Upcoming Games Calendar</p>
        <h2 class="calendar-title">{{ monthLabel }}</h2>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button type="button" class="calendar-btn" @click="shiftMonth(-1)">
          Prev
        </button>
        <button type="button" class="calendar-btn" @click="jumpToCurrentMonth">
          Today
        </button>
        <button type="button" class="calendar-btn" @click="jumpToFirstUpcoming">
          Next Launch
        </button>
        <button type="button" class="calendar-btn" @click="shiftMonth(1)">
          Next
        </button>
      </div>
    </header>

    <div class="grid gap-5 xl:grid-cols-[2.8fr_0.9fr]">
      <div class="space-y-2">
        <div class="grid grid-cols-7 gap-2">
          <span
            v-for="day in dayLabels"
            :key="day"
            class="calendar-day-label"
          >
            {{ day }}
          </span>
        </div>

        <div class="grid grid-cols-7 gap-2">
          <button
            v-for="(cell, cellIndex) in monthCells"
            :key="cell.key"
            type="button"
            class="calendar-cell"
            :class="{
              'is-off': !cell.inCurrentMonth,
              'is-today': cell.isToday,
              'has-events': cell.events.length > 0,
              'is-selected': selectedDateKey === cell.key,
            }"
            :style="{ '--cell-index': String(cellIndex) }"
            @click="selectDate(cell.key)"
          >
            <span class="calendar-day-number">{{ cell.dayNumber }}</span>

            <div v-if="cell.events.length > 0" class="day-events mt-1 space-y-1">
              <span
                v-for="event in cell.events.slice(0, 3)"
                :key="event.id"
                class="event-chip"
                :style="{ '--event-color': event.titleColor || '#38bdf8' }"
              >
                <span class="event-title">{{ event.title }}</span>
              </span>
              <span v-if="cell.events.length > 3" class="event-chip event-chip-more">
                +{{ cell.events.length - 3 }} more
              </span>
            </div>
          </button>
        </div>
      </div>

      <aside class="agenda-panel">
        <div class="mb-3 space-y-1">
          <h3 class="agenda-title">Current Week</h3>
          <p class="agenda-subtitle">{{ weeklyRangeLabel }}</p>
        </div>

        <div v-if="weeklyGames.length === 0" class="empty-state">
          No game events scheduled this week.
        </div>

        <div v-else class="space-y-2">
          <button
            v-for="game in weeklyGames"
            :key="game.id"
            type="button"
            class="agenda-item"
            :class="{
              'is-active': activeGameId === game.id,
              'is-past': isPastGame(game),
            }"
            @click="activateGame(game.id)"
          >
            <span
              class="agenda-dot"
              :style="{ backgroundColor: game.titleColor || '#38bdf8' }"
              aria-hidden="true"
            ></span>
            <span class="min-w-0 flex-1">
              <span class="agenda-game">{{ game.title }}</span>
              <span class="agenda-time">
                {{ formatEventDate(game) }} • {{ formatDaysUntil(game) }}
              </span>
            </span>
            <span v-if="activeGameId === game.id" class="active-tag">Live</span>
          </button>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.calendar-shell {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  border-color: rgba(20, 184, 166, 0.4);
  background:
    linear-gradient(125deg, rgba(4, 12, 24, 0.96), rgba(2, 8, 16, 0.98)),
    radial-gradient(circle at 8% 20%, rgba(20, 184, 166, 0.24), transparent 44%),
    radial-gradient(circle at 90% 78%, rgba(56, 189, 248, 0.24), transparent 44%),
    radial-gradient(circle at 50% 0%, rgba(132, 204, 22, 0.14), transparent 46%);
}

.calendar-shell::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.calendar-shell::before {
  z-index: -1;
  background:
    repeating-linear-gradient(
      135deg,
      rgba(94, 234, 212, 0.08) 0,
      rgba(94, 234, 212, 0.08) 1px,
      transparent 1px,
      transparent 24px
    );
  opacity: 0.35;
}

.calendar-kicker {
  margin: 0;
  font-size: 0.68rem;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgba(165, 243, 252, 0.85);
  font-family: "Trebuchet MS", "Segoe UI", sans-serif;
  font-weight: 700;
}

.calendar-title {
  margin: 0;
  color: #e6fffb;
  font-size: clamp(1.35rem, 1.6vw + 1rem, 2.05rem);
  letter-spacing: 0.04em;
  font-family: "Avenir Next", "Gill Sans", "Segoe UI", sans-serif;
  font-weight: 700;
}

.calendar-btn {
  border: 1px solid rgba(94, 234, 212, 0.28);
  background:
    linear-gradient(180deg, rgba(8, 47, 73, 0.6), rgba(8, 47, 73, 0.2)),
    rgba(2, 6, 23, 0.66);
  color: rgba(240, 253, 250, 0.9);
  border-radius: 999px;
  padding: 0.42rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: all 180ms ease;
}

.calendar-btn:hover {
  border-color: rgba(45, 212, 191, 0.88);
  background:
    linear-gradient(180deg, rgba(13, 148, 136, 0.4), rgba(13, 148, 136, 0.15)),
    rgba(15, 23, 42, 0.8);
  transform: translateY(-1px);
}

.calendar-day-label {
  text-align: center;
  font-size: 0.67rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(153, 246, 228, 0.68);
  font-weight: 600;
  padding-bottom: 0.12rem;
}

.calendar-cell {
  position: relative;
  min-height: 7rem;
  padding: 0.45rem;
  border-radius: 0.82rem;
  border: 1px solid rgba(45, 212, 191, 0.12);
  background:
    linear-gradient(170deg, rgba(6, 20, 38, 0.78), rgba(2, 10, 24, 0.84)),
    rgba(2, 6, 23, 0.56);
  text-align: left;
  overflow: hidden;
  transition: all 170ms ease;
  animation: cellRise 420ms ease both;
  animation-delay: calc(var(--cell-index) * 10ms);
}

.calendar-cell::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background:
    linear-gradient(
      120deg,
      transparent 0%,
      rgba(125, 211, 252, 0.12) 50%,
      transparent 100%
    );
  opacity: 0;
  transition: opacity 180ms ease;
}

.calendar-cell:hover {
  border-color: rgba(45, 212, 191, 0.5);
  transform: translateY(-1px);
}

.calendar-cell:hover::after {
  opacity: 1;
}

.calendar-cell.has-events {
  border-color: rgba(94, 234, 212, 0.35);
  box-shadow: 0 0 0 1px rgba(45, 212, 191, 0.18) inset;
}

.calendar-cell.is-selected {
  border-color: rgba(125, 211, 252, 0.85);
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.34) inset,
    0 8px 18px rgba(56, 189, 248, 0.14);
}

.calendar-cell.is-today .calendar-day-number {
  color: #ccfbf1;
  box-shadow: 0 0 0 1px rgba(45, 212, 191, 0.4) inset;
}

.calendar-cell.is-off {
  opacity: 0.4;
}

.calendar-day-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  color: rgba(226, 232, 240, 0.88);
}

.day-events {
  margin-right: 0;
}

.event-chip {
  display: block;
  border-radius: 0.55rem;
  padding: 0.2rem 0.34rem;
  font-size: 0.62rem;
  line-height: 1.15;
  color: rgba(240, 253, 250, 0.95);
  border: 1px solid color-mix(in srgb, var(--event-color) 45%, transparent);
  background: color-mix(in srgb, var(--event-color) 18%, rgba(2, 6, 23, 1));
}

.event-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(236, 253, 245, 0.95);
}

.event-chip-more {
  --event-color: #5eead4;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(153, 246, 228, 0.88);
}

.agenda-panel {
  border: 1px solid rgba(45, 212, 191, 0.22);
  border-radius: 1rem;
  padding: 0.9rem;
  background:
    linear-gradient(160deg, rgba(3, 14, 28, 0.82), rgba(2, 10, 20, 0.72)),
    rgba(2, 10, 20, 0.7);
}

.agenda-title {
  margin: 0;
  color: #ecfeff;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.agenda-subtitle {
  margin: 0;
  color: rgba(165, 243, 252, 0.76);
  font-size: 0.8rem;
}

.agenda-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  border-radius: 0.8rem;
  border: 1px solid rgba(45, 212, 191, 0.16);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.62), rgba(3, 17, 31, 0.72));
  padding: 0.58rem 0.62rem;
  text-align: left;
  transition: all 170ms ease;
}

.agenda-item:hover {
  border-color: rgba(125, 211, 252, 0.66);
  transform: translateY(-1px);
}

.agenda-item.is-active {
  border-color: rgba(94, 234, 212, 0.75);
  background: linear-gradient(180deg, rgba(20, 184, 166, 0.24), rgba(15, 118, 110, 0.16));
}

.agenda-item.is-past {
  border-color: rgba(148, 163, 184, 0.28);
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.55), rgba(15, 23, 42, 0.62));
  opacity: 0.58;
}

.agenda-item.is-past .agenda-game,
.agenda-item.is-past .agenda-time {
  color: rgba(148, 163, 184, 0.85);
}

.agenda-item.is-past .agenda-dot {
  box-shadow: none;
  filter: grayscale(0.45);
}

.agenda-dot {
  width: 0.56rem;
  height: 0.56rem;
  border-radius: 999px;
  flex-shrink: 0;
  box-shadow: 0 0 12px currentColor;
}

.agenda-game {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(240, 253, 250, 0.95);
  font-size: 0.87rem;
  font-weight: 600;
}

.agenda-time {
  display: block;
  color: rgba(165, 243, 252, 0.72);
  font-size: 0.73rem;
  margin-top: 0.15rem;
}

.active-tag {
  flex-shrink: 0;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
  color: rgba(153, 246, 228, 0.95);
}

.empty-state {
  border: 1px dashed rgba(45, 212, 191, 0.35);
  border-radius: 0.8rem;
  padding: 0.9rem;
  color: rgba(153, 246, 228, 0.78);
  font-size: 0.82rem;
}

@keyframes cellRise {
  0% {
    opacity: 0;
    transform: translateY(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .calendar-cell {
    min-height: 6.2rem;
  }
}

@media (max-width: 640px) {
  .calendar-cell {
    min-height: 5.2rem;
  }

  .day-events {
    margin-right: 0;
  }

  .event-chip {
    font-size: 0.56rem;
  }
}
</style>
