<script setup lang="ts">
import { ref, watch } from "vue";
import { useTimerStore } from "../stores/timer";

const store = useTimerStore();
const isOpen = ref(false);
const dropdownRef = ref<HTMLDivElement | null>(null);

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function closeDropdown() {
  isOpen.value = false;
}

function selectGame(gameId: string) {
  const index = store.games.findIndex((g) => g.id === gameId);
  if (index !== -1) {
    // Set the active game index first
    store.setActiveGameIndex(index);
    
    // If it's a break timer (10/15/30 min), always reset the target date
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

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
}

// Add and remove event listener
watch(isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener('mousedown', handleClickOutside);
  } else {
    document.removeEventListener('mousedown', handleClickOutside);
  }
});
</script>

<template>
  <div class="game-selector" ref="dropdownRef">
    <button 
      @click="toggleDropdown" 
      class="dropdown-button"
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
        class="transition-transform duration-200"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>
    
    <div v-if="isOpen" class="dropdown-menu">
      <div class="dropdown-section">
        <div class="dropdown-header">Utility Timers</div>
        <div class="dropdown-items">
          <button
            v-for="game in store.utilityOptions"
            :key="game.id"
            @click="selectGame(game.id)"
            class="dropdown-item"
            :class="{ 'active': game.id === store.activeGame.id }"
          >
            <span class="game-title">{{ game.title }}</span>
          </button>
        </div>
      </div>

      <div class="dropdown-section">
        <div class="dropdown-header">Games</div>
        <div class="dropdown-items">
          <button
            v-for="game in store.gameOptions"
            :key="game.id"
            @click="selectGame(game.id)"
            class="dropdown-item"
            :class="{ 'active': game.id === store.activeGame.id }"
          >
            <span class="game-title">{{ game.title }}</span>
            <span class="game-date">
              {{ new Date(game.targetDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) }}
            </span>
          </button>
        </div>
      </div>

      <div class="dropdown-footer">
        <button @click="resetGames" class="reset-button">
          Reset to Default Games
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-selector {
  position: relative;
  display: inline-block;
}

.dropdown-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-button:hover {
  background-color: var(--primary-color);
  color: white;
}

.dropdown-button.is-active {
  background-color: var(--primary-color);
  color: white;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.25rem);
  left: 0;
  min-width: 16rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 50;
  overflow: hidden;
  animation: dropdown-appear 0.2s ease;
}

@keyframes dropdown-appear {
  from {
    opacity: 0;
    transform: translateY(-0.25rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-section {
  border-bottom: 1px solid var(--border-color);
}

.dropdown-section:last-of-type {
  border-bottom: none;
}

.dropdown-header {
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.875rem;
  border-bottom: 1px solid var(--border-color);
}

.dropdown-items {
  max-height: 15rem;
  overflow-y: auto;
}

.dropdown-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 0.75rem 1rem;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: var(--bg-secondary);
}

.dropdown-item.active {
  background-color: var(--primary-color);
  color: white;
}

.game-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.game-date {
  font-size: 0.75rem;
  opacity: 0.7;
}

.dropdown-footer {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border-color);
}

.reset-button {
  width: 100%;
  padding: 0.5rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  color: var(--text-primary);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.reset-button:hover {
  background-color: var(--primary-color);
  color: white;
}
</style>
