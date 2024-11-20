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

const containerStyle = computed(() => ({
  backgroundColor: store.settings.backgroundColor,
  color: store.settings.textColor,
  fontSize: `${store.settings.fontSize}px`,
  fontFamily: store.settings.fontFamily,
}))

onMounted(() => {
  store.startTimer()
})

onUnmounted(() => {
  store.stopTimer()
})
</script>

<template>
  <div class="timer-container">
    <h1 class="game-title" :style="{ fontFamily: store.settings.fontFamily }">
      {{ store.gameTitle }}
    </h1>
    <div class="timer-display" :style="containerStyle">
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
    <TimeZonePreview />
  </div>
</template>

<style scoped>
.timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 800px;
  padding: 1rem;
}

.game-title {
  font-size: 1.75rem;
  font-weight: bold;
  text-align: center;
  color: var(--text-primary);
  transition: color 0.3s ease;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timer-display {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 8px -4px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
}

.time-section {
  text-align: center;
  padding: 0.75rem;
  border-radius: 0.75rem;
  backdrop-filter: brightness(1.1);
  min-width: 70px;
}

.separator {
  font-size: 1.5rem;
  font-weight: bold;
  opacity: 0.7;
  padding: 0 0.25rem;
}

.time-value {
  font-size: 1.75rem;
  font-weight: bold;
  line-height: 1.2;
}

.time-label {
  font-size: 0.875rem;
  opacity: 0.8;
  margin-top: 0.25rem;
}

@media (min-width: 640px) {
  .timer-container {
    gap: 2rem;
    padding: 2rem;
  }

  .game-title {
    font-size: 2.5rem;
  }

  .timer-display {
    gap: 1rem;
    padding: 2rem;
    border-radius: 1.5rem;
  }

  .time-section {
    padding: 1rem;
    border-radius: 1rem;
    min-width: 100px;
  }

  .separator {
    font-size: 2rem;
    padding: 0 0.5rem;
  }

  .time-value {
    font-size: 2.5rem;
  }

  .time-label {
    font-size: 1rem;
    margin-top: 0.5rem;
  }
}
</style>