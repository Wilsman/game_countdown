<script setup lang="ts">
import { useTimerStore } from './stores/timer'
import { onMounted, watch, ref } from 'vue'
import TimerDisplay from './components/TimerDisplay.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import HamburgerIcon from './components/HamburgerIcon.vue'

const store = useTimerStore()
const window = ref(globalThis.window)

onMounted(() => {
  store.loadFromLocalStorage()
  
  const params = new URLSearchParams(window.value.location.search)
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

// Close drawer when clicking outside on mobile
function handleClickOutside(event: MouseEvent) {
  const drawer = document.querySelector('.settings-drawer')
  const hamburger = document.querySelector('.menu-button')
  if (drawer && hamburger && 
      !drawer.contains(event.target as Node) && 
      !hamburger.contains(event.target as Node)) {
    store.isEditMode = false
  }
}
</script>

<template>
  <div :class="[
    'min-h-screen transition-colors duration-300',
    store.settings.theme === 'dark' ? 'dark' : ''
  ]" @click="handleClickOutside">
    <button
      @click.stop="store.toggleMode"
      class="menu-button fixed top-4 right-4 z-50 p-2 rounded-lg bg-secondary/90 hover:bg-secondary shadow-md hover:shadow-lg border border-border/50"
    >
      <HamburgerIcon :is-open="store.isEditMode" />
    </button>

    <main class="min-h-screen flex relative overflow-hidden">
      <div class="flex-1 flex flex-col items-center justify-center p-4" 
           :class="{ 'md:mr-[384px]': store.isEditMode }">
        <div class="w-full max-w-4xl mx-auto">
          <h1 class="text-4xl font-bold text-center mb-8">{{ store.gameTitle }}</h1>
          <TimerDisplay />
        </div>
      </div>
      
      <div 
        class="settings-drawer fixed top-0 right-0 w-full md:w-[384px] h-screen bg-secondary border-l border-border transform transition-transform duration-300 ease-in-out overflow-y-auto"
        :class="{ 
          'translate-x-0 shadow-2xl': store.isEditMode,
          'translate-x-full': !store.isEditMode
        }"
      >
        <div class="p-6">
          <SettingsPanel />
        </div>
      </div>

      <div 
        class="footer-bar fixed bottom-0 left-0 w-full h-8 bg-secondary/30 backdrop-blur-sm border-t border-border/30 transition-opacity duration-300"
        :class="{ 'opacity-0': store.isEditMode }"
      >
        <div class="absolute bottom-2 right-4 text-sm opacity-60">
          Built by Wilsman77
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

.menu-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(8px);
}

.menu-button:hover {
  transform: scale(1.05);
}

.menu-button:active {
  transform: scale(0.95);
}

.settings-drawer {
  backdrop-filter: blur(12px);
}

@media (max-width: 768px) {
  .settings-drawer {
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}

@media (max-height: 600px) {
  .footer-bar {
    display: none;
  }
}
</style>