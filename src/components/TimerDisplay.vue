<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { toast } from "vue-sonner";

import TimeZonePreview from "./TimeZonePreview.vue";
import { useTimerStore } from "../stores/timer";

const props = defineProps<{
  isFocusMode: boolean;
  isObsOverride?: boolean;
  createTimerRequest?: number;
}>();

const emit = defineEmits<{
  (e: "toggle-focus"): void;
  (e: "customize"): void;
}>();

const store = useTimerStore();
const { isObsMode: storeObsMode } = storeToRefs(store);

const isObs = computed(() =>
  props.isObsOverride !== undefined ? props.isObsOverride : storeObsMode.value
);
const showDatePicker = ref(false);
const localDateTime = ref("");
const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const editTitle = ref("");
const selectedEditGameId = ref("");

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

const showManualDialog = ref(false);
const manualTitle = ref("");
const manualDateTime = ref("");
const manualTimezoneId = ref(currentTz);

const selectedTimezone = ref({
  id: currentTz,
  name: "",
});

const timezones = [
  { name: "Baker Island Time (BIT)", id: "Etc/GMT+12" },
  { name: "Niue Time (NUT)", id: "Pacific/Niue" },
  { name: "Samoa Standard Time (SST)", id: "Pacific/Pago_Pago" },
  { name: "Hawaii-Aleutian Standard Time (HAST)", id: "Pacific/Honolulu" },
  { name: "Cook Islands Time (CKT)", id: "Pacific/Rarotonga" },
  { name: "Tahiti Time (TAHT)", id: "Pacific/Tahiti" },
  { name: "Marquesas Time (MART)", id: "Pacific/Marquesas" },
  { name: "Alaska Standard Time (AKST)", id: "America/Anchorage" },
  { name: "Gambier Islands Time (GAMT)", id: "Pacific/Gambier" },
  { name: "Pacific Standard Time (PST)", id: "America/Los_Angeles" },
  { name: "Clipperton Island Time (CIT)", id: "Pacific/Pitcairn" },
  { name: "Mountain Standard Time (MST)", id: "America/Denver" },
  { name: "Central Standard Time (CST)", id: "America/Chicago" },
  { name: "Galapagos Time (GALT)", id: "Pacific/Galapagos" },
  { name: "Eastern Standard Time (EST)", id: "America/New_York" },
  { name: "Cuba Standard Time (CST)", id: "America/Havana" },
  { name: "Colombia Time (COT)", id: "America/Bogota" },
  { name: "Peru Time (PET)", id: "America/Lima" },
  { name: "Ecuador Time (ECT)", id: "America/Guayaquil" },
  { name: "Venezuela Standard Time (VET)", id: "America/Caracas" },
  { name: "Atlantic Standard Time (AST)", id: "America/Halifax" },
  { name: "Bolivia Time (BOT)", id: "America/La_Paz" },
  { name: "Chile Standard Time (CLT)", id: "America/Santiago" },
  { name: "Newfoundland Standard Time (NST)", id: "America/St_Johns" },
  { name: "Argentina Time (ART)", id: "America/Argentina/Buenos_Aires" },
  { name: "Brasilia Time (BRT)", id: "America/Sao_Paulo" },
  { name: "Uruguay Time (UYT)", id: "America/Montevideo" },
  { name: "South Georgia Time (GST)", id: "Atlantic/South_Georgia" },
  { name: "Azores Standard Time (AZOT)", id: "Atlantic/Azores" },
  { name: "Cape Verde Time (CVT)", id: "Atlantic/Cape_Verde" },
  { name: "Greenwich Mean Time (GMT)", id: "GMT" },
  { name: "Coordinated Universal Time (UTC)", id: "UTC" },
  { name: "Western European Time (WET)", id: "Europe/Lisbon" },
  { name: "British Summer Time (BST)", id: "Europe/London" },
  { name: "Central European Time (CET)", id: "Europe/Paris" },
  { name: "West Africa Time (WAT)", id: "Africa/Lagos" },
  { name: "Western European Summer Time (WEST)", id: "Atlantic/Canary" },
  { name: "South Africa Standard Time (SAST)", id: "Africa/Johannesburg" },
  { name: "Israel Standard Time (IST)", id: "Asia/Jerusalem" },
  { name: "Moscow Standard Time (MSK)", id: "Europe/Moscow" },
  { name: "Arabia Standard Time (AST)", id: "Asia/Riyadh" },
  { name: "Iran Standard Time (IRST)", id: "Asia/Tehran" },
  { name: "United Arab Emirates Standard Time (GST)", id: "Asia/Dubai" },
  { name: "Afghanistan Time (AFT)", id: "Asia/Kabul" },
  { name: "Pakistan Standard Time (PKT)", id: "Asia/Karachi" },
  { name: "India Standard Time (IST)", id: "Asia/Kolkata" },
  { name: "Nepal Time (NPT)", id: "Asia/Kathmandu" },
  { name: "Bangladesh Standard Time (BST)", id: "Asia/Dhaka" },
  { name: "Myanmar Time (MMT)", id: "Asia/Yangon" },
  { name: "Indochina Time (ICT)", id: "Asia/Bangkok" },
  { name: "China Standard Time (CST)", id: "Asia/Shanghai" },
  { name: "Singapore Standard Time (SGT)", id: "Asia/Singapore" },
  { name: "Japan Standard Time (JST)", id: "Asia/Tokyo" },
  { name: "Korea Standard Time (KST)", id: "Asia/Seoul" },
  { name: "Australian Central Standard Time (ACST)", id: "Australia/Adelaide" },
  { name: "Australian Eastern Standard Time (AEST)", id: "Australia/Sydney" },
  { name: "Lord Howe Standard Time (LHST)", id: "Australia/Lord_Howe" },
  { name: "Solomon Islands Time (SBT)", id: "Pacific/Guadalcanal" },
  { name: "New Zealand Standard Time (NZST)", id: "Pacific/Auckland" },
  { name: "Fiji Time (FJT)", id: "Pacific/Fiji" },
  { name: "Chatham Islands Time (CHAST)", id: "Pacific/Chatham" },
  { name: "Tonga Time (TOT)", id: "Pacific/Tongatapu" },
  { name: "Line Islands Time (LINT)", id: "Pacific/Kiritimati" },
].sort((a, b) => {
  const getOffset = (tz: string) => {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "short",
        hour: "2-digit",
        hour12: false,
      });
      const parts = formatter.formatToParts(new Date());
      const tzPart =
        parts.find((part) => part.type === "timeZoneName")?.value || "";
      const offsetStr = tzPart.replace(/^[^\d+-]+/, "");
      return parseInt(offsetStr) || 0;
    } catch {
      return 0;
    }
  };
  return getOffset(a.id) - getOffset(b.id);
});

const getTimezoneName = (timezoneId: string) =>
  timezones.find((timezone) => timezone.id === timezoneId)?.name || timezoneId;

selectedTimezone.value.name = getTimezoneName(currentTz);

const formatTimezone = (tz: string) => {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const tzName = tz.split("/").pop()?.replace("_", " ") || tz;
    const tzPart = parts.find((part) => part.type === "timeZoneName");
    const tzOffset = tzPart ? tzPart.value : "";
    return `(${tzOffset}) ${tzName}`;
  } catch {
    return tz;
  }
};

const getOffsetMinutes = (timeZone: string, date: Date) => {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    if (!tzPart) return 0;
    const offsetStr = tzPart.value.replace("GMT", "");
    const firstCharCode = offsetStr.charCodeAt(0);
    const sign = firstCharCode === 45 || firstCharCode === 8722 ? -1 : 1;
    const [hours, minutes] = offsetStr.substring(1).split(":").map(Number);
    return (hours * 60 + (minutes || 0)) * sign;
  } catch {
    return new Date().getTimezoneOffset();
  }
};

const localToUTCDate = (dateString: string, timezone: string): Date => {
  if (!dateString) return new Date();
  const [datePart, timePart] = dateString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  try {
    const tempDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    const targetOffsetMinutes = getOffsetMinutes(timezone, tempDate);
    return new Date(tempDate.getTime() - targetOffsetMinutes * 60 * 1000);
  } catch {
    const localDate = new Date(
      Date.UTC(year, month - 1, day, hours, minutes, 0)
    );
    return new Date(
      localDate.getTime() - localDate.getTimezoneOffset() * 60000
    );
  }
};

const formatLocalDate = (date: Date, timezone: string) => {
  if (!date) return "";
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === "year")?.value.padStart(4, "0");
    const month = parts.find((p) => p.type === "month")?.value.padStart(2, "0");
    const day = parts.find((p) => p.type === "day")?.value.padStart(2, "0");
    const hour = parts.find((p) => p.type === "hour")?.value.padStart(2, "0");
    const minute = parts
      .find((p) => p.type === "minute")
      ?.value.padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:${minute}`;
  } catch {
    return "";
  }
};

const createDefaultManualDate = () =>
  formatLocalDate(new Date(Date.now() + 60 * 60 * 1000), currentTz);

const initLocalDateTime = () => {
  localDateTime.value = formatLocalDate(
    store.targetDate,
    selectedTimezone.value.id
  );
};

const handleTimezoneChange = () => {
  const timezone = timezones.find((candidate) => {
    return candidate.id === selectedTimezone.value.id;
  });
  if (timezone) {
    selectedTimezone.value.name = timezone.name;
  }
};

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

const editableUtilityOptions = computed(() => {
  return store.utilityOptions.filter((game) => {
    return (
      game.id === store.activeGame.id || new Date(game.targetDate).getTime() > Date.now()
    );
  });
});

const editableGameOptions = computed(() => {
  return store.gameOptions.filter((game) => {
    return (
      game.id === store.activeGame.id || new Date(game.targetDate).getTime() > Date.now()
    );
  });
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

const manualTimezoneLabel = computed(() =>
  getTimezoneName(manualTimezoneId.value)
);

const manualPreviewDate = computed(() => {
  if (!manualDateTime.value) return null;
  return localToUTCDate(manualDateTime.value, manualTimezoneId.value);
});

const manualPreviewTitle = computed(() => {
  const trimmedTitle = manualTitle.value.trim();
  return trimmedTitle || "Your timer title";
});

const manualPreviewSchedule = computed(() => {
  if (!manualPreviewDate.value) return "Choose a date and time to preview it.";

  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: manualTimezoneId.value,
    }).format(manualPreviewDate.value);
  } catch {
    return manualPreviewDate.value.toISOString();
  }
});

watch(
  () => props.createTimerRequest,
  (request, previousRequest) => {
    if ((request ?? 0) === (previousRequest ?? 0) || isObs.value) return;
    openManualDialog();
  }
);

watch(
  () => store.activeGame.id,
  () => {
    if (!showDatePicker.value) return;
    editTitle.value = store.gameTitle;
    selectedEditGameId.value = store.activeGame.id;
    selectedTimezone.value = {
      id: store.targetTimezone || currentTz,
      name: getTimezoneName(store.targetTimezone || currentTz),
    };
    initLocalDateTime();
  }
);

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
  { deep: true }
);

function openDatePicker() {
  const timezone =
    store.targetTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneName = getTimezoneName(timezone);
  selectedTimezone.value = { id: timezone, name: timezoneName };
  editTitle.value = store.gameTitle;
  selectedEditGameId.value = store.activeGame.id;
  initLocalDateTime();
  showDatePicker.value = true;
}

function closeDatePicker() {
  showDatePicker.value = false;
}

function handleEditGameChange() {
  if (!selectedEditGameId.value) return;
  store.selectGameById(selectedEditGameId.value);
}

function saveEditedTimer() {
  const trimmedTitle = editTitle.value.trim();
  if (!trimmedTitle) {
    toast.error("Add a title for the timer");
    return;
  }

  if (!localDateTime.value) {
    toast.error("Choose the date and time for the timer");
    return;
  }

  const utcDate = localToUTCDate(
    localDateTime.value,
    selectedTimezone.value.id
  );
  store.setGameTitle(trimmedTitle);
  store.setTargetDate(utcDate, selectedTimezone.value.id);
  closeDatePicker();
  toast.success("Timer updated");
}

function openManualDialog() {
  manualTitle.value = "";
  manualDateTime.value = createDefaultManualDate();
  manualTimezoneId.value = currentTz;
  showManualDialog.value = true;
}

function closeManualDialog() {
  showManualDialog.value = false;
}

function saveManualTimer() {
  const trimmedTitle = manualTitle.value.trim();
  if (!trimmedTitle) {
    toast.error("Add a title for the timer");
    return;
  }

  if (!manualDateTime.value) {
    toast.error("Choose the date and time for the timer");
    return;
  }

  const utcDate = localToUTCDate(manualDateTime.value, manualTimezoneId.value);
  store.addGame(trimmedTitle, utcDate, manualTimezoneId.value);
  showManualDialog.value = false;
  toast.success("Custom timer created");
}

async function copyShareableUrl() {
  try {
    await navigator.clipboard.writeText(store.getShareableUrl());
    toast.success("Link copied to clipboard");
  } catch {
    toast.error("Couldn't copy the link");
  }
}

function openOverlayCustomizer() {
  emit("customize");
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
      <div class="grid w-full gap-2">
        <div class="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            class="btn-muted min-w-0 justify-center px-4 py-3 text-xs"
            @click="openDatePicker"
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
            @click="openOverlayCustomizer"
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
              OBS Overlay
            </span>
          </button>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-1">
          <button
            type="button"
            class="btn-ghost px-1 py-1 text-[0.72rem]"
            @click="$emit('toggle-focus')"
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

    <div
      v-if="showDatePicker && !isObs"
      class="dialog-overlay"
      @click="closeDatePicker"
    >
      <div class="dialog-panel space-y-5" @click.stop>
        <div class="space-y-2 text-left">
          <h3 class="text-xl font-semibold text-stone-100">
            Edit current countdown
          </h3>
          <p class="text-sm text-cyan-100/55">
            Adjust the live timer using the timezone you want this countdown to follow.
          </p>
        </div>

        <div class="space-y-3">
          <label class="flex flex-col gap-2 text-sm font-medium text-cyan-50">
            Current event
            <select
              v-model="selectedEditGameId"
              class="input-field"
              @change="handleEditGameChange"
            >
              <optgroup label="Quick timers">
                <option
                  v-for="game in editableUtilityOptions"
                  :key="game.id"
                  :value="game.id"
                >
                  {{ game.title }}
                </option>
              </optgroup>
              <optgroup label="Upcoming games">
                <option
                  v-for="game in editableGameOptions"
                  :key="game.id"
                  :value="game.id"
                >
                  {{ game.title }}
                </option>
              </optgroup>
            </select>
          </label>

          <label class="flex flex-col gap-2 text-sm font-medium text-cyan-50">
            Title
            <input
              v-model="editTitle"
              type="text"
              class="input-field"
              placeholder="Enter timer title"
            />
          </label>

          <label class="flex flex-col gap-2 text-sm font-medium text-cyan-50">
            Date and time
            <input
              id="datetime-local"
              v-model="localDateTime"
              type="datetime-local"
              class="input-field"
            />
          </label>

          <label class="flex flex-col gap-2 text-sm font-medium text-cyan-50">
            Timezone
            <select
              id="timezone"
              v-model="selectedTimezone.id"
              class="input-field"
              @change="handleTimezoneChange"
            >
              <option v-for="timezone in timezones" :key="timezone.id" :value="timezone.id">
                {{ formatTimezone(timezone.id) }} - {{ timezone.name }}
              </option>
            </select>
          </label>

          <div class="border border-cyan-200/10 bg-black/15 px-4 py-3 text-sm text-cyan-100/60">
            <p class="font-mono text-xs uppercase tracking-[0.16em] text-cyan-200/70">
              Active timezone
            </p>
            <p class="mt-2 font-medium text-stone-100">{{ selectedTimezone.name }}</p>
            <p class="mt-1 text-cyan-100/50">
              Enter the time exactly as it should happen in this timezone.
            </p>
          </div>
        </div>

        <div class="flex justify-end">
          <button type="button" class="btn-accent" @click="saveEditedTimer">
            Save
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showManualDialog && !isObs"
      class="dialog-overlay"
      @click="closeManualDialog"
    >
      <div class="dialog-panel space-y-5" @click.stop>
        <div class="space-y-2 text-left">
          <h3 class="text-xl font-semibold text-stone-100">
            Create your own timer
          </h3>
          <p class="text-sm text-cyan-100/55">
            Follow the three steps below. The timer will be stored in the timezone you choose.
          </p>
        </div>

        <div class="space-y-4">
          <div class="border border-cyan-200/10 bg-black/15 px-4 py-4">
            <p class="font-mono text-xs uppercase tracking-[0.16em] text-cyan-200/70">
              Step 1
            </p>
            <label class="mt-3 flex flex-col gap-2 text-sm font-medium text-cyan-50">
              Timer title
              <input
                id="manual-title"
                v-model="manualTitle"
                type="text"
                placeholder="Friday stream starts"
                class="input-field"
              />
            </label>
          </div>

          <div class="border border-cyan-200/10 bg-black/15 px-4 py-4">
            <p class="font-mono text-xs uppercase tracking-[0.16em] text-cyan-200/70">
              Step 2
            </p>
            <label class="mt-3 flex flex-col gap-2 text-sm font-medium text-cyan-50">
              Date and time in that timezone
              <input
                id="manual-datetime"
                v-model="manualDateTime"
                type="datetime-local"
                class="input-field"
              />
            </label>
          </div>

          <div class="border border-cyan-200/10 bg-black/15 px-4 py-4">
            <p class="font-mono text-xs uppercase tracking-[0.16em] text-cyan-200/70">
              Step 3
            </p>
            <label class="mt-3 flex flex-col gap-2 text-sm font-medium text-cyan-50">
              Timezone
              <select v-model="manualTimezoneId" class="input-field">
                <option v-for="timezone in timezones" :key="timezone.id" :value="timezone.id">
                  {{ formatTimezone(timezone.id) }} - {{ timezone.name }}
                </option>
              </select>
            </label>
            <p class="mt-2 text-sm text-cyan-100/50">
              Your current timezone,
              <span class="font-medium text-stone-100">{{ manualTimezoneLabel }}</span>,
              is selected by default.
            </p>
          </div>

          <div class="border border-cyan-200/12 bg-cyan-200/[0.04] px-4 py-4">
            <p class="font-mono text-xs uppercase tracking-[0.16em] text-cyan-200/75">
              Preview
            </p>
            <p class="mt-3 text-base font-semibold text-stone-100">
              {{ manualPreviewTitle }}
            </p>
            <p class="mt-1 text-sm text-cyan-100/60">
              {{ manualPreviewSchedule }} · {{ manualTimezoneLabel }}
            </p>
            <p class="mt-3 text-sm text-cyan-100/50">
              People opening your shared link will see this converted into their own local time automatically.
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button type="button" class="btn-ghost" @click="closeManualDialog">
            Cancel
          </button>
          <button type="button" class="btn-accent" @click="saveManualTimer">
            Create timer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
