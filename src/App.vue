<!-- App.vue -->

<script setup lang="ts">
import { useTimerStore } from "./stores/timer";
import {
  onMounted,
  onUnmounted,
  watch,
  ref,
  nextTick,
  computed,
} from "vue";
import { storeToRefs } from "pinia";
import TimerDisplay from "./components/TimerDisplay.vue";
import GameSelector from "./components/GameSelector.vue";
import ControlPanel from "./components/ControlPanel.vue";
import type { Ref } from "vue";

interface GameBackgroundMeta {
  image: string;
  overlay: string;
}

type Theme = "light" | "dark";

const isClient = typeof window !== "undefined";

const timerStore = useTimerStore();
const { gameTitle, gameTitleColor, settings, isObsMode } =
  storeToRefs(timerStore);

const isEditingTitle = ref(false);
const titleInput: Ref<HTMLInputElement | null> = ref(null);
const isFocusMode = ref(false);

const showChrome = computed(() => !isFocusMode.value && !isObsMode.value);

const gameBackground = computed<GameBackgroundMeta | null>(() => {
  const gameId = timerStore.activeGame?.id?.toLowerCase() ?? "";
  if (gameId.includes("bf6") || gameId.includes("battlefield")) {
    return {
      image:
        "url(https://www.dexerto.com/cdn-image/wp-content/uploads/2025/07/31/How-to-play-Battlefield-6-Open-Beta.jpg?width=1200&quality=100&format=auto)",
      overlay: "bg-slate-950/55",
    };
  }
  if (gameId.includes("tarkov") || gameId.includes("0.16.8.0")) {
    return {
      image: "url(/Hardcore%20Wipe.webp)",
      overlay: "bg-slate-950/60",
    };
  }
  if (gameId.includes("arc") || gameId.includes("raiders")) {
    return {
      image: "url(/arc.webp)",
      overlay: "bg-slate-950/45",
    };
  }
  return null;
});

const hasGameBackground = computed(
  () => Boolean(gameBackground.value && settings.value.enableGameBackground)
);

const activeGameSummary = computed(() =>
  timerStore.activeGame?.type === "utility"
    ? "Utility timer active"
    : "Upcoming launch countdown"
);

const updateBmcVisibility = () => {
  if (!isClient) return;
  const button = document.getElementById("bmc-wbtn");
  if (button) {
    button.style.display = showChrome.value ? "flex" : "none";
  }
};

const syncExternalWidgets = () => {
  if (!isClient) return;
  const widget = document.querySelector(
    ".bmc-widget-container"
  ) as HTMLElement | null;
  if (widget) widget.style.display = showChrome.value ? "block" : "none";
};

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
};

const exitFocusMode = () => {
  isFocusMode.value = false;
};

let checkInterval: number | null = null;
let cleanupTimeout: number | null = null;
let bmcBootstrapped = false;

const bootstrapBmcButton = () => {
  if (!isClient || bmcBootstrapped) {
    updateBmcVisibility();
    syncExternalWidgets();
    return;
  }

  bmcBootstrapped = true;

  const script = document.createElement("script");
  script.src = "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js";
  script.dataset.name = "bmc-button";
  script.dataset.slug = "wilsman";
  script.dataset.font = "Inter";
  script.dataset.color = "#FFDD00";
  script.dataset.emoji = "☕";
  script.dataset.fontColor = "#000000";
  script.dataset.boxShadow = "0px 1px 3px rgba(0, 0, 0, 0.1)";
  script.async = true;
  document.head.appendChild(script);

  const hideBmcButton = () => {
    const button = document.getElementById("bmc-wbtn");
    if (!button) return;
    button.style.position = "fixed";
    button.style.bottom = "24px";
    button.style.right = "24px";
    button.style.zIndex = "1000";
    updateBmcVisibility();
  };

  hideBmcButton();
  checkInterval = window.setInterval(() => {
    const button = document.getElementById("bmc-wbtn");
    if (button) {
      hideBmcButton();
      if (checkInterval !== null) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
    }
  }, 120);

  cleanupTimeout = window.setTimeout(() => {
    if (checkInterval !== null) {
      clearInterval(checkInterval);
      checkInterval = null;
    }
  }, 5000);
};

onMounted(() => {
  if (!isClient) return;
  timerStore.handleUrlParams();
  bootstrapBmcButton();
});

onUnmounted(() => {
  if (checkInterval !== null) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
  if (cleanupTimeout !== null) {
    clearTimeout(cleanupTimeout);
    cleanupTimeout = null;
  }
});

watch(
  () => timerStore.settings.theme as Theme,
  (theme) => {
    if (!isClient) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  },
  { immediate: true }
);

watch(
  () => showChrome.value,
  () => {
    updateBmcVisibility();
    syncExternalWidgets();
  },
  { immediate: true }
);
</script>

<template>
  <div
    class="background-mesh relative min-h-screen overflow-hidden"
    :class="{ 'with-game-background': hasGameBackground }"
  >
    <div
      v-if="gameBackground && settings.enableGameBackground"
      class="pointer-events-none absolute inset-0 -z-10"
    >
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
        :style="{ backgroundImage: gameBackground.image }"
      ></div>
      <div :class="['absolute inset-0', gameBackground.overlay]"></div>
    </div>

    <main class="relative z-0 flex min-h-screen flex-col">
      <div
        class="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-16 pt-12 sm:px-8 lg:px-12"
      >
        <header v-if="showChrome" class="mb-10 flex flex-col gap-6">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="status-pill">
              <span
                class="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px] shadow-emerald-400/70"
              ></span>
              <span>Live</span>
            </div>
            <div class="flex items-center gap-3">
              <ControlPanel />
              <button type="button" class="btn-muted" @click="toggleFocusMode">
                Focus Mode
              </button>
            </div>
          </div>

          <div class="glass-panel px-4 py-5 sm:px-6">
            <div
              class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="flex flex-col gap-2">
                <span
                  class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500"
                >
                  Countdown
                </span>
                <p class="text-base text-slate-300">
                  {{ activeGameSummary }}
                </p>
              </div>
              <GameSelector />
            </div>
          </div>
        </header>

        <section class="flex flex-1 flex-col">
          <div
            class="glass-panel relative flex flex-col items-center gap-8 px-5 py-10 sm:px-10"
            :class="{ 'obs-frame': isObsMode }"
          >
            <div
              class="absolute inset-x-0 top-0 h-1 rounded-full bg-gradient-to-r from-sky-500/60 via-purple-500/50 to-emerald-400/60"
            ></div>

            <div class="flex flex-col items-center gap-2 text-center">
              <p
                class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500"
              >
                Active Event
              </p>
              <button
                v-if="!isEditingTitle"
                type="button"
                class="group flex items-center gap-3 rounded-2xl border border-transparent bg-slate-900/40 px-6 py-4 text-4xl font-black text-slate-100 transition duration-200 ease-out hover:border-sky-500/60 hover:bg-slate-900/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500/60 sm:text-5xl"
                :style="{ color: gameTitleColor || undefined }"
                title="Click to rename the event"
                @click="handleEditTitle"
              >
                <svg
                  aria-hidden="true"
                  class="h-6 w-6 text-slate-400 transition-colors duration-200 group-hover:text-sky-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M16.862 4.487a2.1 2.1 0 0 1 2.967 2.967l-9.49 9.49-3.955.988.988-3.955 9.49-9.49Z" />
                  <path d="m15 6 3 3" />
                </svg>
                {{ gameTitle }}
              </button>
              <input
                v-else
                ref="titleInput"
                v-model="gameTitle"
                type="text"
                class="w-full max-w-3xl rounded-2xl border border-slate-800/70 bg-slate-900/70 px-5 py-3 text-center text-4xl font-bold text-slate-50 shadow-inner focus:border-sky-500/60 focus:outline-none focus:ring-2 focus:ring-sky-500/40 sm:text-5xl"
                :style="{ color: gameTitleColor || undefined }"
                @blur="handleStopEditTitle"
                @keyup.enter="handleStopEditTitle"
              />
              <p
                v-if="!isEditingTitle"
                class="text-sm font-medium text-slate-500"
              >
                Click the event name to edit it
              </p>
            </div>

            <TimerDisplay :is-focus-mode="isFocusMode" />
          </div>
        </section>

        <footer v-if="showChrome" class="mt-12">
          <div
            class="glass-panel flex flex-col gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between"
          >
            <div class="flex items-center gap-3 text-sm text-slate-400">
              <span
                class="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_14px] shadow-sky-400/70"
              ></span>
              <span>Game Countdown Timer</span>
              <span class="text-slate-600">•</span>
              <span>v1</span>
            </div>

            <div class="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <a
                class="btn-ghost"
                href="https://github.com/wilsman"
                target="_blank"
                rel="noopener noreferrer"
              >
                Built by Wilsman77
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>

    <div
      v-if="isFocusMode && !isObsMode"
      class="fixed inset-x-0 bottom-0 z-30 flex justify-center pb-8"
    >
      <button type="button" class="btn-muted" @click="exitFocusMode">
        Exit Focus Mode
      </button>
    </div>
  </div>
</template>

<style scoped>
.background-mesh {
  position: relative;
  background:
    radial-gradient(125% 125% at 50% 15%, rgba(8, 145, 178, 0.32), transparent 75%),
    radial-gradient(150% 150% at 55% 85%, rgba(12, 74, 110, 0.18), transparent 80%),
    linear-gradient(180deg, rgba(1, 6, 18, 0.8) 0%, rgba(1, 3, 10, 0.92) 38%, rgba(0, 2, 6, 1) 100%),
    #01030f;
  overflow: hidden;
}

.background-mesh.with-game-background {
  background: linear-gradient(
      180deg,
      rgba(2, 6, 20, 0.92) 0%,
      rgba(1, 3, 10, 0.96) 38%,
      #00030a 100%
    )
    #00030a;
}

.background-mesh.with-game-background::before {
  opacity: 0.3;
  filter: blur(90px);
}

.background-mesh.with-game-background::after {
  opacity: 0.28;
  filter: blur(22px) saturate(140%);
}

.background-mesh::before,
.background-mesh::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -20;
  pointer-events: none;
}

.background-mesh::before {
  background:
    radial-gradient(38% 42% at 18% 20%, rgba(56, 189, 248, 0.32), transparent 72%),
    radial-gradient(40% 46% at 78% 22%, rgba(125, 211, 252, 0.24), transparent 75%),
    radial-gradient(48% 54% at 52% 72%, rgba(14, 165, 233, 0.2), transparent 82%),
    radial-gradient(2px 2px at 22% 18%, rgba(148, 233, 255, 0.9), transparent 55%),
    radial-gradient(2px 2px at 64% 36%, rgba(168, 239, 255, 0.75), transparent 55%),
    radial-gradient(2px 2px at 84% 70%, rgba(148, 233, 255, 0.8), transparent 55%),
    radial-gradient(2px 2px at 38% 78%, rgba(125, 211, 252, 0.78), transparent 55%);
  background-size:
    100% 100%,
    100% 100%,
    100% 100%,
    260px 260px,
    320px 320px,
    380px 380px,
    340px 340px;
  filter: blur(80px);
  animation: starDrift 90s ease-in-out infinite;
  mix-blend-mode: screen;
  opacity: 0.6;
}

.background-mesh::after {
  background:
    radial-gradient(circle at 50% 50%, rgba(148, 233, 255, 0.55) 1px, transparent 1.4px),
    radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.45) 1px, transparent 1.6px),
    repeating-linear-gradient(120deg, transparent 0 120px, rgba(14, 165, 233, 0.08) 120px 122px, rgba(14, 165, 233, 0.65) 122px 128px, rgba(14, 165, 233, 0.08) 128px 140px),
    repeating-linear-gradient(60deg, transparent 0 160px, rgba(56, 189, 248, 0.08) 160px 162px, rgba(56, 189, 248, 0.55) 162px 170px, rgba(56, 189, 248, 0.08) 170px 190px),
    repeating-linear-gradient(0deg, transparent 0 260px, rgba(37, 99, 235, 0.12) 260px 262px, rgba(56, 189, 248, 0.45) 262px 268px, rgba(37, 99, 235, 0.12) 268px 280px);
  background-size:
    160px 160px,
    240px 240px,
    320px 320px,
    360px 360px,
    100% 360px;
  mix-blend-mode: screen;
  filter: blur(18px) saturate(160%);
  animation: gridFlow 28s linear infinite;
  opacity: 0.55;
}

@keyframes starDrift {
  0% {
    transform: translate3d(-2%, -2%, 0) scale(1.02);
  }
  50% {
    transform: translate3d(4%, 3%, 0) scale(1.05);
  }
  100% {
    transform: translate3d(-2%, -2%, 0) scale(1.02);
  }
}

@keyframes gridFlow {
  0% {
    background-position:
      0 0,
      0 0,
      0 0,
      0 0,
      0 0;
  }
  100% {
    background-position:
      -80px 80px,
      120px -120px,
      -320px 300px,
      320px 360px,
      0 -360px;
  }
}
</style>
