<script setup lang="ts">
import { computed } from "vue";

import { useTimerStore } from "../stores/timer";

type RegionalReleaseOption = {
  id: string;
  label: string;
  timezone: string;
  date: Date | string;
};

const store = useTimerStore();

const pendingGame = computed(() => store.pendingRegionalReleaseGame);
const regionalReleaseOptions = computed<RegionalReleaseOption[]>(
  () => pendingGame.value?.regionalReleaseTimes ?? [],
);

const formatRegionalDate = (regionalRelease: RegionalReleaseOption): string => {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: regionalRelease.timezone,
    month: "short",
    day: "numeric",
  }).format(new Date(regionalRelease.date));
};

const formatRegionalTime = (regionalRelease: RegionalReleaseOption): string => {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: regionalRelease.timezone,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(regionalRelease.date));
};

const formatRegionalZone = (regionalRelease: RegionalReleaseOption): string => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: regionalRelease.timezone,
    hour: "numeric",
    timeZoneName: "short",
  });

  return (
    formatter
      .formatToParts(new Date(regionalRelease.date))
      .find((part) => part.type === "timeZoneName")?.value ??
    regionalRelease.timezone
  );
};
</script>

<template>
  <div
    v-if="pendingGame"
    class="dialog-overlay"
    @click="store.cancelRegionalReleaseSelection"
  >
    <div class="dialog-panel max-w-3xl space-y-5" @click.stop>
      <div class="space-y-2 text-left">
        <h3 class="text-xl font-bold text-slate-50">Choose Launch Location</h3>
        <p class="text-sm text-slate-400">
          Pick the regional storefront time you want
          <span class="font-semibold text-slate-200">{{ pendingGame.title }}</span>
          to use.
        </p>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="regionalRelease in regionalReleaseOptions"
          :key="regionalRelease.id"
          type="button"
          class="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 text-left transition duration-150 hover:-translate-y-0.5 hover:border-sky-500/60 hover:bg-slate-900/80"
          @click="store.confirmPendingRegionalRelease(regionalRelease.id)"
        >
          <span class="block text-sm font-bold uppercase tracking-[0.2em] text-slate-200">
            {{ regionalRelease.label }}
          </span>
          <span class="mt-3 block text-lg font-black text-sky-200">
            {{ formatRegionalTime(regionalRelease) }}
          </span>
          <span class="mt-1 block text-sm font-medium text-slate-400">
            {{ formatRegionalDate(regionalRelease) }} •
            {{ formatRegionalZone(regionalRelease) }}
          </span>
        </button>
      </div>

      <div class="flex justify-end">
        <button
          type="button"
          class="btn-ghost"
          @click="store.cancelRegionalReleaseSelection"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
