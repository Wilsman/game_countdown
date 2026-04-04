<script setup lang="ts">
import { computed } from "vue";
import { useTimerStore } from "../stores/timer";
import { storeToRefs } from "pinia";
import { toast } from "vue-sonner";
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

const copyFinalLink = () => {
  const url = store.getObsOverlayUrl();
  navigator.clipboard.writeText(url);
  toast.success("Customized OBS link copied!");
};

const resetCustomization = () => {
  store.updateSettings({
    digitColor: null,
    labelColor: null,
    digitSize: 100,
    labelSize: null,
    titleSize: null,
    glowColor: null,
    glowIntensity: null,
    showScanlines: true,
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
  <div class="overlay-customizer flex w-full flex-col gap-6 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-1">
        <h2 class="text-3xl font-black tracking-tight text-[#e5e2e1]">
          Overlay Customizer
        </h2>
        <p class="text-sm text-cyan-100/55">
          Tune the OBS output with the same terminal palette as the main app.
        </p>
      </div>
      <button @click="close" class="btn-ghost">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Dashboard
      </button>
    </div>

    <div class="flex flex-col gap-4">
      <!-- Live Preview -->
      <div
          class="sticky top-0 z-50 -mx-4 flex flex-col gap-2 border-b border-cyan-200/10 bg-[#131313]/95 px-4 py-3 backdrop-blur-xl transition-all sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12"
      >
        <div class="flex items-center justify-between px-2">
          <h3
            class="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-500/80"
          >
            Preview Window
          </h3>
        </div>
        <div
            class="preview-container relative flex min-h-[300px] w-full items-center justify-center overflow-hidden border border-cyan-200/10 bg-[#1c1b1b]"
        >
          <!-- Checkerboard background for transparency preview -->
          <div class="absolute inset-0 checkerboard opacity-5"></div>

          <div
            class="obs-frame relative z-10 w-fit flex flex-col items-center gap-6 p-6 sm:p-10"
            :class="{ 'with-scanlines': settings.showScanlines }"
            :style="{
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
              class="text-4xl font-black text-cyan-100 sm:text-6xl drop-shadow-[0_0_20px_rgba(34,211,238,0.85)]"
              :style="{
                color: gameTitleColor || undefined,
                fontSize: settings.titleSize
                  ? settings.titleSize + 'px'
                  : undefined,
                fontFamily: settings.obsFontFamily
                  ? settings.obsFontFamily
                  : undefined,
                textShadow: titleTextShadow,
              }"
            >
              {{ gameTitle }}
            </p>
            <TimerDisplay :is-focus-mode="false" :is-obs-override="true" />
          </div>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex flex-col gap-4">
        <div class="glass-panel space-y-8 p-4 sm:p-6">
          <!-- Actions -->
          <div class="flex flex-col gap-4 border-b border-cyan-200/10 pb-6">
            <div class="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04] px-4 py-3 text-sm text-cyan-100/60">
              Add Countdown creates a new saved timer for the preview you are styling here, without leaving the OBS setup view.
            </div>
            <div class="grid grid-cols-1 gap-4 items-center md:grid-cols-2 xl:grid-cols-4">
              <button
                @click="createCustomTimer"
                class="btn-feature min-h-[4.5rem]"
              >
                <span class="inline-flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  Add Countdown
                </span>
                <span class="btn-feature-subtitle">
                  Create a new countdown and keep this preview open.
                </span>
              </button>
              <button
                @click="randomize"
                class="group py-4 rounded-xl border-2 border-dashed border-cyan-500/20 text-cyan-400 font-bold transition-all hover:bg-cyan-500/5 hover:border-cyan-500/50 flex items-center justify-center gap-2 active:scale-95"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="group-hover:rotate-12 transition-transform"
                >
                  <path
                    d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"
                  />
                  <path d="m18 2 4 4-4 4" />
                  <path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2" />
                  <path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8" />
                  <path d="m18 14 4 4-4 4" />
                </svg>
                Shuffle Everything
              </button>
              <button
                @click="copyFinalLink"
                class="relative group btn-accent py-4 text-lg font-black shadow-[0_0_30px_rgba(6,182,212,0.2)]"
              >
                <span>Copy Final Link</span>
              </button>
              <button
                @click="resetCustomization"
                class="btn-ghost text-xs text-slate-500 font-bold uppercase tracking-widest hover:text-slate-300 transition-colors"
              >
                Reset to Original
              </button>
            </div>
          </div>
          <div
            class="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 items-start"
          >
            <!-- Left Column: Style Presets, Colors & Glow -->
            <div class="flex flex-col gap-10">
              <!-- Style Presets -->
              <section class="space-y-4">
                <h4
                  class="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                  ></span>
                  Style Presets
                </h4>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    v-for="preset in presets"
                    :key="preset.name"
                    @click="applyPreset(preset)"
                    class="group relative overflow-hidden px-3 py-2.5 rounded-xl bg-slate-900/40 border border-white/5 text-xs font-bold text-slate-300 transition-all hover:border-cyan-500/50 hover:bg-slate-800/60 active:scale-95"
                  >
                    <div
                      class="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"
                    ></div>
                    {{ preset.name }}
                  </button>
                </div>
              </section>

              <!-- Colors Section -->
              <section class="space-y-3">
                <h4
                  class="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                  ></span>
                  Colors & Glow
                </h4>
                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-2">
                    <label
                      class="text-[10px] font-bold text-slate-500 uppercase"
                      >Digits</label
                    >
                    <div
                      class="flex items-center gap-2 rounded-xl border border-white/5 bg-black/20 p-2"
                    >
                      <input
                        type="color"
                        :value="settings.digitColor || '#ecfeff'"
                        @input="
                          update(
                            'digitColor',
                            ($event.target as HTMLInputElement).value
                          )
                        "
                        class="h-6 w-8 cursor-pointer bg-transparent border-none"
                      />
                      <button
                        v-if="settings.digitColor"
                        @click="update('digitColor', null)"
                        class="text-[9px] font-bold text-slate-500 hover:text-slate-300 uppercase"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label
                      class="text-[10px] font-bold text-slate-500 uppercase"
                      >Labels</label
                    >
                    <div
                      class="flex items-center gap-2 rounded-xl border border-white/5 bg-black/20 p-2"
                    >
                      <input
                        type="color"
                        :value="settings.labelColor || '#22d3ee'"
                        @input="
                          update(
                            'labelColor',
                            ($event.target as HTMLInputElement).value
                          )
                        "
                        class="h-6 w-8 cursor-pointer bg-transparent border-none"
                      />
                      <button
                        v-if="settings.labelColor"
                        @click="update('labelColor', null)"
                        class="text-[9px] font-bold text-slate-500 hover:text-slate-300 uppercase"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label
                      class="text-[10px] font-bold text-slate-500 uppercase"
                      >Glow</label
                    >
                    <div
                      class="flex items-center gap-2 rounded-xl border border-white/5 bg-black/20 p-2"
                    >
                      <input
                        type="color"
                        :value="settings.glowColor || '#22d3ee'"
                        @input="
                          update(
                            'glowColor',
                            ($event.target as HTMLInputElement).value
                          )
                        "
                        class="h-6 w-8 cursor-pointer bg-transparent border-none"
                      />
                      <button
                        v-if="settings.glowColor"
                        @click="update('glowColor', null)"
                        class="text-[9px] font-bold text-slate-500 hover:text-slate-300 uppercase"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <label
                      class="text-[10px] font-bold text-slate-500 uppercase"
                      >Border</label
                    >
                    <div
                      class="flex items-center gap-2 rounded-xl border border-white/5 bg-black/20 p-2"
                    >
                      <input
                        type="color"
                        :value="settings.borderColor || '#06b6d4'"
                        @input="
                          update(
                            'borderColor',
                            ($event.target as HTMLInputElement).value
                          )
                        "
                        class="h-6 w-8 cursor-pointer bg-transparent border-none"
                      />
                      <button
                        v-if="settings.borderColor"
                        @click="update('borderColor', null)"
                        class="text-[9px] font-bold text-slate-500 hover:text-slate-300 uppercase"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                <div class="space-y-5 pt-2">
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-semibold text-slate-300"
                        >Glow Intensity</label
                      >
                      <span class="text-[10px] font-mono text-cyan-400"
                        >{{ settings.glowIntensity || 20 }}px</span
                      >
                    </div>
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
                      class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-semibold text-slate-300"
                        >Glow Spread</label
                      >
                      <span class="text-[10px] font-mono text-cyan-400"
                        >{{ settings.glowSpread || 0 }}px</span
                      >
                    </div>
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
                      class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                </div>
              </section>
            </div>

            <!-- Right Column: Typography, Frame & Backdrop -->
            <div class="flex flex-col gap-10">
              <!-- Typography Section -->
              <section class="space-y-3">
                <h4
                  class="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                  ></span>
                  Typography
                </h4>
                <div class="space-y-3">
                  <div class="space-y-2">
                    <label
                      class="text-[10px] font-bold text-slate-500 uppercase"
                      >Font Family</label
                    >
                    <select
                      :value="settings.obsFontFamily || 'Geist Sans'"
                      @change="
                        update(
                          'obsFontFamily',
                          ($event.target as HTMLSelectElement).value
                        )
                      "
                      class="w-full h-9 px-3 rounded-xl bg-slate-900 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-cyan-500/50 cursor-pointer"
                    >
                      <option
                        value="Geist Sans"
                        class="bg-slate-900 text-slate-300"
                      >
                        Geist Sans
                      </option>
                      <option
                        value="Geist Mono"
                        class="bg-slate-900 text-slate-300"
                      >
                        Geist Mono
                      </option>
                      <option
                        value="sans-serif"
                        class="bg-slate-900 text-slate-300"
                      >
                        Sans Serif
                      </option>
                      <option
                        value="monospace"
                        class="bg-slate-900 text-slate-300"
                      >
                        Monospace
                      </option>
                    </select>
                  </div>
                  <div class="grid gap-3">
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <label class="text-xs font-semibold text-slate-300"
                          >Digit Size</label
                        >
                        <span class="text-[10px] font-mono text-cyan-400"
                          >{{ settings.digitSize || 100 }}px</span
                        >
                      </div>
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
                        class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                    </div>
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <label class="text-xs font-semibold text-slate-300"
                          >Label Size</label
                        >
                        <span class="text-[10px] font-mono text-cyan-400"
                          >{{ settings.labelSize || 36 }}px</span
                        >
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        :value="settings.labelSize || 36"
                        @input="
                          update(
                            'labelSize',
                            parseInt(($event.target as HTMLInputElement).value)
                          )
                        "
                        class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <!-- Frame Section -->
              <section class="space-y-3">
                <h4
                  class="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                  ></span>
                  Frame & Backdrop
                </h4>
                <div class="space-y-3">
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-semibold text-slate-300"
                        >Background Opacity</label
                      >
                      <span class="text-[10px] font-mono text-cyan-400"
                        >{{
                          Math.round(
                            (settings.backgroundOpacity ?? 0.65) * 100
                          )
                        }}%</span
                      >
                    </div>
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
                      class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-semibold text-slate-300"
                        >Backdrop Blur</label
                      >
                      <span class="text-[10px] font-mono text-cyan-400"
                        >{{ settings.bgBlur ?? 12 }}px</span
                      >
                    </div>
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
                      class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-semibold text-slate-300"
                        >Border Width</label
                      >
                      <span class="text-[10px] font-mono text-cyan-400"
                        >{{ settings.borderWidth ?? 3 }}px</span
                      >
                    </div>
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
                      class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-semibold text-slate-300"
                        >Rotation Speed</label
                      >
                      <span class="text-[10px] font-mono text-cyan-400"
                        >{{ settings.animationSpeed ?? 5 }}s</span
                      >
                    </div>
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
                      class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-semibold text-slate-300"
                        >Scanline Intensity</label
                      >
                      <span class="text-[10px] font-mono text-cyan-400"
                        >{{
                          Math.round((settings.scanlineOpacity ?? 0.08) * 100)
                        }}%</span
                      >
                    </div>
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
                      class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-semibold text-slate-300"
                        >Shine Intensity</label
                      >
                      <span class="text-[10px] font-mono text-cyan-400"
                        >{{
                          Math.round((settings.shineOpacity ?? 0.22) * 100)
                        }}%</span
                      >
                    </div>
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
                      class="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  <div class="pt-2 flex flex-col gap-3">
                    <label
                      class="group flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-black/20 p-3 transition-colors hover:bg-black/40"
                    >
                      <span class="text-sm font-medium text-slate-300"
                        >Animated Shine</span
                      >
                      <div
                        class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200"
                        :class="
                          settings.showShine ? 'bg-cyan-500' : 'bg-slate-700'
                        "
                      >
                        <span
                          class="inline-block h-3 w-3 transform rounded-full bg-white transition duration-200"
                          :class="
                            settings.showShine
                              ? 'translate-x-5'
                              : 'translate-x-1'
                          "
                        ></span>
                        <input
                          type="checkbox"
                          class="sr-only"
                          :checked="settings.showShine"
                          @change="
                            update(
                              'showShine',
                              ($event.target as HTMLInputElement).checked
                            )
                          "
                        />
                      </div>
                    </label>

                    <label
                      class="group flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-black/20 p-3 transition-colors hover:bg-black/40"
                    >
                      <span class="text-sm font-medium text-slate-300"
                        >CRT Scanlines</span
                      >
                      <div
                        class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200"
                        :class="
                          settings.showScanlines
                            ? 'bg-cyan-500'
                            : 'bg-slate-700'
                        "
                      >
                        <span
                          class="inline-block h-3 w-3 transform rounded-full bg-white transition duration-200"
                          :class="
                            settings.showScanlines
                              ? 'translate-x-5'
                              : 'translate-x-1'
                          "
                        ></span>
                        <input
                          type="checkbox"
                          class="sr-only"
                          :checked="settings.showScanlines"
                          @change="
                            update(
                              'showScanlines',
                              ($event.target as HTMLInputElement).checked
                            )
                          "
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay-customizer {
  color: #e5e2e1;
}

.overlay-customizer h2,
.overlay-customizer h3,
.overlay-customizer h4 {
  font-family: "Geist Mono", monospace;
}

.overlay-customizer h2 {
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.overlay-customizer h4 {
  color: rgba(126, 210, 235, 0.74) !important;
}

.overlay-customizer button {
  border-radius: 0 !important;
}

.overlay-customizer .glass-panel button:not(.btn-accent):not(.btn-ghost):not(.btn-feature) {
  background: rgba(28, 27, 27, 0.96);
  border: 1px solid rgba(126, 210, 235, 0.12);
  color: #e5e2e1;
}

.overlay-customizer .glass-panel button:not(.btn-accent):not(.btn-ghost):not(.btn-feature):hover {
  background: rgba(126, 210, 235, 0.06);
  border-color: rgba(126, 210, 235, 0.28);
}

.overlay-customizer select,
.overlay-customizer input[type="text"],
.overlay-customizer input[type="number"] {
  border-radius: 0 !important;
  border-color: rgba(126, 210, 235, 0.14) !important;
  background: rgba(28, 27, 27, 0.96) !important;
  color: #e5e2e1 !important;
}

.overlay-customizer label,
.overlay-customizer .text-slate-300 {
  color: #e5e2e1 !important;
}

.overlay-customizer .text-slate-500,
.overlay-customizer .text-slate-400 {
  color: rgba(167, 204, 218, 0.58) !important;
}

.overlay-customizer input[type="range"] {
  accent-color: #7ed2eb;
}

.preview-container {
  background-image: radial-gradient(
      circle at 50% 50%,
      rgba(126, 210, 235, 0.08) 0%,
      transparent 100%
    ),
    linear-gradient(180deg, rgba(19, 19, 19, 0.88) 0%, rgba(14, 14, 14, 0.82) 100%);
}

.preview-container :deep(.glass-section),
.preview-container :deep(.glass-panel) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
}

.checkerboard {
  background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
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
    /* Sweep B (counter) */
      linear-gradient(
        -70deg,
        transparent 0%,
        rgba(255, 255, 255, calc(var(--obs-shine-opacity, 0.22) * 0.4)) 12%,
        rgba(34, 211, 238, calc(var(--obs-shine-opacity, 0.22) * 0.8)) 18%,
        transparent 28%
      ),
    /* Base inner glow */
      radial-gradient(
        900px 420px at 50% 120%,
        rgba(34, 211, 238, 0.14),
        transparent 65%
      ),
    /* Scanlines - more visible when enabled */
      repeating-linear-gradient(
        to bottom,
        rgba(14, 165, 233, var(--obs-scanline-opacity, 0.08)),
        rgba(14, 165, 233, var(--obs-scanline-opacity, 0.08)) 1px,
        transparent 1px,
        transparent 3px
      );
  background-size: 320% 100%, 280% 100%, 100% 100%, 100% 100%;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(126, 210, 235, 0.16);
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(126, 210, 235, 0.28);
}

.btn-accent {
  @apply relative flex items-center justify-center gap-2 border bg-transparent px-6 py-2.5 font-bold uppercase tracking-[0.14em] text-[#0f1415] transition-all active:scale-[0.98];
  background: linear-gradient(90deg, #7ed2eb, #439cb3);
  border-color: rgba(126, 210, 235, 0.4);
}

.btn-ghost {
  @apply flex items-center gap-2 border border-transparent px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-cyan-100/70 transition-all hover:bg-cyan-200/[0.05] hover:text-[#e5e2e1];
}

.glass-panel {
  background: rgba(32, 31, 31, 0.94);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(126, 210, 235, 0.14);
  box-shadow: 0 0 32px rgba(126, 210, 235, 0.05);
}
</style>
