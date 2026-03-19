<script setup lang="ts">
import { computed } from "vue";

import { useTimerStore } from "../stores/timer";

const store = useTimerStore();

const timeZones = [
  { city: "Seoul", timezone: "Asia/Seoul", region: "South Korea" },
  { city: "London", timezone: "Europe/London", region: "United Kingdom" },
  { city: "New York", timezone: "America/New_York", region: "US East" },
  {
    city: "Los Angeles",
    timezone: "America/Los_Angeles",
    region: "US West",
  },
  { city: "Moscow", timezone: "Europe/Moscow", region: "Russia" },
];

const activeTimezone = computed(() => store.targetTimezone || "UTC");

const timeZonePreviews = computed(() => {
  return timeZones.map((zone) => {
    const regionalRelease = store.activeGame.regionalReleaseTimes?.find(
      (release) => release.timezone === zone.timezone
    );

    const targetDate = regionalRelease
      ? new Date(regionalRelease.date)
      : new Date(store.targetDate);

    return {
      ...zone,
      isPrimary: zone.timezone === activeTimezone.value,
      time: targetDate.toLocaleTimeString("en-US", {
        timeZone: zone.timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      date: targetDate.toLocaleDateString("en-US", {
        timeZone: zone.timezone,
        month: "short",
        day: "numeric",
      }),
    };
  });
});
</script>

<template>
  <div class="space-y-3">
    <h3 class="font-mono text-sm font-medium uppercase tracking-[0.16em] text-cyan-200/75">
      Regional times
    </h3>

    <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <div
        v-for="zone in timeZonePreviews"
        :key="zone.city"
        class="border px-3 py-3 text-left transition duration-150"
        :class="
          zone.isPrimary
            ? 'border-cyan-200/25 bg-cyan-200/[0.07]'
            : 'border-cyan-200/10 bg-[#1c1b1b]'
        "
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-mono text-sm font-semibold text-[#e5e2e1]">
              {{ zone.city }}
            </p>
            <p class="text-xs uppercase tracking-[0.12em] text-cyan-100/40">
              {{ zone.region }}
            </p>
          </div>
          <span
            v-if="zone.isPrimary"
            class="text-xs font-medium uppercase tracking-[0.12em] text-cyan-200/80"
          >
            launch
          </span>
        </div>

        <p class="mt-3 font-mono text-lg font-semibold text-[#e5e2e1]">
          {{ zone.time }}
        </p>
        <p class="text-xs text-cyan-100/45">{{ zone.date }}</p>
      </div>
    </div>
  </div>
</template>
