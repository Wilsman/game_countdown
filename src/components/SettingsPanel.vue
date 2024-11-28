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
      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="store.settings.enableSoundToggle"
          class="checkbox-input"
        />
        <span class="checkbox-text">Enable Sound Toggle</span>
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
  padding: 1rem;
  height: 100%;
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--text-primary);
  text-align: center;
}

.setting-group {
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background-color: var(--bg-primary);
  border-radius: 1rem;
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.setting-group:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.setting-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
  letter-spacing: 0.025em;
}

.settings-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  background-color: var(--bg-input);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.settings-input:hover {
  border-color: var(--primary-color);
}

.color-input {
  height: 48px;
  padding: 0.25rem;
  cursor: pointer;
}

.range-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.range-input {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--border-color);
  border-radius: 3px;
  outline: none;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: var(--primary-color);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.range-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.range-value {
  font-size: 0.875rem;
  font-weight: 500;
  min-width: 4rem;
  text-align: center;
  padding: 0.25rem 0.5rem;
  background-color: var(--bg-secondary);
  border-radius: 0.25rem;
  border: 1px solid var(--border-color);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 0;
}

.checkbox-input {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.25rem;
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox-input:checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.share-button {
  width: 100%;
  padding: 0.875rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 1rem;
}

.share-button:hover {
  background-color: var(--primary-color-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.share-button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .settings-panel {
    padding: 0.75rem;
  }

  .panel-title {
    font-size: 1.25rem;
    margin-bottom: 1.5rem;
  }

  .setting-group {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .settings-input {
    padding: 0.625rem 0.875rem;
  }
}
</style>