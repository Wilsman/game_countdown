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
  () => pendingGame.value?.regionalReleaseTimes ?? []
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
        <h3 class="font-mono text-xl font-semibold uppercase tracking-[0.14em] text-[#e5e2e1]">
          Choose launch location
        </h3>
        <p class="text-sm text-cyan-100/55">
          Pick the regional storefront time you want
          <span class="font-semibold text-cyan-50">{{ pendingGame.title }}</span>
          to use.
        </p>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <button
          v-for="regionalRelease in regionalReleaseOptions"
          :key="regionalRelease.id"
          type="button"
          class="border border-cyan-200/12 bg-[#1c1b1b] p-4 text-left transition duration-150 hover:border-cyan-200/28 hover:bg-[#201f1f]"
          @click="store.confirmPendingRegionalRelease(regionalRelease.id)"
        >
          <span class="block font-mono text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200/75">
            {{ regionalRelease.label }}
          </span>
          <span class="mt-3 block font-mono text-lg font-semibold text-[#e5e2e1]">
            {{ formatRegionalTime(regionalRelease) }}
          </span>
          <span class="mt-1 block text-sm font-medium text-cyan-100/50">
            {{ formatRegionalDate(regionalRelease) }} ·
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
