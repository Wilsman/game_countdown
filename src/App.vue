<script setup lang="ts">
import { useTimerStore } from './stores/timer'
import { onMounted, watch } from 'vue'
import TimerDisplay from './components/TimerDisplay.vue'
import SettingsPanel from './components/SettingsPanel.vue'

const store = useTimerStore()

onMounted(() => {
  store.loadFromLocalStorage()
  
  const params = new URLSearchParams(window.location.search)
  const targetDate = params.get('target')
  const theme = params.get('theme')
  const title = params.get('title')
  
  if (targetDate) {
    store.setTargetDate(new Date(targetDate))
    store.isEditMode = false
  }
  
  if (theme) {
    store.updateSettings({ theme })
  }

  if (title) {
    store.setGameTitle(title)
  }
})

watch(
  () => store.settings.theme,
  (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  },
  { immediate: true }
)
</script>

<template>
  <div :class="[
    'min-h-screen transition-colors duration-300',
    store.settings.theme === 'dark' ? 'dark' : ''
  ]">
    <main class="h-screen flex">
      <div class="flex-1 flex items-center justify-center p-4">
        <TimerDisplay />
      </div>
      
      <div v-if="store.isEditMode" class="w-96 h-screen overflow-y-auto bg-secondary border-l border-border">
        <SettingsPanel />
      </div>
      
      <button
        @click="store.toggleMode"
        class="fixed bottom-6 right-6 mode-toggle"
      >
        {{ store.isEditMode ? 'Preview Mode' : 'Edit Mode' }}
      </button>
    </main>
  </div>
</template>

<style>
:root {
  --primary-color: #646cff;
  --primary-color-hover: #535bf2;
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-input: #ffffff;
  --text-primary: #111827;
  --border-color: #e5e7eb;
}

.dark {
  --bg-primary: #1a1a1a;
  --bg-secondary: #27272a;
  --bg-input: #3f3f46;
  --text-primary: #ffffff;
  --border-color: #52525b;
}

body {
  margin: 0;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.mode-toggle {
  padding: 0.875rem 2rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.125rem;
  z-index: 50;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.mode-toggle:hover {
  background-color: var(--primary-color-hover);
  transform: translateY(-1px);
}

.mode-toggle:active {
  transform: translateY(0);
}
</style>