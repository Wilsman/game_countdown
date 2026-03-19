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
const isCompactViewport = ref(false);

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

const dayColumnTemplate = computed(() => {
  if (isCompactViewport.value) {
    return "1fr 1fr 1fr 1fr 1fr 1fr 1fr";
  }

  const weights = [0.88, 0.88, 0.88, 0.88, 0.88, 0.88, 0.88];

  monthCells.value.forEach((cell) => {
    const weekday = cell.date.getUTCDay();
    if (cell.events.length > 0) {
      weights[weekday] = Math.min(
        1.45,
        weights[weekday] + Math.min(0.22 * cell.events.length, 0.42)
      );
    }
  });

  return weights.map((weight) => `${weight.toFixed(2)}fr`).join(" ");
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

function formatCompactEventTitle(title: string): string {
  const withoutSuffix = title.replace(/\s+\([^)]*\)\s*$/u, "").trim();
  if (withoutSuffix.length <= 34) {
    return withoutSuffix;
  }

  return `${withoutSuffix.slice(0, 31).trimEnd()}...`;
}

function formatOverflowEventList(events: GameOption[]): string {
  return events.map((event) => formatCompactEventTitle(event.title)).join("\n");
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

function syncViewportMode(): void {
  if (typeof window === "undefined") return;
  isCompactViewport.value = window.innerWidth < 1180;
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
  store.selectGameById(gameId);
}

onMounted(() => {
  syncViewportMode();
  window.addEventListener("resize", syncViewportMode);

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
  window.removeEventListener("resize", syncViewportMode);

  if (nowTicker) {
    window.clearInterval(nowTicker);
  }
});
</script>

<template>
  <section class="calendar-shell glass-section mt-10 w-full px-5 py-5 sm:px-6 sm:py-6">
    <header
      class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
    >
      <h2 class="calendar-title">{{ monthLabel }}</h2>

      <div class="flex flex-wrap items-center gap-2">
        <button type="button" class="calendar-btn" @click="shiftMonth(-1)">
          Prev
        </button>
        <button type="button" class="calendar-btn" @click="jumpToCurrentMonth">
          Today
        </button>
        <button type="button" class="calendar-btn" @click="jumpToFirstUpcoming">
          Next launch
        </button>
        <button type="button" class="calendar-btn" @click="shiftMonth(1)">
          Next
        </button>
      </div>
    </header>

    <div class="grid gap-5 2xl:grid-cols-[3.2fr_1fr]">
      <div class="space-y-2">
        <div
          class="grid gap-1.5"
          :style="{ gridTemplateColumns: dayColumnTemplate }"
        >
          <span
            v-for="day in dayLabels"
            :key="day"
            class="calendar-day-label"
          >
            {{ day }}
          </span>
        </div>

        <div
          class="grid gap-1.5"
          :style="{ gridTemplateColumns: dayColumnTemplate }"
        >
          <button
            v-for="cell in monthCells"
            :key="cell.key"
            type="button"
            class="calendar-cell"
            :class="{
              'is-off': !cell.inCurrentMonth,
              'is-today': cell.isToday,
              'has-events': cell.events.length > 0,
              'is-selected': selectedDateKey === cell.key,
            }"
            @click="selectDate(cell.key)"
          >
            <span class="calendar-day-number">{{ cell.dayNumber }}</span>

            <div v-if="cell.events.length > 0" class="day-events mt-2 space-y-1">
              <span
                v-for="event in cell.events.slice(0, 2)"
                :key="event.id"
                class="event-chip"
                :style="{ '--event-color': event.titleColor || '#f59e0b' }"
              >
                <span class="event-title">{{ event.title }}</span>
              </span>
              <span
                v-if="cell.events.length > 2"
                class="event-chip event-chip-more"
                :title="formatOverflowEventList(cell.events.slice(2))"
                :aria-label="`More games: ${formatOverflowEventList(cell.events.slice(2)).replace(/\n/g, ', ')}`"
              >
                +{{ cell.events.length - 2 }} more
              </span>
            </div>
          </button>
        </div>
      </div>

      <aside class="agenda-panel">
        <div class="mb-3 space-y-1">
          <h3 class="agenda-title">This week</h3>
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
              :style="{ backgroundColor: game.titleColor || '#f59e0b' }"
              aria-hidden="true"
            ></span>
            <span class="min-w-0 flex-1">
              <span class="agenda-game">{{ game.title }}</span>
              <span class="agenda-time">
                {{ formatEventDate(game) }} · {{ formatDaysUntil(game) }}
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
  background: rgba(28, 27, 27, 0.9);
}

.calendar-title {
  margin: 0;
  color: #e5e2e1;
  font-family: "Geist Mono", monospace;
  font-size: clamp(1.55rem, 1.8vw + 1rem, 2.3rem);
  font-weight: 600;
  line-height: 1.05;
}

.calendar-btn {
  border: 1px solid rgba(126, 210, 235, 0.14);
  background: #1c1b1b;
  color: #a7ccda;
  padding: 0.45rem 0.8rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    color 150ms ease;
}

.calendar-btn:hover {
  background: rgba(126, 210, 235, 0.06);
  border-color: rgba(126, 210, 235, 0.24);
  color: #e5e2e1;
}

.calendar-day-label {
  padding: 0 0.25rem 0.15rem;
  color: rgba(167, 204, 218, 0.56);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-align: left;
}

.calendar-cell {
  min-height: 8rem;
  border: 1px solid rgba(126, 210, 235, 0.08);
  background: rgba(32, 31, 31, 0.9);
  color: #e5e2e1;
  overflow: hidden;
  padding: 0.5rem;
  text-align: left;
  transition:
    background-color 150ms ease,
    border-color 150ms ease;
}

.calendar-cell:hover {
  background: rgba(53, 53, 52, 0.65);
  border-color: rgba(126, 210, 235, 0.18);
}

.calendar-cell.is-selected {
  background: rgba(126, 210, 235, 0.08);
  border-color: rgba(126, 210, 235, 0.35);
}

.calendar-cell.is-today {
  box-shadow: inset 0 -1px 0 rgba(255, 186, 61, 0.6);
}

.calendar-cell.is-off {
  opacity: 0.46;
}

.calendar-day-number {
  color: #e5e2e1;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: "Geist Mono", monospace;
}

.event-chip {
  display: block;
  border-left: 2px solid var(--event-color);
  background: rgba(14, 14, 14, 0.72);
  color: #e5e2e1;
  padding: 0.28rem 0.4rem;
}

.event-chip-more {
  border-left-color: rgba(126, 210, 235, 0.16);
  color: rgba(167, 204, 218, 0.7);
}

.event-title {
  display: -webkit-box;
  font-size: 0.7rem;
  font-weight: 500;
  line-height: 1.25;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.agenda-panel {
  border: 1px solid rgba(126, 210, 235, 0.12);
  background: rgba(14, 14, 14, 0.54);
  padding: 1rem;
}

.agenda-title {
  margin: 0;
  color: #e5e2e1;
  font-size: 1rem;
  font-weight: 600;
  font-family: "Geist Mono", monospace;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.agenda-subtitle {
  margin: 0;
  color: rgba(167, 204, 218, 0.58);
  font-size: 0.8125rem;
}

.empty-state {
  border: 1px dashed rgba(126, 210, 235, 0.14);
  color: rgba(167, 204, 218, 0.7);
  padding: 0.9rem;
  text-align: center;
  font-size: 0.875rem;
}

.agenda-item {
  align-items: flex-start;
  background: rgba(32, 31, 31, 0.9);
  border: 1px solid rgba(126, 210, 235, 0.08);
  color: inherit;
  display: flex;
  gap: 0.75rem;
  padding: 0.8rem 0.85rem;
  transition:
    background-color 150ms ease,
    border-color 150ms ease;
  width: 100%;
}

.agenda-item:hover {
  background: rgba(53, 53, 52, 0.7);
  border-color: rgba(126, 210, 235, 0.18);
}

.agenda-item.is-active {
  background: rgba(126, 210, 235, 0.08);
  border-color: rgba(126, 210, 235, 0.28);
}

.agenda-item.is-past {
  opacity: 0.58;
}

.agenda-dot {
  border-radius: 999px;
  flex-shrink: 0;
  height: 0.6rem;
  margin-top: 0.35rem;
  width: 0.6rem;
}

.agenda-game {
  color: #e5e2e1;
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.3;
}

.agenda-time {
  color: rgba(167, 204, 218, 0.64);
  display: block;
  font-size: 0.75rem;
  margin-top: 0.2rem;
}

.active-tag {
  color: #ffba3d;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding-top: 0.1rem;
}

@media (max-width: 767px) {
  .calendar-cell {
    min-height: 7rem;
  }
}
</style>
