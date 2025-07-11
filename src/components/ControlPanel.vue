<script setup lang="ts">
import { ref, watch } from 'vue'
import { useToast } from 'vue-toastification'
import { useTimerStore } from '../stores/timer'
import { storeToRefs } from 'pinia'

const store = useTimerStore()
const { settings, gameTitleColor } = storeToRefs(store)

const isOpen = ref(false)
const panelRef = ref<HTMLElement | null>(null)
const toast = useToast()

const copyShareableUrl = async () => {
  try {
    const url = store.getShareableUrl()
    if (!url) return
    
    if (navigator && navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      toast.success('URL copied to clipboard!')
    } else {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success('URL copied to clipboard!')
    }
  } catch (error) {
    console.error('Failed to copy URL:', error)
    toast.error('Failed to copy URL')
  }
}

function togglePanel() {
  isOpen.value = !isOpen.value
}

function closePanel() {
  isOpen.value = false
}

// Close panel when clicking outside
function handleClickOutside(event: MouseEvent) {
  if (panelRef.value && !panelRef.value.contains(event.target as Node)) {
    closePanel()
  }
}

// Add and remove event listener
watch(isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener('mousedown', handleClickOutside)
  } else {
    document.removeEventListener('mousedown', handleClickOutside)
  }
})

// Theme options
const themes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' }
]

// Font family options
const fontFamilies = [
  { value: 'Inter', label: 'Inter' },
  { value: 'system-ui', label: 'System UI' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'monospace', label: 'Monospace' }
]

// Font size options
const fontSizes = [
  { value: 32, label: 'Small' },
  { value: 48, label: 'Medium' },
  { value: 64, label: 'Large' },
  { value: 80, label: 'Extra Large' }
]

function updateSetting(key: string, value: any) {
  store.updateSettings({ [key]: value })
}

function updateTitleColor(color: string) {
  store.setGameTitleColor(color)
}

function resetToDefaults() {
  store.updateSettings({
    fontFamily: 'Inter',
    fontSize: 48,
    enableAnimation: true,
    enableSound: false,
    theme: 'dark',
    enableGameBackground: true
  })
  store.setGameTitleColor('#03a9f4')
}

function exportSettings() {
  const settingsData = {
    settings: settings.value,
    titleColor: gameTitleColor.value,
    gameTitle: store.gameTitle,
    targetDate: store.targetDate,
    targetTimezone: store.targetTimezone
  }
  
  const dataStr = JSON.stringify(settingsData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = 'timer-settings.json'
  link.click()
  
  URL.revokeObjectURL(url)
}

function importSettings(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      if (data.settings) {
        store.updateSettings(data.settings)
      }
      if (data.titleColor) {
        store.setGameTitleColor(data.titleColor)
      }
      if (data.gameTitle) {
        store.setGameTitle(data.gameTitle)
      }
      if (data.targetDate && data.targetTimezone) {
        store.setTargetDate(new Date(data.targetDate), data.targetTimezone)
      }
    } catch (error) {
      console.error('Failed to import settings:', error)
      alert('Failed to import settings. Please check the file format.')
    }
  }
  reader.readAsText(file)
  
  // Reset the input
  ;(event.target as HTMLInputElement).value = ''
}
</script>

<template>
  <div class="control-panel" ref="panelRef">
    <!-- Settings Button -->
    <button 
      @click="togglePanel" 
      class="settings-button"
      :class="{ 'is-active': isOpen }"
      title="Open Settings"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m11-7a4 4 0 0 0-8 0m8 0a4 4 0 0 0 8 0m-8 14a4 4 0 0 0-8 0m8 0a4 4 0 0 0 8 0"/>
      </svg>
    </button>
    
    <!-- Settings Panel -->
    <div v-if="isOpen" class="settings-panel">
      <div class="panel-header">
        <h3>Timer Settings</h3>
        <button @click="closePanel" class="close-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      
      <div class="panel-content">
        <!-- Appearance Section -->
        <div class="settings-section">
          <h4>Appearance</h4>
          
          <div class="setting-item">
            <label>Theme</label>
            <select 
              :value="settings.theme" 
              @change="updateSetting('theme', ($event.target as HTMLSelectElement).value)"
              class="setting-select"
            >
              <option v-for="theme in themes" :key="theme.value" :value="theme.value">
                {{ theme.label }}
              </option>
            </select>
          </div>
          
          <div class="setting-item">
            <label>Title Color</label>
            <div class="color-input-wrapper">
              <input
                type="color"
                :value="gameTitleColor"
                @input="updateTitleColor(($event.target as HTMLInputElement).value)"
                class="color-input"
              />
              <span class="color-value">{{ gameTitleColor }}</span>
            </div>
          </div>
          
          <div class="setting-item">
            <label>Font Family</label>
            <select 
              :value="settings.fontFamily" 
              @change="updateSetting('fontFamily', ($event.target as HTMLSelectElement).value)"
              class="setting-select"
            >
              <option v-for="font in fontFamilies" :key="font.value" :value="font.value">
                {{ font.label }}
              </option>
            </select>
          </div>
          
          <div class="setting-item">
            <label>Font Size</label>
            <select 
              :value="settings.fontSize" 
              @change="updateSetting('fontSize', parseInt(($event.target as HTMLSelectElement).value))"
              class="setting-select"
            >
              <option v-for="size in fontSizes" :key="size.value" :value="size.value">
                {{ size.label }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- Features Section -->
        <div class="settings-section">
          <h4>Features</h4>
          
          <div class="setting-item">
            <label class="toggle-label">
              <input
                type="checkbox"
                :checked="settings.enableGameBackground"
                @change="updateSetting('enableGameBackground', ($event.target as HTMLInputElement).checked)"
                class="toggle-input"
              />
              <span class="toggle-slider"></span>
              Game Background
            </label>
          </div>
          
          <div class="setting-item">
            <label class="toggle-label">
              <input
                type="checkbox"
                :checked="settings.enableAnimation"
                @change="updateSetting('enableAnimation', ($event.target as HTMLInputElement).checked)"
                class="toggle-input"
              />
              <span class="toggle-slider"></span>
              Animations
            </label>
          </div>
          
          <div class="setting-item">
            <label class="toggle-label">
              <input
                type="checkbox"
                :checked="settings.enableSound"
                @change="updateSetting('enableSound', ($event.target as HTMLInputElement).checked)"
                class="toggle-input"
              />
              <span class="toggle-slider"></span>
              Sound Effects
            </label>
          </div>
        </div>
        
        <!-- Actions Section -->
        <div class="settings-section">
          <h4>Actions</h4>
          
          <div class="action-buttons">
            <button @click="copyShareableUrl" class="action-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16,6 12,2 8,6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              Copy Share URL
            </button>
            
            <button @click="exportSettings" class="action-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export Settings
            </button>
            
            <label class="action-button file-input-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Import Settings
              <input type="file" accept=".json" @change="importSettings" class="file-input" />
            </label>
            
            <button @click="store.resetGames" class="action-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23,4 23,10 17,10"/>
                <polyline points="1,20 1,14 7,14"/>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
              </svg>
              Reset Games
            </button>
            
            <button @click="resetToDefaults" class="action-button danger">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18l-1.5 14H4.5L3 6z"/>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Reset All Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.control-panel {
  position: relative;
}

.settings-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.settings-button:hover,
.settings-button.is-active {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-1px);
}

.settings-panel {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  width: 320px;
  max-height: 80vh;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  overflow: hidden;
  animation: panel-appear 0.2s ease;
}

@keyframes panel-appear {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background-color: var(--bg-primary);
}

.panel-content {
  max-height: calc(80vh - 60px);
  overflow-y: auto;
  padding: 16px 20px;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.setting-item {
  margin-bottom: 12px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.setting-select {
  width: 100%;
  padding: 8px 12px;
  background-color: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  transition: border-color 0.2s ease;
}

.setting-select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-input {
  width: 40px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  background: none;
}

.color-value {
  font-size: 12px;
  font-family: monospace;
  color: var(--text-primary);
  opacity: 0.7;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 40px;
  height: 20px;
  background-color: var(--border-color);
  border-radius: 10px;
  transition: background-color 0.2s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.toggle-input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.action-button:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-1px);
}

.action-button.danger:hover {
  background-color: #ef4444;
}

.file-input-label {
  position: relative;
}

.file-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .settings-panel {
    width: 280px;
    right: -20px;
  }
}

@media (max-height: 600px) {
  .settings-panel {
    max-height: 90vh;
  }
  
  .panel-content {
    max-height: calc(90vh - 60px);
  }
}
</style>