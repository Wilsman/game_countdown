<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { toast } from "vue-sonner";

import type { Game } from "../stores/timer";
import { useTimerStore } from "../stores/timer";
import {
  formatLocalDateTime,
  formatTimezoneOption,
  getTimezoneName,
  localToUTCDate,
  timezones,
} from "../lib/timezones";

const props = defineProps<{
  isOpen: boolean;
  mode: "create" | "edit";
  initialGameId?: string | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const store = useTimerStore();
const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

const selectedGameId = ref("");
const title = ref("");
const dateTime = ref("");
const timezoneId = ref(currentTz);

const isCreateMode = computed(() => props.mode === "create");
const customGameOptions = computed(() => store.customGameOptions);
const utilityOptions = computed(() => store.utilityOptions);
const gameOptions = computed(() => store.gameOptions);
const selectedGame = computed(() =>
  props.mode === "edit"
    ? store.games.find((game) => game.id === selectedGameId.value) ?? null
    : null,
);
const timezoneLabel = computed(() => getTimezoneName(timezoneId.value));
const previewDate = computed(() => {
  if (!dateTime.value) return null;
  return localToUTCDate(dateTime.value, timezoneId.value);
});
const previewTitle = computed(() => {
  const trimmedTitle = title.value.trim();
  return trimmedTitle || "Your countdown title";
});
const previewSchedule = computed(() => {
  if (!previewDate.value) return "Choose a date and time to preview it.";

  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezoneId.value,
    }).format(previewDate.value);
  } catch {
    return previewDate.value.toISOString();
  }
});
const dialogTitle = computed(() =>
  isCreateMode.value ? "Add a custom countdown" : "Edit current countdown",
);
const dialogDescription = computed(() =>
  isCreateMode.value
    ? "Set the title, date, and timezone once. This countdown is saved on this device and can still be shared by link."
    : "Adjust the live timer using the timezone you want this countdown to follow.",
);
const submitLabel = computed(() =>
  isCreateMode.value ? "Save countdown" : "Save changes",
);

const createDefaultDate = () =>
  formatLocalDateTime(new Date(Date.now() + 60 * 60 * 1000), currentTz);

const applyGame = (game: Game) => {
  selectedGameId.value = game.id;
  title.value = game.title;
  timezoneId.value = game.targetTimezone || currentTz;
  dateTime.value = formatLocalDateTime(new Date(game.targetDate), timezoneId.value);
};

const initializeDialog = () => {
  if (isCreateMode.value) {
    selectedGameId.value = "";
    title.value = "";
    timezoneId.value = currentTz;
    dateTime.value = createDefaultDate();
    return;
  }

  const fallbackGame = store.activeGame;
  const targetGame =
    store.games.find((game) => game.id === props.initialGameId) ?? fallbackGame;
  applyGame(targetGame);
};

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      initializeDialog();
    }
  },
);

watch(
  () => [props.mode, props.initialGameId] as const,
  () => {
    if (props.isOpen) {
      initializeDialog();
    }
  },
);

watch(
  () => selectedGameId.value,
  (gameId) => {
    if (props.mode !== "edit" || !gameId) return;

    const game = store.games.find((candidate) => candidate.id === gameId);
    if (game) {
      applyGame(game);
    }
  },
);

const save = () => {
  const trimmedTitle = title.value.trim();
  if (!trimmedTitle) {
    toast.error("Add a title for the countdown");
    return;
  }

  if (!dateTime.value) {
    toast.error("Choose the date and time for the countdown");
    return;
  }

  const utcDate = localToUTCDate(dateTime.value, timezoneId.value);

  if (isCreateMode.value) {
    const customGame = store.addCustomTimer(trimmedTitle, utcDate, timezoneId.value);
    toast.success(`"${customGame.title}" added and saved on this device`);
    emit("close");
    return;
  }

  const game = selectedGame.value;
  if (!game) return;

  if (game.source === "custom") {
    store.updateCustomTimer(game.id, {
      title: trimmedTitle,
      targetDate: utcDate,
      targetTimezone: timezoneId.value,
    });
    toast.success(`"${trimmedTitle}" updated`);
    emit("close");
    return;
  }

  store.selectGameById(game.id);
  store.setGameTitle(trimmedTitle);
  store.setTargetDate(utcDate, timezoneId.value);
  toast.success("Timer updated");
  emit("close");
};
</script>

<template>
  <div v-if="isOpen" class="dialog-overlay" @click="emit('close')">
    <div class="dialog-panel space-y-5" @click.stop>
      <div class="space-y-2 text-left">
        <h3 class="text-xl font-semibold text-stone-100">
          {{ dialogTitle }}
        </h3>
        <p class="text-sm text-cyan-100/55">
          {{ dialogDescription }}
        </p>
      </div>

      <div class="space-y-4">
        <div
          v-if="!isCreateMode"
          class="border border-cyan-200/10 bg-black/15 px-4 py-4"
        >
          <p class="font-mono text-xs uppercase tracking-[0.16em] text-cyan-200/70">
            Countdown
          </p>
          <label class="mt-3 flex flex-col gap-2 text-sm font-medium text-cyan-50">
            Current event
            <select
              v-model="selectedGameId"
              class="input-field"
            >
              <optgroup v-if="customGameOptions.length" label="Custom countdowns">
                <option
                  v-for="game in customGameOptions"
                  :key="game.id"
                  :value="game.id"
                >
                  {{ game.title }}
                </option>
              </optgroup>
              <optgroup label="Quick timers">
                <option
                  v-for="game in utilityOptions"
                  :key="game.id"
                  :value="game.id"
                >
                  {{ game.title }}
                </option>
              </optgroup>
              <optgroup label="Upcoming games">
                <option
                  v-for="game in gameOptions"
                  :key="game.id"
                  :value="game.id"
                >
                  {{ game.title }}
                </option>
              </optgroup>
            </select>
          </label>
        </div>

        <div class="border border-cyan-200/10 bg-black/15 px-4 py-4">
          <p class="font-mono text-xs uppercase tracking-[0.16em] text-cyan-200/70">
            {{ isCreateMode ? "Step 1" : "Title" }}
          </p>
          <label class="mt-3 flex flex-col gap-2 text-sm font-medium text-cyan-50">
            {{ isCreateMode ? "Countdown title" : "Title" }}
            <input
              v-model="title"
              type="text"
              class="input-field"
              :placeholder="
                isCreateMode ? 'Friday stream starts' : 'Enter timer title'
              "
            />
          </label>
        </div>

        <div class="border border-cyan-200/10 bg-black/15 px-4 py-4">
          <p class="font-mono text-xs uppercase tracking-[0.16em] text-cyan-200/70">
            {{ isCreateMode ? "Step 2" : "Schedule" }}
          </p>
          <label class="mt-3 flex flex-col gap-2 text-sm font-medium text-cyan-50">
            Date and time in that timezone
            <input
              v-model="dateTime"
              type="datetime-local"
              class="input-field"
            />
          </label>
        </div>

        <div class="border border-cyan-200/10 bg-black/15 px-4 py-4">
          <p class="font-mono text-xs uppercase tracking-[0.16em] text-cyan-200/70">
            {{ isCreateMode ? "Step 3" : "Timezone" }}
          </p>
          <label class="mt-3 flex flex-col gap-2 text-sm font-medium text-cyan-50">
            Timezone
            <select v-model="timezoneId" class="input-field">
              <option
                v-for="timezone in timezones"
                :key="timezone.id"
                :value="timezone.id"
              >
                {{ formatTimezoneOption(timezone.id) }} - {{ timezone.name }}
              </option>
            </select>
          </label>
          <p class="mt-2 text-sm text-cyan-100/50">
            {{ isCreateMode ? "Saved in" : "Active timezone" }}
            <span class="font-medium text-stone-100">{{ timezoneLabel }}</span>.
          </p>
        </div>

        <div class="border border-cyan-200/12 bg-cyan-200/[0.04] px-4 py-4">
          <p class="font-mono text-xs uppercase tracking-[0.16em] text-cyan-200/75">
            Preview
          </p>
          <p class="mt-3 text-base font-semibold text-stone-100">
            {{ previewTitle }}
          </p>
          <p class="mt-1 text-sm text-cyan-100/60">
            {{ previewSchedule }} · {{ timezoneLabel }}
          </p>
          <p class="mt-3 text-sm text-cyan-100/50">
            Custom countdowns stay on this device, and any share link still opens in each viewer's local time.
          </p>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button type="button" class="btn-ghost" @click="emit('close')">
          Cancel
        </button>
        <button type="button" class="btn-accent" @click="save">
          {{ submitLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
