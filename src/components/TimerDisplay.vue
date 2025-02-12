<script setup lang="ts">
import { useTimerStore } from '../stores/timer'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import TimeZonePreview from './TimeZonePreview.vue'

const store = useTimerStore()
const showDatePicker = ref(false)

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
  showDatePicker.value = true
}

function closeDatePicker() {
  showDatePicker.value = false
}

function copyShareableUrl() {
  navigator.clipboard.writeText(store.getShareableUrl())
}

onMounted(() => {
  store.startTimer()
})

onUnmounted(() => {
  store.stopTimer()
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
        <input 
          type="datetime-local" 
          :value="store.targetDate.toISOString().slice(0, 16)"
          @input="(e) => store.setTargetDate(new Date((e.target as HTMLInputElement).value))"
          class="settings-input"
        />
        <button @click="closeDatePicker" class="close-button">Close</button>
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

.settings-input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
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