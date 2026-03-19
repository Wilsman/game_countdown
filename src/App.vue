<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import type { Ref } from "vue";
import { storeToRefs } from "pinia";
import { Toaster, toast } from "vue-sonner";

import ControlPanel from "./components/ControlPanel.vue";
import GameSelector from "./components/GameSelector.vue";
import OverlayCustomizer from "./components/OverlayCustomizer.vue";
import RegionalReleasePicker from "./components/RegionalReleasePicker.vue";
import TimerDisplay from "./components/TimerDisplay.vue";
import UpcomingGamesCalendar from "./components/UpcomingGamesCalendar.vue";
import { useTimerStore } from "./stores/timer";

interface GameBackgroundMeta {
  image: string;
  overlay: string;
}

type Theme = "light" | "dark";

const isClient = typeof window !== "undefined";

const timerStore = useTimerStore();
const { gameTitle, gameTitleColor, isObsMode, settings } =
  storeToRefs(timerStore);

const isEditingTitle = ref(false);
const titleInput: Ref<HTMLInputElement | null> = ref(null);
const isFocusMode = ref(false);
const isCustomizing = ref(false);

const showChrome = computed(
  () => !isFocusMode.value && !isObsMode.value && !isCustomizing.value
);

const toggleCustomizing = () => {
  isCustomizing.value = !isCustomizing.value;
};

const MARATHON_DUO_THEME_IDS = new Set([
  "marathon",
  "marathon-server-slam-open-beta",
]);

const isMarathonDuoTheme = computed(() =>
  MARATHON_DUO_THEME_IDS.has((timerStore.activeGame?.id ?? "").toLowerCase())
);

const gameBackground = computed<GameBackgroundMeta | null>(() => {
  const gameId = timerStore.activeGame?.id?.toLowerCase() ?? "";
  if (gameId.includes("bf6") || gameId.includes("battlefield")) {
    return {
      image:
        "url(https://www.dexerto.com/cdn-image/wp-content/uploads/2025/07/31/How-to-play-Battlefield-6-Open-Beta.jpg?width=1200&quality=100&format=auto)",
      overlay: "bg-black/60",
    };
  }
  if (gameId.includes("tarkov") || gameId.includes("0.16.8.0")) {
    return {
      image: "url(/Hardcore Wipe.webp)",
      overlay: "bg-black/58",
    };
  }
  if (gameId.includes("arc") || gameId.includes("raiders")) {
    return {
      image: "url(/arc.webp)",
      overlay: "bg-black/58",
    };
  }
  return null;
});

const hasGameBackground = computed(() =>
  Boolean(gameBackground.value && settings.value.enableGameBackground)
);

const handleEditTitle = () => {
  isEditingTitle.value = true;
  nextTick(() => {
    titleInput.value?.focus();
    titleInput.value?.select();
  });
};

const handleStopEditTitle = () => {
  isEditingTitle.value = false;
};

const toggleFocusMode = () => {
  isFocusMode.value = !isFocusMode.value;
  if (isFocusMode.value) {
    toast.info("Focus mode enabled", {
      description: "Use the exit button to return to the full layout.",
    });
  }
};

const exitFocusMode = () => {
  isFocusMode.value = false;
};

onMounted(() => {
  if (!isClient) return;
  timerStore.handleUrlParams();
});

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

watch(
  () => timerStore.settings.theme as Theme,
  (theme) => {
    if (!isClient) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  },
  { immediate: true }
);
</script>

<template>
  <div
    class="background-mesh relative min-h-screen"
    :class="{
      'with-game-background': hasGameBackground,
      'obs-mode': isObsMode && !isCustomizing,
      'marathon-duo-theme': isMarathonDuoTheme,
    }"
  >
    <div
      v-if="gameBackground && settings.enableGameBackground"
      class="pointer-events-none absolute inset-0 -z-10"
    >
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        :style="{ backgroundImage: gameBackground.image }"
      ></div>
      <div :class="['absolute inset-0', gameBackground.overlay]"></div>
    </div>

    <main class="relative z-0">
      <div
        class="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8"
      >
        <header
          v-if="showChrome"
          class="flex items-center justify-between gap-4 border-b border-cyan-200/10 pb-4"
        >
          <p class="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200/80">
            Game Countdown
          </p>
          <ControlPanel />
        </header>

        <section class="flex flex-1 flex-col">
          <OverlayCustomizer v-if="isCustomizing" @close="toggleCustomizing" />

          <template v-else>
            <div class="flex min-h-[70vh] items-center py-8 sm:py-10">
              <div
                class="glass-panel countdown-stage relative mx-auto flex w-full flex-col items-center justify-center gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:max-w-5xl lg:px-10 lg:py-12"
                :class="{
                  'obs-frame w-fit max-w-none': isObsMode,
                  'marathon-panel': isMarathonDuoTheme,
                }"
                :style="{
                  '--obs-bg':
                    isObsMode && settings.backgroundOpacity !== null
                      ? `rgba(0,0,0,${settings.backgroundOpacity})`
                      : undefined,
                  '--obs-bg-opacity':
                    isObsMode && settings.backgroundOpacity !== null
                      ? settings.backgroundOpacity
                      : undefined,
                  '--obs-blur':
                    isObsMode && settings.bgBlur !== null
                      ? `${settings.bgBlur}px`
                      : undefined,
                  '--obs-border-width':
                    isObsMode && settings.borderWidth !== null
                      ? `${settings.borderWidth}px`
                      : undefined,
                  '--obs-border-color':
                    isObsMode && settings.borderColor
                      ? settings.borderColor
                      : undefined,
                  '--obs-speed':
                    isObsMode && settings.animationSpeed !== null
                      ? `${settings.animationSpeed}s`
                      : undefined,
                  '--obs-scanline-opacity':
                    isObsMode && settings.scanlineOpacity !== null
                      ? settings.scanlineOpacity
                      : undefined,
                  '--obs-shine-opacity':
                    isObsMode && settings.showShine
                      ? settings.shineOpacity ?? 0.22
                      : 0,
                  '--obs-shine-state':
                    isObsMode && settings.showShine ? 'running' : 'paused',
                }"
              >
                <div
                  v-if="!isObsMode && !isEditingTitle"
                  class="w-full max-w-4xl"
                >
                  <GameSelector variant="hero" @edit="handleEditTitle" />
                </div>

                <input
                  v-else-if="!isObsMode && isEditingTitle"
                  ref="titleInput"
                  v-model="gameTitle"
                  type="text"
                  class="countdown-title-input w-full max-w-4xl"
                  :style="{
                    color: gameTitleColor || undefined,
                    fontSize: settings.titleSize
                      ? settings.titleSize + 'px'
                      : undefined,
                  }"
                  @blur="handleStopEditTitle"
                  @keyup.enter="handleStopEditTitle"
                />

                <p
                  v-else
                  class="countdown-obs-title"
                  :style="{
                    color: gameTitleColor || undefined,
                    fontSize: settings.titleSize
                      ? settings.titleSize + 'px'
                      : undefined,
                    textShadow: titleTextShadow,
                  }"
                >
                  {{ gameTitle }}
                </p>

                <TimerDisplay
                  class="timer-display-core w-full"
                  :is-focus-mode="isFocusMode"
                  :is-obs-override="isObsMode"
                  @toggle-focus="toggleFocusMode"
                  @customize="toggleCustomizing"
                />
              </div>
            </div>

            <UpcomingGamesCalendar v-if="showChrome && !isCustomizing" />
          </template>
        </section>

        <footer
          v-if="showChrome"
          class="mt-8 flex flex-col gap-3 border-t border-cyan-200/10 pt-4 text-sm text-cyan-100/55 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>UTC countdowns · regional launch selection · OBS output</span>
          <a
            class="btn-ghost self-start border-none p-0 text-sm text-cyan-100/70 hover:bg-transparent hover:text-cyan-100"
            href="https://github.com/wilsman"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wilsman77
          </a>
        </footer>
      </div>
    </main>

    <div
      v-if="isFocusMode && !isObsMode"
      class="fixed inset-x-0 bottom-0 z-30 flex justify-center pb-8"
    >
      <button type="button" class="btn-muted" @click="exitFocusMode">
        Exit focus mode
      </button>
    </div>
  </div>
  <RegionalReleasePicker />
  <Toaster position="bottom-center" />
</template>

<style scoped>
.background-mesh {
  position: relative;
  background:
    radial-gradient(
      circle at top,
      rgba(126, 210, 235, 0.12),
      transparent 28%
    ),
    linear-gradient(180deg, #131313 0%, #101010 46%, #0c0c0c 100%);
}

.background-mesh::before,
.background-mesh::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: -20;
}

.background-mesh::before {
  background-image:
    linear-gradient(rgba(126, 210, 235, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(126, 210, 235, 0.05) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.26), transparent 82%);
  opacity: 0.3;
}

.background-mesh::after {
  background:
    radial-gradient(circle at 18% 16%, rgba(126, 210, 235, 0.08), transparent 22%),
    radial-gradient(circle at 82% 12%, rgba(67, 156, 179, 0.08), transparent 22%),
    radial-gradient(circle at 50% 74%, rgba(255, 186, 61, 0.06), transparent 26%);
}

.background-mesh.with-game-background {
  background: linear-gradient(180deg, #111111 0%, #090909 100%);
}

.background-mesh.with-game-background::before,
.background-mesh.with-game-background::after {
  opacity: 0.22;
}

.background-mesh.obs-mode::before,
.background-mesh.obs-mode::after {
  display: none;
}

.background-mesh.obs-mode {
  background: transparent;
}

.countdown-stage {
  min-height: min(44rem, calc(100vh - 10rem));
  background:
    linear-gradient(180deg, rgba(32, 31, 31, 0.96), rgba(18, 18, 18, 0.98)),
    rgba(18, 18, 18, 0.96);
}

.countdown-title-input {
  border: 0;
  border-bottom: 1px solid rgba(126, 210, 235, 0.28);
  background: rgba(14, 14, 14, 0.28);
  color: #e5e2e1;
  font-family: "Geist Mono", monospace;
  font-size: clamp(2.5rem, 4vw, 4.25rem);
  font-weight: 600;
  line-height: 1;
  padding: 1rem 1.25rem;
  text-align: center;
}

.countdown-title-input:focus {
  border-color: rgba(126, 210, 235, 0.72);
  box-shadow: inset 0 -1px 0 rgba(126, 210, 235, 0.42);
  outline: none;
}

.countdown-obs-title {
  margin: 0;
  color: #e5e2e1;
  font-family: "Geist Mono", monospace;
  font-size: clamp(2.5rem, 4vw, 4.5rem);
  font-weight: 600;
  line-height: 1;
  text-align: center;
}
</style>
