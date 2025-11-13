<!-- components/TimerDisplay.vue -->

<script setup lang="ts">
import { useTimerStore } from "../stores/timer";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import TimeZonePreview from "./TimeZonePreview.vue";

defineProps<{
  isFocusMode: boolean;
}>();

const store = useTimerStore();
const showDatePicker = ref(false);
const localDateTime = ref("");
const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

// Track previous values for animation triggers
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

// Manual timer modal state
const showManualDialog = ref(false);
const manualTitle = ref("");
const manualDateTime = ref("");

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
  { name: "Galápagos Time (GALT)", id: "Pacific/Galapagos" },
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
  { name: "Brasília Time (BRT)", id: "America/Sao_Paulo" },
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

const currentTzName =
  timezones.find((tz) => tz.id === currentTz)?.name || currentTz;
selectedTimezone.value.name = currentTzName;

const formatTimezone = (tz: string) => {
  try {
    const options = {
      timeZone: tz,
      timeZoneName: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    } as const;
    const formatter = new Intl.DateTimeFormat("en-US", options);
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
    const sign =
      offsetStr.startsWith("-") || offsetStr.startsWith("−") ? -1 : 1;
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
    const utcMillis = tempDate.getTime() - targetOffsetMinutes * 60 * 1000;
    return new Date(utcMillis);
  } catch (e) {
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
    const options = {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    } as const;
    const formatter = new Intl.DateTimeFormat("en-CA", options);
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

const initLocalDateTime = () => {
  localDateTime.value = formatLocalDate(
    store.targetDate,
    selectedTimezone.value.id
  );
};

const handleDateChange = () => {
  if (!localDateTime.value) return;
  const utcDate = localToUTCDate(
    localDateTime.value,
    selectedTimezone.value.id
  );
  store.setTargetDate(utcDate, selectedTimezone.value.id);
};

const handleTimezoneChange = () => {
  if (!localDateTime.value) return;
  const utcDate = localToUTCDate(
    localDateTime.value,
    selectedTimezone.value.id
  );
  store.setTargetDate(utcDate, selectedTimezone.value.id);
  const tz = timezones.find((t) => t.id === selectedTimezone.value.id);
  if (tz) selectedTimezone.value.name = tz.name;
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
    { label: "d", value: formattedTime.value.days, rawValue: store.timeRemaining.days, key: 'days' },
    { label: "h", value: formattedTime.value.hours, rawValue: store.timeRemaining.hours, key: 'hours' },
    { label: "m", value: formattedTime.value.minutes, rawValue: store.timeRemaining.minutes, key: 'minutes' },
    { label: "s", value: formattedTime.value.seconds, rawValue: store.timeRemaining.seconds, key: 'seconds' },
  ];
  
  // Find the first non-zero segment
  const firstNonZeroIndex = segments.findIndex(seg => seg.rawValue > 0);
  
  // If all are zero, show minutes and seconds
  if (firstNonZeroIndex === -1) {
    return segments.slice(2);
  }
  
  // Return from first non-zero segment onwards
  return segments.slice(firstNonZeroIndex);
});

// Watch for changes in time values and trigger animations
watch(() => store.timeRemaining, (newVal) => {
  const keys: Array<'days' | 'hours' | 'minutes' | 'seconds'> = ['days', 'hours', 'minutes', 'seconds'];
  
  keys.forEach(key => {
    if (newVal[key] !== prevValues.value[key]) {
      animatingSegments.value[key] = true;
      prevValues.value[key] = newVal[key];
      
      // Reset animation after it completes
      setTimeout(() => {
        animatingSegments.value[key] = false;
      }, 400);
    }
  });
}, { deep: true });

function openDatePicker() {
  const tz =
    store.targetTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tzName = timezones.find((t) => t.id === tz)?.name || tz;
  selectedTimezone.value = { id: tz, name: tzName };
  initLocalDateTime();
  showDatePicker.value = true;
}

function closeDatePicker() {
  showDatePicker.value = false;
}

// Manual timer handlers
function openManualDialog() {
  manualTitle.value = "";
  manualDateTime.value = formatLocalDate(new Date(), currentTz);
  showManualDialog.value = true;
}

function closeManualDialog() {
  showManualDialog.value = false;
}

function saveManualTimer() {
  if (!manualTitle.value || !manualDateTime.value) return;
  const utcDate = localToUTCDate(manualDateTime.value, currentTz);
  store.addGame(manualTitle.value, utcDate);
  showManualDialog.value = false;
}

function copyShareableUrl() {
  navigator.clipboard.writeText(store.getShareableUrl());
}

const copyObsUrl = () => {
  let obsUrl = store.getShareableUrl() + "&obs=1";
  // if "bg=1" in url replace bg=1 with "bg=0"
  if (obsUrl.includes("bg=1")) {
    obsUrl = obsUrl.replace("bg=1", "bg=0");
  }
  navigator.clipboard.writeText(obsUrl);
};

const originalTitle = document.title;

const updateDocumentTitle = () => {
  const { days, hours, minutes, seconds } = store.timeRemaining;
  let timeStr = "";
  if (days > 0) timeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  else if (hours > 0) timeStr = `${hours}h ${minutes}m ${seconds}s`;
  else timeStr = `${minutes}m ${seconds}s`;
  document.title = `${store.gameTitle} - ${timeStr}`;
};

let animationFrameId: number | null = null;
const updateTitle = () => {
  updateDocumentTitle();
  animationFrameId = requestAnimationFrame(updateTitle);
};

onMounted(() => {
  store.startTimer();
  animationFrameId = requestAnimationFrame(updateTitle);
});

onUnmounted(() => {
  store.stopTimer();
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  document.title = originalTitle;
});
</script>

<template>
  <div class="flex w-full flex-col items-center gap-6">
    <div
      class="glass-section relative w-full overflow-hidden px-6 py-8 sm:px-10"
      @click="!store.isObsMode ? openDatePicker() : null"
    >
      <div
        class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-sky-500/50 via-purple-500/30 to-emerald-400/40"
      ></div>

      <button
        v-if="store.activeGame.type === 'utility' && !store.isObsMode"
        type="button"
        class="btn-ghost absolute right-4 top-4"
        title="Restart countdown"
        aria-label="Restart countdown"
        @click.stop="store.restartCountdown(store.activeGame.id)"
      >
        <svg
          class="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9Z" />
          <path d="M21 3v6h-6" />
        </svg>
      </button>

      <div class="flex w-full items-center justify-center gap-3 sm:gap-6">
        <div
          v-for="segment in timeSegments"
          :key="segment.label"
          class="flex items-baseline gap-1 transition-all duration-300"
        >
          <span 
            class="font-black tabular-nums transition-all duration-300"
            :class="[
              store.isObsMode
                ? 'text-6xl sm:text-8xl text-cyan-100 drop-shadow-[0_0_20px_rgba(34,211,238,0.9)] obs-digit'
                : 'text-4xl sm:text-7xl text-slate-100',
              { 
                'tick-animation': animatingSegments[segment.key as keyof typeof animatingSegments],
                'urgent-pulse': store.timeRemaining.days === 0 && store.timeRemaining.hours === 0 && store.timeRemaining.minutes === 0 && store.timeRemaining.seconds <= 10 && store.timeRemaining.seconds > 0 && store.isObsMode
              }
            ]"
          >
            {{ segment.value }}
          </span>
          <span
            class="font-black uppercase transition-all duration-300"
            :class="
              store.isObsMode
                ? 'text-4xl sm:text-6xl text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.9)] obs-label'
                : 'text-2xl sm:text-4xl text-slate-400'
            "
          >
            {{ segment.label }}
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="!isFocusMode && !store.isObsMode"
      class="glass-section w-full px-5 py-6 sm:px-8"
    >
      <div class="flex flex-col gap-6">
        <TimeZonePreview />

        <div class="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            class="btn-accent"
            @click.stop="copyShareableUrl"
          >
            Copy Shareable URL
          </button>
          <button
            type="button"
            class="btn-muted min-w-[180px]"
            @click.stop="copyObsUrl"
          >
            Copy OBS Link
          </button>
          <button
            type="button"
            class="btn-muted"
            @click.stop="openManualDialog"
          >
            Manual Timer
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showDatePicker && !store.isObsMode"
      class="dialog-overlay"
      @click="closeDatePicker"
    >
      <div class="dialog-panel space-y-5" @click.stop>
        <div class="space-y-2 text-left">
          <h3 class="text-xl font-bold text-slate-50">Set Target Date/Time</h3>
          <p class="text-sm text-slate-400">
            Choose a launch time and timezone for the active countdown.
          </p>
        </div>
        <div class="space-y-3">
          <label
            class="flex flex-col gap-2 text-sm font-semibold text-slate-300"
          >
            Date &amp; Time
            <input
              id="datetime-local"
              v-model="localDateTime"
              type="datetime-local"
              class="input-field"
              @change="handleDateChange"
            />
          </label>
          <label
            class="flex flex-col gap-2 text-sm font-semibold text-slate-300"
          >
            Timezone
            <select
              id="timezone"
              v-model="selectedTimezone.id"
              class="input-field"
              @change="handleTimezoneChange"
            >
              <option v-for="tz in timezones" :key="tz.id" :value="tz.id">
                {{ formatTimezone(tz.id) }} — {{ tz.name }}
              </option>
            </select>
          </label>
        </div>
        <div class="flex justify-end">
          <button type="button" class="btn-accent" @click="closeDatePicker">
            Save
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showManualDialog && !store.isObsMode"
      class="dialog-overlay"
      @click="closeManualDialog"
    >
      <div class="dialog-panel space-y-5" @click.stop>
        <div class="space-y-2 text-left">
          <h3 class="text-xl font-bold text-slate-50">Create Manual Timer</h3>
          <p class="text-sm text-slate-400">
            Add a custom timer to your list with a unique title and time.
          </p>
        </div>
        <div class="space-y-3">
          <label
            class="flex flex-col gap-2 text-sm font-semibold text-slate-300"
          >
            Title
            <input
              id="manual-title"
              v-model="manualTitle"
              type="text"
              placeholder="Enter title"
              class="input-field"
            />
          </label>
          <label
            class="flex flex-col gap-2 text-sm font-semibold text-slate-300"
          >
            Time
            <input
              id="manual-datetime"
              v-model="manualDateTime"
              type="datetime-local"
              class="input-field"
            />
          </label>
        </div>
        <div class="flex justify-end gap-3">
          <button type="button" class="btn-ghost" @click="closeManualDialog">
            Cancel
          </button>
          <button type="button" class="btn-accent" @click="saveManualTimer">
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
