<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { toast } from "vue-sonner";

import TimeZonePreview from "./TimeZonePreview.vue";
import { useTimerStore } from "../stores/timer";
import { getTimezoneName } from "../lib/timezones";

const props = withDefaults(
  defineProps<{
    isFocusMode: boolean;
    isObsOverride?: boolean;
    // One slim row of controls instead of the button panel. The date line
    // moves into the title above, so it is hidden here.
    toolbar?: boolean;
  }>(),
  {
    isObsOverride: undefined,
    toolbar: false,
  },
);

const emit = defineEmits<{
  (e: "toggle-focus"): void;
  (e: "customize"): void;
  (e: "open-create"): void;
  (e: "open-edit"): void;
  (e: "open-loop"): void;
}>();

const store = useTimerStore();
const { isObsMode: storeObsMode } = storeToRefs(store);

const isObs = computed(() =>
  props.isObsOverride !== undefined ? props.isObsOverride : storeObsMode.value,
);
const prevValues = ref({
  days: store.timeRemaining.days,
  hours: store.timeRemaining.hours,
  minutes: store.timeRemaining.minutes,
  seconds: store.timeRemaining.seconds,
});
const animatingSegments = ref({
  days: false,
  hours: false,
  minutes: false,
  seconds: false,
});
const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const shareMenuOpen = ref(false);
const shareMenuRef = ref<HTMLElement | null>(null);
const regionalTimesOpen = ref(false);
const canRestartActiveGame = computed(() => {
  const activeGame = store.activeGame;
  return (
    activeGame.type === "utility" &&
    (/\((\d+)min\)/i.test(activeGame.title) ||
      /\((\d+)h\s*(\d+)m\)/i.test(activeGame.title))
  );
});

const formattedTime = computed(() => {
  const { days, hours, minutes, seconds } = store.timeRemaining;
  return {
    days: days.toString().padStart(2, "0"),
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
  };
});

const timeSegments = computed(() => {
  const segments = [
    {
      label: "days",
      value: formattedTime.value.days,
      rawValue: store.timeRemaining.days,
      key: "days",
    },
    {
      label: "hours",
      value: formattedTime.value.hours,
      rawValue: store.timeRemaining.hours,
      key: "hours",
    },
    {
      label: "minutes",
      value: formattedTime.value.minutes,
      rawValue: store.timeRemaining.minutes,
      key: "minutes",
    },
    {
      label: "seconds",
      value: formattedTime.value.seconds,
      rawValue: store.timeRemaining.seconds,
      key: "seconds",
    },
  ];

  const firstNonZeroIndex = segments.findIndex((segment) => segment.rawValue > 0);

  if (firstNonZeroIndex === -1) {
    return segments.slice(2);
  }

  return segments.slice(firstNonZeroIndex);
});

const launchDateLabel = computed(() => {
  const timezone = store.targetTimezone || currentTz;
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezone,
    }).format(store.targetDate);
  } catch {
    return store.targetDate.toISOString();
  }
});

const launchTimezoneLabel = computed(() => {
  const timezone = store.targetTimezone || currentTz;
  return getTimezoneName(timezone);
});

watch(
  () => store.timeRemaining,
  (newValue) => {
    if (!store.settings.enableAnimation) return;

    const keys: Array<"days" | "hours" | "minutes" | "seconds"> = [
      "days",
      "hours",
      "minutes",
      "seconds",
    ];

    keys.forEach((key) => {
      if (newValue[key] !== prevValues.value[key]) {
        animatingSegments.value[key] = true;
        prevValues.value[key] = newValue[key];

        setTimeout(() => {
          animatingSegments.value[key] = false;
        }, 400);
      }
    });
  },
  { deep: true },
);

async function copyShareableUrl() {
  try {
    await navigator.clipboard.writeText(store.getShareableUrl());
    toast.success("Link copied to clipboard");
    shareMenuOpen.value = false;
  } catch {
    toast.error("Couldn't copy the link");
  }
}

async function copyObsOverlayUrl() {
  try {
    await navigator.clipboard.writeText(store.getObsOverlayUrl());
    toast.success("OBS link copied to clipboard");
    shareMenuOpen.value = false;
  } catch {
    toast.error("Couldn't copy the OBS link");
  }
}

function toggleShareMenu() {
  shareMenuOpen.value = !shareMenuOpen.value;
}

function closeShareMenu() {
  shareMenuOpen.value = false;
}

function handleDocumentClick(event: MouseEvent) {
  if (!shareMenuOpen.value) return;

  const target = event.target;
  if (!(target instanceof Node)) return;

  if (!shareMenuRef.value?.contains(target)) {
    closeShareMenu();
  }
}

const originalTitle = document.title;

const updateDocumentTitle = () => {
  const { days, hours, minutes, seconds } = store.timeRemaining;
  let timeStr = "";
  if (days > 0) {
    timeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours > 0) {
    timeStr = `${hours}h ${minutes}m ${seconds}s`;
  } else {
    timeStr = `${minutes}m ${seconds}s`;
  }
  document.title = `${store.gameTitle} - ${timeStr}`;
};

let animationFrameId: number | null = null;

const updateTitle = () => {
  updateDocumentTitle();
  animationFrameId = requestAnimationFrame(updateTitle);
};

const obsDigitShadow = computed(() => {
  if (!isObs.value || !store.settings.glowColor) {
    return store.settings.enableChristmasTheme
      ? "0 0 20px rgba(220, 38, 38, 0.8), 0 0 40px rgba(251, 191, 36, 0.6)"
      : undefined;
  }
  const intensity = store.settings.glowIntensity || 20;
  let shadow = `0 0 ${intensity}px ${store.settings.glowColor}`;
  if (store.settings.glowSpread) {
    shadow += `, 0 0 ${store.settings.glowSpread + intensity}px ${
      store.settings.glowColor
    }`;
  }
  return shadow;
});

const obsLabelShadow = computed(() => {
  if (!isObs.value || !store.settings.glowColor) {
    return store.settings.enableChristmasTheme
      ? "0 0 15px rgba(22, 163, 74, 0.8)"
      : undefined;
  }
  const intensity = (store.settings.glowIntensity || 20) / 2;
  let shadow = `0 0 ${intensity}px ${store.settings.glowColor}`;
  if (store.settings.glowSpread) {
    shadow += `, 0 0 ${
      (store.settings.glowSpread + (store.settings.glowIntensity || 20)) / 2
    }px ${store.settings.glowColor}`;
  }
  return shadow;
});

onMounted(() => {
  store.startTimer();
  animationFrameId = requestAnimationFrame(updateTitle);
  document.addEventListener("click", handleDocumentClick);
});

onUnmounted(() => {
  store.stopTimer();
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  document.removeEventListener("click", handleDocumentClick);
  document.title = originalTitle;
});
</script>

<template>
  <div
    class="mx-auto flex w-full flex-col items-center gap-6"
    :class="{ 'max-w-4xl': !toolbar || isObs }"
  >
    <div
      class="w-full"
      :class="
        toolbar && !isObs
          ? 'px-2 py-1'
          : 'rounded-xl border border-white/8 bg-black/15 px-4 py-5 sm:px-6 sm:py-7'
      "
    >
      <div class="text-center">
        <p
          v-if="!isObs && !toolbar"
          class="font-mono text-sm uppercase tracking-[0.14em] text-cyan-200/60"
        >
          {{ launchDateLabel }} · {{ launchTimezoneLabel }}
        </p>
      </div>

      <div
        class="grid gap-x-8 gap-y-6 sm:flex sm:flex-wrap sm:items-end sm:justify-center"
        :class="[
          isObs ? 'obs-time-segments sm:gap-x-0' : 'sm:gap-x-10',
          { 'mt-4': !toolbar || isObs },
        ]"
        :style="{
          columnGap:
            isObs && store.settings.segmentGap !== null
              ? `${store.settings.segmentGap}px`
              : undefined,
        }"
      >
        <div
          v-for="segment in timeSegments"
          :key="segment.label"
          class="flex min-w-[7rem] flex-col items-center justify-end gap-1 text-center"
        >
          <span
            class="tabular-nums font-semibold leading-none tracking-[-0.06em] transition-all duration-300"
            :class="{
              'tick-animation':
                animatingSegments[segment.key as keyof typeof animatingSegments],
              'urgent-pulse':
                store.timeRemaining.days === 0 &&
                store.timeRemaining.hours === 0 &&
                store.timeRemaining.minutes === 0 &&
                store.timeRemaining.seconds <= 10 &&
                store.timeRemaining.seconds > 0 &&
                isObs,
            }"
            :style="{
              fontSize: isObs
                ? store.settings.digitSize
                  ? store.settings.digitSize + 'px'
                  : undefined
                : 'clamp(4.75rem, 10vw, 8.25rem)',
              color:
                isObs && store.settings.digitColor
                  ? store.settings.digitColor
                  : '#e5e2e1',
              fontFamily:
                isObs && store.settings.obsFontFamily
                  ? store.settings.obsFontFamily
                  : 'Geist Mono, monospace',
              textShadow: obsDigitShadow,
            }"
          >
            {{ segment.value }}
          </span>

          <span
            v-if="!isObs || store.settings.showLabels"
            class="font-mono text-sm font-medium uppercase tracking-[0.14em] text-cyan-100/45 transition-all duration-300"
            :class="isObs ? 'obs-label' : ''"
            :style="{
              fontSize:
                isObs && store.settings.labelSize
                  ? store.settings.labelSize + 'px'
                  : undefined,
              color:
                isObs && store.settings.labelColor
                  ? store.settings.labelColor
                  : undefined,
              textShadow: obsLabelShadow,
            }"
          >
            {{ segment.label }}
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="!isFocusMode && !isObs && !toolbar"
      class="regional-times-panel w-full overflow-hidden rounded-xl border border-cyan-200/10 bg-[#171717]/90"
    >
      <button
        type="button"
        class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition duration-200 hover:bg-cyan-200/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60 sm:px-5"
        :aria-expanded="regionalTimesOpen"
        aria-controls="regional-times-content"
        @click="regionalTimesOpen = !regionalTimesOpen"
      >
        <span class="flex min-w-0 items-center gap-2.5">
          <span class="regional-times-pulse h-1.5 w-1.5 rounded-full bg-cyan-200/80" aria-hidden="true"></span>
          <span class="font-mono text-xs font-medium uppercase tracking-[0.18em] text-cyan-100/65 sm:text-sm">
            Regional times
          </span>
          <span class="hidden text-[0.65rem] uppercase tracking-[0.14em] text-cyan-100/30 sm:inline">
            launch zones
          </span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 shrink-0 text-cyan-100/60 transition-transform duration-300"
          :class="{ 'rotate-180': regionalTimesOpen }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <Transition name="regional-times">
        <div
          v-show="regionalTimesOpen"
          id="regional-times-content"
          class="regional-times-content border-t border-cyan-200/10 px-4 pb-4 pt-3 sm:px-5"
        >
          <TimeZonePreview />
        </div>
      </Transition>
    </div>

    <div v-if="!isFocusMode && !isObs && toolbar" class="w-full">
      <div class="timer-toolbar">
        <div class="flex flex-wrap items-center gap-1">
          <button type="button" class="toolbar-btn" @click="emit('open-edit')">
            <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Edit
          </button>
          <button
            v-if="canRestartActiveGame"
            type="button"
            class="toolbar-btn"
            @click="store.restartCountdown(store.activeGame.id)"
          >
            <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-3.2-6.9" />
              <path d="M21 3v6h-6" />
            </svg>
            Restart
          </button>
          <button
            type="button"
            class="toolbar-btn"
            :class="{ 'is-open': regionalTimesOpen }"
            :aria-expanded="regionalTimesOpen"
            aria-controls="toolbar-time-zones"
            @click="regionalTimesOpen = !regionalTimesOpen"
          >
            <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18" />
              <path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18" />
            </svg>
            Time zones
          </button>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            class="toolbar-btn is-outline"
            @click="emit('open-create')"
          >
            <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
            New countdown
          </button>
          <button
            type="button"
            class="toolbar-btn is-outline"
            @click="emit('open-loop')"
          >
            <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            Loop timer
          </button>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-1">
          <button type="button" class="toolbar-btn" @click="emit('customize')">
            <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M3 5h18" />
              <path d="M3 12h18" />
              <path d="M3 19h18" />
              <path d="M7 3v4" />
              <path d="M17 10v4" />
              <path d="M11 17v4" />
            </svg>
            OBS setup
          </button>
          <button type="button" class="toolbar-btn" @click="emit('toggle-focus')">
            <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 3H5a2 2 0 0 0-2 2v4" />
              <path d="M15 3h4a2 2 0 0 1 2 2v4" />
              <path d="M21 15v4a2 2 0 0 1-2 2h-4" />
              <path d="M3 15v4a2 2 0 0 0 2 2h4" />
            </svg>
            Focus
          </button>
          <div ref="shareMenuRef" class="relative">
            <button
              type="button"
              class="toolbar-btn is-primary"
              :class="{ 'is-open': shareMenuOpen }"
              :aria-expanded="shareMenuOpen"
              @click="toggleShareMenu"
            >
              <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Links
              <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div
              v-if="shareMenuOpen"
              class="absolute right-0 top-full z-20 mt-1 flex min-w-44 flex-col border border-cyan-200/12 bg-[#181717] shadow-[0_14px_32px_rgba(0,0,0,0.38)]"
            >
              <button
                type="button"
                class="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.12em] text-cyan-50 transition duration-150 hover:bg-cyan-200/[0.06]"
                @click="copyShareableUrl"
              >
                Copy timer link
              </button>
              <button
                type="button"
                class="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.12em] text-cyan-50 transition duration-150 hover:bg-cyan-200/[0.06]"
                @click="copyObsOverlayUrl"
              >
                Copy OBS link
              </button>
            </div>
          </div>
        </div>
      </div>

      <Transition name="regional-times">
        <div
          v-show="regionalTimesOpen"
          id="toolbar-time-zones"
          class="bg-[#141414] px-4 pb-4 pt-3 sm:px-5"
        >
          <TimeZonePreview />
        </div>
      </Transition>
    </div>

    <div
      v-if="!isFocusMode && !isObs && !toolbar"
      class="flex w-full flex-col gap-6 border border-cyan-200/10 bg-[#1c1b1b] px-4 py-5 sm:px-6"
    >
      <div class="grid w-full gap-3">
        <button
          type="button"
          class="btn-feature min-w-0"
          @click="emit('open-create')"
        >
          <span class="inline-flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
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
            Add Countdown
          </span>
          <span class="btn-feature-subtitle">
            Create and save a custom countdown that stays easy to find.
          </span>
        </button>

        <button
          type="button"
          class="btn-muted min-w-0 flex-col items-center justify-center gap-1 px-4 py-3 text-center"
          @click="emit('open-loop')"
        >
          <span class="inline-flex items-center gap-2 text-xs uppercase tracking-[0.12em]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
            Looping countdown
          </span>
          <span class="btn-feature-subtitle">
            Resets every 12h, 24h or your own length. Perfect for Twitch drops.
          </span>
        </button>

        <div class="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            class="btn-muted min-w-0 justify-center px-4 py-3 text-xs"
            @click="emit('open-edit')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect x="3" y="4" width="18" height="18" />
              <path d="M3 10h18" />
            </svg>
            Edit current timer
          </button>

          <button
            type="button"
            class="btn-muted min-w-0 flex-col items-center justify-center px-4 py-3 text-center"
            @click="emit('customize')"
          >
            <span class="inline-flex w-full items-center justify-center gap-2 text-xs uppercase tracking-[0.12em]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 5h18" />
                <path d="M3 12h18" />
                <path d="M3 19h18" />
                <path d="M7 3v4" />
                <path d="M17 10v4" />
                <path d="M11 17v4" />
              </svg>
              OBS Overlay setup
            </span>
          </button>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1">
          <button
            type="button"
            class="btn-ghost px-1 py-1 text-[0.72rem]"
            @click="emit('toggle-focus')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M9 3H5a2 2 0 0 0-2 2v4" />
              <path d="M15 3h4a2 2 0 0 1 2 2v4" />
              <path d="M21 15v4a2 2 0 0 1-2 2h-4" />
              <path d="M3 15v4a2 2 0 0 0 2 2h4" />
            </svg>
            Focus mode
          </button>

          <div ref="shareMenuRef" class="relative">
            <button
              type="button"
              class="btn-link-chip"
              :class="{ 'is-open': shareMenuOpen }"
              @click="toggleShareMenu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              Gets links
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <div
              v-if="shareMenuOpen"
              class="absolute left-1/2 top-full z-20 mt-2 flex min-w-44 -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-cyan-200/12 bg-[#181717] shadow-[0_14px_32px_rgba(0,0,0,0.38)]"
            >
              <button
                type="button"
                class="px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.12em] text-cyan-50 transition duration-150 hover:bg-cyan-200/[0.06]"
                @click="copyShareableUrl"
              >
                Share timer link
              </button>
              <button
                type="button"
                class="border-t border-cyan-200/10 px-4 py-3 text-left text-xs font-medium uppercase tracking-[0.12em] text-cyan-50 transition duration-150 hover:bg-cyan-200/[0.06]"
                @click="copyObsOverlayUrl"
              >
                Share OBS link
              </button>
            </div>
          </div>

          <button
            type="button"
            class="btn-ghost px-1 py-1 text-[0.72rem] disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!canRestartActiveGame"
            @click="store.restartCountdown(store.activeGame.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-3.2-6.9" />
              <path d="M21 3v6h-6" />
            </svg>
            Restart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timer-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.4rem;
  background: var(--surface-0);
}

/* Wide screens: edit tools left, create centred, output tools right. */
@media (min-width: 1024px) {
  .timer-toolbar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
  }
}

.toolbar-btn.is-outline {
  box-shadow: inset 0 0 0 1px rgba(126, 210, 235, 0.35);
  color: #cffafe;
}

.toolbar-btn.is-outline:hover {
  box-shadow: inset 0 0 0 1px rgba(126, 210, 235, 0.7);
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(207, 250, 254, 0.68);
  transition: background 150ms ease, color 150ms ease;
}

.toolbar-btn:hover,
.toolbar-btn.is-open {
  background: rgba(126, 210, 235, 0.08);
  color: #e5e2e1;
}

.toolbar-btn:focus-visible {
  outline: 2px solid rgba(126, 210, 235, 0.45);
  outline-offset: -2px;
}

.toolbar-btn.is-primary {
  background: #7ed2eb;
  color: #0f1415;
}

.toolbar-btn.is-primary:hover {
  background: #9adcf0;
}

.obs-time-segments {
  width: 100%;
  justify-content: space-around;
}

.obs-time-segments > div {
  flex: 1 1 0;
  min-width: 0;
}

.obs-time-segments .tabular-nums {
  transform: scale(1.12);
  transform-origin: center bottom;
}

.regional-times-pulse {
  box-shadow: 0 0 0 0 rgba(126, 210, 235, 0.35);
  animation: regional-pulse 2.8s ease-out infinite;
}

.regional-times-enter-active,
.regional-times-leave-active {
  max-height: 24rem;
  overflow: hidden;
  transition:
    max-height 320ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 220ms ease,
    transform 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

.regional-times-enter-from,
.regional-times-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-0.4rem);
}

@keyframes regional-pulse {
  0%,
  55%,
  100% {
    box-shadow: 0 0 0 0 rgba(126, 210, 235, 0);
  }

  20% {
    box-shadow: 0 0 0 4px rgba(126, 210, 235, 0.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .regional-times-pulse {
    animation: none;
  }

  .regional-times-enter-active,
  .regional-times-leave-active {
    transition: opacity 150ms ease;
  }
}
</style>
