<script setup lang="ts">
import { useTimerStore } from './stores/timer'
import { onMounted, watch, ref, nextTick, computed } from 'vue'
import { storeToRefs } from 'pinia'
import TimerDisplay from './components/TimerDisplay.vue'
import GameSelector from './components/GameSelector.vue'
import ControlPanel from './components/ControlPanel.vue'
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
const { gameTitle, gameTitleColor, settings } = storeToRefs(timerStore)

// Reactive variables
const isEditingTitle = ref<boolean>(false)
const titleInput: Ref<HTMLInputElement | null> = ref(null)
const isFocusMode = ref<boolean>(false)

// Watch for changes in focus mode and hide the Buy Me a Coffee button
watch(isFocusMode, (isFocused) => {
  const bmcButton = document.getElementById('bmc-wbtn')
  if (bmcButton) {
    bmcButton.style.display = isFocused ? 'none' : 'flex'
  }
})

// Check which game background to show
const gameBackground = computed(() => {
  const gameId = timerStore.activeGame?.id?.toLowerCase() || ''
  
  if (gameId.includes('tarkov') || gameId.includes('0.16.8.0')) {
    return {
      image: 'url(/Hardcore%20Wipe.webp)',
      overlay: 'bg-black/50',
      blur: 'backdrop-blur-sm'
    }
  } else if (gameId.includes('arc') || gameId.includes('raiders')) {
    return {
      image: 'url(/arc.webp)',
      overlay: 'bg-black/40',
      blur: 'backdrop-blur-sm'
    }
  }
  return null
})

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

// Process URL parameters and initialize the app
onMounted(() => {
  if (!isClient) return;
  
  // Handle URL parameters through the store
  timerStore.handleUrlParams();
  
  // Set up the Buy Me a Coffee button
  const script = document.createElement('script');
  script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js';
  script.dataset.name = 'bmc-button';
  script.dataset.slug = 'wilsman';
  script.dataset.font = 'Inter';
  script.dataset.color = '#FFDD00';
  script.dataset.emoji = '☕';
  script.dataset.fontColor = '#000000';
  script.dataset.boxShadow = '0px 1px 3px rgba(0, 0, 0, 0.1)';
  script.async = true;
  
  // Add the script to the document
  document.head.appendChild(script);
  
  // Set the button position
  const bmcButton = document.getElementById('bmc-wbtn');
  if (bmcButton) {
    bmcButton.style.position = 'fixed';
    bmcButton.style.bottom = '20px';
    bmcButton.style.right = '20px';
    bmcButton.style.zIndex = '1000';
  }
  
  // Hide the button if focus mode is active
  if (isFocusMode.value) {
    const bmcButton = document.getElementById('bmc-wbtn');
    if (bmcButton) {
      bmcButton.style.display = 'none';
    }
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
  <div class="relative min-h-screen w-full">
    <!-- Game Background -->
    <div 
      v-if="gameBackground && settings.enableGameBackground"
      class="fixed inset-0 -z-10 w-screen h-screen transition-all duration-500"
      :style="{
        backgroundImage: gameBackground.image,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#0f172a'
      }"
    >
      <div 
        class="absolute inset-0 transition-all duration-500"
        :class="[gameBackground.overlay, gameBackground.blur]"
      ></div>
    </div>
    
    <!-- Content -->
    <div class="min-h-screen w-full transition-all duration-500" :class="{ 'dark': settings.theme === 'dark' }">
      <main class="relative z-10 min-h-screen w-full">
        <div class="flex flex-col items-center justify-center p-8 min-h-screen w-full">
          <div class="w-full max-w-5xl mx-auto">
            <!-- Game Selector -->
            <div v-if="!isFocusMode" class="flex justify-center mb-4">
              <GameSelector />
            </div>
            
            <!-- Editable Title -->
            <h1 
              v-if="!isEditingTitle" 
              @click="handleEditTitle" 
              class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center cursor-pointer"
              style="color: var(--primary-color)"
              :class="{ 'mx-auto': gameTitle.length < 15 }"
            >
              {{ gameTitle }}
            </h1>
            <input 
              v-else 
              type="text" 
              v-model="gameTitle" 
              @blur="handleStopEditTitle" 
              @keyup.enter="handleStopEditTitle"
              class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-center bg-transparent border-none outline-none w-full px-4 py-2 rounded"
              :style="{ color: gameTitleColor }"
              ref="titleInput" 
            />
            <TimerDisplay :is-focus-mode="isFocusMode" />
          </div>
        </div>

        <!-- Footer -->
        <div v-if="!isFocusMode" class="footer-bar fixed bottom-0 left-0 w-full h-12 bg-secondary/30 backdrop-blur-sm border-t border-border/30 transition-all duration-500">
          <div class="container mx-auto px-6 h-full flex items-center justify-between">
            <div class="text-sm opacity-60">
              Game Countdown Timer
            </div>
            <div class="flex items-center space-x-2">
              <ControlPanel />
              <button
                @click="isFocusMode = !isFocusMode"
                class="text-sm opacity-60 hover:opacity-100 transition-opacity"
              >
                Focus Mode
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
  </div>
</template>

<style>
:root {
  --primary-color: #03a9f4;
  --primary-color-hover: #0288d1;
  --bg-primary: ##029be5;
  --bg-secondary: #eceff1;
  --bg-input: #ffffff;
  --text-primary: rgba(0,0,0,0.87);
  --border-color: #e0e0e0;
}

.dark {
  --bg-primary: #212121;
  --bg-secondary: #424242;
  --bg-input: #424242;
  --text-primary: rgba(255,255,255,0.87);
  --border-color: #424242;
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
