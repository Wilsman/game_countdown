<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";

import { useNow } from "../hooks/useNow";
import { writeToClipboard } from "../lib/clipboard";
import {
  LOOP_INTERVAL_PRESETS,
  MAX_LOOP_INTERVAL_MINUTES,
  formatLoopInterval,
  getNextLoopReset,
  isValidLoopIntervalMinutes,
} from "../lib/loopingCountdown";
import {
  formatLocalDateTime,
  getTimezoneName,
  resolveLocalDateTime,
} from "../lib/timezones";
import { useTimerStore } from "../stores/timer";

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const store = useTimerStore();
const now = useNow();
const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const DEFAULT_INTERVAL_MINUTES = 24 * 60;

const title = ref("");
const intervalMinutes = ref<number>(DEFAULT_INTERVAL_MINUTES);
const isCustomInterval = ref(false);
const customHours = ref("");
const useUtc = ref(false);
const dateTime = ref("");
const overlayUrl = ref("");

const timezoneId = computed(() => (useUtc.value ? "UTC" : localTz));
const timezoneLabel = computed(() =>
  useUtc.value ? "UTC" : getTimezoneName(localTz),
);

const resolvedInterval = computed<number | null>(() => {
  if (!isCustomInterval.value) return intervalMinutes.value;
  const hours = Number(customHours.value);
  if (!customHours.value.trim() || !Number.isFinite(hours)) return null;
  const minutes = Math.round(hours * 60);
  return isValidLoopIntervalMinutes(minutes) ? minutes : null;
});

const dateResolution = computed(() =>
  dateTime.value ? resolveLocalDateTime(dateTime.value, timezoneId.value) : null,
);
const anchorDate = computed(() => {
  const resolution = dateResolution.value;
  return resolution?.status === "exact" || resolution?.status === "ambiguous"
    ? resolution.date
    : null;
});

const validationMessage = computed(() => {
  if (isCustomInterval.value && resolvedInterval.value === null) {
    return `Enter how many hours each cycle lasts (up to ${MAX_LOOP_INTERVAL_MINUTES / 60 / 24} days).`;
  }
  switch (dateResolution.value?.status) {
    case "nonexistent":
      return "That time is skipped by a clock change. Choose another time.";
    case "malformed":
    case undefined:
      return "Choose when a cycle starts.";
    default:
      return "";
  }
});

const canCreate = computed(
  () =>
    title.value.trim() !== "" &&
    anchorDate.value !== null &&
    resolvedInterval.value !== null,
);

const nextReset = computed(() =>
  anchorDate.value && resolvedInterval.value
    ? getNextLoopReset(anchorDate.value, resolvedInterval.value, now.value)
    : null,
);

const nextResetLabel = computed(() => {
  if (!nextReset.value) return "";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(nextReset.value);
});

const timeUntilNextReset = computed(() => {
  if (!nextReset.value) return "";
  const totalSeconds = Math.max(
    0,
    Math.floor((nextReset.value.getTime() - now.value.getTime()) / 1000),
  );
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => value.toString().padStart(2, "0");
  const clock = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return days > 0 ? `${days}d ${clock}` : clock;
});

const selectPreset = (minutes: number) => {
  isCustomInterval.value = false;
  intervalMinutes.value = minutes;
};

const selectCustom = () => {
  isCustomInterval.value = true;
  if (!customHours.value) {
    customHours.value = String(intervalMinutes.value / 60);
  }
};

// Keep the same instant when switching between local time and UTC.
watch(timezoneId, (nextTz, previousTz) => {
  if (!dateTime.value) return;
  const resolution = resolveLocalDateTime(dateTime.value, previousTz);
  if (resolution.status === "exact" || resolution.status === "ambiguous") {
    dateTime.value = formatLocalDateTime(resolution.date, nextTz);
  }
});

const resetForm = () => {
  const startOfHour = new Date();
  startOfHour.setMinutes(0, 0, 0);

  title.value = "";
  intervalMinutes.value = DEFAULT_INTERVAL_MINUTES;
  isCustomInterval.value = false;
  customHours.value = "";
  useUtc.value = false;
  dateTime.value = formatLocalDateTime(startOfHour, localTz);
  overlayUrl.value = "";
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) resetForm();
  },
);

const copyOverlayUrl = async () => {
  try {
    await writeToClipboard(overlayUrl.value);
    toast.success("OBS link copied");
  } catch (error) {
    console.error("Failed to copy OBS overlay link:", error);
    toast.error("Couldn't copy automatically. Select the link and copy it.");
  }
};

const create = async () => {
  if (!canCreate.value || !anchorDate.value || !resolvedInterval.value) {
    return;
  }

  store.addCustomTimer(
    title.value.trim(),
    anchorDate.value,
    timezoneId.value,
    undefined,
    resolvedInterval.value,
  );
  overlayUrl.value = store.getObsOverlayUrl();
  await copyOverlayUrl();
};
</script>

<template>
  <div v-if="isOpen" class="dialog-overlay" @click="emit('close')">
    <div
      class="dialog-panel max-h-[calc(100vh-2rem)] space-y-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="looping-countdown-title"
      @click.stop
    >
      <div class="space-y-2 text-left">
        <h3
          id="looping-countdown-title"
          class="text-xl font-semibold text-stone-100"
        >
          {{ overlayUrl ? "Your looping overlay is ready" : "Looping countdown" }}
        </h3>
        <p class="text-sm text-cyan-100/55">
          {{
            overlayUrl
              ? "The link is copied. It keeps counting down and resets on its own, forever."
              : "Counts down to the next reset, then starts again automatically. Great for daily Twitch drops."
          }}
        </p>
      </div>

      <template v-if="!overlayUrl">
        <div class="space-y-4">
          <label class="flex flex-col gap-2 text-sm font-medium text-cyan-50">
            Name
            <input
              v-model="title"
              type="text"
              class="input-field"
              placeholder="Drops reset"
              maxlength="80"
            />
          </label>

          <div class="flex flex-col gap-2 text-sm font-medium text-cyan-50">
            Resets every
            <div class="flex flex-wrap gap-2" role="group" aria-label="Resets every">
              <button
                v-for="preset in LOOP_INTERVAL_PRESETS"
                :key="preset.minutes"
                type="button"
                class="loop-chip"
                :class="{
                  'is-selected':
                    !isCustomInterval && intervalMinutes === preset.minutes,
                }"
                :aria-pressed="!isCustomInterval && intervalMinutes === preset.minutes"
                @click="selectPreset(preset.minutes)"
              >
                {{ preset.label }}
              </button>
              <button
                type="button"
                class="loop-chip"
                :class="{ 'is-selected': isCustomInterval }"
                :aria-pressed="isCustomInterval"
                @click="selectCustom"
              >
                Custom
              </button>
            </div>
            <label
              v-if="isCustomInterval"
              class="mt-1 flex items-center gap-3 text-sm text-cyan-100/70"
            >
              <input
                v-model="customHours"
                type="number"
                min="0.25"
                step="0.25"
                inputmode="decimal"
                class="input-field w-32"
                aria-label="Hours per cycle"
              />
              hours
            </label>
          </div>

          <div class="flex flex-col gap-2 text-sm font-medium text-cyan-50">
            <div class="flex items-center justify-between gap-3">
              <label for="looping-countdown-start">A reset happens at</label>
              <label
                class="flex cursor-pointer items-center gap-2 text-xs font-normal text-cyan-100/60"
              >
                <input v-model="useUtc" type="checkbox" class="accent-cyan-300" />
                Time is in UTC
              </label>
            </div>
            <input
              id="looping-countdown-start"
              v-model="dateTime"
              type="datetime-local"
              class="input-field"
            />
            <p class="text-xs font-normal text-cyan-100/50">
              Any past or upcoming reset works, e.g. when today's drops went
              live. Time zone: {{ timezoneLabel }}.
            </p>
          </div>
        </div>

        <div
          class="border border-cyan-200/12 bg-cyan-200/[0.04] px-4 py-4"
          aria-live="polite"
        >
          <template v-if="nextReset && resolvedInterval">
            <p class="font-mono text-xs uppercase tracking-[0.16em] text-cyan-200/75">
              Next reset in
            </p>
            <p class="mt-2 font-mono text-3xl font-semibold tabular-nums text-stone-100">
              {{ timeUntilNextReset }}
            </p>
            <p class="mt-1 text-sm text-cyan-100/60">
              {{ nextResetLabel }} your time, then every
              {{ formatLoopInterval(resolvedInterval) }}.
            </p>
          </template>
          <p v-else class="text-sm text-amber-200/80">
            {{ validationMessage }}
          </p>
        </div>

        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            class="btn-ghost w-full justify-center sm:w-auto"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn-accent w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!canCreate"
            @click="create"
          >
            Create + copy OBS link
          </button>
        </div>
      </template>

      <template v-else>
        <div class="flex gap-2">
          <input
            :value="overlayUrl"
            type="text"
            readonly
            class="input-field min-w-0 flex-1 font-mono text-xs"
            aria-label="OBS overlay link"
            @focus="($event.target as HTMLInputElement).select()"
          />
          <button type="button" class="btn-muted shrink-0" @click="copyOverlayUrl">
            Copy
          </button>
        </div>

        <ol class="list-decimal space-y-2 pl-5 text-sm text-cyan-100/70">
          <li>In OBS, go to Sources, click <strong>+</strong> and choose <strong>Browser</strong>.</li>
          <li>Paste the link into <strong>URL</strong>.</li>
          <li>Set Width to <strong>1280</strong> and Height to <strong>720</strong>, then click OK.</li>
        </ol>

        <p class="text-xs text-cyan-100/50">
          It's also saved in your countdown list. To change colours or size,
          use OBS Overlay setup and copy the link again.
        </p>

        <div class="flex justify-end">
          <button type="button" class="btn-accent w-full sm:w-auto" @click="emit('close')">
            Done
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.loop-chip {
  @apply border px-4 py-2 font-mono text-sm font-semibold transition duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2;
  background: var(--surface-1);
  border-color: var(--border-1);
  color: var(--text-secondary);
  outline-color: rgba(126, 210, 235, 0.45);
}

.loop-chip:hover {
  border-color: var(--border-2);
  color: var(--text-primary);
}

.loop-chip.is-selected {
  background: rgba(126, 210, 235, 0.14);
  border-color: rgba(126, 210, 235, 0.55);
  color: #eafcff;
}
</style>
