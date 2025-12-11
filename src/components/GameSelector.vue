<!-- components/GameSelector.vue -->

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useTimerStore } from "../stores/timer";
import { differenceInSeconds } from "date-fns";

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
  const index = store.games.findIndex((g) => g.id === gameId);
  if (index !== -1) {
    store.setActiveGameIndex(index);
    if (gameId.startsWith("break-")) {
      const minutes = parseInt(gameId.replace("break-", ""));
      const newDate = new Date();
      newDate.setMinutes(newDate.getMinutes() + minutes);
      const game = store.games[index];
      store.setTargetDate(newDate, game.targetTimezone);
    }
    closeDropdown();
  }
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

const isGameInPast = (game: any) => {
  return differenceInSeconds(new Date(game.targetDate), new Date()) <= 0;
};

const sortedGameOptions = computed(() => {
  return [...store.gameOptions]
    .filter((game) => !isGameInPast(game))
    .sort((a, b) => {
      return (
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      );
    });
});

const sortedUtilityOptions = computed(() => {
  return [...store.utilityOptions]
    .filter((game) => !isGameInPast(game))
    .sort((a, b) => {
      return (
        new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      );
    });
});
</script>

<template>
  <div ref="dropdownRef" class="relative inline-flex">
    <button
      type="button"
      class="group relative flex w-full flex-col gap-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
      :class="[
        variant === 'hero'
          ? 'items-center rounded-3xl border border-transparent bg-slate-900/40 px-6 py-4 hover:border-sky-500/60 hover:bg-slate-900/60 sm:min-w-[400px]'
          : 'items-start rounded-2xl border border-slate-800/60 bg-slate-900/40 px-5 py-4 hover:border-slate-700/60 hover:bg-slate-800/40 hover:shadow-lg hover:shadow-sky-900/10 sm:min-w-[320px]',
        isOpen
          ? variant === 'hero'
            ? 'bg-slate-900/60'
            : 'ring-2 ring-sky-500/40 bg-slate-800/60'
          : '',
      ]"
      @click="toggleDropdown"
    >
      <!-- Hero Variant Content -->
      <template v-if="variant === 'hero'">
        <div
          class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500"
        >
          <span>Active Event</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        <div class="flex items-center gap-3">
          <span
            class="text-4xl font-black transition duration-200 sm:text-5xl"
            :style="{ color: store.activeGame.titleColor || '#f1f5f9' }"
          >
            {{ store.activeGame.title }}
          </span>
          <button
            type="button"
            class="rounded-full p-2 text-slate-400 opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover:opacity-100"
            @click.stop="$emit('edit')"
            title="Rename event"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
              />
            </svg>
          </button>
        </div>

        <p
          class="text-sm font-medium text-slate-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          Click to switch event
        </p>
      </template>

      <!-- Default Variant Content -->
      <template v-else>
        <div
          class="flex w-full items-center justify-between text-xs font-bold uppercase tracking-[0.2em] text-slate-500 transition-colors group-hover:text-emerald-400"
        >
          <span>Active Event</span>
          <span
            class="flex items-center gap-1 text-[10px] tracking-normal opacity-0 transition-all duration-300 group-hover:opacity-100"
          >
            Change
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-3 w-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m19 9-7 7-7-7" />
            </svg>
          </span>
        </div>

        <div class="flex w-full items-center justify-between gap-4">
          <span
            class="truncate text-lg font-bold text-slate-200 transition-colors group-hover:text-white sm:text-xl"
          >
            {{ store.activeGame.title }}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 shrink-0 text-slate-500 transition-transform duration-300 group-hover:text-sky-400"
            :class="{ 'rotate-180 text-sky-400': isOpen }"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </template>
    </button>

    <teleport to="body">
      <div v-if="isOpen" class="dropdown-menu-teleport" :style="dropdownStyle">
        <div
          class="glass-section w-full overflow-hidden border-slate-800/70 bg-slate-950/95 shadow-2xl shadow-slate-950/60"
        >
          <div class="border-b border-slate-800/80 bg-slate-900/80 px-4 py-3">
            <h3
              class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500"
            >
              Quick Timers
            </h3>
            <p class="text-xs text-slate-600 mt-1">
              For breaks and short activities
            </p>
          </div>
          <div class="max-h-56 overflow-y-auto px-2 py-2">
            <button
              v-for="game in sortedUtilityOptions"
              :key="game.id"
              type="button"
              class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-200 transition duration-150 hover:bg-slate-800/60"
              :class="{
                'bg-sky-600/30 text-sky-100': game.id === store.activeGame.id,
              }"
              @click="selectGame(game.id)"
            >
              <span class="truncate">{{ game.title }}</span>
            </button>
          </div>

          <div
            class="border-b border-t border-slate-800/80 bg-slate-900/80 px-4 py-3"
          >
            <h3
              class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500"
            >
              Upcoming Games
            </h3>
            <p class="text-xs text-slate-600 mt-1">Game releases and events</p>
          </div>
          <div class="max-h-72 overflow-y-auto px-2 py-2">
            <button
              v-for="game in sortedGameOptions"
              :key="game.id"
              type="button"
              class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-200 transition duration-150 hover:bg-slate-800/60"
              :class="{
                'bg-sky-600/30 text-sky-100': game.id === store.activeGame.id,
              }"
              @click="selectGame(game.id)"
            >
              <span class="truncate">{{ game.title }}</span>
              <span class="text-xs font-medium text-slate-400">
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

          <div class="border-t border-slate-800/80 bg-slate-900/80 px-4 py-3">
            <button
              type="button"
              class="btn-muted w-full justify-center"
              @click="resetGames"
            >
              Reset to Default Games
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>
