<script setup lang="ts">
import { useTimerStore } from '../stores/timer'
import { computed, onMounted, onUnmounted } from 'vue'
import TimeZonePreview from './TimeZonePreview.vue'

const store = useTimerStore()

const formattedTime = computed(() => {
  const { days, hours, minutes, seconds } = store.timeRemaining
  return {
    days: days.toString().padStart(2, '0'),
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0')
  }
})


onMounted(() => {
  store.startTimer()
})

onUnmounted(() => {
  store.stopTimer()
})
</script>

<template>
  <div class="timer-container">
    <div class="timer-display">
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
    </div>
  </div>
</template>

<style scoped>
.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  padding: 2rem;
  text-align: center;
}

.timer-display {
  display: grid;
  grid-template-columns: repeat(7, auto);
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem;
  border-radius: 1.5rem;
  background-color: var(--bg-secondary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  order: 1;
}

.timezone-section {
  width: 100%;
  order: 2;
}

.time-section {
  position: relative;
  text-align: center;
  padding: 1.5rem;
  background-color: var(--bg-primary);
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: min(120px, 20vw);
}

.time-section:hover {
  transform: translateY(-2px);
}

.time-value {
  font-size: clamp(1.5rem, 4vw, 3.5rem);
  font-weight: 700;
  line-height: 1;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.time-label {
  font-size: clamp(0.75rem, 2vw, 1rem);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.8;
  color: var(--text-primary);
}

.separator {
  font-size: clamp(1.5rem, 4vw, 3rem);
  font-weight: 300;
  color: var(--text-primary);
  opacity: 0.5;
  margin: 0;
  animation: pulse 1.5s infinite;
  padding-bottom: 1.5rem;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.2; }
}

@media (max-width: 768px) {
  .timer-container {
    padding: 1rem;
    gap: 1.5rem;
  }

  .timer-display {
    padding: 1rem;
    gap: 0.25rem;
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    grid-template-columns: repeat(7, auto);
    order: 1;
  }

  .timezone-section {
    order: 2;
    font-size: 0.875rem;
  }

  .timer-display::-webkit-scrollbar {
    display: none;
  }

  .time-section {
    padding: 0.75rem;
    min-width: 60px;
  }

  .separator {
    padding-bottom: 1rem;
  }
}

@media (max-width: 360px) {
  .timer-display {
    padding: 0.75rem;
  }

  .time-section {
    padding: 0.5rem;
    min-width: 50px;
  }

  .time-value {
    font-size: 1.25rem;
  }

  .time-label {
    font-size: 0.625rem;
  }

  .separator {
    font-size: 1.25rem;
    padding-bottom: 0.75rem;
  }
}
</style>