<!-- App.vue -->

<script setup lang="ts">
import { useTimerStore } from "./stores/timer";
import { onMounted, watch, ref, nextTick, computed } from "vue";
import { storeToRefs } from "pinia";
import TimerDisplay from "./components/TimerDisplay.vue";
import GameSelector from "./components/GameSelector.vue";
import ControlPanel from "./components/ControlPanel.vue";
import type { Ref } from "vue";

declare global {
  interface Window {
    location: Location;
  }
}

const isClient = typeof window !== "undefined";
type Theme = "light" | "dark";

const timerStore = useTimerStore();
const { gameTitle, gameTitleColor, settings, isObsMode } = storeToRefs(timerStore);

const isEditingTitle = ref<boolean>(false);
const titleInput: Ref<HTMLInputElement | null> = ref(null);
const isFocusMode = ref<boolean>(false);

watch(isFocusMode, (isFocused) => {
  const bmcButton = document.getElementById("bmc-wbtn");
  if (bmcButton) {
    bmcButton.style.display = (isFocused || isObsMode.value) ? "none" : "flex";
  }
});

watch(isObsMode, (isObs) => {
  const bmcButton = document.getElementById("bmc-wbtn");
  if (bmcButton) {
    bmcButton.style.display = (isObs || isFocusMode.value) ? "none" : "flex";
  }
});

const gameBackground = computed(() => {
  const gameId = timerStore.activeGame?.id?.toLowerCase() || "";
  if (gameId.includes("bf6") || gameId.includes("battlefield")) {
    return {
      image:
        "url(https://www.dexerto.com/cdn-image/wp-content/uploads/2025/07/31/How-to-play-Battlefield-6-Open-Beta.jpg?width=1200&quality=100&format=auto)",
      overlay: "bg-black/50",
      blur: "backdrop-blur-sm",
    };
  } else if (gameId.includes("tarkov") || gameId.includes("0.16.8.0")) {
    return {
      image: "url(/Hardcore%20Wipe.webp)",
      overlay: "bg-black/50",
      blur: "backdrop-blur-sm",
    };
  } else if (gameId.includes("arc") || gameId.includes("raiders")) {
    return {
      image: "url(/arc.webp)",
      overlay: "bg-black/40",
      blur: "backdrop-blur-sm",
    };
  }
  return null;
});

const handleEditTitle = (): void => {
  isEditingTitle.value = true;
  nextTick(() => {
    titleInput.value?.focus();
    titleInput.value?.select();
  });
};
const handleStopEditTitle = (): void => {
  isEditingTitle.value = false;
};

onMounted(() => {
  if (!isClient) return;
  timerStore.handleUrlParams();

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

  const bmcButton = document.getElementById("bmc-wbtn");
  if (bmcButton) {
    bmcButton.style.position = "fixed";
    bmcButton.style.bottom = "20px";
    bmcButton.style.right = "20px";
    bmcButton.style.zIndex = "1000";
  }
  if (isFocusMode.value || isObsMode.value) {
    const btn = document.getElementById("bmc-wbtn");
    if (btn) btn.style.display = "none";
  }
});

watch(
  () => timerStore.settings.theme as Theme,
  (theme) => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  },
  { immediate: true }
);

watch(isFocusMode, (isFocus) => {
  const widget = document.querySelector(
    ".bmc-widget-container"
  ) as HTMLElement | null;
  if (widget) {
    widget.style.display = isFocus ? "none" : "block";
  }
});
</script>

<template>
  <div class="relative min-h-screen w-full modern-bg">
    <!-- Game Background -->
    <div
      v-if="gameBackground && settings.enableGameBackground"
      class="fixed inset-0 -z-10 w-screen h-screen transition-all duration-500"
      :style="{
        backgroundImage: gameBackground.image,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#0C0C0C',
      }"
    >
      <div
        class="absolute inset-0 transition-all duration-500"
        :class="[gameBackground.overlay, gameBackground.blur]"
      ></div>
    </div>

    <!-- Content -->
    <div class="min-h-screen w-full transition-all duration-500">
      <main class="relative z-10 min-h-screen w-full">
        <div
          class="flex flex-col items-center justify-center p-6 sm:p-8 min-h-screen w-full"
        >
          <div class="w-full max-w-6xl mx-auto card-glass">
            <!-- Header bar -->
            <div
              v-if="!isFocusMode && !isObsMode"
              class="flex items-center justify-center header-bar"
            >
              <GameSelector />
            </div>

            <!-- Editable Title -->
            <div class="flex justify-center mb-4 sm:mb-6">
              <template v-if="!isEditingTitle">
                <h1
                  @click="handleEditTitle"
                  class="title-display"
                  :style="{ color: gameTitleColor || 'var(--accent-300)' }"
                  :class="{ 'mx-auto': gameTitle.length < 20 }"
                >
                  {{ gameTitle }}
                </h1>
              </template>
              <input
                v-else
                type="text"
                v-model="gameTitle"
                @blur="handleStopEditTitle"
                @keyup.enter="handleStopEditTitle"
                class="title-input"
                :style="{ color: gameTitleColor || 'var(--accent-200)' }"
                ref="titleInput"
              />
            </div>

            <TimerDisplay :is-focus-mode="isFocusMode" />
          </div>
        </div>

        <!-- Footer (reimagined, #0C0C0C-based) -->
        <div v-if="!isFocusMode && !isObsMode" class="footer-shell">
          <div class="footer glass">
            <div class="footer-left">
              <span class="brand-dot"></span>
              <span class="footer-title">Game Countdown Timer</span>
              <span class="footer-pill">v1</span>
            </div>

            <div class="footer-center">
              <div class="status-dot live"></div>
              <span class="status-text">Live</span>
              <span class="sep">•</span>
              <span class="hint">Tip: Click the timer to edit date</span>
            </div>

            <div class="footer-right">
              <ControlPanel />
              <button
                @click="isFocusMode = !isFocusMode"
                class="chip"
                title="Toggle focus mode"
              >
                Focus Mode
              </button>
              <a
                href="https://github.com/wilsman"
                target="_blank"
                rel="noopener noreferrer"
                class="link"
                aria-label="Creator profile"
              >
                Built by Wilsman77
              </a>
            </div>
          </div>
        </div>

        <div v-else-if="isFocusMode && !isObsMode" class="footer-shell">
          <div class="footer glass compact">
            <button
              @click="isFocusMode = !isFocusMode"
              class="chip"
              title="Exit focus mode"
            >
              Exit Focus Mode
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style>
:root {
  --base-900: #0c0c0c;
  --base-800: #121212;
  --base-700: #171717;
  --base-600: #1f1f1f;
  --base-500: #2a2a2a;

  --text-100: rgba(255, 255, 255, 0.92);
  --text-200: rgba(255, 255, 255, 0.72);
  --text-300: rgba(255, 255, 255, 0.56);

  --border: rgba(255, 255, 255, 0.08);

  --accent-100: #6ee7f9;
  --accent-200: #22d3ee;
  --accent-300: #06b6d4;
  --accent-400: #0891b2;

  --primary-color: var(--accent-300);
  --primary-color-hover: var(--accent-200);

  --bg-primary: var(--base-900);
  --bg-secondary: var(--base-700);
  --bg-input: var(--base-800);
  --text-primary: var(--text-100);
  --text-secondary: var(--text-300);
  --border-color: var(--border);
}

.dark {
  --bg-primary: var(--base-900);
  --bg-secondary: var(--base-700);
  --bg-input: var(--base-800);
  --text-primary: var(--text-100);
  --border-color: var(--border);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: radial-gradient(
      1200px 600px at 20% -10%,
      rgba(8, 145, 178, 0.08),
      transparent 90%
    ),
    radial-gradient(
      1000px 520px at 110% 10%,
      rgba(34, 211, 238, 0.06),
      transparent 90%
    ),
    linear-gradient(180deg, #0c0c0c, #0b0b0b 40%, #0c0c0c);
  color: var(--text-primary);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
    Oxygen, Ubuntu, Cantarell, Open Sans, Helvetica Neue, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background 0.5s ease, color 0.5s ease;
}

.modern-bg::before {
  content: "";
  position: fixed;
  inset: -20% -10% auto auto;
  width: 520px;
  height: 520px;
  background: radial-gradient(
    50% 50% at 50% 50%,
    rgba(6, 182, 212, 0.08) 0%,
    rgba(6, 182, 212, 0) 90%
  );
  filter: blur(10px);
  z-index: -1;
  pointer-events: none;
}

.header-bar {
  background: rgba(12, 12, 12, 0.6);
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 10px 12px;
  margin: 8px 0 18px;
}

.brand-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: conic-gradient(
    from 0deg at 50% 50%,
    var(--accent-200),
    var(--accent-300),
    var(--accent-400),
    var(--accent-200)
  );
  box-shadow: 0 0 16px rgba(34, 211, 238, 0.6), 0 0 6px rgba(6, 182, 212, 0.6);
}

.brand {
  color: var(--text-200);
  font-weight: 600;
  letter-spacing: 0.2px;
}

.card-glass {
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.4),
    rgba(0, 0, 0, 0.6)
  );
  border: 1px solid var(--border-color);
  border-radius: 24px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  padding: 20px 16px 28px;
}

.title-display {
  font-size: clamp(1.75rem, 4vw, 3.25rem);
  font-weight: 800;
  text-align: center;
  line-height: 1.12;
  letter-spacing: -0.02em;
  margin: 0;
  padding: 0.35rem 0.75rem;
  border-radius: 14px;
  cursor: text;
  background: radial-gradient(
      1000px 200px at 50% 0%,
      rgba(34, 211, 238, 0.06),
      rgba(0, 0, 0, 0) 90%
    ),
    transparent;
  text-shadow: 0 0 22px rgba(34, 211, 238, 0.15);
}

.title-input {
  font-size: clamp(1.75rem, 4vw, 3.25rem);
  font-weight: 800;
  text-align: center;
  line-height: 1.12;
  letter-spacing: -0.02em;
  width: 100%;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-color);
  outline: none;
  padding: 0.5rem 0.75rem;
  border-radius: 14px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}

.text-muted {
  color: var(--text-300);
}

.chip {
  appearance: none;
  background: linear-gradient(
    180deg,
    rgba(34, 211, 238, 0.16),
    rgba(6, 182, 212, 0.12)
  );
  color: var(--text-primary);
  border: 1px solid rgba(34, 211, 238, 0.28);
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.25px;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.3s ease, border-color 0.3s ease,
    box-shadow 0.3s ease;
  box-shadow: 0 6px 18px rgba(6, 182, 212, 0.16);
}
.chip:hover {
  transform: translateY(-1px);
  background: linear-gradient(
    180deg,
    rgba(34, 211, 238, 0.22),
    rgba(6, 182, 212, 0.16)
  );
  border-color: rgba(34, 211, 238, 0.45);
  box-shadow: 0 10px 26px rgba(6, 182, 212, 0.22);
}
.chip:active {
  transform: translateY(0);
}

/* New Footer styles */
.footer-shell {
  position: fixed;
  inset: auto 0 16px 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
  z-index: 60;
}

.footer {
  --footer-w: min(100% - 24px, 980px);
  width: var(--footer-w);
  min-height: 56px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  border-radius: 16px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.015)
  );
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
  padding: 10px 12px;
  pointer-events: all;
}

.footer.compact {
  grid-template-columns: 1fr;
  justify-items: center;
  min-height: 48px;
}

.footer-left,
.footer-right {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.footer-left {
  justify-self: start;
}
.footer-right {
  justify-self: end;
}

.footer-center {
  justify-self: center;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-300, rgba(255, 255, 255, 0.56));
  font-size: 12px;
  font-weight: 600;
}

.footer-title {
  color: var(--text-primary, rgba(255, 255, 255, 0.92));
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.footer-pill {
  font-size: 11px;
  font-weight: 800;
  color: #93c5fd;
  border: 1px solid rgba(147, 197, 253, 0.25);
  border-radius: 999px;
  padding: 3px 8px;
  background: linear-gradient(
    180deg,
    rgba(147, 197, 253, 0.15),
    rgba(147, 197, 253, 0.08)
  );
}

.brand-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: conic-gradient(
    from 0deg at 50% 50%,
    var(--accent-200),
    var(--accent-300),
    var(--accent-400),
    var(--accent-200)
  );
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.5), 0 0 4px rgba(6, 182, 212, 0.45);
  flex: 0 0 auto;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #10b981;
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
  animation: ping 1.6s infinite;
}
.status-dot.live {
  background: #22c55e;
}
@keyframes ping {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.status-text {
  color: var(--text-primary, rgba(255, 255, 255, 0.92));
  font-weight: 800;
  font-size: 12px;
}
.sep {
  opacity: 0.45;
}
.hint {
  opacity: 0.7;
}

.link {
  color: var(--text-300, rgba(255, 255, 255, 0.56));
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.16);
  padding-bottom: 1px;
  transition: color 0.2s ease, border-color 0.2s ease;
}
.link:hover {
  color: var(--text-primary, rgba(255, 255, 255, 0.92));
  border-color: rgba(255, 255, 255, 0.28);
}

/* Keep using your .chip styles (already in App.vue) */

/* Glass utility (matches rest of app) */
.glass {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.015)
  );
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  backdrop-filter: blur(10px);
}

/* Responsive */
@media (max-width: 820px) {
  .footer {
    grid-template-columns: 1fr 1fr;
  }
  .footer-center {
    display: none;
  }
}

@media (max-width: 520px) {
  .footer {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 8px 10px;
  }
  .footer-left {
    justify-self: center;
  }
  .footer-right {
    justify-self: center;
  }
}

html {
  scroll-behavior: smooth;
}

/* Custom scrollbar styles */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-track {
  background: #0e0e0e;
}
::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #1e1e1e, #2a2a2a);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}
::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #2a2a2a, #333);
}
</style>
