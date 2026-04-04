<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { toast } from "vue-sonner";

import TimeZonePreview from "./TimeZonePreview.vue";
import { useTimerStore } from "../stores/timer";
import { getTimezoneName } from "../lib/timezones";

const props = defineProps<{
  isFocusMode: boolean;
  isObsOverride?: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle-focus"): void;
  (e: "customize"): void;
  (e: "open-create"): void;
  (e: "open-edit"): void;
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
  } catch {
    toast.error("Couldn't copy the link");
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
});

onUnmounted(() => {
  store.stopTimer();
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  document.title = originalTitle;
});
</script>

<template>
  <div class="mx-auto flex w-full max-w-4xl flex-col items-center gap-6">
    <div
      class="w-full rounded-xl border border-white/8 bg-black/15 px-4 py-5 sm:px-6 sm:py-7"
    >
      <div class="text-center">
        <p
          v-if="!isObs"
          class="font-mono text-sm uppercase tracking-[0.14em] text-cyan-200/60"
        >
          {{ launchDateLabel }} · {{ launchTimezoneLabel }}
        </p>
      </div>

      <div
        class="mt-4 grid gap-x-8 gap-y-6 sm:flex sm:flex-wrap sm:items-end sm:justify-center"
        :class="isObs ? 'sm:gap-x-4' : 'sm:gap-x-10'"
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
      v-if="!isFocusMode && !isObs"
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

          <button
            type="button"
            class="btn-ghost px-1 py-1 text-[0.72rem]"
            @click="copyShareableUrl"
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
            Share link
          </button>

          <button
            v-if="store.activeGame.type === 'utility'"
            type="button"
            class="btn-ghost px-1 py-1 text-[0.72rem]"
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

      <TimeZonePreview />
    </div>
  </div>
</template>
