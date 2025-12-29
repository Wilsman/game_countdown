<!-- App.vue -->

<script setup lang="ts">
import { useTimerStore } from "./stores/timer";
import { onMounted, watch, ref, nextTick, computed } from "vue";
import { storeToRefs } from "pinia";
import { Toaster, toast } from "vue-sonner";
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
      overlay: "bg-slate-950/40",
    };
  }
  if (gameId.includes("tarkov") || gameId.includes("0.16.8.0")) {
    return {
      image: "url(/Hardcore Wipe.webp)",
      overlay: "bg-slate-950/45",
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
    toast.info("Focus Mode Enabled", {
      description: "Press 'Exit Focus Mode' to return",
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
      'obs-mode': isObsMode,
      'overflow-hidden': !isObsMode,
    }"
  >
    <div
      v-if="gameBackground && settings.enableGameBackground"
      class="pointer-events-none absolute inset-0 -z-10"
    >
      <div
        class="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
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
              <!-- Focus Mode moved to toolbar -->
            </div>
          </div>

          <!-- Header Selector Removed -->
        </header>

        <section class="flex flex-1 flex-col">
          <div
            class="glass-panel relative flex flex-col items-center gap-8 px-5 py-10 sm:px-10"
            :class="{ 'obs-frame': isObsMode }"
          >
            <div
              class="absolute inset-x-0 top-0 h-1 rounded-full bg-gradient-to-r from-sky-500/60 via-purple-500/50 to-emerald-400/60"
            ></div>

            <GameSelector
              v-if="!isObsMode && !isEditingTitle"
              variant="hero"
              @edit="handleEditTitle"
            />

            <input
              v-else-if="!isObsMode && isEditingTitle"
              ref="titleInput"
              v-model="gameTitle"
              type="text"
              class="w-full max-w-3xl rounded-2xl border border-slate-800/70 bg-slate-900/70 px-5 py-3 text-center text-4xl font-bold text-slate-50 shadow-inner focus:border-sky-500/60 focus:outline-none focus:ring-2 focus:ring-sky-500/40 sm:text-5xl"
              :style="{ color: gameTitleColor || undefined }"
              @blur="handleStopEditTitle"
              @keyup.enter="handleStopEditTitle"
            />
            <p
              v-else
              class="rounded-2xl border border-transparent px-6 py-4 text-4xl font-black text-cyan-100 sm:text-7xl drop-shadow-[0_0_20px_rgba(34,211,238,0.85)]"
              :style="{ color: gameTitleColor || undefined }"
            >
              {{ gameTitle }}
            </p>

            <TimerDisplay
              :is-focus-mode="isFocusMode"
              @toggle-focus="toggleFocusMode"
            />
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

            <div
              class="flex flex-wrap items-center gap-3 text-sm text-slate-500"
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
  <Toaster position="bottom-center" />
</template>

<style scoped>
.background-mesh {
  position: relative;
  background: radial-gradient(
      125% 125% at 50% 15%,
      rgba(126, 139, 143, 0.32),
      transparent 75%
    ),
    radial-gradient(
      150% 150% at 55% 85%,
      rgba(12, 74, 110, 0.18),
      transparent 80%
    ),
    linear-gradient(
      180deg,
      rgba(1, 6, 18, 0.8) 0%,
      rgba(1, 3, 10, 0.92) 38%,
      rgba(0, 2, 6, 1) 100%
    ),
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
  background: radial-gradient(
      38% 42% at 18% 20%,
      rgba(56, 189, 248, 0.32),
      transparent 72%
    ),
    radial-gradient(
      40% 46% at 78% 22%,
      rgba(125, 211, 252, 0.24),
      transparent 75%
    ),
    radial-gradient(
      48% 54% at 52% 72%,
      rgba(14, 165, 233, 0.2),
      transparent 82%
    ),
    radial-gradient(
      2px 2px at 22% 18%,
      rgba(148, 233, 255, 0.9),
      transparent 55%
    ),
    radial-gradient(
      2px 2px at 64% 36%,
      rgba(168, 239, 255, 0.75),
      transparent 55%
    ),
    radial-gradient(
      2px 2px at 84% 70%,
      rgba(148, 233, 255, 0.8),
      transparent 55%
    ),
    radial-gradient(
      2px 2px at 38% 78%,
      rgba(125, 211, 252, 0.78),
      transparent 55%
    );
  background-size: 100% 100%, 100% 100%, 100% 100%, 260px 260px, 320px 320px,
    380px 380px, 340px 340px;
  filter: blur(80px);
  animation: starDrift 90s ease-in-out infinite;
  mix-blend-mode: screen;
  opacity: 0.6;
}

.background-mesh::after {
  background: radial-gradient(
      circle at 50% 50%,
      rgba(148, 233, 255, 0.55) 1px,
      transparent 1.4px
    ),
    radial-gradient(
      circle at 50% 50%,
      rgba(56, 189, 248, 0.45) 1px,
      transparent 1.6px
    ),
    repeating-linear-gradient(
      120deg,
      transparent 0 120px,
      rgba(14, 165, 233, 0.08) 120px 122px,
      rgba(14, 165, 233, 0.65) 122px 128px,
      rgba(14, 165, 233, 0.08) 128px 140px
    ),
    repeating-linear-gradient(
      60deg,
      transparent 0 160px,
      rgba(56, 189, 248, 0.08) 160px 162px,
      rgba(56, 189, 248, 0.55) 162px 170px,
      rgba(56, 189, 248, 0.08) 170px 190px
    ),
    repeating-linear-gradient(
      0deg,
      transparent 0 260px,
      rgba(37, 99, 235, 0.12) 260px 262px,
      rgba(56, 189, 248, 0.45) 262px 268px,
      rgba(37, 99, 235, 0.12) 268px 280px
    );
  background-size: 160px 160px, 240px 240px, 320px 320px, 360px 360px,
    100% 360px;
  mix-blend-mode: screen;
  filter: blur(18px) saturate(160%);
  animation: gridFlow 28s linear infinite;
  opacity: 0.55;
}

.background-mesh.obs-mode::before,
.background-mesh.obs-mode::after {
  animation: none;
  opacity: 0;
  filter: none;
}

/* OBS overlay should be transparent and clean for compositing */
.background-mesh.obs-mode {
  background: transparent;
}

:deep(.obs-mode .glass-panel),
:deep(.obs-mode .glass-section) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
}

:deep(.obs-mode .obs-frame::before) {
  animation: none !important;
  inset: 0 !important;
  background: linear-gradient(
    115deg,
    rgba(56, 189, 248, 0.22),
    rgba(129, 140, 248, 0.18),
    rgba(16, 185, 129, 0.16)
  ) !important;
  opacity: 0.25 !important;
  border-radius: inherit;
}

@keyframes gridFlow {
  0% {
    background-position: 0 0, 0 0, 0 0, 0 0, 0 0;
  }
  100% {
    background-position: -80px 80px, 120px -120px, -320px 300px, 320px 360px,
      0 -360px;
  }
}

/* OBS Neon Glass Frame */
.obs-frame {
  padding: 1.35rem;
  position: relative;
  border-radius: 28px;
  background: radial-gradient(
      900px 520px at 50% 55%,
      rgba(0, 0, 0, 0.35),
      transparent 60%
    ),
    radial-gradient(
      600px 380px at 20% 10%,
      rgba(6, 182, 212, 0.18),
      transparent 60%
    ),
    radial-gradient(
      520px 320px at 82% 86%,
      rgba(124, 58, 237, 0.16),
      transparent 60%
    ),
    linear-gradient(180deg, rgba(2, 6, 23, 0.65), rgba(2, 6, 23, 0.4));
  backdrop-filter: blur(12px) saturate(160%);
  -webkit-backdrop-filter: blur(12px) saturate(160%);
  box-shadow: inset 0 0 0 1px rgba(34, 211, 238, 0.32),
    inset 0 0 120px rgba(6, 182, 212, 0.18),
    inset 0 0 180px rgba(124, 58, 237, 0.12), 0 10px 28px rgba(0, 0, 0, 0.65),
    0 0 48px rgba(34, 211, 238, 0.28);
}

/* Animated gradient border using conic-gradient mask */
@property --angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: false;
}

@keyframes spin-angle {
  to {
    --angle: 360deg;
  }
}

.obs-frame::before {
  content: "";
  position: absolute;
  inset: -3px;
  border-radius: inherit;
  background: conic-gradient(
    from var(--angle),
    #06b6d4,
    #7c3aed,
    #22c55e,
    #06b6d4
  );
  padding: 3px;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite: exclude;
  animation: spin-angle 5s linear infinite;
  opacity: 0.98;
  pointer-events: none;
}

@keyframes obs-sweep {
  0% {
    background-position: -220% 0, 220% 0, 0 0, 0 0;
  }
  100% {
    background-position: 220% 0, -220% 0, 0 0, 0 0;
  }
}

/* Strong inner glow + dual moving sweeps, specular highlight, and scanlines */
.obs-frame::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    /* Sweep A */ linear-gradient(
      110deg,
      rgba(34, 211, 238, 0.06) 0%,
      rgba(34, 211, 238, 0.22) 12%,
      rgba(124, 58, 237, 0.18) 50%,
      rgba(34, 211, 238, 0.06) 88%,
      transparent 100%
    ),
    /* Sweep B (counter) */
      linear-gradient(
        -70deg,
        transparent 0%,
        rgba(255, 255, 255, 0.1) 12%,
        rgba(34, 211, 238, 0.18) 18%,
        transparent 28%
      ),
    /* Base inner glow */
      radial-gradient(
        900px 420px at 50% 120%,
        rgba(34, 211, 238, 0.14),
        transparent 65%
      ),
    /* Scanlines */
      repeating-linear-gradient(
        to bottom,
        rgba(14, 165, 233, 0.08),
        rgba(14, 165, 233, 0.08) 1px,
        transparent 1px,
        transparent 3px
      );
  background-size: 320% 100%, 280% 100%, 100% 100%, 100% 100%;
  animation: obs-sweep 7s ease-in-out infinite alternate;
  mix-blend-mode: screen;
  box-shadow: inset 0 0 90px rgba(34, 211, 238, 0.2),
    inset 0 0 180px rgba(124, 58, 237, 0.16);
  pointer-events: none;
}

/* Slightly increase spacing for OBS overlay */
:deep(.obs-mode .obs-frame .text-4xl) {
  letter-spacing: 0.02em;
}
:deep(.obs-mode .obs-frame .text-6xl) {
  letter-spacing: 0.015em;
}
</style>
