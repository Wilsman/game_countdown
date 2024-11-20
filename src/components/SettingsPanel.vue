<script setup lang="ts">
import { useTimerStore } from '../stores/timer'

const store = useTimerStore()

const fonts = [
  'Inter',
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Roboto',
  'Open Sans'
]

function copyShareableUrl() {
  navigator.clipboard.writeText(store.getShareableUrl())
}
</script>

<template>
  <div class="settings-panel">
    <h2 class="panel-title">Timer Settings</h2>
    
    <div class="setting-group">
      <label>Game Title</label>
      <input
        type="text"
        :value="store.gameTitle"
        @input="(e) => store.setGameTitle((e.target as HTMLInputElement).value)"
        class="settings-input"
        placeholder="Enter game title"
      />
    </div>

    <div class="setting-group">
      <label>Target Date/Time</label>
      <input
        type="datetime-local"
        :value="store.targetDate.toISOString().slice(0, 16)"
        @input="(e) => store.setTargetDate(new Date((e.target as HTMLInputElement).value))"
        class="settings-input"
      />
    </div>

    <div class="setting-group">
      <label>Font Family</label>
      <select
        v-model="store.settings.fontFamily"
        class="settings-input"
      >
        <option v-for="font in fonts" :key="font" :value="font">
          {{ font }}
        </option>
      </select>
    </div>

    <div class="setting-group">
      <label>Text Color</label>
      <input
        type="color"
        v-model="store.settings.textColor"
        class="settings-input color-input"
      />
    </div>

    <div class="setting-group">
      <label>Background Color</label>
      <input
        type="color"
        v-model="store.settings.backgroundColor"
        class="settings-input color-input"
      />
    </div>

    <div class="setting-group">
      <label>Font Size (px)</label>
      <div class="range-container">
        <input
          type="range"
          v-model.number="store.settings.fontSize"
          min="24"
          max="120"
          class="settings-input range-input"
        />
        <span class="range-value">{{ store.settings.fontSize }}px</span>
      </div>
    </div>

    <div class="setting-group">
      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="store.settings.enableAnimation"
          class="checkbox-input"
        />
        <span class="checkbox-text">Enable Animation</span>
      </label>
    </div>

    <div class="setting-group">
      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="store.settings.enableSound"
          class="checkbox-input"
        />
        <span class="checkbox-text">Enable Sound</span>
      </label>
    </div>

    <div class="setting-group">
      <label>Theme</label>
      <select
        v-model="store.settings.theme"
        class="settings-input"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>

    <button
      @click="copyShareableUrl"
      class="share-button"
    >
      Copy Shareable URL
    </button>
  </div>
</template>

<style scoped>
.settings-panel {
  height: 100%;
  padding: 1.5rem;
  background-color: var(--bg-secondary);
}

.panel-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
}

.setting-group {
  margin-bottom: 1.25rem;
}

.setting-group label {
  display: block;
  margin-bottom: 0.375rem;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.settings-input {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  background-color: var(--bg-input);
  color: var(--text-primary);
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.settings-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-hover);
}

.color-input {
  height: 36px;
  padding: 0.25rem;
  cursor: pointer;
}

.range-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.range-input {
  flex: 1;
}

.range-value {
  min-width: 50px;
  text-align: right;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  border: 2px solid var(--border-color);
  cursor: pointer;
}

.checkbox-text {
  color: var(--text-primary);
  font-size: 0.875rem;
}

.share-button {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.share-button:hover {
  background-color: var(--primary-color-hover);
  transform: translateY(-1px);
}

.share-button:active {
  transform: translateY(0);
}
</style>