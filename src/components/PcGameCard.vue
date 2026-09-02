<script setup lang="ts">
import { ref } from "vue";
import { toast } from "vue-sonner";

import PcPlatformIcon from "./PcPlatformIcon.vue";
import type { PcGame } from "../data/pc-games";
import type { TimeRemaining } from "../types/pc-catalog";

interface PcGameCardProps {
  game: PcGame;
  view: "grid" | "list";
  countdown: TimeRemaining | null;
  isFavorite: boolean;
  hypeCount: number;
}

const props = defineProps<PcGameCardProps>();

const emit = defineEmits<{
  (e: "toggleFavorite", id: string): void;
  (e: "hype", id: string): void;
}>();

const hasImageError = ref(false);

function onImageError(): void {
  hasImageError.value = true;
}

function shareUrl(): string {
  if (typeof window === "undefined") return "";
  const base = window.location.href.split("?")[0].split("#")[0];
  return `${base}#/pc?game=${encodeURIComponent(props.game.id)}`;
}

async function copyLink(): Promise<void> {
  try {
    await navigator.clipboard.writeText(shareUrl());
    toast.info("Link copied to clipboard");
  } catch {
    toast.error("Could not copy link");
  }
}

function toggleFavorite(): void {
  emit("toggleFavorite", props.game.id);
}

function hype(): void {
  emit("hype", props.game.id);
}

function trailerUrl(): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${props.game.title} trailer`,
  )}`;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
</script>

<template>
  <article
    class="group relative overflow-hidden rounded-xl border border-[#191919] bg-[#141414] p-3 transition duration-300 hover:-translate-y-1 hover:border-[#1f1f1f] sm:p-4"
    :class="{
      'flex flex-col': view === 'grid',
      'flex flex-col gap-4 sm:flex-row sm:items-center': view === 'list',
    }"
  >
    <div
      class="relative overflow-hidden rounded-lg border border-[#191919]"
      :class="{
        'h-44 w-full sm:h-52': view === 'grid',
        'h-32 w-full shrink-0 sm:h-28 sm:w-48': view === 'list',
      }"
    >
      <img
        v-if="!hasImageError"
        :src="game.image"
        :alt="game.title"
        loading="lazy"
        class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        @error="onImageError"
      />
      <div
        v-else
        class="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#111111] to-[#1a1a1a] p-4 text-center"
      >
        <span class="text-sm font-medium text-[#f5f5f5]">{{ game.title }}</span>
      </div>

      <button
        type="button"
        class="absolute left-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-[#f5f5f5] backdrop-blur-sm transition hover:bg-black/70"
        :aria-label="`Copy link to ${game.title}`"
        @click="copyLink"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>

      <button
        type="button"
        class="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 text-[#f5f5f5] backdrop-blur-sm transition hover:bg-black/70"
        :class="{ 'text-[#fe9a00]': isFavorite, 'text-[#f5f5f5]': !isFavorite }"
        :aria-label="`Add ${game.title} to favorites`"
        @click="toggleFavorite"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
        </svg>
      </button>

      <a
        :href="trailerUrl()"
        target="_blank"
        rel="noopener noreferrer"
        class="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-black transition hover:bg-white"
      >
        Trailer
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </a>
    </div>

    <div class="flex min-w-0 flex-1 flex-col">
      <h3 class="mt-3 truncate text-base font-semibold text-[#f5f5f5] sm:text-lg">
        {{ game.title }}
      </h3>

      <dl class="mt-2 space-y-0.5 text-xs text-[#818181] sm:text-sm">
        <div v-if="game.publisher">
          <dt class="inline">Publisher: </dt>
          <dd class="inline text-[#f5f5f5]">{{ game.publisher }}</dd>
        </div>
        <div v-if="game.developer">
          <dt class="inline">Developer: </dt>
          <dd class="inline text-[#f5f5f5]">{{ game.developer }}</dd>
        </div>
        <div>
          <dt class="inline">Release Date: </dt>
          <dd class="inline text-[#f5f5f5]">{{ game.releaseDate }}</dd>
        </div>
      </dl>

      <div v-if="game.platforms.length" class="mt-3 flex flex-wrap gap-2 text-[#818181]">
        <PcPlatformIcon
          v-for="platform in game.platforms"
          :key="platform"
          :name="platform"
          class="h-5 w-5"
        />
      </div>

      <div
        v-if="countdown && game.dateType === 'exact'"
        class="mt-3 rounded-lg border border-[#191919] bg-[#111111] p-2.5"
      >
        <div class="flex justify-center gap-3 text-sm font-bold sm:text-base">
          <span class="text-[#346bf1]">{{ countdown.days }}d</span>
          <span class="text-[#f5f5f5]">{{ pad(countdown.hours) }}h</span>
          <span class="text-[#f5f5f5]">{{ pad(countdown.minutes) }}m</span>
          <span class="text-[#fb414a]">{{ pad(countdown.seconds) }}s</span>
        </div>
      </div>

      <div
        v-else-if="game.dateType === 'tba'"
        class="mt-3 rounded-lg border border-[#191919] bg-[#111111] p-2.5 text-center text-sm font-bold text-[#fe9a00]"
      >
        {{ game.releaseDate }}
      </div>

      <button
        type="button"
        class="mt-3 w-full rounded-lg border border-[#191919] bg-[#111111] p-2.5 text-center text-sm font-semibold text-[#818181] transition hover:border-[#fe9a00] hover:text-[#fe9a00]"
        :aria-label="`Hype for ${game.title}`"
        @click="hype"
      >
        Hype! {{ hypeCount }}
      </button>
    </div>
  </article>
</template>
