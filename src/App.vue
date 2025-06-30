<script setup lang="ts">
import { useTimerStore } from './stores/timer'
import { onMounted, watch, ref, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import TimerDisplay from './components/TimerDisplay.vue'
import GameSelector from './components/GameSelector.vue'
import type { Ref } from 'vue'

declare global {
  interface Window {
    location: Location
  }
}

const isClient = typeof window !== 'undefined'
type Theme = 'light' | 'dark'

// Import store and initialize it
const timerStore = useTimerStore()
const { gameTitle, settings } = storeToRefs(timerStore)

// Reactive variables
const isEditingTitle = ref<boolean>(false)
const titleInput: Ref<HTMLInputElement | null> = ref(null)
const isFocusMode = ref<boolean>(false)

// Function to handle title editing
const handleEditTitle = (): void => {
  isEditingTitle.value = true
  nextTick(() => {
    titleInput.value?.focus()
    titleInput.value?.select()
  })
}

// Function to handle stopping title edit
const handleStopEditTitle = (): void => {
  isEditingTitle.value = false
}

// No need for exposedFunctions - we'll use the variables directly in template

// Process URL parameters
onMounted(() => {

  if (!isClient) return
  
  const params = new URLSearchParams(window.location.search)
  const targetDate = params.get('target')
  const theme = params.get('theme')
  const title = params.get('title')

  if (targetDate) {
    timerStore.setTargetDate(new Date(targetDate))
  }

  if (theme === 'light' || theme === 'dark') {
    timerStore.updateSettings({ theme: theme as Theme })
  }

  if (title) {
    timerStore.setGameTitle(title)
  }
})

// Watch for theme changes
watch(
  () => timerStore.settings.theme as Theme,
  (theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  },
  { immediate: true }
)

watch(isFocusMode, (isFocus) => {
  const widget = document.querySelector('.bmc-widget-container') as HTMLElement | null
  if (widget) {
    widget.style.display = isFocus ? 'none' : 'block'
  }
})
</script>

<template>
  <div :class="[
    'min-h-screen transition-all duration-500',
    settings.theme === 'dark' ? 'dark' : ''
  ]">
    <main class="min-h-screen flex relative overflow-hidden">
      <div class="flex-1 flex flex-col items-center justify-center p-8">
        <div class="w-full max-w-5xl mx-auto">
          <!-- Game Selector -->
          <div v-if="!isFocusMode" class="flex justify-center mb-4">
            <GameSelector />
          </div>
          
          <!-- Editable Title -->
          <h1 
            v-if="!isEditingTitle" 
            @click="handleEditTitle" 
            class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center text-white cursor-pointer"
            :class="{ 'mx-auto': gameTitle.length < 15 }"
          >
            {{ gameTitle }}
          </h1>
          <input v-else 
            type="text" 
            v-model="gameTitle" 
            @blur="handleStopEditTitle" 
            @keyup.enter="handleStopEditTitle"
            class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center bg-white text-black cursor-pointer border-none outline-none w-full px-4 py-2 rounded"
            ref="titleInput" />
          <TimerDisplay :is-focus-mode="isFocusMode" />
        </div>
      </div>

      <div v-if="!isFocusMode" class="footer-bar fixed bottom-0 left-0 w-full h-12 bg-secondary/30 backdrop-blur-sm border-t border-border/30 transition-all duration-500">
        <div class="container mx-auto px-6 h-full flex items-center justify-between">
          <div class="text-sm opacity-60">
            Game Countdown Timer
          </div>
          <div class="flex items-center gap-4">
            <button
              @click="isFocusMode = !isFocusMode"
              class="text-sm opacity-60 hover:opacity-100 transition-opacity"
            >
              Focus Mode
            </button>
            <button
              @click="() => { useTimerStore().resetGames(); }"
              class="text-sm opacity-60 hover:opacity-100 transition-opacity"
            >
              Reset Games
            </button>
            <div class="text-sm opacity-60">
              Built by Wilsman77
            </div>
          </div>
        </div>
      </div>
      <div v-else class="footer-bar fixed bottom-0 left-0 w-full h-12 bg-secondary/30 backdrop-blur-sm border-t border-border/30 transition-all duration-500">
        <div class="container mx-auto px-6 h-full flex items-center justify-center">
          <button
            @click="isFocusMode = !isFocusMode"
            class="text-sm opacity-60 hover:opacity-100 transition-opacity"
          >
            Exit Focus Mode
          </button>
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
