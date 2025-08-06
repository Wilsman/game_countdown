<!-- components/ControlPanel.vue (modernized settings panel) -->
<script setup lang="ts">
import { ref, watch } from "vue";
import { useToast } from "vue-toastification";
import { useTimerStore } from "../stores/timer";
import { storeToRefs } from "pinia";

const store = useTimerStore();
const { settings, gameTitleColor } = storeToRefs(store);

const isOpen = ref(false);
const panelRef = ref<HTMLElement | null>(null);
const toast = useToast();

const copyShareableUrl = async () => {
  try {
    const url = store.getShareableUrl();
    if (!url) return;

    if (navigator && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied to clipboard!");
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast.success("URL copied to clipboard!");
    }
  } catch (error) {
    console.error("Failed to copy URL:", error);
    toast.error("Failed to copy URL");
  }
};

function togglePanel() {
  isOpen.value = !isOpen.value;
}

function closePanel() {
  isOpen.value = false;
}

function handleClickOutside(event: MouseEvent) {
  if (panelRef.value && !panelRef.value.contains(event.target as Node)) {
    closePanel();
  }
}

watch(isOpen, (newValue) => {
  if (newValue) document.addEventListener("mousedown", handleClickOutside);
  else document.removeEventListener("mousedown", handleClickOutside);
});

const themes = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const fontFamilies = [
  { value: "Inter", label: "Inter" },
  { value: "system-ui", label: "System UI" },
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Courier New", label: "Courier New" },
  { value: "monospace", label: "Monospace" },
];

const fontSizes = [
  { value: 32, label: "Small" },
  { value: 48, label: "Medium" },
  { value: 64, label: "Large" },
  { value: 80, label: "Extra Large" },
];

function updateSetting(key: string, value: any) {
  store.updateSettings({ [key]: value });
}

function updateTitleColor(color: string) {
  store.setGameTitleColor(color);
}

function resetToDefaults() {
  store.updateSettings({
    fontFamily: "Inter",
    fontSize: 48,
    enableAnimation: true,
    enableSound: false,
    theme: "dark",
    enableGameBackground: true,
  });
  store.setGameTitleColor("#06B6D4");
}

function exportSettings() {
  const settingsData = {
    settings: settings.value,
    titleColor: gameTitleColor.value,
    gameTitle: store.gameTitle,
    targetDate: store.targetDate,
    targetTimezone: store.targetTimezone,
  };

  const dataStr = JSON.stringify(settingsData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "timer-settings.json";
  link.click();

  URL.revokeObjectURL(url);
}

function importSettings(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      if (data.settings) store.updateSettings(data.settings);
      if (data.titleColor) store.setGameTitleColor(data.titleColor);
      if (data.gameTitle) store.setGameTitle(data.gameTitle);
      if (data.targetDate && data.targetTimezone) {
        store.setTargetDate(new Date(data.targetDate), data.targetTimezone);
      }
      toast.success("Settings imported!");
    } catch (error) {
      console.error("Failed to import settings:", error);
      toast.error("Failed to import settings. Check the file format.");
    }
  };
  reader.readAsText(file);
  (event.target as HTMLInputElement).value = "";
}
</script>

<template>
  <div class="control-panel" ref="panelRef">
    <!-- Settings Button -->
    <button
      @click="togglePanel"
      class="settings-button soft-btn"
      :class="{ 'is-active': isOpen }"
      title="Open Settings"
      aria-label="Open Settings"
    >
      <!-- Minimal, modern gear (stroke, rounded, 24x24 viewBox) -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M19.4 13.2c.04-.39.06-.79.06-1.2s-.02-.81-.06-1.2l1.77-1.28a.9.9 0 0 0 .2-1.22l-1.5-2.6a.9.9 0 0 0-1.12-.37l-2.1.85a7.9 7.9 0 0 0-2.08-1.2l-.32-2.25A.92.92 0 0 0 12.27 2h-3.03a.92.92 0 0 0-.89.73l-.32 2.25c-.73.27-1.42.65-2.08 1.2l-2.1-.85a.9.9 0 0 0-1.12.37L1.23 8.3a.9.9 0 0 0 .2 1.22L3.2 10.8c-.04.39-.06.79-.06 1.2s.02.81.06 1.2L1.43 14.48a.9.9 0 0 0-.2 1.22l1.5 2.6c.24.42.75.6 1.2.43l2.1-.85c.66.54 1.35.93 2.08 1.2l.32 2.25c.07.44.45.77.89.77h3.03c.44 0 .82-.33.89-.77l.32-2.25c.73-.27 1.42-.66 2.08-1.2l2.1.85c.45.17.97 0 1.2-.43l1.5-2.6a.9.9 0 0 0-.2-1.22L19.4 13.2Z"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <!-- Settings Panel -->
    <div v-if="isOpen" class="settings-panel surface-3d strong">
      <div class="panel-header">
        <div class="panel-title">
          <span class="brand-dot small"></span>
          <h3>Timer Settings</h3>
        </div>
        <button
          @click="closePanel"
          class="close-button"
          aria-label="Close settings"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
          >
            <line
              x1="18"
              y1="6"
              x2="6"
              y2="18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <line
              x1="6"
              y1="6"
              x2="18"
              y2="18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div class="panel-content">
        <!-- Appearance -->
        <div class="settings-section">
          <h4>Appearance</h4>

          <div class="setting-item">
            <label>Theme</label>
            <select
              :value="settings.theme"
              @change="
                updateSetting(
                  'theme',
                  ($event.target as HTMLSelectElement).value
                )
              "
              class="setting-select"
            >
              <option
                v-for="theme in themes"
                :key="theme.value"
                :value="theme.value"
              >
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
                @input="
                  updateTitleColor(($event.target as HTMLInputElement).value)
                "
                class="color-input"
              />
              <span class="color-value">{{ gameTitleColor }}</span>
            </div>
          </div>

          <div class="setting-item two-col">
            <div>
              <label>Font Family</label>
              <select
                :value="settings.fontFamily"
                @change="
                  updateSetting(
                    'fontFamily',
                    ($event.target as HTMLSelectElement).value
                  )
                "
                class="setting-select"
              >
                <option
                  v-for="font in fontFamilies"
                  :key="font.value"
                  :value="font.value"
                >
                  {{ font.label }}
                </option>
              </select>
            </div>

            <div>
              <label>Font Size</label>
              <select
                :value="settings.fontSize"
                @change="
                  updateSetting(
                    'fontSize',
                    parseInt(($event.target as HTMLSelectElement).value)
                  )
                "
                class="setting-select"
              >
                <option
                  v-for="size in fontSizes"
                  :key="size.value"
                  :value="size.value"
                >
                  {{ size.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Features -->
        <div class="settings-section">
          <h4>Features</h4>

          <label class="toggle">
            <input
              type="checkbox"
              :checked="settings.enableGameBackground"
              @change="
                updateSetting(
                  'enableGameBackground',
                  ($event.target as HTMLInputElement).checked
                )
              "
            />
            <span class="slider"></span>
            <span class="toggle-text">Game Background</span>
          </label>

          <label class="toggle">
            <input
              type="checkbox"
              :checked="settings.enableAnimation"
              @change="
                updateSetting(
                  'enableAnimation',
                  ($event.target as HTMLInputElement).checked
                )
              "
            />
            <span class="slider"></span>
            <span class="toggle-text">Animations</span>
          </label>

          <label class="toggle">
            <input
              type="checkbox"
              :checked="settings.enableSound"
              @change="
                updateSetting(
                  'enableSound',
                  ($event.target as HTMLInputElement).checked
                )
              "
            />
            <span class="slider"></span>
            <span class="toggle-text">Sound Effects</span>
          </label>
        </div>

        <!-- Actions -->
        <div class="settings-section">
          <h4>Actions</h4>

          <div class="action-grid">
            <button
              @click="copyShareableUrl"
              class="action-button soft-btn-strong"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <polyline
                  points="16,6 12,2 8,6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="12"
                  y1="2"
                  x2="12"
                  y2="15"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              Copy Share URL
            </button>

            <button
              @click="exportSettings"
              class="action-button soft-btn-strong"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <polyline
                  points="7,10 12,15 17,10"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="12"
                  y1="15"
                  x2="12"
                  y2="3"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              Export Settings
            </button>

            <label class="action-button soft-btn-strong file-input-label">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <polyline
                  points="17,8 12,3 7,8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <line
                  x1="12"
                  y1="3"
                  x2="12"
                  y2="15"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              Import Settings
              <input
                type="file"
                accept=".json"
                @change="importSettings"
                class="file-input"
              />
            </label>

            <button
              @click="store.resetGames"
              class="action-button soft-btn-strong subtle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <polyline
                  points="23,4 23,10 17,10"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <polyline
                  points="1,20 1,14 7,14"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              Reset Games
            </button>

            <button
              @click="resetToDefaults"
              class="action-button danger-strong"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M3 6h18l-1.5 14H4.5L3 6z"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <path
                  d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
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
/* Surfaces and soft buttons — match the app look */
.surface-3d {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.04),
    rgba(255, 255, 255, 0.02)
  ); /* slightly denser */
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12)); /* a bit stronger */
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.03), inset 0 -1px 0 rgba(0, 0, 0, 0.25);
  border-radius: 16px;
}

.strong {
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.04), inset 0 -1px 0 rgba(0, 0, 0, 0.35);
}

.soft-btn,
.soft-btn-strong {
  background: linear-gradient(
    180deg,
    rgba(34, 211, 238, 0.16),
    rgba(6, 182, 212, 0.12)
  );
  color: var(--text-primary, rgba(255, 255, 255, 0.92));
  border: 1px solid rgba(34, 211, 238, 0.28);
  border-radius: 12px;
  padding: 8px 10px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.25px;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.3s ease, border-color 0.3s ease,
    box-shadow 0.3s ease;
  box-shadow: 0 8px 26px rgba(6, 182, 212, 0.18);
}
.soft-btn:hover,
.soft-btn-strong:hover {
  transform: translateY(-1px);
  background: linear-gradient(
    180deg,
    rgba(34, 211, 238, 0.24),
    rgba(6, 182, 212, 0.16)
  );
  border-color: rgba(34, 211, 238, 0.45);
  box-shadow: 0 14px 34px rgba(6, 182, 212, 0.25);
}
.soft-btn:active,
.soft-btn-strong:active {
  transform: translateY(0);
}
.soft-btn-strong {
  padding: 10px 12px;
  border-radius: 14px;
}

.control-panel {
  position: relative;
}

.settings-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
}
.settings-button.is-active {
  outline: 2px solid rgba(34, 211, 238, 0.25);
}

/* Panel */
.settings-panel {
  position: absolute;
  bottom: calc(100% + 10px);
  right: 0;
  width: min(380px, 92vw);
  max-height: 78vh;
  z-index: 1000;
  overflow: hidden;
  animation: panel-appear 0.18s ease;
  background: rgba(12, 12, 12, 0.9); /* add: solid dark base */
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1)); /* slightly stronger border */
  backdrop-filter: blur(8px);
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
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  background: rgba(12, 12, 12, 0.85);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.panel-title h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary, rgba(255, 255, 255, 0.92));
  letter-spacing: 0.2px;
}

.brand-dot.small {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: conic-gradient(
    from 0deg at 50% 50%,
    #22d3ee,
    #06b6d4,
    #0891b2,
    #22d3ee
  );
  box-shadow: 0 0 10px rgba(34, 211, 238, 0.5), 0 0 4px rgba(6, 182, 212, 0.45);
}

.close-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  color: var(--text-primary, rgba(255, 255, 255, 0.92));
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
}
.close-button:hover {
  background: rgba(255, 255, 255, 0.04);
  transform: translateY(-1px);
}

.panel-content {
  max-height: calc(78vh - 54px);
  overflow-y: auto;
  padding: 12px 14px 14px;
}

/* Sections */
.settings-section {
  margin-bottom: 18px;
  padding: 10px;
  border: 1px dashed rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.05),
    rgba(255, 255, 255, 0.025)
  );
}
.settings-section h4 {
  margin: 0 0 10px 0;
  font-size: 12px;
  font-weight: 900;
  color: var(--accent-300, #06b6d4);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

/* Items */
.setting-item {
  margin-bottom: 12px;
}
.setting-item:last-child {
  margin-bottom: 0;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.setting-item label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary, rgba(255, 255, 255, 0.92));
}

.setting-select {
  width: 100%;
  padding: 9px 10px;
  background-color: #111;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 10px;
  color: var(--text-primary, rgba(255, 255, 255, 0.92));
  font-size: 13px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  outline: none;
}
.setting-select:focus {
  border-color: rgba(34, 211, 238, 0.45);
  box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.15);
}

/* Color input */
.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}
.color-input {
  width: 44px;
  height: 34px;
  padding: 0;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 10px;
  cursor: pointer;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.01)
  );
}
.color-value {
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--text-primary, rgba(255, 255, 255, 0.92));
  opacity: 0.7;
}

/* Toggles */
.toggle {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.toggle:last-child {
  margin-bottom: 0;
}

.toggle input {
  appearance: none;
  width: 44px;
  height: 24px;
  background: linear-gradient(180deg, #242424, #1a1a1a);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 999px;
  position: relative;
  outline: none;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.toggle input::before {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: linear-gradient(180deg, #fff, #eaeaea);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  transition: transform 0.2s ease;
}
.toggle input:checked {
  background: linear-gradient(
    180deg,
    rgba(34, 211, 238, 0.35),
    rgba(6, 182, 212, 0.25)
  );
  border-color: rgba(34, 211, 238, 0.45);
  box-shadow: 0 6px 18px rgba(6, 182, 212, 0.18) inset;
}
.toggle input:checked::before {
  transform: translateX(20px);
}
.toggle .slider {
  display: none;
} /* kept for structure compat */
.toggle-text {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary, rgba(255, 255, 255, 0.92));
}

/* Actions */
.action-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.action-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  padding: 10px 12px;
  text-align: center;
  color: var(--text-primary, rgba(255, 255, 255, 0.92));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 12px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.02),
    rgba(255, 255, 255, 0.01)
  );
  cursor: pointer;
  transition: transform 0.15s ease, background 0.3s ease, border-color 0.3s ease,
    box-shadow 0.3s ease;
}
.action-button:hover {
  transform: translateY(-1px);
  border-color: rgba(34, 211, 238, 0.45);
  background: linear-gradient(
    180deg,
    rgba(34, 211, 238, 0.16),
    rgba(6, 182, 212, 0.12)
  );
  box-shadow: 0 10px 26px rgba(6, 182, 212, 0.22);
}
.action-button svg {
  flex: 0 0 auto;
}

.subtle {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.01),
    rgba(255, 255, 255, 0.005)
  );
}

.danger-strong {
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.18),
    rgba(239, 68, 68, 0.12)
  );
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fecaca;
  font-weight: 800;
  box-shadow: 0 8px 26px rgba(239, 68, 68, 0.18);
}
.danger-strong:hover {
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.28),
    rgba(239, 68, 68, 0.18)
  );
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 12px 30px rgba(239, 68, 68, 0.25);
}

/* File input */
.file-input-label {
  position: relative;
  overflow: hidden;
}
.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

/* Scrollbar (scoped) */
.panel-content::-webkit-scrollbar {
  width: 10px;
}
.panel-content::-webkit-scrollbar-track {
  background: #101010;
}
.panel-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #1e1e1e, #2a2a2a);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Responsive */
@media (max-width: 480px) {
  .action-grid {
    grid-template-columns: 1fr;
  }
  .two-col {
    grid-template-columns: 1fr;
  }
}
</style>
