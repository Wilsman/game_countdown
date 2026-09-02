<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { fetchIgdbReleases, type IgdbRelease } from "../lib/igdb";
import { useTimerStore } from "../stores/timer";

const INITIAL_VISIBLE_COUNT = 12;
const LOAD_MORE_COUNT = 12;
const DAY_MS = 24 * 60 * 60 * 1000;
type ReleaseSort = "soonest" | "hype" | "hype-soon";

const store = useTimerStore();
const today = startOfUtcDay(new Date());
const displayedMonth = ref(startOfUtcMonth(today));
const releases = ref<IgdbRelease[]>([]);
const loading = ref(true);
const errorMessage = ref("");
const truncated = ref(false);
const visibleCount = ref(INITIAL_VISIBLE_COUNT);
const searchQuery = ref("");
const activeSearch = ref("");
const releaseSort = ref<ReleaseSort>("hype-soon");
const searchFocused = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
const loadMoreSentinel = ref<HTMLElement | null>(null);

let activeRequest: AbortController | null = null;
let searchDebounce: ReturnType<typeof setTimeout> | null = null;
let loadMoreObserver: IntersectionObserver | null = null;

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function toUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const currentMonth = startOfUtcMonth(today);
const canGoPrevious = computed(
  () => displayedMonth.value.getTime() > currentMonth.getTime(),
);

const monthLabel = computed(() =>
  new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(displayedMonth.value),
);

function daysUntilRelease(release: IgdbRelease): number {
  const releaseDay = startOfUtcDay(new Date(release.releaseAt));
  return Math.max(0, Math.round((releaseDay.getTime() - today.getTime()) / DAY_MS));
}

function hypeSoonScore(release: IgdbRelease): number {
  return release.hypes / Math.sqrt(daysUntilRelease(release) + 1);
}

const orderedReleases = computed(() =>
  [...releases.value].sort((left, right) => {
    if (releaseSort.value === "hype") {
      const hypeOrder = right.hypes - left.hypes;
      if (hypeOrder !== 0) return hypeOrder;
    }

    if (releaseSort.value === "hype-soon") {
      const scoreOrder = hypeSoonScore(right) - hypeSoonScore(left);
      if (scoreOrder !== 0) return scoreOrder;
      const hypeOrder = right.hypes - left.hypes;
      if (hypeOrder !== 0) return hypeOrder;
    }

    const dateOrder = left.releaseAt.localeCompare(right.releaseAt);
    if (dateOrder !== 0) return dateOrder;
    if (left.hypes !== right.hypes) return right.hypes - left.hypes;
    return left.name.localeCompare(right.name);
  }),
);

const searchSuggestions = computed(() => orderedReleases.value.slice(0, 6));

const visibleReleases = computed(() =>
  orderedReleases.value.slice(0, visibleCount.value),
);

const hasMore = computed(() => visibleCount.value < orderedReleases.value.length);

function releaseTimerId(release: IgdbRelease): string {
  return `igdb-${release.gameId}-${release.releaseAt.slice(0, 10)}`;
}

function isSelected(release: IgdbRelease): boolean {
  return store.activeGame?.id === releaseTimerId(release);
}

function formatReleaseDate(release: IgdbRelease): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(release.releaseAt));
}

function formatDaysUntil(release: IgdbRelease): string {
  const releaseDay = startOfUtcDay(new Date(release.releaseAt));
  const days = Math.round((releaseDay.getTime() - today.getTime()) / DAY_MS);
  if (days < 0) return "Released";
  if (days === 0) return "Out today";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}

function artworkUrl(release: IgdbRelease): string | null {
  return release.heroUrl ?? release.coverUrl;
}

function shiftMonth(direction: -1 | 1): void {
  if (direction === -1 && !canGoPrevious.value) return;
  displayedMonth.value = new Date(
    Date.UTC(
      displayedMonth.value.getUTCFullYear(),
      displayedMonth.value.getUTCMonth() + direction,
      1,
    ),
  );
}

function jumpToCurrentMonth(): void {
  displayedMonth.value = new Date(currentMonth);
}

function showMore(): void {
  visibleCount.value += LOAD_MORE_COUNT;
}

function chooseSearchSuggestion(name: string): void {
  searchQuery.value = name;
  searchInput.value?.blur();
}

function selectRelease(release: IgdbRelease): void {
  const releaseDate = new Date(release.releaseAt);
  if (Number.isNaN(releaseDate.getTime())) return;

  store.addCustomTimer(
    release.name,
    releaseDate,
    "UTC",
    releaseTimerId(release),
  );
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function hideBrokenImage(event: Event): void {
  const image = event.currentTarget;
  if (image instanceof HTMLImageElement) image.hidden = true;
}

async function loadReleases(search = searchQuery.value.trim()): Promise<void> {
  activeRequest?.abort();
  activeRequest = new AbortController();
  loading.value = true;
  errorMessage.value = "";
  visibleCount.value = INITIAL_VISIBLE_COUNT;
  activeSearch.value = search;

  const monthStart = displayedMonth.value;
  const nextMonth = new Date(
    Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1),
  );
  const rangeStart = monthStart.getTime() === currentMonth.getTime()
    ? today
    : monthStart;

  try {
    const response = await fetchIgdbReleases(
      toUtcDateKey(rangeStart),
      toUtcDateKey(nextMonth),
      activeRequest.signal,
      search,
    );
    releases.value = response.releases;
    truncated.value = response.truncated;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    releases.value = [];
    errorMessage.value = error instanceof Error
      ? error.message
      : "Unable to load upcoming releases";
  } finally {
    if (!activeRequest.signal.aborted) loading.value = false;
  }
}

watch(displayedMonth, () => loadReleases(), { immediate: true });

watch(searchQuery, (value) => {
  if (searchDebounce) clearTimeout(searchDebounce);
  const search = value.trim();

  if (!search) {
    loadReleases("");
    return;
  }

  if (search.length < 2) return;
  searchDebounce = setTimeout(() => loadReleases(search), 260);
});

watch(loadMoreSentinel, (current, previous) => {
  if (previous) loadMoreObserver?.unobserve(previous);
  if (current) loadMoreObserver?.observe(current);
}, { flush: "post" });

onMounted(() => {
  loadMoreObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting && hasMore.value && !loading.value) showMore();
    },
    { rootMargin: "400px 0px" },
  );

  if (loadMoreSentinel.value) loadMoreObserver.observe(loadMoreSentinel.value);
});

onBeforeUnmount(() => {
  activeRequest?.abort();
  if (searchDebounce) clearTimeout(searchDebounce);
  loadMoreObserver?.disconnect();
});
</script>

<template>
  <section class="release-browser glass-section mt-10 w-full overflow-hidden">
    <header class="release-header">
      <div class="release-header-copy">
        <div class="release-eyebrow">
          <span class="release-live-dot" aria-hidden="true"></span>
          IGDB release feed
        </div>
        <div class="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 class="release-heading">{{ activeSearch ? "Search results" : monthLabel }}</h2>
          <span v-if="!loading && !errorMessage" class="release-count">
            {{ orderedReleases.length }} upcoming PC
            {{ orderedReleases.length === 1 ? "release" : "releases" }}
          </span>
        </div>
        <p class="release-subtitle">
          {{ activeSearch
            ? `Matches for “${activeSearch}” across all upcoming months.`
            : "Exact release day from IGDB. Storefront launch times can vary by region." }}
        </p>
      </div>

      <div class="release-search-wrap">
        <label class="sr-only" for="igdb-release-search">Search PC releases</label>
        <div class="release-search-box">
          <span class="release-search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
          </span>
          <input
            id="igdb-release-search"
            ref="searchInput"
            v-model="searchQuery"
            type="search"
            autocomplete="off"
            placeholder="Search all upcoming PC releases…"
            aria-autocomplete="list"
            :aria-expanded="searchFocused && searchQuery.trim().length >= 2 && searchSuggestions.length > 0"
            :aria-busy="loading && searchQuery.trim().length >= 2"
            aria-controls="igdb-release-suggestions"
            @focus="searchFocused = true"
            @blur="searchFocused = false"
          />
          <span
            v-if="loading && searchQuery.trim().length >= 2"
            class="release-search-spinner"
            aria-hidden="true"
          ></span>
          <button
            v-if="searchQuery"
            type="button"
            class="release-search-clear"
            aria-label="Clear release search"
            @click="searchQuery = ''"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m7 7 10 10M17 7 7 17" />
            </svg>
          </button>
        </div>
        <div
          v-if="searchFocused && searchQuery.trim().length >= 2 && searchSuggestions.length > 0 && !loading"
          id="igdb-release-suggestions"
          class="release-suggestions"
          role="listbox"
        >
            <div class="release-suggestions-header" aria-hidden="true">
              <span>Top matches</span>
              <span>{{ orderedReleases.length }} found</span>
            </div>
            <button
              v-for="suggestion in searchSuggestions"
              :key="`${suggestion.gameId}-${suggestion.releaseAt}`"
              type="button"
              role="option"
              class="release-suggestion"
              @mousedown.prevent
              @click="chooseSearchSuggestion(suggestion.name)"
            >
              <span class="release-suggestion-artwork">
                <span aria-hidden="true">{{ suggestion.name.slice(0, 2).toUpperCase() }}</span>
                <img
                  v-if="artworkUrl(suggestion)"
                  :src="artworkUrl(suggestion) ?? undefined"
                  alt=""
                  loading="lazy"
                  @error="hideBrokenImage"
                />
              </span>
              <span class="release-suggestion-copy">
                <span class="release-suggestion-name">{{ suggestion.name }}</span>
                <span class="release-suggestion-platform">PC release</span>
              </span>
              <span class="release-suggestion-date">{{ formatReleaseDate(suggestion) }}</span>
              <svg class="release-suggestion-arrow" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
        </div>
        <div class="release-sort-bar">
          <div class="release-sort-heading">
            <span class="release-sort-label">Sort by</span>
            <span class="release-sort-hint">Prioritize what matters most</span>
          </div>
          <div class="release-sort-options" role="group" aria-label="Sort release cards by">
            <button
              type="button"
              class="release-sort-button"
              :class="{ 'release-sort-button-active': releaseSort === 'soonest' }"
              :aria-pressed="releaseSort === 'soonest'"
              @click="releaseSort = 'soonest'"
            >
              Soonest first
            </button>
            <button
              type="button"
              class="release-sort-button"
              :class="{ 'release-sort-button-active': releaseSort === 'hype' }"
              :aria-pressed="releaseSort === 'hype'"
              @click="releaseSort = 'hype'"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m12 3 2.3 4.7 5.2.8-3.8 3.7.9 5.2-4.6-2.5-4.6 2.5.9-5.2-3.8-3.7 5.2-.8L12 3Z" />
              </svg>
              Most hyped
            </button>
            <button
              type="button"
              class="release-sort-button"
              :class="{ 'release-sort-button-active': releaseSort === 'hype-soon' }"
              :aria-pressed="releaseSort === 'hype-soon'"
              title="Prioritises highly hyped games with nearer release dates"
              @click="releaseSort = 'hype-soon'"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M13 2 5.5 13h5L9 22l7.5-12h-5L13 2Z" />
              </svg>
              Hype + soon
            </button>
          </div>
        </div>
      </div>

      <nav class="release-nav" aria-label="Release month">
        <button
          type="button"
          class="release-nav-button"
          :disabled="!canGoPrevious"
          aria-label="Previous month"
          @click="shiftMonth(-1)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button type="button" class="release-today-button" @click="jumpToCurrentMonth">
          This month
        </button>
        <button
          type="button"
          class="release-nav-button"
          aria-label="Next month"
          @click="shiftMonth(1)"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </nav>
    </header>

    <div aria-live="polite">
      <div v-if="loading && releases.length === 0" class="release-grid" aria-label="Loading releases">
        <article v-for="index in 6" :key="index" class="release-card release-skeleton">
          <div class="skeleton-media"></div>
          <div class="space-y-3 p-5">
            <div class="skeleton-line w-2/3"></div>
            <div class="skeleton-line w-full"></div>
            <div class="skeleton-line w-4/5"></div>
          </div>
        </article>
      </div>

      <div v-else-if="errorMessage" class="release-state">
        <div class="release-state-icon" aria-hidden="true">!</div>
        <div>
          <h3>Release feed unavailable</h3>
          <p>{{ errorMessage }}</p>
        </div>
        <button type="button" class="release-retry-button" @click="loadReleases()">
          Try again
        </button>
      </div>

      <div v-else-if="visibleReleases.length === 0" class="release-state">
        <div class="release-state-icon" aria-hidden="true">0</div>
        <div>
          <h3>No dated PC releases found</h3>
          <p>IGDB does not currently list an exact release day for this month.</p>
        </div>
      </div>

      <div v-else class="release-results-shell">
        <div v-if="loading" class="release-refresh-status" role="status">
          <span class="release-refresh-spinner" aria-hidden="true"></span>
          Updating releases…
        </div>
        <div class="release-grid" :class="{ 'release-grid-loading': loading }" :aria-busy="loading">
        <article
          v-for="release in visibleReleases"
          :key="`${release.gameId}-${release.releaseAt}`"
          class="release-card"
          :class="{ 'release-card-selected': isSelected(release) }"
        >
          <div class="release-artwork">
            <div class="release-artwork-fallback" aria-hidden="true">
              {{ release.name.slice(0, 2).toUpperCase() }}
            </div>
            <img
              v-if="artworkUrl(release)"
              :src="artworkUrl(release) ?? undefined"
              :alt="`${release.name} artwork`"
              loading="lazy"
              decoding="async"
              @error="hideBrokenImage"
            />
            <div class="release-artwork-shade"></div>

            <span class="platform-badge">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 5.6 11 4.5v7H3V5.6Zm9-1.2L21 3v8.5h-9V4.4ZM3 12.5h8v7L3 18.4v-5.9Zm9 0h9V21l-9-1.4v-7.1Z" />
              </svg>
              PC
            </span>

            <span class="precision-badge">Date only</span>

            <img
              v-if="release.heroUrl && release.coverUrl"
              class="release-cover"
              :src="release.coverUrl"
              :alt="`${release.name} cover`"
              loading="lazy"
              decoding="async"
              @error="hideBrokenImage"
            />

            <a
              class="igdb-link"
              :href="release.igdbUrl"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="`Open ${release.name} on IGDB`"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 5h5v5M19 5l-8 8" />
                <path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
              </svg>
            </a>
          </div>

          <div class="release-card-body">
            <div class="min-w-0">
              <h3 class="release-title">{{ release.name }}</h3>
              <dl class="release-companies">
                <div>
                  <dt>Developer</dt>
                  <dd>{{ release.developer ?? "Not listed" }}</dd>
                </div>
                <div>
                  <dt>Publisher</dt>
                  <dd>{{ release.publisher ?? "Not listed" }}</dd>
                </div>
              </dl>
            </div>

            <div class="release-date-row">
              <div>
                <span class="release-date-label">Release date</span>
                <strong>{{ formatReleaseDate(release) }}</strong>
              </div>
              <span class="days-badge">{{ formatDaysUntil(release) }}</span>
            </div>

            <div class="release-card-actions">
              <span v-if="release.hypes > 0" class="hype-count">
                <span aria-hidden="true">◆</span>
                {{ release.hypes }} hype
              </span>
              <span v-else class="hype-count hype-count-muted">IGDB</span>

              <button
                type="button"
                class="countdown-button"
                :class="{ 'countdown-button-selected': isSelected(release) }"
                @click="selectRelease(release)"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 8v4l2.5 2.5M9 3h6" />
                </svg>
                {{ isSelected(release) ? "Selected" : "Use countdown" }}
              </button>
            </div>
          </div>
        </article>
        </div>
      </div>
    </div>

    <footer v-if="!errorMessage && releases.length > 0" class="release-footer">
      <p>
        Release data and imagery from
        <a href="https://www.igdb.com/" target="_blank" rel="noopener noreferrer">IGDB</a>.
        Exact times are not supplied by this feed.
      </p>
      <div v-if="hasMore" ref="loadMoreSentinel" class="release-load-more" role="status">
        <span class="release-load-more-spinner" aria-hidden="true"></span>
        More releases load as you scroll
      </div>
      <span v-else-if="truncated" class="truncated-note">
        More releases may be available on IGDB
      </span>
    </footer>
  </section>
</template>

<style scoped>
.release-browser {
  padding: 0;
  border-color: rgba(126, 210, 235, 0.16);
  background:
    radial-gradient(circle at 88% -20%, rgba(126, 210, 235, 0.14), transparent 32%),
    rgba(20, 20, 20, 0.9);
}

.release-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: auto auto;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(126, 210, 235, 0.12);
}

.release-header-copy {
  min-width: 0;
  grid-column: 1;
  grid-row: 1;
}

.release-eyebrow {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: rgba(167, 204, 218, 0.72);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.release-live-dot {
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  background: var(--accent);
  box-shadow: 0 0 0 4px rgba(126, 210, 235, 0.1), 0 0 12px rgba(126, 210, 235, 0.55);
}

.release-heading {
  color: var(--text-primary);
  font-size: clamp(1.45rem, 3vw, 2rem);
  font-weight: 720;
  letter-spacing: -0.035em;
}

.release-count,
.release-subtitle {
  color: var(--text-muted);
  font-size: 0.84rem;
}

.release-subtitle {
  margin-top: 0.55rem;
}

.release-search-wrap {
  position: relative;
  width: 100%;
  grid-column: 1 / -1;
  grid-row: 2;
}

.release-search-box {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-height: 3.55rem;
  overflow: hidden;
  border: 1px solid rgba(126, 210, 235, 0.22);
  border-radius: 0.9rem;
  background:
    linear-gradient(90deg, rgba(126, 210, 235, 0.035), transparent 18%),
    rgba(5, 7, 8, 0.78);
  color: rgba(167, 204, 218, 0.62);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025), 0 10px 28px rgba(0, 0, 0, 0.16);
  transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
}

.release-search-box:focus-within {
  border-color: rgba(126, 210, 235, 0.52);
  background:
    linear-gradient(90deg, rgba(126, 210, 235, 0.055), transparent 22%),
    rgba(5, 7, 8, 0.94);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.035), 0 0 0 1px rgba(126, 210, 235, 0.08), 0 14px 34px rgba(0, 0, 0, 0.22);
}

.release-search-icon svg,
.release-search-clear svg {
  width: 1.05rem;
  height: 1.05rem;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.release-search-icon {
  display: grid;
  width: 2rem;
  height: 2rem;
  margin-left: 0.7rem;
  place-items: center;
  flex: 0 0 auto;
  border: 1px solid rgba(126, 210, 235, 0.1);
  border-radius: 0.6rem;
  background: rgba(126, 210, 235, 0.055);
  transition: border-color 180ms ease, color 180ms ease, background 180ms ease;
}

.release-search-box:focus-within .release-search-icon {
  border-color: rgba(126, 210, 235, 0.22);
  background: rgba(126, 210, 235, 0.09);
  color: rgba(186, 226, 239, 0.9);
}

.release-search-box input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--text-primary);
  font-size: 0.92rem;
  font-weight: 520;
  letter-spacing: -0.01em;
}

.release-search-box input::placeholder {
  color: rgba(167, 204, 218, 0.44);
  font-weight: 470;
  opacity: 1;
  transition: opacity 120ms ease;
}

.release-search-box input:focus::placeholder {
  opacity: 0;
}

.release-search-box input::-webkit-search-cancel-button {
  display: none;
}

.release-search-clear {
  display: grid;
  width: 2rem;
  height: 2rem;
  margin-right: 0.7rem;
  place-items: center;
  flex: 0 0 auto;
  border: 1px solid transparent;
  border-radius: 0.6rem;
  color: rgba(167, 204, 218, 0.52);
  transition: border-color 160ms ease, color 160ms ease, background 160ms ease;
}

.release-search-clear:hover {
  border-color: rgba(126, 210, 235, 0.14);
  background: rgba(126, 210, 235, 0.08);
  color: var(--text-primary);
}

.release-search-spinner {
  width: 0.9rem;
  height: 0.9rem;
  flex: 0 0 auto;
  border: 2px solid rgba(126, 210, 235, 0.14);
  border-top-color: rgba(126, 210, 235, 0.72);
  border-radius: 999px;
  animation: release-spin 700ms linear infinite;
}

.release-sort-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
  margin-top: 0.65rem;
  padding: 0.35rem 0.1rem 0;
}

.release-sort-heading {
  display: flex;
  align-items: baseline;
  gap: 0.55rem;
  min-width: 0;
}

.release-sort-label {
  color: rgba(167, 204, 218, 0.42);
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.release-sort-hint {
  color: rgba(167, 204, 218, 0.28);
  font-size: 0.67rem;
}

.release-sort-options {
  display: inline-flex;
  gap: 0.2rem;
  padding: 0.2rem;
  border: 1px solid rgba(126, 210, 235, 0.1);
  border-radius: 0.7rem;
  background: rgba(5, 7, 8, 0.46);
}

.release-sort-button {
  display: inline-flex;
  min-height: 2rem;
  align-items: center;
  gap: 0.35rem;
  padding: 0 0.65rem;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  color: rgba(167, 204, 218, 0.52);
  font-size: 0.68rem;
  font-weight: 650;
  transition: border-color 150ms ease, background 150ms ease, color 150ms ease, box-shadow 150ms ease;
}

.release-sort-button svg {
  width: 0.78rem;
  height: 0.78rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.release-sort-button:hover {
  color: rgba(210, 235, 243, 0.82);
}

.release-sort-button-active {
  border-color: rgba(126, 210, 235, 0.16);
  background: rgba(126, 210, 235, 0.09);
  color: var(--text-primary);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.025);
}

.release-suggestions {
  position: absolute;
  z-index: 10;
  top: calc(100% + 0.55rem);
  right: 0;
  left: 0;
  overflow: hidden;
  padding: 0.4rem;
  border: 1px solid rgba(126, 210, 235, 0.18);
  border-radius: 0.9rem;
  background: rgba(12, 14, 15, 0.985);
  box-shadow: 0 24px 52px rgba(0, 0, 0, 0.48), inset 0 1px 0 rgba(255, 255, 255, 0.025);
  backdrop-filter: blur(18px);
}

.release-suggestions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.55rem 0.5rem;
  color: rgba(167, 204, 218, 0.42);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.release-suggestion {
  display: grid;
  width: 100%;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 0.8rem;
  padding: 0.62rem;
  border-radius: 0.65rem;
  color: rgba(167, 204, 218, 0.55);
  font-size: 0.7rem;
  text-align: left;
  transition: background 150ms ease, color 150ms ease;
}

.release-suggestion + .release-suggestion {
  margin-top: 0.15rem;
}

.release-suggestion:hover,
.release-suggestion:focus-visible {
  background: rgba(126, 210, 235, 0.08);
  color: var(--text-primary);
  outline: 0;
}

.release-suggestion-artwork {
  position: relative;
  display: grid;
  width: 2.35rem;
  height: 2.35rem;
  overflow: hidden;
  place-items: center;
  border: 1px solid rgba(126, 210, 235, 0.11);
  border-radius: 0.55rem;
  background: linear-gradient(145deg, rgba(126, 210, 235, 0.13), rgba(126, 210, 235, 0.025));
  color: rgba(190, 224, 236, 0.5);
  font-size: 0.58rem;
  font-weight: 750;
  letter-spacing: 0.05em;
}

.release-suggestion-artwork img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.release-suggestion-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 0.12rem;
}

.release-suggestion-name {
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.release-suggestion-platform {
  color: rgba(167, 204, 218, 0.38);
  font-size: 0.64rem;
}

.release-suggestion-date {
  padding: 0.28rem 0.45rem;
  border: 1px solid rgba(126, 210, 235, 0.09);
  border-radius: 0.45rem;
  background: rgba(126, 210, 235, 0.035);
  color: rgba(167, 204, 218, 0.62);
  white-space: nowrap;
}

.release-suggestion-arrow {
  width: 0.9rem;
  height: 0.9rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
  opacity: 0;
  transform: translateX(-0.2rem);
  transition: opacity 150ms ease, transform 150ms ease;
}

.release-suggestion:hover .release-suggestion-arrow,
.release-suggestion:focus-visible .release-suggestion-arrow {
  opacity: 1;
  transform: translateX(0);
}

.release-nav {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  grid-column: 2;
  grid-row: 1;
  flex-shrink: 0;
}

.release-nav-button,
.release-today-button,
.release-retry-button {
  min-height: 2.55rem;
  border: 1px solid var(--border-2);
  border-radius: 0.7rem;
  background: rgba(14, 14, 14, 0.72);
  color: var(--text-secondary);
  transition: border-color 160ms ease, background 160ms ease, color 160ms ease, transform 160ms ease;
}

.release-nav-button {
  display: grid;
  width: 2.55rem;
  place-items: center;
}

.release-nav-button svg,
.igdb-link svg,
.countdown-button svg {
  width: 1.05rem;
  height: 1.05rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.release-today-button,
.release-retry-button {
  padding: 0 0.9rem;
  font-size: 0.78rem;
  font-weight: 650;
}

.release-nav-button:hover:not(:disabled),
.release-today-button:hover,
.release-retry-button:hover {
  border-color: rgba(126, 210, 235, 0.5);
  background: rgba(126, 210, 235, 0.08);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.release-nav-button:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

.release-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  padding: 1.25rem;
}

.release-results-shell {
  position: relative;
}

.release-grid-loading {
  opacity: 0.58;
  pointer-events: none;
  transition: opacity 180ms ease;
}

.release-refresh-status {
  position: absolute;
  z-index: 2;
  top: 0.7rem;
  left: 50%;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  transform: translateX(-50%);
  border: 1px solid rgba(126, 210, 235, 0.2);
  border-radius: 999px;
  background: rgba(16, 16, 16, 0.86);
  color: rgba(167, 204, 218, 0.7);
  padding: 0.35rem 0.65rem;
  font-size: 0.67rem;
  font-weight: 650;
  white-space: nowrap;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(12px);
}

.release-refresh-spinner {
  width: 0.6rem;
  height: 0.6rem;
  border: 1px solid rgba(126, 210, 235, 0.28);
  border-top-color: var(--accent);
  border-radius: 999px;
  animation: release-spin 700ms linear infinite;
}

.release-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(126, 210, 235, 0.13);
  border-radius: 1rem;
  background: linear-gradient(180deg, rgba(24, 24, 24, 0.98), rgba(14, 14, 14, 0.98));
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.18);
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.release-card:hover {
  transform: translateY(-3px);
  border-color: rgba(126, 210, 235, 0.34);
  box-shadow: 0 20px 46px rgba(0, 0, 0, 0.28);
}

.release-card-selected {
  border-color: rgba(126, 210, 235, 0.62);
  box-shadow: 0 0 0 1px rgba(126, 210, 235, 0.12), 0 18px 42px rgba(0, 0, 0, 0.26);
}

.release-artwork {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #090909;
}

.release-artwork > img:not(.release-cover) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 500ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.release-card:hover .release-artwork > img:not(.release-cover) {
  transform: scale(1.035);
}

.release-artwork-fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background:
    linear-gradient(135deg, rgba(126, 210, 235, 0.14), transparent 58%),
    repeating-linear-gradient(135deg, #101010 0 12px, #131313 12px 24px);
  color: rgba(126, 210, 235, 0.3);
  font-family: var(--font-family-mono);
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.08em;
}

.release-artwork-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.18), transparent 45%, rgba(0, 0, 0, 0.72));
}

.platform-badge,
.precision-badge {
  position: absolute;
  top: 0.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 1.75rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(5, 5, 5, 0.72);
  backdrop-filter: blur(12px);
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.platform-badge {
  left: 0.75rem;
  padding: 0 0.6rem;
}

.platform-badge svg {
  width: 0.82rem;
  fill: #59c8e7;
}

.precision-badge {
  right: 3.35rem;
  padding: 0 0.65rem;
  color: rgba(255, 255, 255, 0.65);
}

.igdb-link {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: grid;
  width: 1.75rem;
  height: 1.75rem;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(5, 5, 5, 0.72);
  color: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(12px);
}

.igdb-link:hover {
  color: white;
  border-color: rgba(126, 210, 235, 0.55);
}

.release-cover {
  position: absolute;
  left: 0.85rem;
  bottom: 0.75rem;
  width: 2.9rem;
  aspect-ratio: 0.704;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 0.35rem;
  object-fit: cover;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.55);
}

.release-card-body {
  display: flex;
  min-height: 15.25rem;
  flex-direction: column;
  gap: 1rem;
  padding: 1.1rem;
}

.release-title {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 1.08rem;
  font-weight: 720;
  letter-spacing: -0.018em;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.release-companies {
  display: grid;
  gap: 0.32rem;
  margin-top: 0.8rem;
  font-size: 0.75rem;
}

.release-companies > div {
  display: grid;
  grid-template-columns: 4.35rem minmax(0, 1fr);
  gap: 0.45rem;
}

.release-companies dt {
  color: rgba(167, 204, 218, 0.52);
}

.release-companies dd {
  overflow: hidden;
  color: rgba(229, 226, 225, 0.78);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.release-date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  margin-top: auto;
  padding-top: 0.9rem;
  border-top: 1px solid rgba(126, 210, 235, 0.1);
}

.release-date-row > div {
  display: grid;
  gap: 0.2rem;
}

.release-date-label {
  color: rgba(167, 204, 218, 0.48);
  font-size: 0.65rem;
  font-weight: 650;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.release-date-row strong {
  color: var(--text-primary);
  font-family: var(--font-family-mono);
  font-size: 0.78rem;
  font-weight: 620;
}

.days-badge {
  flex-shrink: 0;
  border-radius: 0.5rem;
  background: rgba(126, 210, 235, 0.09);
  color: var(--accent);
  padding: 0.42rem 0.55rem;
  font-family: var(--font-family-mono);
  font-size: 0.7rem;
  font-weight: 700;
}

.release-card-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.hype-count {
  color: #ffba3d;
  font-family: var(--font-family-mono);
  font-size: 0.68rem;
}

.hype-count-muted {
  color: rgba(167, 204, 218, 0.42);
}

.countdown-button {
  display: inline-flex;
  min-height: 2.25rem;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid rgba(126, 210, 235, 0.3);
  border-radius: 0.6rem;
  background: rgba(126, 210, 235, 0.07);
  color: var(--text-secondary);
  padding: 0 0.72rem;
  font-size: 0.72rem;
  font-weight: 680;
  transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
}

.countdown-button:hover,
.countdown-button-selected {
  border-color: rgba(126, 210, 235, 0.62);
  background: rgba(126, 210, 235, 0.14);
  color: var(--text-primary);
}

.countdown-button-selected {
  box-shadow: inset 0 0 16px rgba(126, 210, 235, 0.08);
}

.release-state {
  display: flex;
  min-height: 14rem;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: left;
}

.release-state-icon {
  display: grid;
  width: 2.65rem;
  height: 2.65rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid rgba(126, 210, 235, 0.24);
  border-radius: 0.75rem;
  background: rgba(126, 210, 235, 0.06);
  color: var(--accent);
  font-family: var(--font-family-mono);
  font-weight: 800;
}

.release-state h3 {
  color: var(--text-primary);
  font-weight: 700;
}

.release-state p {
  margin-top: 0.2rem;
  color: var(--text-muted);
  font-size: 0.8rem;
}

.release-skeleton {
  pointer-events: none;
}

.skeleton-media,
.skeleton-line {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.035), rgba(126, 210, 235, 0.08), rgba(255, 255, 255, 0.035));
  background-size: 220% 100%;
  animation: release-shimmer 1.5s linear infinite;
}

.skeleton-media {
  aspect-ratio: 16 / 9;
}

.skeleton-line {
  height: 0.7rem;
  border-radius: 999px;
}

.release-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem 1.2rem;
  border-top: 1px solid rgba(126, 210, 235, 0.1);
  color: rgba(167, 204, 218, 0.52);
  font-size: 0.72rem;
}

.release-footer a {
  color: var(--text-secondary);
  text-decoration: underline;
  text-decoration-color: rgba(126, 210, 235, 0.28);
  text-underline-offset: 0.2rem;
}

.release-load-more {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  color: rgba(167, 204, 218, 0.58);
}

.release-load-more-spinner {
  width: 0.75rem;
  height: 0.75rem;
  border: 1.5px solid rgba(126, 210, 235, 0.14);
  border-top-color: rgba(126, 210, 235, 0.66);
  border-radius: 999px;
  animation: release-spin 800ms linear infinite;
}

.truncated-note {
  flex-shrink: 0;
  color: rgba(167, 204, 218, 0.58);
}

button:focus-visible,
a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

@keyframes release-shimmer {
  to { background-position: -220% 0; }
}

@keyframes release-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .release-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .release-header,
  .release-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .release-header {
    display: flex;
  }

  .release-nav {
    justify-content: space-between;
  }

  .release-search-wrap {
    width: 100%;
  }

  .release-search-box {
    min-height: 3.25rem;
  }

  .release-sort-bar {
    align-items: stretch;
    flex-direction: column;
    gap: 0.4rem;
  }

  .release-sort-options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .release-sort-button {
    justify-content: center;
    padding: 0 0.35rem;
  }

  .release-suggestion-date {
    display: none;
  }

  .release-today-button {
    flex: 1;
  }

  .release-grid {
    grid-template-columns: minmax(0, 1fr);
    padding: 0.9rem;
  }

  .release-state {
    align-items: flex-start;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .release-card,
  .release-artwork > img,
  .release-nav-button,
  .release-today-button,
  .release-retry-button {
    transition: none;
  }

  .skeleton-media,
  .skeleton-line {
    animation: none;
  }

  .release-grid-loading {
    transition: none;
  }

  .release-refresh-spinner,
  .release-search-spinner,
  .release-load-more-spinner {
    animation: none;
  }
}
</style>
