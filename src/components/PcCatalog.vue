<script setup lang="ts">
import { computed, ref } from "vue";
import { useStorage } from "@vueuse/core";

import { pcGames, type PcGame } from "../data/pc-games";
import { useNow } from "../hooks/useNow";
import type {
  DateTypeKey,
  SortOption,
  TimeRemaining,
  ViewMode,
} from "../types/pc-catalog";
import PcGameCard from "./PcGameCard.vue";
import SparkleToggle from "./SparkleToggle.vue";

interface GameGroup {
  key: string;
  label: string;
  count: number;
  date: Date;
  games: PcGame[];
  isTba: boolean;
}

interface DateTypeOption {
  key: DateTypeKey;
  label: string;
}

const emit = defineEmits<{ (e: "back"): void }>();

const now = useNow();

const favorites = useStorage<string[]>("pc-favorites", []);

const hypeMap = ref<Record<string, number>>(
  Object.fromEntries(pcGames.map((game) => [game.id, game.hype])),
);

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dateTypeOptions: DateTypeOption[] = [
  { key: "exact", label: "With Date" },
  { key: "approx", label: "Approx. Date" },
  { key: "tba", label: "TBA" },
];

const selectedMonth = ref<number | "all">("all");
const selectedYear = ref<number | "all">("all");
const sortBy = ref<SortOption>("default");
const viewMode = ref<ViewMode>("grid");
const searchQuery = ref("");
const activeDateTypes = ref<Record<DateTypeKey, boolean>>({
  exact: true,
  approx: true,
  tba: true,
});

const years = computed<number[]>(() => {
  const set = new Set<number>();
  for (const game of pcGames) {
    set.add(new Date(game.targetDate).getUTCFullYear());
  }
  return [...set].sort((a, b) => a - b);
});

function getTimeToRelease(isoDate: string, time: Date): TimeRemaining {
  const target = new Date(isoDate);
  const diffMs = target.getTime() - time.getTime();
  const diff = Math.max(0, Math.floor(diffMs / 1000));

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  return { days, hours, minutes, seconds };
}

function gameYear(game: PcGame): number {
  return new Date(game.targetDate).getUTCFullYear();
}

function gameMonth(game: PcGame): number {
  return new Date(game.targetDate).getUTCMonth();
}

function matchesSearch(game: PcGame, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    game.title.toLowerCase().includes(q) ||
    game.publisher.toLowerCase().includes(q) ||
    game.developer.toLowerCase().includes(q)
  );
}

const filteredGames = computed<PcGame[]>(() => {
  let result = pcGames.filter((game) => {
    if (!activeDateTypes.value[game.dateType]) return false;
    if (!matchesSearch(game, searchQuery.value)) return false;
    if (selectedYear.value !== "all" && gameYear(game) !== selectedYear.value)
      return false;
    if (selectedMonth.value !== "all") {
      if (game.dateType !== "exact") return false;
      if (gameMonth(game) !== selectedMonth.value) return false;
    }
    return true;
  });

  switch (sortBy.value) {
    case "az":
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "za":
      result = [...result].sort((a, b) => b.title.localeCompare(a.title));
      break;
    case "hype_desc":
      result = [...result].sort(
        (a, b) => (hypeMap.value[b.id] ?? 0) - (hypeMap.value[a.id] ?? 0),
      );
      break;
    case "hype_asc":
      result = [...result].sort(
        (a, b) => (hypeMap.value[a.id] ?? 0) - (hypeMap.value[b.id] ?? 0),
      );
      break;
    case "default":
    default:
      result = [...result].sort((a, b) => {
        const dateDiff =
          new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        if (dateDiff !== 0) return dateDiff;
        return a.title.localeCompare(b.title);
      });
  }

  return result;
});

const countdowns = computed<Record<string, TimeRemaining>>(() => {
  return Object.fromEntries(
    filteredGames.value.map((game) => [
      game.id,
      getTimeToRelease(game.targetDate, now.value),
    ]),
  );
});

const groupedGames = computed<GameGroup[]>(() => {
  const map = new Map<string, GameGroup>();

  for (const game of filteredGames.value) {
    const year = gameYear(game);
    let key: string;
    let label: string;
    let sortDate: Date;
    let isTba = false;

    if (game.dateType === "tba") {
      key = `tba-${year}`;
      label = `TBA ${year}`;
      sortDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59));
      isTba = true;
    } else {
      const date = new Date(game.targetDate);
      const month = date.getUTCMonth();
      const monthName = months[month];
      key = `${year}-${month}`;
      label = `${monthName} ${year}`;
      sortDate = date;
    }

    const group = map.get(key) ?? {
      key,
      label,
      count: 0,
      date: sortDate,
      games: [],
      isTba,
    };
    group.games.push(game);
    group.count += 1;
    map.set(key, group);
  }

  const groups = [...map.values()];
  groups.sort((a, b) => a.date.getTime() - b.date.getTime());

  for (const group of groups) {
    group.games = [...group.games].sort((a, b) => {
      if (group.isTba) {
        return a.title.localeCompare(b.title);
      }
      if (sortBy.value === "hype_desc") {
        return (hypeMap.value[b.id] ?? 0) - (hypeMap.value[a.id] ?? 0);
      }
      if (sortBy.value === "hype_asc") {
        return (hypeMap.value[a.id] ?? 0) - (hypeMap.value[b.id] ?? 0);
      }
      if (sortBy.value === "az") return a.title.localeCompare(b.title);
      if (sortBy.value === "za") return b.title.localeCompare(a.title);
      return (
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime() ||
        a.title.localeCompare(b.title)
      );
    });
  }

  return groups;
});

const viewClasses = computed<string>(() => {
  if (viewMode.value === "grid") {
    return "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";
  }
  return "flex flex-col gap-3";
});

function isCurrentMonth(date: Date): boolean {
  return (
    date.getUTCMonth() === now.value.getUTCMonth() &&
    date.getUTCFullYear() === now.value.getUTCFullYear()
  );
}

function toggleFavorite(id: string): void {
  if (favorites.value.includes(id)) {
    favorites.value = favorites.value.filter((fav) => fav !== id);
  } else {
    favorites.value = [...favorites.value, id];
  }
}

function hypeGame(id: string): void {
  if (typeof hypeMap.value[id] === "number") {
    hypeMap.value[id] += 1;
  }
}

function resetFilters(): void {
  selectedMonth.value = "all";
  selectedYear.value = "all";
  sortBy.value = "default";
  searchQuery.value = "";
  activeDateTypes.value = { exact: true, approx: true, tba: true };
}
</script>

<template>
  <div class="pc-catalog min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
    <header
      class="sticky top-0 z-50 border-b border-[#191919] bg-[#0a0a0a]/95 backdrop-blur"
    >
      <div
        class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
      >
        <div class="flex items-center gap-3">
          <SparkleToggle mode="to-home" @click="emit('back')" />
          <h1 class="text-lg font-bold text-[#f5f5f5] sm:text-xl">
            PC Game Countdowns
          </h1>
        </div>
        <span
          class="hidden rounded-full bg-[#346bf1]/10 px-2.5 py-0.5 text-xs font-semibold text-[#346bf1] sm:inline"
        >
          Beta
        </span>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section class="mb-8 rounded-2xl border border-[#191919] bg-[#111111] p-6 sm:p-8">
        <h2 class="text-2xl font-bold text-[#f5f5f5] sm:text-3xl">
          Upcoming PC Game Releases
        </h2>
        <p class="mt-2 max-w-3xl text-[#818181]">
          Track the most anticipated PC game releases with real-time countdowns.
          Filter by month, year, and release status to find your next game.
        </p>
      </section>

      <div class="mb-8 rounded-2xl border border-[#191919] bg-[#111111] p-4 sm:p-6">
        <div
          class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
        >
          <div class="flex flex-wrap items-center gap-3">
            <select
              v-model="selectedMonth"
              class="rounded-lg border border-[#191919] bg-[#1e1e1e] px-3 py-2 text-sm text-[#f5f5f5] focus:border-[#346bf1] focus:outline-none"
              aria-label="Filter by month"
            >
              <option value="all">All Months</option>
              <option
                v-for="(month, index) in months"
                :key="month"
                :value="index"
              >
                {{ month }}
              </option>
            </select>

            <select
              v-model="selectedYear"
              class="rounded-lg border border-[#191919] bg-[#1e1e1e] px-3 py-2 text-sm text-[#f5f5f5] focus:border-[#346bf1] focus:outline-none"
              aria-label="Filter by year"
            >
              <option value="all">All Years</option>
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>

            <select
              v-model="sortBy"
              class="rounded-lg border border-[#191919] bg-[#1e1e1e] px-3 py-2 text-sm text-[#f5f5f5] focus:border-[#346bf1] focus:outline-none"
              aria-label="Sort games"
            >
              <option value="default">Unsorted</option>
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
              <option value="hype_desc">Most Hype</option>
              <option value="hype_asc">Less Hype</option>
            </select>

            <div
              class="inline-flex rounded-lg border border-[#191919] bg-[#1e1e1e] p-1"
            >
              <button
                type="button"
                class="rounded-md p-2 transition"
                :class="{
                  'bg-[#346bf1] text-[#f5f5f5]': viewMode === 'grid',
                  'text-[#818181] hover:text-[#f5f5f5]': viewMode !== 'grid',
                }"
                aria-label="Grid view"
                @click="viewMode = 'grid'"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </button>
              <button
                type="button"
                class="rounded-md p-2 transition"
                :class="{
                  'bg-[#346bf1] text-[#f5f5f5]': viewMode === 'list',
                  'text-[#818181] hover:text-[#f5f5f5]': viewMode !== 'list',
                }"
                aria-label="List view"
                @click="viewMode = 'list'"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search games..."
              class="w-full rounded-lg border border-[#191919] bg-[#1e1e1e] px-4 py-2 text-sm text-[#f5f5f5] placeholder-[#818181] focus:border-[#346bf1] focus:outline-none sm:w-64"
            />
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-lg border border-[#191919] bg-[#1e1e1e] px-3 py-2 text-sm font-medium text-[#f5f5f5] transition hover:border-[#fb414a] hover:text-[#fb414a]"
              @click="resetFilters"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Reset
            </button>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-5">
          <label
            v-for="option in dateTypeOptions"
            :key="option.key"
            class="inline-flex cursor-pointer items-center gap-2 text-sm text-[#f5f5f5]"
          >
            <input
              v-model="activeDateTypes[option.key]"
              type="checkbox"
              class="h-4 w-4 accent-[#346bf1]"
            />
            {{ option.label }}
          </label>
        </div>
      </div>

      <div v-if="groupedGames.length" class="space-y-10">
        <section v-for="group in groupedGames" :key="group.key">
          <div
            class="mb-4 flex flex-wrap items-center gap-3 border-b border-[#191919] pb-2"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-[#346bf1]"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h3
              class="text-base font-bold uppercase tracking-wide text-[#f5f5f5] sm:text-lg"
            >
              {{ group.label }}
              <span class="mx-2 text-[#818181]">·</span>
              <span class="text-[#818181]">{{ group.count }} games</span>
            </h3>
            <span
              v-if="isCurrentMonth(group.date) && !group.isTba"
              class="ml-auto rounded-full bg-[#346bf1]/10 px-2.5 py-0.5 text-xs font-semibold text-[#346bf1]"
            >
              Current Month
            </span>
          </div>

          <div :class="viewClasses">
            <PcGameCard
              v-for="game in group.games"
              :key="game.id"
              :game="game"
              :view="viewMode"
              :countdown="countdowns[game.id] ?? null"
              :is-favorite="favorites.includes(game.id)"
              :hype-count="hypeMap[game.id] ?? 0"
              @toggle-favorite="toggleFavorite"
              @hype="hypeGame"
            />
          </div>
        </section>
      </div>

      <div v-else class="py-20 text-center text-[#818181]">
        No games match your filters.
      </div>
    </main>
  </div>
</template>
