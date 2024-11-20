<script setup lang="ts">
import { useTimerStore } from '../stores/timer'
import { computed } from 'vue'

const store = useTimerStore()

// Define major time zones with their offsets and cities
const timeZones = [
  { city: 'Seoul', offset: 9, region: 'South Korea', flag: '🇰🇷' },
  { city: 'London', offset: 0, region: 'UK', flag: '🇬🇧' },
  { city: 'New York', offset: -5, region: 'US East', flag: '🇺🇸' },
  { city: 'Los Angeles', offset: -8, region: 'US West', flag: '🇺🇸' },
  { city: 'Moscow', offset: 3, region: 'Russia', flag: '🇷🇺' },
  { city: 'Tokyo', offset: 9, region: 'Japan', flag: '🇯🇵' },
]

const timeZonePreviews = computed(() => {
  return timeZones.map(zone => {
    const targetDate = new Date(store.targetDate)
    const localOffset = targetDate.getTimezoneOffset()
    const zoneOffset = zone.offset * 60
    const totalOffset = (localOffset + zoneOffset) * 60 * 1000
    
    const zoneDate = new Date(targetDate.getTime() + totalOffset)
    return {
      ...zone,
      time: zoneDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      date: zoneDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
  })
})
</script>

<template>
  <div class="timezone-grid">
    <div v-for="zone in timeZonePreviews" 
         :key="zone.city" 
         class="timezone-item">
      <div class="timezone-info">
        <div class="timezone-name">{{ zone.city }}</div>
        <div class="timezone-time">{{ zone.time }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timezone-grid {
  display: grid;
  gap: 0.5rem;
  width: 100%;
  margin: 0 auto;
}

.timezone-item {
  background-color: var(--bg-secondary);
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  transition: transform 0.2s ease;
}

.timezone-item:hover {
  transform: translateY(-1px);
}

.timezone-info {
  text-align: center;
}

.timezone-name {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-bottom: 0.125rem;
}

.timezone-time {
  font-weight: 500;
  font-size: 0.875rem;
}

@media (min-width: 768px) {
  .timezone-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
  }

  .timezone-item {
    padding: 0.75rem;
  }

  .timezone-name {
    font-size: 0.875rem;
  }

  .timezone-time {
    font-size: 1rem;
  }
}

@media (max-width: 767px) {
  .timezone-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.25rem;
  }

  .timezone-item {
    padding: 0.25rem;
  }

  .timezone-name {
    font-size: 0.625rem;
  }

  .timezone-time {
    font-size: 0.75rem;
  }
}

@media (max-width: 360px) {
  .timezone-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
