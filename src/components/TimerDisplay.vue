<!-- components/TimerDisplay.vue -->

<script setup lang="ts">
import { useTimerStore } from '../stores/timer'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import TimeZonePreview from './TimeZonePreview.vue'

defineProps<{
  isFocusMode: boolean
}>()

const store = useTimerStore()
const showDatePicker = ref(false)
const localDateTime = ref('')
const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone

const selectedTimezone = ref({
  id: currentTz,
  name: ''
})

const timezones = [
  { name: 'Baker Island Time (BIT)', id: 'Etc/GMT+12' },
  { name: 'Niue Time (NUT)', id: 'Pacific/Niue' },
  { name: 'Samoa Standard Time (SST)', id: 'Pacific/Pago_Pago' },
  { name: 'Hawaii-Aleutian Standard Time (HAST)', id: 'Pacific/Honolulu' },
  { name: 'Cook Islands Time (CKT)', id: 'Pacific/Rarotonga' },
  { name: 'Tahiti Time (TAHT)', id: 'Pacific/Tahiti' },
  { name: 'Marquesas Time (MART)', id: 'Pacific/Marquesas' },
  { name: 'Alaska Standard Time (AKST)', id: 'America/Anchorage' },
  { name: 'Gambier Islands Time (GAMT)', id: 'Pacific/Gambier' },
  { name: 'Pacific Standard Time (PST)', id: 'America/Los_Angeles' },
  { name: 'Clipperton Island Time (CIT)', id: 'Pacific/Pitcairn' },
  { name: 'Mountain Standard Time (MST)', id: 'America/Denver' },
  { name: 'Central Standard Time (CST)', id: 'America/Chicago' },
  { name: 'Galápagos Time (GALT)', id: 'Pacific/Galapagos' },
  { name: 'Eastern Standard Time (EST)', id: 'America/New_York' },
  { name: 'Cuba Standard Time (CST)', id: 'America/Havana' },
  { name: 'Colombia Time (COT)', id: 'America/Bogota' },
  { name: 'Peru Time (PET)', id: 'America/Lima' },
  { name: 'Ecuador Time (ECT)', id: 'America/Guayaquil' },
  { name: 'Venezuela Standard Time (VET)', id: 'America/Caracas' },
  { name: 'Atlantic Standard Time (AST)', id: 'America/Halifax' },
  { name: 'Bolivia Time (BOT)', id: 'America/La_Paz' },
  { name: 'Chile Standard Time (CLT)', id: 'America/Santiago' },
  { name: 'Newfoundland Standard Time (NST)', id: 'America/St_Johns' },
  { name: 'Argentina Time (ART)', id: 'America/Argentina/Buenos_Aires' },
  { name: 'Brasília Time (BRT)', id: 'America/Sao_Paulo' },
  { name: 'Uruguay Time (UYT)', id: 'America/Montevideo' },
  { name: 'South Georgia Time (GST)', id: 'Atlantic/South_Georgia' },
  { name: 'Azores Standard Time (AZOT)', id: 'Atlantic/Azores' },
  { name: 'Cape Verde Time (CVT)', id: 'Atlantic/Cape_Verde' },
  { name: 'Greenwich Mean Time (GMT)', id: 'GMT' },
  { name: 'Coordinated Universal Time (UTC)', id: 'UTC' },
  { name: 'Western European Time (WET)', id: 'Europe/Lisbon' },
  { name: 'British Summer Time (BST)', id: 'Europe/London' },
  { name: 'Central European Time (CET)', id: 'Europe/Paris' },
  { name: 'West Africa Time (WAT)', id: 'Africa/Lagos' },
  { name: 'Western European Summer Time (WEST)', id: 'Atlantic/Canary' },
  { name: 'South Africa Standard Time (SAST)', id: 'Africa/Johannesburg' },
  { name: 'Israel Standard Time (IST)', id: 'Asia/Jerusalem' },
  { name: 'Moscow Standard Time (MSK)', id: 'Europe/Moscow' },
  { name: 'Arabia Standard Time (AST)', id: 'Asia/Riyadh' },
  { name: 'Iran Standard Time (IRST)', id: 'Asia/Tehran' },
  { name: 'United Arab Emirates Standard Time (GST)', id: 'Asia/Dubai' },
  { name: 'Afghanistan Time (AFT)', id: 'Asia/Kabul' },
  { name: 'Pakistan Standard Time (PKT)', id: 'Asia/Karachi' },
  { name: 'India Standard Time (IST)', id: 'Asia/Kolkata' },
  { name: 'Nepal Time (NPT)', id: 'Asia/Kathmandu' },
  { name: 'Bangladesh Standard Time (BST)', id: 'Asia/Dhaka' },
  { name: 'Myanmar Time (MMT)', id: 'Asia/Yangon' },
  { name: 'Indochina Time (ICT)', id: 'Asia/Bangkok' },
  { name: 'China Standard Time (CST)', id: 'Asia/Shanghai' },
  { name: 'Singapore Standard Time (SGT)', id: 'Asia/Singapore' },
  { name: 'Japan Standard Time (JST)', id: 'Asia/Tokyo' },
  { name: 'Korea Standard Time (KST)', id: 'Asia/Seoul' },
  { name: 'Australian Central Standard Time (ACST)', id: 'Australia/Adelaide' },
  { name: 'Australian Eastern Standard Time (AEST)', id: 'Australia/Sydney' },
  { name: 'Lord Howe Standard Time (LHST)', id: 'Australia/Lord_Howe' },
  { name: 'Solomon Islands Time (SBT)', id: 'Pacific/Guadalcanal' },
  { name: 'New Zealand Standard Time (NZST)', id: 'Pacific/Auckland' },
  { name: 'Fiji Time (FJT)', id: 'Pacific/Fiji' },
  { name: 'Chatham Islands Time (CHAST)', id: 'Pacific/Chatham' },
  { name: 'Tonga Time (TOT)', id: 'Pacific/Tongatapu' },
  { name: 'Line Islands Time (LINT)', id: 'Pacific/Kiritimati' }
].sort((a, b) => {
  const getOffset = (tz: string) => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'short',
        hour: '2-digit',
        hour12: false
      });
      const parts = formatter.formatToParts(new Date());
      const tzPart = parts.find(part => part.type === 'timeZoneName')?.value || '';
      const offsetStr = tzPart.replace(/^[^\d+-]+/, '');
      return parseInt(offsetStr) || 0;
    } catch {
      return 0;
    }
  };
  return getOffset(a.id) - getOffset(b.id);
})

const currentTzName = timezones.find(tz => tz.id === currentTz)?.name || currentTz
selectedTimezone.value.name = currentTzName

const formatTimezone = (tz: string) => {
  try {
    const options = {
      timeZone: tz,
      timeZoneName: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    } as const;
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(new Date());
    const tzName = tz.split('/').pop()?.replace('_', ' ') || tz;
    const tzPart = parts.find(part => part.type === 'timeZoneName');
    const tzOffset = tzPart ? tzPart.value : '';
    return `(${tzOffset}) ${tzName}`;
  } catch {
    return tz;
  }
}

const getOffsetMinutes = (timeZone: string, date: Date) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset',
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    if (!tzPart) return 0;
    const offsetStr = tzPart.value.replace('GMT', '');
    const sign = offsetStr.startsWith('-') || offsetStr.startsWith('−') ? -1 : 1;
    const [hours, minutes] = offsetStr.substring(1).split(':').map(Number);
    return (hours * 60 + (minutes || 0)) * sign;
  } catch {
    return new Date().getTimezoneOffset();
  }
};

const localToUTCDate = (dateString: string, timezone: string): Date => {
  if (!dateString) return new Date()
  const [datePart, timePart] = dateString.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes] = timePart.split(':').map(Number)
  try {
    const tempDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    const targetOffsetMinutes = getOffsetMinutes(timezone, tempDate);
    const utcMillis = tempDate.getTime() - targetOffsetMinutes * 60 * 1000;
    return new Date(utcMillis);
  } catch (e) {
    const localDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0))
    return new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000))
  }
}

const formatLocalDate = (date: Date, timezone: string) => {
  if (!date) return ''
  try {
    const options = {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    } as const;
    const formatter = new Intl.DateTimeFormat('en-CA', options);
    const parts = formatter.formatToParts(date);
    const year = parts.find(p => p.type === 'year')?.value.padStart(4, '0');
    const month = parts.find(p => p.type === 'month')?.value.padStart(2, '0');
    const day = parts.find(p => p.type === 'day')?.value.padStart(2, '0');
    const hour = parts.find(p => p.type === 'hour')?.value.padStart(2, '0');
    const minute = parts.find(p => p.type === 'minute')?.value.padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minute}`;
  } catch {
    return '';
  }
}

const initLocalDateTime = () => {
  localDateTime.value = formatLocalDate(store.targetDate, selectedTimezone.value.id)
}

const handleDateChange = () => {
  if (!localDateTime.value) return
  const utcDate = localToUTCDate(localDateTime.value, selectedTimezone.value.id)
  store.setTargetDate(utcDate, selectedTimezone.value.id)
}

const handleTimezoneChange = () => {
  if (!localDateTime.value) return
  const utcDate = localToUTCDate(localDateTime.value, selectedTimezone.value.id)
  store.setTargetDate(utcDate, selectedTimezone.value.id)
  const tz = timezones.find(t => t.id === selectedTimezone.value.id)
  if (tz) selectedTimezone.value.name = tz.name
}

const formattedTime = computed(() => {
  const { days, hours, minutes, seconds } = store.timeRemaining
  return {
    days: days.toString().padStart(2, '0'),
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0')
  }
})

function openDatePicker() {
  const tz = store.targetTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  const tzName = timezones.find(t => t.id === tz)?.name || tz
  selectedTimezone.value = { id: tz, name: tzName }
  initLocalDateTime()
  showDatePicker.value = true
}

function closeDatePicker() {
  showDatePicker.value = false
}

function copyShareableUrl() {
  navigator.clipboard.writeText(store.getShareableUrl())
}

const copyObsUrl = () => {
  const obsUrl = store.getShareableUrl() + '&obs=1'
  navigator.clipboard.writeText(obsUrl)
}

const originalTitle = document.title

const updateDocumentTitle = () => {
  const { days, hours, minutes, seconds } = store.timeRemaining
  let timeStr = ''
  if (days > 0) timeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`
  else if (hours > 0) timeStr = `${hours}h ${minutes}m ${seconds}s`
  else timeStr = `${minutes}m ${seconds}s`
  document.title = `${store.gameTitle} - ${timeStr}`
}

let animationFrameId: number | null = null
const updateTitle = () => {
  updateDocumentTitle()
  animationFrameId = requestAnimationFrame(updateTitle)
}

onMounted(() => {
  store.startTimer()
  animationFrameId = requestAnimationFrame(updateTitle)
})

onUnmounted(() => {
  store.stopTimer()
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  document.title = originalTitle
})
</script>

<template>
  <div class="timer-container">
    <div class="timer-display-wrapper">
      <div class="timer-display surface-3d hover-scale" @click="!store.isObsMode ? openDatePicker : null">
        <div class="time-section" :class="{ 'animate-pulse': store.settings.enableAnimation }">
          <div class="time-value gradient-text">{{ formattedTime.days }}</div>
          <div class="time-label">Days</div>
        </div>
        <div class="separator">:</div>
        <div class="time-section" :class="{ 'animate-pulse': store.settings.enableAnimation }">
          <div class="time-value gradient-text">{{ formattedTime.hours }}</div>
          <div class="time-label">Hours</div>
        </div>
        <div class="separator">:</div>
        <div class="time-section" :class="{ 'animate-pulse': store.settings.enableAnimation }">
          <div class="time-value gradient-text">{{ formattedTime.minutes }}</div>
          <div class="time-label">Minutes</div>
        </div>
        <div class="separator">:</div>
        <div class="time-section" :class="{ 'animate-pulse': store.settings.enableAnimation }">
          <div class="time-value gradient-text">{{ formattedTime.seconds }}</div>
          <div class="time-label">Seconds</div>
        </div>
      </div>

      <button
        v-if="store.activeGame.type === 'utility' && !store.isObsMode"
        @click.stop="store.restartCountdown(store.activeGame.id)"
        class="restart-button soft-btn"
        title="Restart countdown"
        aria-label="Restart countdown"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="restart-icon">
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C15.0711 3 17.75 4.60718 19.25 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M19 8V3H14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>

    <div v-if="!isFocusMode && !store.isObsMode" class="timezone-section">
      <TimeZonePreview />
      <button @click.stop="copyShareableUrl" class="share-button soft-btn-strong">
        <span>Copy Shareable URL</span>
      </button>
      <button @click.stop="copyObsUrl" class="obs-button soft-btn-strong">
        <span>Copy OBS Link</span>
      </button>
    </div>



    <!-- Date Picker Modal -->
    <div v-if="showDatePicker && !store.isObsMode" class="modal-overlay" @click="closeDatePicker">
      <div class="modal-content surface-3d strong" @click.stop>
        <h3 class="modal-title">Set Target Date/Time</h3>
        <div class="form-group">
          <label for="datetime-local">Date & Time</label>
          <input
            id="datetime-local"
            type="datetime-local"
            v-model="localDateTime"
            @change="handleDateChange"
            class="settings-input"
          />
        </div>
        <div class="form-group">
          <label for="timezone">Timezone</label>
          <select
            id="timezone"
            v-model="selectedTimezone.id"
            @change="handleTimezoneChange"
            class="settings-input"
          >
            <option
              v-for="tz in timezones"
              :key="tz.id"
              :value="tz.id"
            >
              {{ formatTimezone(tz.id) }} - {{ tz.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <button @click="closeDatePicker" class="close-button soft-btn-strong">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  height: 100%;
  width: 100%;
  padding: 0 0.5rem 0.5rem;
}

.timer-display-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.surface-3d {
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border: 1px solid var(--border-color);
  box-shadow:
    0 18px 60px rgba(0,0,0,0.45),
    inset 0 1px 0 rgba(255,255,255,0.03),
    inset 0 -1px 0 rgba(0,0,0,0.25);
  border-radius: 18px;
}

.strong {
  box-shadow:
    0 24px 80px rgba(0,0,0,0.55),
    inset 0 1px 0 rgba(255,255,255,0.04),
    inset 0 -1px 0 rgba(0,0,0,0.35);
}

.hover-scale { transition: transform 0.2s ease; }
.hover-scale:hover { transform: translateY(-1px); }

.soft-btn, .soft-btn-strong {
  background: linear-gradient(180deg, rgba(34,211,238,0.16), rgba(6,182,212,0.12));
  color: var(--text-primary);
  border: 1px solid rgba(34,211,238,0.28);
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.25px;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 8px 26px rgba(6,182,212,0.18);
}
.soft-btn:hover, .soft-btn-strong:hover {
  transform: translateY(-1px);
  background: linear-gradient(180deg, rgba(34,211,238,0.24), rgba(6,182,212,0.16));
  border-color: rgba(34,211,238,0.45);
  box-shadow: 0 14px 34px rgba(6,182,212,0.25);
}
.soft-btn:active, .soft-btn-strong:active { transform: translateY(0); }

.soft-btn-strong {
  padding: 12px 16px;
  border-radius: 14px;
}

.restart-button {
  margin-left: 0.75rem;
  color: var(--text-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.restart-button svg { width: 22px; height: 22px; }

.timer-display {
  display: grid;
  grid-template-columns: repeat(7, auto);
  align-items: center;
  gap: 0.65rem;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  padding: 0.85rem 1rem;
  border-radius: 1.1rem;
}

@media (max-width: 640px) {
  .timer-display {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }
  .separator { display: none; }
  .time-section {
    padding: 0.5rem;
    min-width: unset;
    width: 100%;
    max-width: 92px;
    margin: 0 auto;
  }
  .time-value { font-size: 1.35rem; line-height: 1; }
  .time-label { font-size: 0.625rem; margin-top: 0.15rem; letter-spacing: 0.06em; }
}

.time-section {
  position: relative;
  text-align: center;
  padding: 0.75rem 0.85rem;
  background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border-radius: 0.9rem;
  border: 1px solid var(--border-color);
  transition: all 0.25s ease;
  min-width: min(92px, 18vw);
}
.time-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(0,0,0,0.35);
}

.gradient-text {
  background: linear-gradient(135deg, var(--accent-200), var(--accent-400));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.time-value {
  font-size: clamp(1.6rem, 4.6vw, var(--timer-font-size, 2.8rem));
  font-weight: 800;
  line-height: 1.1;
  font-family: Inter, ui-sans-serif, system-ui;
}

.time-label {
  font-size: clamp(0.72rem, 1.5vw, 0.8rem);
  font-weight: 600;
  color: var(--text-300);
  margin-top: 0.28rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.separator {
  font-size: clamp(1.65rem, 4.6vw, 2.8rem);
  font-weight: 500;
  color: var(--text-300);
  margin: 0 0.1rem;
}

.timezone-section {
  width: 100%;
  display: flex;
  gap: 10px;
  margin-top: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.share-button { min-width: 220px; }

.obs-button {
  min-width: 140px;
}

.obs-exit-section {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.obs-exit-button {
  min-width: 180px;
  background: linear-gradient(180deg, rgba(239,68,68,0.16), rgba(220,38,38,0.12));
  border: 1px solid rgba(239,68,68,0.28);
  box-shadow: 0 8px 26px rgba(220,38,38,0.18);
}

.obs-exit-button:hover {
  background: linear-gradient(180deg, rgba(239,68,68,0.24), rgba(220,38,38,0.16));
  border-color: rgba(239,68,68,0.45);
  box-shadow: 0 14px 34px rgba(220,38,38,0.25);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(6,6,6,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}

.modal-content {
  background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015));
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 1.25rem;
  width: 92%;
  max-width: 420px;
}

@media (max-width: 640px) {
  .modal-content { padding: 1rem; width: 94%; }
}

.modal-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.form-group {
  margin-bottom: 0.85rem;
  text-align: left;
  width: 100%;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 700;
  font-size: 0.8rem;
  color: var(--text-200);
}

.settings-input {
  width: 100%;
  padding: 0.75rem 0.8rem;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-input);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.2s ease;
  outline: none;
}
.settings-input:focus {
  border-color: rgba(34,211,238,0.45);
  box-shadow: 0 0 0 4px rgba(6,182,212,0.15);
}

.close-button {
  width: 100%;
  padding: 0.85rem 1.25rem;
  border: 0;
  border-radius: 12px;
  font-weight: 800;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>