<script setup lang="ts">
import { useTimerStore } from '../stores/timer'
import { computed, onMounted, onUnmounted, ref } from 'vue'
// Timezone handling using browser's Intl API
import TimeZonePreview from './TimeZonePreview.vue'

const store = useTimerStore()
const showDatePicker = ref(false)
const localDateTime = ref('')
const currentTz = Intl.DateTimeFormat().resolvedOptions().timeZone

// Initialize with a default timezone object
const selectedTimezone = ref({
  id: currentTz,
  name: ''
})

// List of timezones with their display names and IANA identifiers
const timezones = [
  // UTC-12:00
  { name: 'Baker Island Time (BIT)', id: 'Etc/GMT+12' },
  
  // UTC-11:00
  { name: 'Niue Time (NUT)', id: 'Pacific/Niue' },
  { name: 'Samoa Standard Time (SST)', id: 'Pacific/Pago_Pago' },
  
  // UTC-10:00
  { name: 'Hawaii-Aleutian Standard Time (HAST)', id: 'Pacific/Honolulu' },
  { name: 'Cook Islands Time (CKT)', id: 'Pacific/Rarotonga' },
  { name: 'Tahiti Time (TAHT)', id: 'Pacific/Tahiti' },
  
  // UTC-09:30
  { name: 'Marquesas Time (MART)', id: 'Pacific/Marquesas' },
  
  // UTC-09:00
  { name: 'Alaska Standard Time (AKST)', id: 'America/Anchorage' },
  { name: 'Gambier Islands Time (GAMT)', id: 'Pacific/Gambier' },
  
  // UTC-08:00
  { name: 'Pacific Standard Time (PST)', id: 'America/Los_Angeles' },
  { name: 'Clipperton Island Time (CIT)', id: 'Pacific/Pitcairn' },
  
  // UTC-07:00
  { name: 'Mountain Standard Time (MST)', id: 'America/Denver' },
  
  // UTC-06:00
  { name: 'Central Standard Time (CST)', id: 'America/Chicago' },
  { name: 'Galápagos Time (GALT)', id: 'Pacific/Galapagos' },
  
  // UTC-05:00
  { name: 'Eastern Standard Time (EST)', id: 'America/New_York' },
  { name: 'Cuba Standard Time (CST)', id: 'America/Havana' },
  { name: 'Colombia Time (COT)', id: 'America/Bogota' },
  { name: 'Peru Time (PET)', id: 'America/Lima' },
  { name: 'Ecuador Time (ECT)', id: 'America/Guayaquil' },
  
  // UTC-04:30
  { name: 'Venezuela Standard Time (VET)', id: 'America/Caracas' },
  
  // UTC-04:00
  { name: 'Atlantic Standard Time (AST)', id: 'America/Halifax' },
  { name: 'Bolivia Time (BOT)', id: 'America/La_Paz' },
  { name: 'Chile Standard Time (CLT)', id: 'America/Santiago' },
  
  // UTC-03:30
  { name: 'Newfoundland Standard Time (NST)', id: 'America/St_Johns' },
  
  // UTC-03:00
  { name: 'Argentina Time (ART)', id: 'America/Argentina/Buenos_Aires' },
  { name: 'Brasília Time (BRT)', id: 'America/Sao_Paulo' },
  { name: 'Uruguay Time (UYT)', id: 'America/Montevideo' },
  
  // UTC-02:00
  { name: 'South Georgia Time (GST)', id: 'Atlantic/South_Georgia' },
  
  // UTC-01:00
  { name: 'Azores Standard Time (AZOT)', id: 'Atlantic/Azores' },
  { name: 'Cape Verde Time (CVT)', id: 'Atlantic/Cape_Verde' },
  
  // UTC±00:00
  { name: 'Greenwich Mean Time (GMT)', id: 'GMT' },
  { name: 'Coordinated Universal Time (UTC)', id: 'UTC' },
  { name: 'Western European Time (WET)', id: 'Europe/Lisbon' },
  
  // UTC+01:00
  { name: 'British Summer Time (BST)', id: 'Europe/London' },
  { name: 'Central European Time (CET)', id: 'Europe/Paris' },
  { name: 'West Africa Time (WAT)', id: 'Africa/Lagos' },
  { name: 'Western European Summer Time (WEST)', id: 'Atlantic/Canary' },
  { name: 'South Africa Standard Time (SAST)', id: 'Africa/Johannesburg' },
  { name: 'Israel Standard Time (IST)', id: 'Asia/Jerusalem' },
  
  // UTC+03:00
  { name: 'Moscow Standard Time (MSK)', id: 'Europe/Moscow' },
  { name: 'Arabia Standard Time (AST)', id: 'Asia/Riyadh' },
  
  // UTC+03:30
  { name: 'Iran Standard Time (IRST)', id: 'Asia/Tehran' },
  
  // UTC+04:00
  { name: 'United Arab Emirates Standard Time (GST)', id: 'Asia/Dubai' },
  
  // UTC+04:30
  { name: 'Afghanistan Time (AFT)', id: 'Asia/Kabul' },
  
  // UTC+05:00
  { name: 'Pakistan Standard Time (PKT)', id: 'Asia/Karachi' },
  
  // UTC+05:30
  { name: 'India Standard Time (IST)', id: 'Asia/Kolkata' },
  
  // UTC+05:45
  { name: 'Nepal Time (NPT)', id: 'Asia/Kathmandu' },
  
  // UTC+06:00
  { name: 'Bangladesh Standard Time (BST)', id: 'Asia/Dhaka' },
  
  // UTC+06:30
  { name: 'Myanmar Time (MMT)', id: 'Asia/Yangon' },
  
  // UTC+07:00
  { name: 'Indochina Time (ICT)', id: 'Asia/Bangkok' },
  
  // UTC+08:00
  { name: 'China Standard Time (CST)', id: 'Asia/Shanghai' },
  { name: 'Singapore Standard Time (SGT)', id: 'Asia/Singapore' },
  
  // UTC+09:00
  { name: 'Japan Standard Time (JST)', id: 'Asia/Tokyo' },
  { name: 'Korea Standard Time (KST)', id: 'Asia/Seoul' },
  
  // UTC+09:30
  { name: 'Australian Central Standard Time (ACST)', id: 'Australia/Adelaide' },
  
  // UTC+10:00
  { name: 'Australian Eastern Standard Time (AEST)', id: 'Australia/Sydney' },
  
  // UTC+10:30
  { name: 'Lord Howe Standard Time (LHST)', id: 'Australia/Lord_Howe' },
  
  // UTC+11:00
  { name: 'Solomon Islands Time (SBT)', id: 'Pacific/Guadalcanal' },
  
  // UTC+12:00
  { name: 'New Zealand Standard Time (NZST)', id: 'Pacific/Auckland' },
  { name: 'Fiji Time (FJT)', id: 'Pacific/Fiji' },
  
  // UTC+12:45
  { name: 'Chatham Islands Time (CHAST)', id: 'Pacific/Chatham' },
  
  // UTC+13:00
  { name: 'Tonga Time (TOT)', id: 'Pacific/Tongatapu' },
  
  // UTC+14:00
  { name: 'Line Islands Time (LINT)', id: 'Pacific/Kiritimati' }
].sort((a, b) => {
  // Sort by UTC offset
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

// Initialize the selected timezone name after timezones array is defined
const currentTzName = timezones.find(tz => tz.id === currentTz)?.name || currentTz
selectedTimezone.value.name = currentTzName

// Format timezone for display
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

// Convert local date string to UTC Date
const localToUTCDate = (dateString: string, timezone: string) => {
  if (!dateString) return new Date()
  // Format: YYYY-MM-DDTHH:MM
  const [datePart, timePart] = dateString.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes] = timePart.split(':').map(Number)
  
  // Create date in the target timezone
  const localDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0))
  // Convert to UTC
  const utcDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000))
  return utcDate
}

// Format UTC date to local date string for datetime-local input
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
  } catch (e) {
    console.error('Error formatting date:', e);
    return '';
  }
}

// Initialize local date time when modal opens
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
  // Update the name in case it changed
  const tz = timezones.find(t => t.id === selectedTimezone.value.id)
  if (tz) {
    selectedTimezone.value.name = tz.name
  }
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
  selectedTimezone.value = { 
    id: tz, 
    name: tzName 
  }
  initLocalDateTime()
  showDatePicker.value = true
}

function closeDatePicker() {
  showDatePicker.value = false
}

function copyShareableUrl() {
  navigator.clipboard.writeText(store.getShareableUrl())
}

// Keep track of the original document title
const originalTitle = document.title

// Update document title with countdown, hiding days if today and hours if less than an hour
const updateDocumentTitle = () => {
  const { days, hours, minutes, seconds } = store.timeRemaining
  let timeStr = ''
  if (days > 0) {
    timeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`
  } else if (hours > 0) {
    timeStr = `${hours}h ${minutes}m ${seconds}s`
  } else {
    timeStr = `${minutes}m ${seconds}s`
  }
  document.title = `${store.gameTitle} - ${timeStr}`
}

// Use requestAnimationFrame for smoother updates
let animationFrameId: number | null = null

const updateTitle = () => {
  updateDocumentTitle()
  animationFrameId = requestAnimationFrame(updateTitle)
}

onMounted(() => {
  store.startTimer()
  // Start the animation frame loop
  animationFrameId = requestAnimationFrame(updateTitle)
})

onUnmounted(() => {
  store.stopTimer()
  // Clean up animation frame
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  // Reset title when component is unmounted
  document.title = originalTitle
})
</script>

<template>
  <div class="timer-container">
    <div class="timer-display" @click="openDatePicker">
      <div class="time-section" :class="{ 'animate-pulse': store.settings.enableAnimation }">
        <div class="time-value">{{ formattedTime.days }}</div>
        <div class="time-label">Days</div>
      </div>
      <div class="separator">:</div>
      <div class="time-section" :class="{ 'animate-pulse': store.settings.enableAnimation }">
        <div class="time-value">{{ formattedTime.hours }}</div>
        <div class="time-label">Hours</div>
      </div>
      <div class="separator">:</div>
      <div class="time-section" :class="{ 'animate-pulse': store.settings.enableAnimation }">
        <div class="time-value">{{ formattedTime.minutes }}</div>
        <div class="time-label">Minutes</div>
      </div>
      <div class="separator">:</div>
      <div class="time-section" :class="{ 'animate-pulse': store.settings.enableAnimation }">
        <div class="time-value">{{ formattedTime.seconds }}</div>
        <div class="time-label">Seconds</div>
      </div>
    </div>

    <div class="timezone-section">
      <TimeZonePreview />
      <button @click.stop="copyShareableUrl" class="share-button">
        <span>Copy Shareable URL</span>
      </button>
    </div>

    <!-- Date Picker Modal -->
    <div v-if="showDatePicker" class="modal-overlay" @click="closeDatePicker">
      <div class="modal-content" @click.stop>
        <h3>Set Target Date/Time</h3>
        <div class="form-group">
          <label for="datetime-local">Date & Time:</label>
          <input 
            id="datetime-local"
            type="datetime-local" 
            v-model="localDateTime"
            @change="handleDateChange"
            class="settings-input"
          />
        </div>
        <div class="form-group">
          <label for="timezone">Timezone:</label>
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
          <button @click="closeDatePicker" class="close-button">Save</button>
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
  gap: 1rem;
  width: 100%;
  padding: 1rem;
  text-align: center;
}

.timer-display {
  display: grid;
  grid-template-columns: repeat(7, auto);
  align-items: center;
  gap: 0.5rem;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  padding: 1rem;
  border-radius: 1rem;
  transition: transform 0.2s;
}

@media (max-width: 640px) {
  .timer-display {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }

  .separator {
    display: none;
  }

  .time-section {
    padding: 0.375rem;
    min-width: unset;
    width: 100%;
    max-width: 80px;
    margin: 0 auto;
  }

  .time-value {
    font-size: 1.25rem;
    line-height: 1;
  }

  .time-label {
    font-size: 0.625rem;
    margin-top: 0.125rem;
    letter-spacing: 0;
  }
}

.time-section {
  position: relative;
  text-align: center;
  padding: 0.75rem;
  background-color: var(--bg-primary);
  border-radius: 0.75rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: min(80px, 15vw);
}

.time-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.time-value {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-color-hover));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.time-label {
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
  font-weight: 500;
  opacity: 0.8;
  margin-top: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.separator {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 300;
  margin: 0 0.25rem;
}

.timezone-section {
  width: 100%;
  order: 2;
}

.share-button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-button:hover {
  background-color: var(--primary-color-hover);
  transform: translateY(-2px);
}

.share-button:active {
  transform: translateY(0);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: var(--bg-primary);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  width: 90%;
  max-width: 400px;
}

@media (max-width: 640px) {
  .modal-content {
    padding: 1rem;
    width: 95%;
  }
}

.modal-content h3 {
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;
  width: 100%;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.settings-input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  color: var(--text-color);
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s ease;
  margin-bottom: 1rem;
}

.close-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.close-button:hover {
  background-color: var(--primary-color-hover);
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