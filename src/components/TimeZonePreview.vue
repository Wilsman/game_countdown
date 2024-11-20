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
  <div class="timezone-container">
    <h2 class="timezone-title">Release Time Across the World</h2>
    <div class="timezone-grid">
      <div v-for="zone in timeZonePreviews" 
           :key="zone.city" 
           class="timezone-preview">
        <div class="timezone-flag">{{ zone.flag }}</div>
        <div class="timezone-info">
          <div class="timezone-city">{{ zone.city }}</div>
          <div class="timezone-time">{{ zone.time }}</div>
          <div class="timezone-date">{{ zone.date }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.timezone-container {
  width: 100%;
  max-width: 800px;
  margin-top: 2rem;
}

.timezone-title {
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  opacity: 0.9;
}

.timezone-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 0 1rem;
}

.timezone-preview {
  font-size: 0.875rem;
  color: var(--text-primary);
  opacity: 0.8;
  text-align: center;
  padding: 0.75rem 1.5rem;
  background-color: var(--bg-secondary);
  border-radius: 1rem;
  border: 1px solid var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.timezone-preview:hover {
  opacity: 1;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.timezone-flag {
  font-size: 1.5rem;
}

.timezone-info {
  flex: 1;
}

.timezone-city {
  font-weight: 600;
  color: var(--text-primary);
}

.timezone-time {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--primary-color);
  margin-top: 0.25rem;
}

.timezone-date {
  font-size: 0.9rem;
  opacity: 0.7;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .timezone-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
  }

  .timezone-preview {
    font-size: 0.75rem;
    padding: 0.5rem 1rem;
  }
}
</style>
