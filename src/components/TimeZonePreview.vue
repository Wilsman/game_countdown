<script setup lang="ts">
import { useTimerStore } from '../stores/timer'
import { computed } from 'vue'

const store = useTimerStore()

// Define major time zones with their IANA timezone identifiers
const timeZones = [
  { city: 'Seoul', timezone: 'Asia/Seoul', region: 'South Korea', flag: '🇰🇷' },
  { city: 'London', timezone: 'Europe/London', region: 'UK', flag: '🇬🇧' },
  { city: 'New York', timezone: 'America/New_York', region: 'US East', flag: '🇺🇸' },
  { city: 'Los Angeles', timezone: 'America/Los_Angeles', region: 'US West', flag: '🇺🇸' },
  { city: 'Moscow', timezone: 'Europe/Moscow', region: 'Russia', flag: '🇷🇺' },
  { city: 'Tokyo', timezone: 'Asia/Tokyo', region: 'Japan', flag: '🇯🇵' },
]

const timeZonePreviews = computed(() => {
  return timeZones.map(zone => {
    const targetDate = new Date(store.targetDate)
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      timeZone: zone.timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }
    
    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone: zone.timezone,
      month: 'short',
      day: 'numeric'
    }
    
    return {
      ...zone,
      time: targetDate.toLocaleTimeString('en-US', timeOptions as any),
      date: targetDate.toLocaleDateString('en-US', dateOptions as any)
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
  color: var(--primary-color);
  transition: color 0.2s ease;
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
