<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { toast } from "vue-sonner";

import { useTimerStore } from "../stores/timer";
import TimerDisplay from "./TimerDisplay.vue";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "create-timer"): void;
}>();

const store = useTimerStore();
const { settings, gameTitle, gameTitleColor } = storeToRefs(store);

const close = () => {
  emit("close");
};

const createCustomTimer = () => {
  emit("create-timer");
};

const overlayUrl = computed(() => store.getObsOverlayUrl());

const copyFinalLink = () => {
  navigator.clipboard.writeText(overlayUrl.value);
  toast.success("Customized OBS link copied!");
};

const resetCustomization = () => {
  store.updateSettings({
    digitColor: null,
    labelColor: null,
    digitSize: 100,
    labelSize: null,
    titleSize: 48,
    showTitle: true,
    showLabels: true,
    framePadding: 24,
    segmentGap: 0,
    glowColor: null,
    glowIntensity: null,
    glowSpread: null,
    showScanlines: true,
    backgroundOpacity: null,
    bgBlur: null,
    obsFontFamily: null,
    borderWidth: null,
    borderColor: null,
    animationSpeed: null,
    scanlineOpacity: null,
    showShine: true,
    shineOpacity: null,
  });
  toast.info("Customizations reset");
};

// Helper to update settings
const update = (key: string, value: any) => {
  store.updateSettings({ [key]: value });
};

const presets = [
  {
    name: "Cyber Neon",
    settings: {
      digitColor: "#06b6d4",
      labelColor: "#7c3aed",
      glowColor: "#06b6d4",
      glowIntensity: 30,
      glowSpread: 5,
      borderColor: null,
      borderWidth: 3,
      animationSpeed: 5,
      scanlineOpacity: 0.1,
      showShine: true,
      shineOpacity: 0.25,
      backgroundOpacity: 0.25,
      bgBlur: 12,
      framePadding: 24,
      segmentGap: 4,
      obsFontFamily: "Geist Sans",
    },
  },
  {
    name: "Golden Hour",
    settings: {
      digitColor: "#fbbf24",
      labelColor: "#f59e0b",
      glowColor: "#f59e0b",
      glowIntensity: 25,
      glowSpread: 8,
      borderColor: "#fbbf24",
      borderWidth: 2,
      animationSpeed: 10,
      scanlineOpacity: 0.05,
      showShine: true,
      shineOpacity: 0.15,
      backgroundOpacity: 0.15,
      bgBlur: 8,
      framePadding: 28,
      segmentGap: 12,
      obsFontFamily: "Geist Mono",
    },
  },
  {
    name: "Minimalist",
    settings: {
      digitColor: "#ffffff",
      labelColor: "#94a3b8",
      glowColor: "#ffffff",
      glowIntensity: 10,
      glowSpread: 2,
      borderColor: "rgba(255,255,255,0.1)",
      borderWidth: 1,
      animationSpeed: 20,
      scanlineOpacity: 0,
      showShine: false,
      shineOpacity: 0,
      backgroundOpacity: 0.1,
      bgBlur: 20,
      framePadding: 16,
      segmentGap: 20,
      obsFontFamily: "Geist Sans",
    },
  },
  {
    name: "Retro CRT",
    settings: {
      digitColor: "#22c55e",
      labelColor: "#15803d",
      glowColor: "#22c55e",
      glowIntensity: 40,
      glowSpread: 10,
      showScanlines: true,
      scanlineOpacity: 0.25,
      animationSpeed: 2,
      showShine: true,
      shineOpacity: 0.2,
      borderColor: "#166534",
      borderWidth: 5,
      backgroundOpacity: 0.4,
      bgBlur: 2,
      framePadding: 26,
      segmentGap: 2,
      obsFontFamily: "Geist Mono",
    },
  },
  {
    name: "Sunset",
    settings: {
      digitColor: "#f43f5e",
      labelColor: "#fb7185",
      glowColor: "#f43f5e",
      glowIntensity: 28,
      glowSpread: 7,
      borderColor: "#be123c",
      borderWidth: 3,
      animationSpeed: 8,
      scanlineOpacity: 0.08,
      showShine: true,
      shineOpacity: 0.2,
      backgroundOpacity: 0.2,
      bgBlur: 10,
      framePadding: 26,
      segmentGap: 8,
      obsFontFamily: "Geist Sans",
    },
  },
  {
    name: "Ocean",
    settings: {
      digitColor: "#0ea5e9",
      labelColor: "#38bdf8",
      glowColor: "#0ea5e9",
      glowIntensity: 22,
      glowSpread: 6,
      borderColor: "#0369a1",
      borderWidth: 2,
      animationSpeed: 12,
      scanlineOpacity: 0.05,
      showShine: true,
      shineOpacity: 0.18,
      backgroundOpacity: 0.18,
      bgBlur: 14,
      framePadding: 24,
      segmentGap: 10,
      obsFontFamily: "Geist Sans",
    },
  },
  {
    name: "Royal",
    settings: {
      digitColor: "#a855f7",
      labelColor: "#c084fc",
      glowColor: "#a855f7",
      glowIntensity: 35,
      glowSpread: 9,
      borderColor: "#7e22ce",
      borderWidth: 4,
      animationSpeed: 6,
      scanlineOpacity: 0.15,
      showShine: true,
      shineOpacity: 0.25,
      backgroundOpacity: 0.3,
      bgBlur: 8,
      framePadding: 28,
      segmentGap: 6,
      obsFontFamily: "Geist Mono",
    },
  },
  {
    name: "Noir",
    settings: {
      digitColor: "#ef4444",
      labelColor: "#f87171",
      glowColor: "#ef4444",
      glowIntensity: 32,
      glowSpread: 7,
      borderColor: "#991b1b",
      borderWidth: 3,
      animationSpeed: 5,
      scanlineOpacity: 0.12,
      showShine: true,
      shineOpacity: 0.2,
      backgroundOpacity: 0.22,
      bgBlur: 10,
      framePadding: 24,
      segmentGap: 4,
      obsFontFamily: "Geist Mono",
    },
  },
];

const applyPreset = (preset: any) => {
  store.updateSettings(preset.settings);
  toast.success(`Applied ${preset.name} style`);
};

const randomize = () => {
  const randomHex = () =>
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0");
  store.updateSettings({
    digitColor: randomHex(),
    labelColor: randomHex(),
    glowColor: randomHex(),
    glowIntensity: Math.floor(Math.random() * 60),
    glowSpread: Math.floor(Math.random() * 20),
    backgroundOpacity: Math.random() * 0.8,
    bgBlur: Math.floor(Math.random() * 40),
    framePadding: Math.floor(Math.random() * 33) + 8,
    segmentGap: Math.floor(Math.random() * 29),
    borderWidth: Math.floor(Math.random() * 10),
    borderColor: randomHex(),
    animationSpeed: Math.floor(Math.random() * 20) + 1,
    scanlineOpacity: Math.random() * 0.4,
    showShine: Math.random() > 0.3,
    shineOpacity: Math.random() * 0.5,
    obsFontFamily: ["Geist Sans", "Geist Mono", "sans-serif", "monospace"][
      Math.floor(Math.random() * 4)
    ],
  });
  toast.success("Shuffled all styles!");
};

const titleTextShadow = computed(() => {
  if (!settings.value.glowColor) return undefined;
  const intensity = settings.value.glowIntensity || 20;
  let shadow = `0 0 ${intensity}px ${settings.value.glowColor}`;
  if (settings.value.glowSpread) {
    shadow += `, 0 0 ${settings.value.glowSpread + intensity}px ${
      settings.value.glowColor
    }`;
  }
  return shadow;
});
</script>

<template>
  <div class="overlay-customizer w-full animate-in fade-in duration-500">
    <!-- Header -->
    <div class="builder-header">
      <div>
        <p class="builder-eyebrow">OBS Studio</p>
        <h2>Overlay Builder</h2>
        <p class="builder-description">
          Style your countdown, preview every change, then copy the browser source URL.
        </p>
      </div>
      <button type="button" class="back-button" @click="close">
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
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Dashboard
      </button>
    </div>

    <div class="builder-grid">
      <!-- Controls -->
      <!-- Left Column: Style Presets, Colors & Glow -->
      <aside class="control-column">
        <!-- Style Presets -->
        <section class="builder-card">
          <div class="section-heading">
            <span>01</span>
            <h3>Presets</h3>
          </div>
          <div class="preset-grid">
            <button
              v-for="preset in presets"
              :key="preset.name"
              type="button"
              class="preset-button"
              @click="applyPreset(preset)"
            >
              {{ preset.name }}
            </button>
          </div>
        </section>

        <!-- Typography Section -->
        <section class="builder-card">
          <div class="section-heading">
            <span>02</span>
            <h3>Typography</h3>
          </div>
          <label class="select-control">
            <span>Font family</span>
            <select
              :value="settings.obsFontFamily || 'Geist Sans'"
              @change="
                update(
                  'obsFontFamily',
                  ($event.target as HTMLSelectElement).value
                )
              "
            >
              <option value="Geist Sans">Geist Sans</option>
              <option value="Geist Mono">Geist Mono</option>
              <option value="sans-serif">Sans Serif</option>
              <option value="monospace">Monospace</option>
            </select>
          </label>
          <div class="content-controls">
            <div class="color-control">
              <span>Title color</span>
              <div>
                <input
                  type="color"
                  aria-label="Title color"
                  :value="gameTitleColor || '#e5e2e1'"
                  @input="
                    store.setGameTitleColor(
                      ($event.target as HTMLInputElement).value
                    )
                  "
                />
              </div>
            </div>
            <label class="toggle-control">
              <span>Show title</span>
              <input
                type="checkbox"
                :checked="settings.showTitle"
                @change="
                  update(
                    'showTitle',
                    ($event.target as HTMLInputElement).checked
                  )
                "
              />
            </label>
            <label class="toggle-control">
              <span>Show labels</span>
              <input
                type="checkbox"
                :checked="settings.showLabels"
                @change="
                  update(
                    'showLabels',
                    ($event.target as HTMLInputElement).checked
                  )
                "
              />
            </label>
          </div>
          <div class="control-stack">
            <label class="range-control">
              <span class="range-meta">
                <span>Title size</span>
                <output>{{ settings.titleSize || 48 }}px</output>
              </span>
              <input
                type="range"
                min="16"
                max="120"
                :value="settings.titleSize || 48"
                @input="
                  update(
                    'titleSize',
                    parseInt(($event.target as HTMLInputElement).value)
                  )
                "
              />
            </label>
            <label class="range-control">
              <span class="range-meta">
                <span>Digit size</span>
                <output>{{ settings.digitSize || 100 }}px</output>
              </span>
              <input
                type="range"
                min="20"
                max="200"
                :value="settings.digitSize || 100"
                @input="
                  update(
                    'digitSize',
                    parseInt(($event.target as HTMLInputElement).value)
                  )
                "
              />
            </label>
            <label class="range-control">
              <span class="range-meta">
                <span>Label size</span>
                <output>{{ settings.labelSize || 14 }}px</output>
              </span>
              <input
                type="range"
                min="10"
                max="100"
                :value="settings.labelSize || 14"
                @input="
                  update(
                    'labelSize',
                    parseInt(($event.target as HTMLInputElement).value)
                  )
                "
              />
            </label>
          </div>
        </section>

        <!-- Colors Section -->
        <section class="builder-card">
          <div class="section-heading">
            <span>03</span>
            <h3>Colors & Glow</h3>
          </div>
          <div class="color-grid">
            <div class="color-control">
              <span>Digits</span>
              <div>
                <input
                  type="color"
                  aria-label="Digit color"
                  :value="settings.digitColor || '#ecfeff'"
                  @input="
                    update(
                      'digitColor',
                      ($event.target as HTMLInputElement).value
                    )
                  "
                />
                <button
                  v-if="settings.digitColor"
                  type="button"
                  @click="update('digitColor', null)"
                >
                  Reset
                </button>
              </div>
            </div>
            <div class="color-control">
              <span>Labels</span>
              <div>
                <input
                  type="color"
                  aria-label="Label color"
                  :value="settings.labelColor || '#22d3ee'"
                  @input="
                    update(
                      'labelColor',
                      ($event.target as HTMLInputElement).value
                    )
                  "
                />
                <button
                  v-if="settings.labelColor"
                  type="button"
                  @click="update('labelColor', null)"
                >
                  Reset
                </button>
              </div>
            </div>
            <div class="color-control">
              <span>Glow</span>
              <div>
                <input
                  type="color"
                  aria-label="Glow color"
                  :value="settings.glowColor || '#22d3ee'"
                  @input="
                    update(
                      'glowColor',
                      ($event.target as HTMLInputElement).value
                    )
                  "
                />
                <button
                  v-if="settings.glowColor"
                  type="button"
                  @click="update('glowColor', null)"
                >
                  Reset
                </button>
              </div>
            </div>
            <div class="color-control">
              <span>Border</span>
              <div>
                <input
                  type="color"
                  aria-label="Border color"
                  :value="settings.borderColor || '#06b6d4'"
                  @input="
                    update(
                      'borderColor',
                      ($event.target as HTMLInputElement).value
                    )
                  "
                />
                <button
                  v-if="settings.borderColor"
                  type="button"
                  @click="update('borderColor', null)"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
          <div class="control-stack">
            <label class="range-control">
              <span class="range-meta">
                <span>Glow intensity</span>
                <output>{{ settings.glowIntensity || 20 }}px</output>
              </span>
              <input
                type="range"
                min="0"
                max="100"
                :value="settings.glowIntensity || 20"
                @input="
                  update(
                    'glowIntensity',
                    parseInt(($event.target as HTMLInputElement).value)
                  )
                "
              />
            </label>
            <label class="range-control">
              <span class="range-meta">
                <span>Glow spread</span>
                <output>{{ settings.glowSpread || 0 }}px</output>
              </span>
              <input
                type="range"
                min="0"
                max="40"
                :value="settings.glowSpread || 0"
                @input="
                  update(
                    'glowSpread',
                    parseInt(($event.target as HTMLInputElement).value)
                  )
                "
              />
            </label>
          </div>
        </section>

        <!-- Right Column: Typography, Frame & Backdrop -->
        <!-- Frame Section -->
        <section class="builder-card">
          <div class="section-heading">
            <span>04</span>
            <h3>Frame & Backdrop</h3>
          </div>
          <div class="control-stack">
            <label class="range-control">
              <span class="range-meta">
                <span>Frame padding</span>
                <output>{{ settings.framePadding ?? 24 }}px</output>
              </span>
              <input
                type="range"
                min="0"
                max="64"
                :value="settings.framePadding ?? 24"
                @input="
                  update(
                    'framePadding',
                    parseInt(($event.target as HTMLInputElement).value)
                  )
                "
              />
            </label>
            <label class="range-control">
              <span class="range-meta">
                <span>Segment spacing</span>
                <output>{{ settings.segmentGap ?? 0 }}px</output>
              </span>
              <input
                type="range"
                min="0"
                max="48"
                :value="settings.segmentGap ?? 0"
                @input="
                  update(
                    'segmentGap',
                    parseInt(($event.target as HTMLInputElement).value)
                  )
                "
              />
            </label>
            <label class="range-control">
              <span class="range-meta">
                <span>Background opacity</span>
                <output>{{ Math.round((settings.backgroundOpacity ?? 0.65) * 100) }}%</output>
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                :value="settings.backgroundOpacity ?? 0.65"
                @input="
                  update(
                    'backgroundOpacity',
                    parseFloat(($event.target as HTMLInputElement).value)
                  )
                "
              />
            </label>
            <label class="range-control">
              <span class="range-meta">
                <span>Backdrop blur</span>
                <output>{{ settings.bgBlur ?? 12 }}px</output>
              </span>
              <input
                type="range"
                min="0"
                max="40"
                :value="settings.bgBlur ?? 12"
                @input="
                  update(
                    'bgBlur',
                    parseInt(($event.target as HTMLInputElement).value)
                  )
                "
              />
            </label>
            <label class="range-control">
              <span class="range-meta">
                <span>Border width</span>
                <output>{{ settings.borderWidth ?? 3 }}px</output>
              </span>
              <input
                type="range"
                min="0"
                max="12"
                :value="settings.borderWidth ?? 3"
                @input="
                  update(
                    'borderWidth',
                    parseInt(($event.target as HTMLInputElement).value)
                  )
                "
              />
            </label>
            <label class="range-control">
              <span class="range-meta">
                <span>Rotation speed</span>
                <output>{{ settings.animationSpeed ?? 5 }}s</output>
              </span>
              <input
                type="range"
                min="1"
                max="30"
                step="0.5"
                :value="settings.animationSpeed ?? 5"
                @input="
                  update(
                    'animationSpeed',
                    parseFloat(($event.target as HTMLInputElement).value)
                  )
                "
              />
            </label>
            <label class="range-control">
              <span class="range-meta">
                <span>Scanline intensity</span>
                <output>{{ Math.round((settings.scanlineOpacity ?? 0.08) * 100) }}%</output>
              </span>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                :value="settings.scanlineOpacity ?? 0.08"
                @input="
                  update(
                    'scanlineOpacity',
                    parseFloat(($event.target as HTMLInputElement).value)
                  )
                "
              />
            </label>
            <label class="range-control">
              <span class="range-meta">
                <span>Shine intensity</span>
                <output>{{ Math.round((settings.shineOpacity ?? 0.22) * 100) }}%</output>
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                :value="settings.shineOpacity ?? 0.22"
                @input="
                  update(
                    'shineOpacity',
                    parseFloat(($event.target as HTMLInputElement).value)
                  )
                "
              />
            </label>
          </div>
          <div class="toggle-stack">
            <label class="toggle-control">
              <span>Animated shine</span>
              <input
                type="checkbox"
                :checked="settings.showShine"
                @change="
                  update(
                    'showShine',
                    ($event.target as HTMLInputElement).checked
                  )
                "
              />
            </label>
            <label class="toggle-control">
              <span>CRT scanlines</span>
              <input
                type="checkbox"
                :checked="settings.showScanlines"
                @change="
                  update(
                    'showScanlines',
                    ($event.target as HTMLInputElement).checked
                  )
                "
              />
            </label>
          </div>
        </section>
      </aside>

      <div class="preview-column">
        <!-- Live Preview -->
        <section class="preview-shell">
          <div class="preview-toolbar">
            <div>
              <span class="live-dot"></span>
              Live preview
            </div>
            <span>Browser source</span>
          </div>
          <div class="preview-container">
            <!-- Checkerboard background for transparency preview -->
            <div class="checkerboard"></div>
            <div
              class="obs-frame"
              :class="{ 'with-scanlines': settings.showScanlines }"
              :style="{
                padding:
                  settings.framePadding !== null
                    ? `${settings.framePadding}px`
                    : undefined,
                '--obs-bg':
                  settings.backgroundOpacity !== null
                    ? `rgba(0,0,0,${settings.backgroundOpacity})`
                    : undefined,
                '--obs-bg-opacity':
                  settings.backgroundOpacity !== null
                    ? settings.backgroundOpacity
                    : undefined,
                '--obs-blur':
                  settings.bgBlur !== null ? `${settings.bgBlur}px` : undefined,
                '--obs-border-width':
                  settings.borderWidth !== null
                    ? `${settings.borderWidth}px`
                    : undefined,
                '--obs-border-color': settings.borderColor || undefined,
                '--obs-speed':
                  settings.animationSpeed !== null
                    ? `${settings.animationSpeed}s`
                    : undefined,
                '--obs-scanline-opacity':
                  settings.scanlineOpacity !== null
                    ? settings.scanlineOpacity
                    : undefined,
                '--obs-shine-opacity': settings.showShine
                  ? settings.shineOpacity ?? 0.22
                  : 0,
                '--obs-shine-state': settings.showShine ? 'running' : 'paused',
              }"
            >
              <p
                v-if="settings.showTitle"
                class="preview-title"
                :style="{
                  color: gameTitleColor || undefined,
                  fontSize: settings.titleSize
                    ? settings.titleSize + 'px'
                    : undefined,
                  fontFamily: settings.obsFontFamily || undefined,
                  textShadow: titleTextShadow,
                }"
              >
                {{ gameTitle }}
              </p>
              <TimerDisplay :is-focus-mode="false" :is-obs-override="true" />
            </div>
          </div>
          <div class="url-row">
            <span class="url-value" :title="overlayUrl">{{ overlayUrl }}</span>
            <button type="button" class="copy-button" @click="copyFinalLink">
              Copy URL
            </button>
          </div>
        </section>

        <!-- Actions -->
        <section class="builder-card output-card">
          <div class="output-heading">
            <div>
              <p class="builder-eyebrow">Overlay output</p>
              <h3>Ready for OBS</h3>
            </div>
            <span class="status-badge"><span></span> Live</span>
          </div>
          <p class="output-description">
            Add the copied URL as an OBS Browser source. Your current countdown and styling are included automatically.
          </p>
          <ol class="setup-steps">
            <li>
              <strong>Recommended source size:</strong> around 900–1200 px wide by 200–280 px tall. A 16:9 canvas (e.g. 1280 x 720) with the overlay scaled to ~70% width keeps the text crisp.
            </li>
            <li>
              <strong>Add a Browser source</strong> in OBS → Sources → + → Browser.
            </li>
            <li>
              <strong>Paste the copied URL</strong> into the URL field and set Width to 1280 and Height to 720.
            </li>
            <li>
              Leave <strong>Custom CSS</strong> blank and check <strong>Shutdown source when not visible</strong> for clean scene switching.
            </li>
          </ol>
          <div class="primary-actions">
            <button type="button" class="add-button" @click="createCustomTimer">
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
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              Add countdown
            </button>
            <button type="button" class="shuffle-button" @click="randomize">
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
              >
                <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22" />
                <path d="m18 2 4 4-4 4" />
                <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
                <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
                <path d="m18 14 4 4-4 4" />
              </svg>
              Shuffle style
            </button>
          </div>
          <div class="secondary-actions">
            <button type="button" class="final-link-button" @click="copyFinalLink">
              Copy final link
            </button>
            <button type="button" class="reset-button" @click="resetCustomization">
              Reset styles
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay-customizer {
  color: #e5e2e1;
  padding: 1.5rem 0 3rem;
}

.overlay-customizer :deep(.preview-container) .rounded-xl,
.overlay-customizer .builder-card,
.overlay-customizer .preview-shell,
.overlay-customizer .preview-container,
.overlay-customizer .obs-frame,
.overlay-customizer .url-value,
.overlay-customizer .color-control > div,
.overlay-customizer .select-control select,
.overlay-customizer button,
.overlay-customizer input {
  border-radius: 0.75rem !important;
}

.builder-header {
  align-items: flex-start;
  border-bottom: 1px solid rgba(126, 210, 235, 0.12);
  display: flex;
  gap: 2rem;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
}

.builder-eyebrow {
  color: rgba(126, 210, 235, 0.72);
  font-family: "Geist Mono", monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  margin: 0 0 0.35rem;
  text-transform: uppercase;
}

.builder-header h2 {
  font-family: "Geist Mono", monospace;
  font-size: clamp(1.35rem, 2vw, 1.75rem);
  font-weight: 700;
  letter-spacing: 0.06em;
  line-height: 1.15;
  margin: 0;
  text-transform: uppercase;
}

.builder-description {
  color: rgba(167, 204, 218, 0.58);
  font-size: 0.8rem;
  margin: 0.45rem 0 0;
}

.back-button {
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(126, 210, 235, 0.14);
  color: rgba(229, 226, 225, 0.72);
  display: inline-flex;
  flex: none;
  font-size: 0.68rem;
  font-weight: 650;
  gap: 0.45rem;
  letter-spacing: 0.02em;
  padding: 0.65rem 0.9rem;
  text-transform: none;
  transition: 150ms ease;
}

.back-button:hover,
.preset-button:hover,
.shuffle-button:hover,
.reset-button:hover {
  background: rgba(126, 210, 235, 0.06);
  border-color: rgba(126, 210, 235, 0.3);
  color: #e5e2e1;
}

.builder-grid {
  align-items: start;
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(17.5rem, 20rem) minmax(0, 1fr);
}

.control-column,
.preview-column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
}

.preview-column {
  position: sticky;
  top: 0.75rem;
}

.builder-card,
.preview-shell {
  background: rgba(22, 22, 24, 0.98);
  border: 1px solid rgba(126, 210, 235, 0.08);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.04) inset,
    0 12px 32px rgba(0, 0, 0, 0.28);
}

.builder-card {
  padding: 0.9rem;
}

.section-heading {
  align-items: center;
  display: flex;
  gap: 0.55rem;
  margin-bottom: 0.75rem;
}

.section-heading > span {
  align-items: center;
  background: rgba(126, 210, 235, 0.1);
  border: 1px solid rgba(126, 210, 235, 0.14);
  border-radius: 999px;
  color: rgba(126, 210, 235, 0.65);
  display: inline-flex;
  font-family: "Geist Mono", monospace;
  font-size: 0.55rem;
  height: 1.25rem;
  justify-content: center;
  width: 1.25rem;
}

.section-heading h3,
.output-heading h3 {
  color: rgba(229, 226, 225, 0.9);
  font-family: var(--font-family);
  font-size: 0.7rem;
  font-weight: 650;
  letter-spacing: 0.06em;
  margin: 0;
  text-transform: none;
}

.preset-grid {
  display: grid;
  gap: 0.4rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.preset-button,
.shuffle-button,
.reset-button {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(126, 210, 235, 0.12);
  color: rgba(229, 226, 225, 0.7);
  font-size: 0.66rem;
  font-weight: 650;
  padding: 0.55rem 0.45rem;
  transition: 150ms ease;
}

.select-control {
  display: block;
}

.select-control > span,
.color-control > span {
  color: rgba(167, 204, 218, 0.58);
  display: block;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  margin-bottom: 0.35rem;
  text-transform: none;
}

.select-control select {
  appearance: none;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6' fill='none'%3E%3Cpath d='M1 1.5L5 4.5L9 1.5' stroke='%237ed2eb' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") calc(100% - 0.75rem) 50% / 0.6rem no-repeat,
    rgba(14, 14, 14, 0.72);
  border: 1px solid rgba(126, 210, 235, 0.12);
  color: rgba(229, 226, 225, 0.85);
  cursor: pointer;
  font-size: 0.72rem;
  height: 2.15rem;
  padding: 0 1.9rem 0 0.75rem;
  width: 100%;
}

.content-controls {
  align-items: end;
  display: grid;
  gap: 0.45rem;
  grid-template-columns: 1.1fr 1fr 1fr;
  margin-top: 0.65rem;
}

.content-controls .toggle-control {
  align-items: flex-start;
  flex-direction: column;
  gap: 0.35rem;
  justify-content: flex-end;
  min-height: 2.95rem;
}

.content-controls .toggle-control input {
  order: 0;
}

.control-stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.8rem;
}

.range-control {
  display: block;
}

.range-meta {
  align-items: center;
  color: rgba(229, 226, 225, 0.75);
  display: flex;
  font-size: 0.65rem;
  justify-content: space-between;
  margin-bottom: 0.35rem;
}

.range-meta output {
  color: #7ed2eb;
  font-family: "Geist Mono", monospace;
  font-size: 0.6rem;
  font-weight: 600;
}

.range-control input[type="range"] {
  accent-color: #7ed2eb;
  cursor: pointer;
  display: block;
  height: 0.25rem;
  width: 100%;
}

.color-grid {
  display: grid;
  gap: 0.45rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.color-control > div {
  align-items: center;
  background: rgba(14, 14, 14, 0.56);
  border: 1px solid rgba(126, 210, 235, 0.09);
  display: flex;
  height: 2.05rem;
  justify-content: space-between;
  padding: 0.25rem 0.45rem;
}

.color-control input[type="color"] {
  background: transparent;
  border: 0;
  cursor: pointer;
  height: 1.4rem;
  padding: 0;
  width: 1.9rem;
}

.color-control button {
  color: rgba(167, 204, 218, 0.5);
  font-family: "Geist Mono", monospace;
  font-size: 0.52rem;
  text-transform: uppercase;
}

.color-control button:hover {
  color: #e5e2e1;
}

.toggle-stack {
  border-top: 1px solid rgba(126, 210, 235, 0.09);
  display: grid;
  gap: 0.45rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 0.9rem;
  padding-top: 0.8rem;
}

.toggle-control {
  align-items: center;
  color: rgba(229, 226, 225, 0.7);
  cursor: pointer;
  display: flex;
  font-size: 0.62rem;
  gap: 0.45rem;
}

.toggle-control input {
  accent-color: #7ed2eb;
  height: 0.85rem;
  order: -1;
  width: 0.85rem;
}

.preview-shell {
  overflow: hidden;
}

.preview-toolbar {
  align-items: center;
  border-bottom: 1px solid rgba(126, 210, 235, 0.08);
  color: rgba(167, 204, 218, 0.5);
  display: flex;
  font-size: 0.6rem;
  font-weight: 600;
  justify-content: space-between;
  letter-spacing: 0.04em;
  padding: 0.7rem 0.85rem;
  text-transform: none;
}

.preview-toolbar > div {
  align-items: center;
  color: rgba(229, 226, 225, 0.75);
  display: flex;
  gap: 0.45rem;
}

.live-dot,
.status-badge > span {
  background: #58c7e3;
  box-shadow: 0 0 8px rgba(88, 199, 227, 0.75);
  display: inline-block;
  height: 0.35rem;
  width: 0.35rem;
}

.preview-container {
  align-items: center;
  aspect-ratio: 16 / 9;
  background:
    radial-gradient(circle at 50% 45%, rgba(126, 210, 235, 0.08), transparent 55%),
    #101112;
  display: flex;
  justify-content: center;
  min-height: 22rem;
  overflow: hidden;
  padding: clamp(1rem, 3vw, 2.25rem);
  position: relative;
}

.checkerboard {
  background-image:
    linear-gradient(45deg, rgba(229, 226, 225, 0.035) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(229, 226, 225, 0.035) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(229, 226, 225, 0.035) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(229, 226, 225, 0.035) 75%);
  background-position: 0 0, 0 8px, 8px -8px, -8px 0;
  background-size: 16px 16px;
  inset: 0;
  position: absolute;
}

.obs-frame {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  max-width: 100%;
  padding: clamp(1rem, 3vw, 2rem);
  position: relative;
  width: 100%;
  z-index: 1;
}

.preview-title {
  color: #e5e2e1;
  font-family: "Geist Mono", monospace;
  font-size: clamp(1.2rem, 3vw, 2.3rem);
  font-weight: 700;
  line-height: 1.1;
  margin: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
  text-align: center;
  text-wrap: balance;
}

.preview-container :deep(.glass-section),
.preview-container :deep(.glass-panel) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.preview-container :deep(.rounded-xl) {
  border-radius: 1rem !important;
}

.preview-container :deep(.mx-auto) {
  gap: 0.5rem;
}

.preview-container :deep(.rounded-xl) {
  padding-bottom: 0.75rem;
  padding-top: 0.75rem;
}

.url-row {
  align-items: center;
  background: rgba(14, 14, 14, 0.78);
  border-top: 1px solid rgba(126, 210, 235, 0.1);
  display: flex;
  gap: 0.5rem;
  padding: 0.55rem;
}

.url-value {
  background: rgba(28, 27, 27, 0.9);
  border: 1px solid rgba(126, 210, 235, 0.09);
  color: rgba(167, 204, 218, 0.58);
  flex: 1;
  font-family: "Geist Mono", monospace;
  font-size: 0.58rem;
  min-width: 0;
  overflow: hidden;
  padding: 0.65rem 0.8rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.copy-button,
.add-button,
.final-link-button {
  background: linear-gradient(90deg, #7ed2eb, #439cb3);
  border: 0;
  color: #0f1415;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 0.6rem 0.85rem;
  text-transform: none;
  transition: 150ms ease;
}

.copy-button:hover,
.add-button:hover,
.final-link-button:hover {
  box-shadow: 0 0 18px rgba(126, 210, 235, 0.22);
  filter: brightness(1.04);
}

.output-card {
  padding: 1rem;
}

.output-heading {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.status-badge {
  align-items: center;
  border: 1px solid rgba(88, 199, 227, 0.18);
  color: rgba(126, 210, 235, 0.72);
  display: inline-flex;
  font-family: "Geist Mono", monospace;
  font-size: 0.55rem;
  gap: 0.4rem;
  letter-spacing: 0.1em;
  padding: 0.35rem 0.45rem;
  text-transform: uppercase;
}

.output-description {
  color: rgba(167, 204, 218, 0.55);
  font-size: 0.72rem;
  line-height: 1.55;
  margin: 0.65rem 0 0.85rem;
  max-width: 42rem;
}

.setup-steps {
  color: rgba(167, 204, 218, 0.6);
  display: flex;
  flex-direction: column;
  font-size: 0.68rem;
  gap: 0.5rem;
  line-height: 1.55;
  list-style-position: outside;
  margin: 0 0 0.9rem;
  padding-left: 1.15rem;
}

.setup-steps li {
  padding-left: 0.2rem;
}

.setup-steps strong {
  color: rgba(229, 226, 225, 0.78);
  font-weight: 700;
}

.primary-actions,
.secondary-actions {
  display: grid;
  gap: 0.5rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.primary-actions {
  margin-bottom: 0.5rem;
}

.add-button,
.shuffle-button,
.final-link-button,
.reset-button {
  align-items: center;
  display: inline-flex;
  justify-content: center;
  min-height: 2.45rem;
}

.add-button,
.shuffle-button {
  gap: 0.45rem;
}

.final-link-button {
  grid-column: span 1;
}

/* Scanlines overlay - uses a separate visual layer, not ::after, to avoid conflicting with the shine animation */
.with-scanlines {
  position: relative;
}

.with-scanlines > * {
  position: relative;
  z-index: 1;
}

.obs-frame.with-scanlines::after {
  /* Inherit the shine animation, but add scanlines to the background */
  background:
    /* Sweep A */ linear-gradient(
      110deg,
      rgba(34, 211, 238, calc(var(--obs-shine-opacity, 0.22) * 0.3)) 0%,
      rgba(34, 211, 238, var(--obs-shine-opacity, 0.22)) 12%,
      rgba(124, 58, 237, calc(var(--obs-shine-opacity, 0.22) * 0.8)) 50%,
      rgba(34, 211, 238, calc(var(--obs-shine-opacity, 0.22) * 0.3)) 88%,
      transparent 100%
    ),
    /* Sweep B (counter) */ linear-gradient(
      -70deg,
      transparent 0%,
      rgba(255, 255, 255, calc(var(--obs-shine-opacity, 0.22) * 0.4)) 12%,
      rgba(34, 211, 238, calc(var(--obs-shine-opacity, 0.22) * 0.8)) 18%,
      transparent 28%
    ),
    /* Base inner glow */ radial-gradient(
      900px 420px at 50% 120%,
      rgba(34, 211, 238, 0.14),
      transparent 65%
    ),
    /* Scanlines - more visible when enabled */ repeating-linear-gradient(
      to bottom,
      rgba(14, 165, 233, var(--obs-scanline-opacity, 0.08)),
      rgba(14, 165, 233, var(--obs-scanline-opacity, 0.08)) 1px,
      transparent 1px,
      transparent 3px
    );
  background-size: 320% 100%, 280% 100%, 100% 100%, 100% 100%;
}

@media (max-width: 900px) {
  .builder-grid {
    grid-template-columns: 1fr;
  }

  .preview-column {
    order: -1;
    position: static;
  }

  .control-column {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .overlay-customizer {
    padding-top: 1rem;
  }

  .builder-header {
    align-items: stretch;
    flex-direction: column;
    gap: 0.9rem;
  }

  .back-button {
    justify-content: center;
  }

  .control-column {
    display: flex;
  }

  .preview-container {
    aspect-ratio: auto;
    min-height: 18rem;
    padding: 0.6rem;
  }

  .obs-frame {
    padding: 0.75rem;
  }

  .preview-container :deep(.tabular-nums) {
    font-size: clamp(2.7rem, 15vw, 4.25rem) !important;
  }

  .preview-container :deep(.obs-label) {
    font-size: clamp(0.65rem, 3vw, 0.95rem) !important;
  }

  .url-row {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-actions,
  .secondary-actions {
    grid-template-columns: 1fr;
  }
}
</style>
