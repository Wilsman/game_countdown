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
  <div
    class="grid w-full gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
  >
    <div
      v-for="zone in timeZonePreviews"
      :key="zone.city"
      class="flex flex-col items-center gap-1 rounded-xl border border-slate-800/70 bg-slate-900/70 px-3 py-2 text-center shadow-sm shadow-slate-950/30 transition duration-150 hover:-translate-y-0.5 hover:border-sky-500/40"
    >
      <span class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        {{ zone.city }}
      </span>
      <span class="text-sm font-bold text-sky-200">{{ zone.time }}</span>
      <span class="text-[11px] font-medium text-slate-500">{{ zone.date }}</span>
    </div>
  </div>
</template>
