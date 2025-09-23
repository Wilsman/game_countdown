<!-- components/GameSelector.vue -->

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useTimerStore } from "../stores/timer";
import { differenceInSeconds } from "date-fns";

const store = useTimerStore();
const isOpen = ref(false);
const dropdownRef = ref<HTMLDivElement | null>(null);
const dropdownStyle = ref({});

const updateDropdownPosition = () => {
  if (dropdownRef.value && isOpen.value) {
    const rect = dropdownRef.value.getBoundingClientRect();
    dropdownStyle.value = {
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
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
function closeDropdown() { isOpen.value = false; }

function selectGame(gameId: string) {
  const index = store.games.findIndex((g) => g.id === gameId);
  if (index !== -1) {
    store.setActiveGameIndex(index);
    if (gameId.startsWith('break-')) {
      const minutes = parseInt(gameId.replace('break-', ''));
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
  const dropdownElement = document.querySelector('.dropdown-menu-teleport');
  if (dropdownElement && !dropdownElement.contains(event.target as Node) && 
      dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
}

watch(isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', updateDropdownPosition);
    window.addEventListener('scroll', updateDropdownPosition);
  } else {
    document.removeEventListener('mousedown', handleClickOutside);
    window.removeEventListener('resize', updateDropdownPosition);
    window.removeEventListener('scroll', updateDropdownPosition);
  }
});

const isGameInPast = (game: any) => {
  return differenceInSeconds(new Date(game.targetDate), new Date()) <= 0;
};

const sortedGameOptions = computed(() => {
  return [...store.gameOptions]
    .filter(game => !isGameInPast(game))
    .sort((a, b) => {
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    });
});

const sortedUtilityOptions = computed(() => {
  return [...store.utilityOptions]
    .filter(game => !isGameInPast(game))
    .sort((a, b) => {
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    });
});
</script>

<template>
  <div ref="dropdownRef" class="relative inline-flex">
    <button
      type="button"
      class="btn-muted pl-3 pr-2"
      :class="{ 'ring-2 ring-sky-500/40': isOpen }"
      @click="toggleDropdown"
    >
      <span class="text-sm font-semibold">Choose Option</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 transition-transform duration-200"
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
      <div
        v-if="isOpen"
        class="dropdown-menu-teleport"
        :style="dropdownStyle"
      >
        <div
          class="glass-section w-72 overflow-hidden border-slate-800/70 bg-slate-950/95 shadow-2xl shadow-slate-950/60"
        >
          <div class="border-b border-slate-800/80 bg-slate-900/80 px-4 py-3">
            <h3 class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Utility Timers
            </h3>
          </div>
          <div class="max-h-56 overflow-y-auto px-2 py-2">
            <button
              v-for="game in sortedUtilityOptions"
              :key="game.id"
              type="button"
              class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-200 transition duration-150 hover:bg-slate-800/60"
              :class="{ 'bg-sky-600/30 text-sky-100': game.id === store.activeGame.id }"
              @click="selectGame(game.id)"
            >
              <span class="truncate">{{ game.title }}</span>
            </button>
          </div>

          <div class="border-b border-t border-slate-800/80 bg-slate-900/80 px-4 py-3">
            <h3 class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Games
            </h3>
          </div>
          <div class="max-h-72 overflow-y-auto px-2 py-2">
            <button
              v-for="game in sortedGameOptions"
              :key="game.id"
              type="button"
              class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-200 transition duration-150 hover:bg-slate-800/60"
              :class="{ 'bg-sky-600/30 text-sky-100': game.id === store.activeGame.id }"
              @click="selectGame(game.id)"
            >
              <span class="truncate">{{ game.title }}</span>
              <span class="text-xs font-medium text-slate-400">
                {{ new Date(game.targetDate).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) }}
              </span>
            </button>
          </div>

          <div class="border-t border-slate-800/80 bg-slate-900/80 px-4 py-3">
            <button type="button" class="btn-muted w-full justify-center" @click="resetGames">
              Reset to Default Games
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>