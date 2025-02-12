<script setup lang="ts">
import { useTimerStore } from './stores/timer'
import { onMounted, watch, ref, nextTick } from 'vue'
import TimerDisplay from './components/TimerDisplay.vue'

const store = useTimerStore()
const window = ref(globalThis.window)
const isEditingTitle = ref(false)
const titleInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  store.loadFromLocalStorage()

  const params = new URLSearchParams(window.value.location.search)
  const targetDate = params.get('target')
  const theme = params.get('theme')
  const title = params.get('title')

  if (targetDate) {
    store.setTargetDate(new Date(targetDate))
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

// Function to enable title editing
const editTitle = () => {
  isEditingTitle.value = true
  nextTick(() => {
    titleInput.value?.focus()
    titleInput.value?.select()
  })
}

// Function to stop title editing
const stopEditTitle = () => {
  isEditingTitle.value = false
}
</script>

<template>
  <div :class="[
    'min-h-screen transition-all duration-500',
    store.settings.theme === 'dark' ? 'dark' : ''
  ]">
    <main class="min-h-screen flex relative overflow-hidden">
      <div class="flex-1 flex flex-col items-center justify-center p-8">
        <div class="w-full max-w-5xl mx-auto">
          <!-- Editable Title -->
          <h1 v-if="!isEditingTitle" @click="editTitle"
            class="text-5xl md:text-6xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-primary-hover bg-clip-text cursor-pointer">
            {{ store.gameTitle }}
          </h1>
          <input v-else type="text" v-model="store.gameTitle" @blur="stopEditTitle" @keyup.enter="stopEditTitle"
            class="text-5xl md:text-6xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-primary-hover bg-clip-text cursor-pointer border-none outline-none"
            ref="titleInput" />
          <TimerDisplay />
        </div>
      </div>

      <div
        class="footer-bar fixed bottom-0 left-0 w-full h-12 bg-secondary/30 backdrop-blur-sm border-t border-border/30 transition-all duration-500">
        <div class="container mx-auto px-6 h-full flex items-center justify-between">
          <div class="text-sm opacity-60">
            Game Countdown Timer
          </div>
          <div class="text-sm opacity-60">
            Built by Wilsman77
          </div>
        </div>
      </div>
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
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --bg-input: #374151;
  --text-primary: #f9fafb;
  --border-color: #374151;
}

body {
  margin: 0;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color 0.5s ease, color 0.5s ease;
}

@media (max-height: 600px) {
  .footer-bar {
    display: none;
  }
}

/* Add smooth scrolling to the entire page */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar styles */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}
</style>