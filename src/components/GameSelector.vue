<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { differenceInSeconds } from "date-fns";

import { useTimerStore } from "../stores/timer";

const store = useTimerStore();
const isOpen = ref(false);

withDefaults(
  defineProps<{
    variant?: "default" | "hero";
  }>(),
  {
    variant: "default",
  }
);

defineEmits<{
  (e: "edit"): void;
}>();

const dropdownRef = ref<HTMLDivElement | null>(null);
const dropdownStyle = ref({});

type RegionalGame = {
  targetDate: Date | string;
  targetTimezone: string;
  regionalReleaseTimes?: Array<{
    label: string;
    timezone: string;
    date: Date | string;
  }>;
};

const updateDropdownPosition = () => {
  if (dropdownRef.value && isOpen.value) {
    const rect = dropdownRef.value.getBoundingClientRect();
    dropdownStyle.value = {
      position: "fixed",
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: 9999,
    };
  }
};

function toggleDropdown() {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    setTimeout(updateDropdownPosition, 0);
  }
}

function closeDropdown() {
  isOpen.value = false;
}

function selectGame(gameId: string) {
  store.selectGameById(gameId);
  closeDropdown();
}

function resetGames() {
  store.resetGames();
  closeDropdown();
}

function handleClickOutside(event: MouseEvent) {
  const dropdownElement = document.querySelector(".dropdown-menu-teleport");
  if (
    dropdownElement &&
    !dropdownElement.contains(event.target as Node) &&
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target as Node)
  ) {
    closeDropdown();
  }
}

watch(isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition);
  } else {
    document.removeEventListener("mousedown", handleClickOutside);
    window.removeEventListener("resize", updateDropdownPosition);
    window.removeEventListener("scroll", updateDropdownPosition);
  }
});

const isGameInPast = (game: RegionalGame) =>
  differenceInSeconds(new Date(game.targetDate), new Date()) <= 0;

const sortedGameOptions = computed(() => {
  return [...store.gameOptions]
    .filter((game) => !isGameInPast(game))
    .sort(
      (a, b) =>
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    );
});

const sortedUtilityOptions = computed(() => {
  return [...store.utilityOptions]
    .filter((game) => !isGameInPast(game))
    .sort(
      (a, b) =>
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    );
});

const getRegionalReleaseLabel = (game: RegionalGame): string | null => {
  const regionalRelease = game.regionalReleaseTimes?.find((candidate) => {
    return (
      candidate.timezone === game.targetTimezone &&
      new Date(candidate.date).getTime() === new Date(game.targetDate).getTime()
    );
  });

  return regionalRelease?.label ?? null;
};

const activeRegionalReleaseLabel = computed(() => {
  if (!store.activeGame?.regionalReleaseTimes?.length) return null;
  return getRegionalReleaseLabel(store.activeGame);
});

const activeDateLabel = computed(() => {
  const game = store.activeGame;
  const timeZone = game.targetTimezone || "UTC";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone,
    }).format(new Date(game.targetDate));
  } catch {
    return new Date(game.targetDate).toLocaleString();
  }
});
</script>

<template>
  <div ref="dropdownRef" class="relative w-full">
    <template v-if="variant === 'hero'">
      <button
        type="button"
        class="w-full border border-cyan-200/12 bg-[#1c1b1b] px-5 py-6 text-center transition duration-150 hover:border-cyan-200/28 hover:bg-[#201f1f] focus:outline-none focus:ring-2 focus:ring-cyan-300/25"
        @click="toggleDropdown"
      >
        <div
          class="text-balance font-semibold leading-[0.98] text-[#e5e2e1]"
          :class="'text-3xl sm:text-4xl lg:text-5xl'"
          :style="{
            color: store.activeGame.titleColor || undefined,
            fontFamily: 'Geist Mono, monospace',
          }"
        >
          {{ store.activeGame.title }}
        </div>

        <div
          class="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-medium text-cyan-100/70"
        >
          <span v-if="activeRegionalReleaseLabel">
            {{ activeRegionalReleaseLabel }}
          </span>
          <span>{{ activeDateLabel }}</span>
        </div>

        <p class="mt-3 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-cyan-100/38">
          Click title to switch timer
        </p>
      </button>
    </template>

    <button
      v-else
      type="button"
      class="flex w-full items-center justify-between gap-4 border border-cyan-200/12 bg-[#1c1b1b] px-4 py-3 text-left transition duration-150 hover:border-cyan-200/28 hover:bg-[#201f1f] focus:outline-none focus:ring-2 focus:ring-cyan-300/25"
      @click="toggleDropdown"
    >
      <span class="min-w-0">
        <span class="block truncate font-mono text-base font-semibold text-[#e5e2e1]">
          {{ store.activeGame.title }}
        </span>
        <span class="block truncate text-sm text-cyan-100/55">
          {{ activeRegionalReleaseLabel || activeDateLabel }}
        </span>
      </span>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 shrink-0 text-cyan-100/45 transition-transform duration-150"
        :class="{ 'rotate-180': isOpen }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>

    <teleport to="body">
      <div v-if="isOpen" class="dropdown-menu-teleport" :style="dropdownStyle">
        <div class="glass-section w-full overflow-hidden">
          <div class="border-b border-cyan-200/10 px-4 py-3">
            <h3 class="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200/75">
              Quick timers
            </h3>
          </div>

          <div class="max-h-56 overflow-y-auto px-2 py-2">
            <button
              v-for="game in sortedUtilityOptions"
              :key="game.id"
              type="button"
              class="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm font-medium text-[#e5e2e1] transition duration-150 hover:bg-cyan-200/[0.04]"
              :class="{
                'bg-cyan-200/[0.08] text-cyan-50': game.id === store.activeGame.id,
              }"
              @click="selectGame(game.id)"
            >
              <span class="truncate">{{ game.title }}</span>
            </button>
          </div>

          <div class="border-y border-cyan-200/10 px-4 py-3">
            <h3 class="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200/75">
              Upcoming games
            </h3>
          </div>

          <div class="max-h-72 overflow-y-auto px-2 py-2">
            <button
              v-for="game in sortedGameOptions"
              :key="game.id"
              type="button"
              class="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm font-medium text-[#e5e2e1] transition duration-150 hover:bg-cyan-200/[0.04]"
              :class="{
                'bg-cyan-200/[0.08] text-cyan-50': game.id === store.activeGame.id,
              }"
              @click="selectGame(game.id)"
            >
              <span class="min-w-0 flex-1">
                <span class="block truncate">{{ game.title }}</span>
                <span
                  v-if="game.regionalReleaseTimes?.length"
                  class="mt-1 block text-xs uppercase tracking-[0.12em] text-cyan-100/45"
                >
                  Choose location
                </span>
              </span>
              <span class="text-xs text-cyan-100/45">
                {{
                  new Date(game.targetDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                }}
              </span>
            </button>
          </div>

          <div class="border-t border-cyan-200/10 px-4 py-3">
            <button
              type="button"
              class="btn-muted w-full justify-center"
              @click="resetGames"
            >
              Reset default games
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>
