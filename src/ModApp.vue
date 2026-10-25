<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Toaster, toast } from "vue-sonner";

import { writeToClipboard } from "./lib/clipboard";
import {
  createCountdownId,
  MOD_COUNTDOWNS_API_PATH,
  type CountdownOverrides,
  type ModAction,
} from "./lib/countdownOverrides";
import {
  parseGameBase,
  serializeGameBase,
  type SerializedGameBase,
} from "./lib/liveCountdowns";
import {
  formatLocalDateTime,
  formatTimezoneOption,
  getTimezoneName,
  resolveLocalDateTime,
  timezones,
} from "./lib/timezones";
import type { GameBase } from "./types/game";

type RowStatus = "built-in" | "edited" | "added" | "hidden";

interface Row {
  game: GameBase;
  status: RowStatus;
}

interface ModState {
  builtIn: SerializedGameBase[];
  overrides: CountdownOverrides;
}

const PASSWORD_STORAGE_KEY = "game-countdown.mod-password";
const STATUS_LABELS: Record<RowStatus, string> = {
  "built-in": "Built-in",
  edited: "Edited",
  added: "Added by mod",
  hidden: "Hidden",
};
const NUDGES = [
  { label: "-1h", minutes: -60 },
  { label: "-5m", minutes: -5 },
  { label: "-1m", minutes: -1 },
  { label: "+1m", minutes: 1 },
  { label: "+5m", minutes: 5 },
  { label: "+1h", minutes: 60 },
];

const viewerTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const password = ref("");
const isUnlocked = ref(false);
const isBusy = ref(false);
const loginError = ref("");
const state = ref<ModState | null>(null);

// Editor
const editingId = ref<string | null>(null);
const isNew = ref(false);
const formId = ref("");
const formTitle = ref("");
const formColor = ref("#ffffff");
const formTimezone = ref("UTC");
const formDateTime = ref("");
const formRegionalTimes = ref<GameBase["regionalReleaseTimes"]>(undefined);
const clearRegionalTimes = ref(false);
const formError = ref("");

const readStoredPassword = (): string => {
  try {
    return window.sessionStorage.getItem(PASSWORD_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
};

const storePassword = (value: string | null): void => {
  try {
    if (value) window.sessionStorage.setItem(PASSWORD_STORAGE_KEY, value);
    else window.sessionStorage.removeItem(PASSWORD_STORAGE_KEY);
  } catch {
    // Private mode: the mod just signs in again next time.
  }
};

const toGames = (entries: SerializedGameBase[]): GameBase[] =>
  entries
    .map(parseGameBase)
    .filter((game): game is GameBase => game !== null);

const rows = computed<Row[]>(() => {
  if (!state.value) return [];
  const builtIn = toGames(state.value.builtIn);
  const edits = new Map(
    toGames(state.value.overrides.games).map((game) => [game.id, game]),
  );
  const removed = new Set(state.value.overrides.removed);
  const builtInIds = new Set(builtIn.map((game) => game.id));

  const result: Row[] = builtIn.map((game) => {
    if (removed.has(game.id)) return { game, status: "hidden" };
    const edit = edits.get(game.id);
    return edit ? { game: edit, status: "edited" } : { game, status: "built-in" };
  });
  for (const game of edits.values()) {
    if (!builtInIds.has(game.id) && !removed.has(game.id)) {
      result.push({ game, status: "added" });
    }
  }

  // Upcoming first (soonest on top), then ended (latest first), then hidden.
  const group = (row: Row): number =>
    row.status === "hidden" ? 2 : isPast(row.game) ? 1 : 0;
  return result.sort((left, right) => {
    const groupOrder = group(left) - group(right);
    if (groupOrder) return groupOrder;
    const timeOrder =
      left.game.targetDate.getTime() - right.game.targetDate.getTime();
    return group(left) === 1 ? -timeOrder : timeOrder;
  });
});

const takenIds = computed(() => {
  if (!state.value) return [];
  return [
    ...state.value.builtIn.map((game) => game.id),
    ...state.value.overrides.games.map((game) => game.id),
    ...state.value.overrides.removed,
  ];
});

const dateResolution = computed(() =>
  formDateTime.value
    ? resolveLocalDateTime(formDateTime.value, formTimezone.value)
    : null,
);
const formDate = computed(() => {
  const resolution = dateResolution.value;
  return resolution?.status === "exact" || resolution?.status === "ambiguous"
    ? resolution.date
    : null;
});
const dateMessage = computed(() => {
  switch (dateResolution.value?.status) {
    case "ambiguous":
      return "That time happens twice (clocks go back). The earlier one is used.";
    case "nonexistent":
      return "That time is skipped in this timezone (clocks go forward).";
    case "malformed":
      return "Enter a valid date and time.";
    case "unsupported-zone":
      return "This timezone isn't supported by your browser.";
    default:
      return "";
  }
});
const canSave = computed(
  () => Boolean(formDate.value) && formTitle.value.trim().length > 0 && !isBusy.value,
);

const formatInZone = (date: Date, timezone: string): string => {
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
      timeZoneName: "short",
    }).format(date);
  } catch {
    return date.toISOString();
  }
};

const isPast = (game: GameBase): boolean => game.targetDate.getTime() < Date.now();

async function request(action?: ModAction): Promise<boolean> {
  isBusy.value = true;
  try {
    const response = await fetch(MOD_COUNTDOWNS_API_PATH, {
      method: action ? "POST" : "GET",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${encodeURIComponent(password.value)}`,
        ...(action ? { "Content-Type": "application/json" } : {}),
      },
      body: action ? JSON.stringify(action) : undefined,
    });
    const data = (await response.json().catch(() => null)) as
      | (ModState & { error?: string })
      | null;

    if (response.status === 401) {
      isUnlocked.value = false;
      storePassword(null);
      loginError.value = "Wrong password.";
      return false;
    }
    if (!response.ok || !data) {
      const message = data?.error ?? `Request failed (${response.status}).`;
      if (isUnlocked.value) {
        formError.value = message;
        toast.error(message);
      } else {
        loginError.value = message;
      }
      return false;
    }

    state.value = { builtIn: data.builtIn, overrides: data.overrides };
    isUnlocked.value = true;
    loginError.value = "";
    storePassword(password.value);
    return true;
  } catch {
    const message = "Network error. Check your connection and try again.";
    if (isUnlocked.value) toast.error(message);
    else loginError.value = message;
    return false;
  } finally {
    isBusy.value = false;
  }
}

const unlock = () => {
  if (!password.value) return;
  void request();
};

const signOut = () => {
  storePassword(null);
  password.value = "";
  isUnlocked.value = false;
  state.value = null;
  closeEditor();
};

function openEditor(game: GameBase | null): void {
  formError.value = "";
  clearRegionalTimes.value = false;
  if (game) {
    isNew.value = false;
    editingId.value = game.id;
    formId.value = game.id;
    formTitle.value = game.title;
    formColor.value = game.titleColor;
    formTimezone.value = game.targetTimezone;
    formDateTime.value = formatLocalDateTime(game.targetDate, game.targetTimezone);
    formRegionalTimes.value = game.regionalReleaseTimes;
  } else {
    isNew.value = true;
    editingId.value = "";
    formId.value = "";
    formTitle.value = "";
    formColor.value = "#ffffff";
    formTimezone.value = viewerTimezone;
    formDateTime.value = formatLocalDateTime(
      new Date(Date.now() + 60 * 60 * 1000),
      viewerTimezone,
    );
    formRegionalTimes.value = undefined;
  }
  window.scrollTo({ top: 0 });
}

function closeEditor(): void {
  editingId.value = null;
  formError.value = "";
}

const suggestedId = computed(() =>
  createCountdownId(formTitle.value || "event", takenIds.value),
);

const nudge = (minutes: number) => {
  if (!formDate.value) return;
  formDateTime.value = formatLocalDateTime(
    new Date(formDate.value.getTime() + minutes * 60 * 1000),
    formTimezone.value,
  );
};

async function save(): Promise<void> {
  if (!formDate.value) return;
  formError.value = "";
  const id = isNew.value ? formId.value.trim() || suggestedId.value : formId.value;
  const regionalReleaseTimes = clearRegionalTimes.value
    ? undefined
    : formRegionalTimes.value;

  const saved = await request({
    type: "save",
    isNew: isNew.value,
    game: serializeGameBase({
      id,
      title: formTitle.value.trim(),
      titleColor: formColor.value,
      targetDate: formDate.value,
      targetTimezone: formTimezone.value,
      type: "game",
      ...(regionalReleaseTimes?.length ? { regionalReleaseTimes } : {}),
    }),
  });
  if (!saved) return;

  toast.success(
    isNew.value
      ? "Countdown added. It shows on the site within about 2 minutes."
      : "Saved. Open pages and overlays update within about 2 minutes.",
  );
  closeEditor();
}

async function runAction(action: ModAction, success: string, confirmText?: string) {
  if (confirmText && !window.confirm(confirmText)) return;
  if (await request(action)) toast.success(success);
}

const hide = (row: Row) =>
  runAction(
    { type: "remove", id: row.game.id },
    "Countdown hidden.",
    row.status === "added"
      ? `Delete "${row.game.title}"? Its links will stop working.`
      : `Hide "${row.game.title}" from the site?`,
  );

const reset = (row: Row) =>
  runAction(
    { type: "reset", id: row.game.id },
    row.status === "hidden" ? "Countdown restored." : "Reverted to the built-in version.",
    row.status === "edited" ? `Undo mod edits to "${row.game.title}"?` : undefined,
  );

const linkFor = (id: string, obs: boolean): string => {
  const url = new URL("/", window.location.origin);
  url.searchParams.set("game", id);
  if (obs) {
    url.searchParams.set("obs", "1");
    url.searchParams.set("bg", "0");
  }
  return url.toString();
};

async function copyLink(id: string, obs: boolean): Promise<void> {
  try {
    await writeToClipboard(linkFor(id, obs));
    toast.success(obs ? "OBS link copied" : "Link copied");
  } catch {
    toast.error("Could not copy the link");
  }
}

onMounted(() => {
  const stored = readStoredPassword();
  if (stored) {
    password.value = stored;
    void request();
  }
});
</script>

<template>
  <main class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
    <header class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-stone-100">Mod tools</h1>
        <p class="mt-1 text-sm text-cyan-100/60">
          Edit or add countdowns. Changes reach the site and OBS overlays within about 2 minutes.
        </p>
      </div>
      <div v-if="isUnlocked" class="flex gap-2">
        <a href="/" class="btn-ghost">Open site</a>
        <button type="button" class="btn-ghost" @click="signOut">Sign out</button>
      </div>
    </header>

    <form
      v-if="!isUnlocked"
      class="glass-panel mt-8 max-w-sm space-y-4 p-6"
      @submit.prevent="unlock"
    >
      <label class="flex flex-col gap-2 text-sm font-medium text-cyan-50">
        Password
        <input
          v-model="password"
          type="password"
          class="input-field"
          autocomplete="current-password"
          autofocus
        />
      </label>
      <p v-if="loginError" class="text-sm text-amber-200/80" aria-live="polite">
        {{ loginError }}
      </p>
      <button type="submit" class="btn-accent w-full" :disabled="isBusy || !password">
        {{ isBusy ? "Checking..." : "Unlock" }}
      </button>
    </form>

    <template v-else>
      <section
        v-if="editingId !== null"
        class="glass-panel mt-8 space-y-4 p-6"
        aria-labelledby="editor-title"
      >
        <h2 id="editor-title" class="text-lg font-semibold text-stone-100">
          {{ isNew ? "Add countdown" : "Edit countdown" }}
        </h2>

        <div class="grid gap-4 sm:grid-cols-2">
          <label class="flex flex-col gap-2 text-sm font-medium text-cyan-50 sm:col-span-2">
            Title
            <input v-model="formTitle" type="text" class="input-field" maxlength="120" />
          </label>

          <label class="flex flex-col gap-2 text-sm font-medium text-cyan-50">
            Date and time
            <input v-model="formDateTime" type="datetime-local" class="input-field" />
          </label>

          <label class="flex flex-col gap-2 text-sm font-medium text-cyan-50">
            Timezone
            <select v-model="formTimezone" class="input-field">
              <option
                v-if="!timezones.some((zone) => zone.id === formTimezone)"
                :value="formTimezone"
              >
                {{ formTimezone }}
              </option>
              <option v-for="zone in timezones" :key="zone.id" :value="zone.id">
                {{ formatTimezoneOption(zone.id, formDate ?? new Date()) }} - {{ zone.name }}
              </option>
            </select>
          </label>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm text-cyan-100/60">Adjust:</span>
          <button
            v-for="step in NUDGES"
            :key="step.label"
            type="button"
            class="btn-muted px-3 py-1.5 font-mono"
            :disabled="!formDate"
            @click="nudge(step.minutes)"
          >
            {{ step.label }}
          </button>
        </div>

        <p v-if="dateMessage" class="text-sm text-amber-200/80" aria-live="polite">
          {{ dateMessage }}
        </p>
        <div v-if="formDate" class="text-sm text-cyan-100/60">
          <p>
            Ends <span class="text-stone-100">{{ formatInZone(formDate, formTimezone) }}</span>
            ({{ getTimezoneName(formTimezone) }})
          </p>
          <p>Your time: {{ formatInZone(formDate, viewerTimezone) }}</p>
          <p class="font-mono text-xs">UTC {{ formDate.toISOString() }}</p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <label class="flex flex-col gap-2 text-sm font-medium text-cyan-50">
            Title colour
            <span class="flex gap-2">
              <input
                v-model="formColor"
                type="color"
                class="h-11 w-14 shrink-0 cursor-pointer border-0 bg-transparent p-0"
                aria-label="Pick colour"
              />
              <input v-model="formColor" type="text" class="input-field font-mono" />
            </span>
          </label>

          <label class="flex flex-col gap-2 text-sm font-medium text-cyan-50">
            Link id
            <input
              v-if="isNew"
              v-model="formId"
              type="text"
              class="input-field font-mono"
              :placeholder="suggestedId"
            />
            <span v-else class="input-field font-mono text-cyan-100/70">{{ formId }}</span>
            <span class="text-xs font-normal text-cyan-100/50">
              {{ isNew ? "Used in share and OBS links. Can't be changed later." : "Can't be changed, links use it." }}
            </span>
          </label>
        </div>

        <label
          v-if="formRegionalTimes?.length"
          class="flex items-center gap-2 text-sm text-cyan-100/70"
        >
          <input v-model="clearRegionalTimes" type="checkbox" />
          Remove the {{ formRegionalTimes.length }} regional release times (they won't move with this date)
        </label>

        <p v-if="formError" class="text-sm text-amber-200/80" aria-live="polite">
          {{ formError }}
        </p>

        <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" class="btn-ghost" @click="closeEditor">Cancel</button>
          <button type="button" class="btn-accent" :disabled="!canSave" @click="save">
            {{ isBusy ? "Saving..." : isNew ? "Add countdown" : "Save changes" }}
          </button>
        </div>
      </section>

      <section class="mt-8">
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-lg font-semibold text-stone-100">Countdowns</h2>
          <button
            v-if="editingId === null"
            type="button"
            class="btn-accent"
            @click="openEditor(null)"
          >
            Add countdown
          </button>
        </div>

        <ul class="mt-4 space-y-2">
          <li
            v-for="row in rows"
            :key="row.game.id"
            class="glass-section flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            :class="{ 'opacity-60': row.status === 'hidden' }"
          >
            <div class="min-w-0">
              <p class="flex flex-wrap items-center gap-2">
                <span class="font-semibold" :style="{ color: row.game.titleColor }">
                  {{ row.game.title }}
                </span>
                <span class="status-pill px-2 py-0.5">{{ STATUS_LABELS[row.status] }}</span>
                <span v-if="isPast(row.game)" class="status-pill px-2 py-0.5">Ended</span>
              </p>
              <p class="mt-1 text-sm text-cyan-100/60">
                {{ formatInZone(row.game.targetDate, row.game.targetTimezone) }}
                <span class="font-mono text-xs text-cyan-100/40">· {{ row.game.id }}</span>
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <template v-if="row.status !== 'hidden'">
                <button type="button" class="btn-muted px-3 py-1.5" @click="openEditor(row.game)">
                  Edit
                </button>
                <button type="button" class="btn-ghost" @click="copyLink(row.game.id, true)">
                  OBS link
                </button>
                <button type="button" class="btn-ghost" @click="copyLink(row.game.id, false)">
                  Link
                </button>
                <button
                  v-if="row.status === 'edited'"
                  type="button"
                  class="btn-ghost"
                  @click="reset(row)"
                >
                  Undo edits
                </button>
                <button type="button" class="btn-ghost" @click="hide(row)">
                  {{ row.status === "added" ? "Delete" : "Hide" }}
                </button>
              </template>
              <button v-else type="button" class="btn-muted px-3 py-1.5" @click="reset(row)">
                Restore
              </button>
            </div>
          </li>
        </ul>
      </section>
    </template>
  </main>
  <Toaster position="bottom-center" />
</template>
