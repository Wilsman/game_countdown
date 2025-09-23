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
      overlay: "bg-slate-950/80",
    };
  }
  if (gameId.includes("tarkov") || gameId.includes("0.16.8.0")) {
    return {
      image: "url(/Hardcore%20Wipe.webp)",
      overlay: "bg-slate-950/80",
    };
  }
  if (gameId.includes("arc") || gameId.includes("raiders")) {
    return {
      image: "url(/arc.webp)",
      overlay: "bg-slate-950/75",
    };
  }
  return null;
});

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
  <div class="background-mesh relative min-h-screen overflow-hidden">
    <div
      v-if="gameBackground && settings.enableGameBackground"
      class="pointer-events-none absolute inset-0 -z-10"
    >
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
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

            <div class="flex flex-col items-center gap-3 text-center">
              <p
                class="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500"
              >
                Active Event
              </p>
              <button
                v-if="!isEditingTitle"
                type="button"
                class="heading-display transition-colors hover:text-sky-200"
                :style="{ color: gameTitleColor || undefined }"
                @click="handleEditTitle"
              >
                {{ gameTitle }}
              </button>
              <input
                v-else
                ref="titleInput"
                v-model="gameTitle"
                type="text"
                class="w-full max-w-3xl rounded-2xl border border-slate-800/70 bg-slate-900/70 px-5 py-3 text-center text-3xl font-bold text-slate-50 shadow-inner focus:border-sky-500/60 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                :style="{ color: gameTitleColor || undefined }"
                @blur="handleStopEditTitle"
                @keyup.enter="handleStopEditTitle"
              />
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
              <span class="hidden sm:inline"
                >Tip: Click the title to rename or the timer to edit the
                date.</span
              >
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
.background-mesh::before,
.background-mesh::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -20;
}

.background-mesh::before {
  background: radial-gradient(
      600px 480px at 15% 10%,
      rgba(56, 189, 248, 0.18),
      transparent 70%
    ),
    radial-gradient(
      720px 520px at 90% 0%,
      rgba(14, 165, 233, 0.12),
      transparent 80%
    );
  filter: blur(60px);
}

.background-mesh::after {
  background: radial-gradient(
      520px 420px at 80% 85%,
      rgba(139, 92, 246, 0.16),
      transparent 75%
    ),
    radial-gradient(
      440px 360px at 10% 85%,
      rgba(34, 197, 94, 0.12),
      transparent 80%
    );
  filter: blur(80px);
}
</style>
