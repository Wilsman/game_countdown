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
      top: `${rect.bottom + window.scrollY + 4}px`,
      left: `${rect.left + window.scrollX}px`,
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
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
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
  return [...store.gameOptions].sort((a, b) => {
    return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
  });
});

const sortedUtilityOptions = computed(() => {
  return [...store.utilityOptions].sort((a, b) => {
    return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
  });
});
</script>

<template>
  <div class="game-selector" ref="dropdownRef">
    <button
      @click="toggleDropdown"
      class="dropdown-button soft-btn"
      :class="{ 'is-active': isOpen }"
    >
      <span>Choose Option</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        :class="{ 'rotate-180': isOpen }"
        style="transition: transform 0.2s ease;"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <teleport to="body">
      <div v-if="isOpen" class="dropdown-menu surface-3d" :style="dropdownStyle">
      <div class="dropdown-section">
        <div class="dropdown-header">Utility Timers</div>
        <div class="dropdown-items">
          <button
            v-for="game in sortedUtilityOptions"
            :key="game.id"
            @click="selectGame(game.id)"
            class="dropdown-item"
            :class="{
              'active': game.id === store.activeGame.id,
              'completed': isGameInPast(game)
            }"
          >
            <span class="game-title">{{ game.title }}</span>
            <span v-if="isGameInPast(game)" class="completed-badge">Completed</span>
          </button>
        </div>
      </div>

      <div class="dropdown-section">
        <div class="dropdown-header">Games</div>
        <div class="dropdown-items">
          <button
            v-for="game in sortedGameOptions"
            :key="game.id"
            @click="selectGame(game.id)"
            class="dropdown-item"
            :class="{
              'active': game.id === store.activeGame.id,
              'completed': isGameInPast(game)
            }"
          >
            <span class="game-title">{{ game.title }}</span>
            <div class="game-meta">
              <span class="game-date">
                {{ new Date(game.targetDate).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) }}
              </span>
              <span v-if="isGameInPast(game)" class="completed-badge">Completed</span>
            </div>
          </button>
        </div>
      </div>

      <div class="dropdown-footer">
        <button @click="resetGames" class="reset-button soft-btn-strong">
          Reset to Default Games
        </button>
      </div>
    </div>
  </teleport>
  </div>
</template>

<style scoped>
.game-selector {
  position: relative;
  display: inline-block;
}

.dropdown-button {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.9rem;
  font-size: 0.9rem;
}

.dropdown-button.is-active {
  outline: 2px solid rgba(34,211,238,0.25);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 50%;
  /* transform: translateX(-50%); */
  min-width: 18rem;
  background: rgba(12,12,12,1); 
  border: 1px solid var(--border-color, rgba(255,255,255,0.10));
  border-radius: 12px;
  box-shadow: 0 18px 50px rgba(0,0,0,0.45);
  z-index: 9999999;
  overflow: hidden;
  animation: dropdown-appear 0.18s ease;
}

@keyframes dropdown-appear {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.dropdown-section { border-bottom: 1px solid var(--border-color); }
.dropdown-section:last-of-type { border-bottom: none; }

.dropdown-header {
  padding: 0.75rem 0.9rem;
  font-weight: 800;
  font-size: 0.82rem;
  color: var(--text-primary);
  letter-spacing: 0.02em;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
}

.dropdown-items { max-height: 16rem; overflow-y: auto; }

.dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0.55rem 0.9rem;
  text-align: left;
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.12s ease, opacity 0.2s ease;
}
.dropdown-item:hover { background-color: rgba(255,255,255,0.3); }
.dropdown-item.active {
  background: rgba(6,182,212,0.6);
  border-left: 2px solid var(--accent-300);
}
.dropdown-item.completed { opacity: 0.6; }
.dropdown-item.completed .game-title { text-decoration: line-through; }

.game-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
.game-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;
}
.game-date { font-size: 0.78rem; color: var(--text-300); white-space: nowrap; }

.completed-badge {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.15rem 0.35rem;
  border-radius: 0.35rem;
  background: rgba(239,68,68,0.8);
  color: #FCA5A5;
  border: 1px solid rgba(239,68,68,0.8);
}

.dropdown-footer {
  padding: 0.75rem 0.9rem;
  border-top: 1px solid var(--border-color);
}

.reset-button {
  width: 100%;
  font-size: 0.83rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>