<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { useNow } from "../hooks/useNow";
import {
  buildUpcomingQueue,
  filterQueue,
  formatRemaining,
  groupQueueByTarget,
} from "../lib/upcomingQueue";
import { useTimerStore } from "../stores/timer";

const store = useTimerStore();
const now = useNow();

const groups = computed(() =>
  groupQueueByTarget(
    filterQueue(buildUpcomingQueue(store.games, now.value), "all"),
  ),
);

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
});

const isActive = (gameId: string) => store.activeGame.id === gameId;

// Auto-scroll speed in px per second.
const SPEED = 36;
// Pointer travel before a press counts as a drag rather than a click.
const DRAG_THRESHOLD = 5;

const viewportRef = ref<HTMLElement | null>(null);
const trackRef = ref<HTMLElement | null>(null);
const listRef = ref<HTMLElement[]>([]);

// True when one copy of the list is wider than the viewport, so it loops.
const overflows = ref(false);
const isHovering = ref(false);
const hasFocus = ref(false);
const isDragging = ref(false);
const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let offset = 0;
let listWidth = 0;
let frameId = 0;
let lastFrame = 0;
let resizeObserver: ResizeObserver | null = null;

let pointerId: number | null = null;
let dragStartX = 0;
let dragStartOffset = 0;
let suppressClick = false;

const applyOffset = () => {
  if (!trackRef.value) return;
  if (overflows.value && listWidth > 0) {
    offset = ((offset % listWidth) + listWidth) % listWidth;
  } else {
    offset = 0;
  }
  trackRef.value.style.transform = `translate3d(${-offset}px, 0, 0)`;
};

const measure = () => {
  const list = listRef.value[0];
  const viewport = viewportRef.value;
  if (!list || !viewport) return;
  listWidth = list.offsetWidth;
  overflows.value = listWidth > viewport.clientWidth;
  applyOffset();
};

const tick = (time: number) => {
  const elapsed = lastFrame ? (time - lastFrame) / 1000 : 0;
  lastFrame = time;
  const paused =
    reducedMotion || isHovering.value || hasFocus.value || isDragging.value;
  if (!paused && overflows.value) {
    offset += SPEED * Math.min(elapsed, 0.1);
    applyOffset();
  }
  frameId = requestAnimationFrame(tick);
};

const onPointerDown = (event: PointerEvent) => {
  if (!overflows.value || event.button !== 0) return;
  pointerId = event.pointerId;
  dragStartX = event.clientX;
  dragStartOffset = offset;
  suppressClick = false;
};

const onPointerMove = (event: PointerEvent) => {
  if (pointerId !== event.pointerId) return;
  const dx = event.clientX - dragStartX;
  if (!isDragging.value && Math.abs(dx) < DRAG_THRESHOLD) return;
  if (!isDragging.value) {
    isDragging.value = true;
    suppressClick = true;
    // Capture only once it is a drag, so a plain click still reaches the item.
    viewportRef.value?.setPointerCapture(event.pointerId);
  }
  offset = dragStartOffset - dx;
  applyOffset();
};

const endDrag = (event: PointerEvent) => {
  if (pointerId !== event.pointerId) return;
  pointerId = null;
  isDragging.value = false;
};

// A drag can end with a click on whatever is under the pointer; swallow it.
const onClickCapture = (event: MouseEvent) => {
  if (!suppressClick) return;
  suppressClick = false;
  event.preventDefault();
  event.stopPropagation();
};

// Trackpad sideways swipes and shift + wheel pan the list.
const onWheel = (event: WheelEvent) => {
  if (!overflows.value) return;
  const delta =
    Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.shiftKey
        ? event.deltaY
        : 0;
  if (!delta) return;
  event.preventDefault();
  offset += delta;
  applyOffset();
};

const onFocusOut = (event: FocusEvent) => {
  const next = event.relatedTarget as Node | null;
  hasFocus.value = !!next && !!viewportRef.value?.contains(next);
};

onMounted(() => {
  resizeObserver = new ResizeObserver(measure);
  if (viewportRef.value) resizeObserver.observe(viewportRef.value);
  measure();
  frameId = requestAnimationFrame(tick);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId);
  resizeObserver?.disconnect();
});

// The list changes width as countdowns end or get added.
watch(
  () => groups.value.map((group) => group.items.length).join(","),
  () => nextTick(measure),
);
</script>

<template>
  <div class="ticker mt-4 flex items-stretch" aria-label="Upcoming countdowns">
    <span class="ticker-label">
      <span class="ticker-dot" aria-hidden="true"></span>
      Up next
    </span>

    <div
      v-if="groups.length"
      ref="viewportRef"
      class="ticker-viewport"
      :class="{ 'is-scrollable': overflows, 'is-dragging': isDragging }"
      @pointerenter="isHovering = true"
      @pointerleave="isHovering = false"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="endDrag"
      @pointercancel="endDrag"
      @click.capture="onClickCapture"
      @wheel="onWheel"
      @focusin="hasFocus = true"
      @focusout="onFocusOut"
      @dragstart.prevent
    >
      <!-- A second copy follows the first so the loop has no gap. -->
      <div ref="trackRef" class="ticker-track">
        <ul
          v-for="copy in overflows ? 2 : 1"
          :key="copy"
          ref="listRef"
          class="ticker-list"
          :aria-hidden="copy === 2 ? 'true' : undefined"
        >
          <li
            v-for="group in groups"
            :key="group.targetDate.getTime()"
            class="ticker-group"
          >
            <span class="ticker-date">
              {{ dateFormatter.format(group.targetDate) }}
            </span>
            <span class="ticker-remaining">
              {{ formatRemaining(group.remainingMs) }}
            </span>
            <button
              v-for="item in group.items"
              :key="item.game.id"
              type="button"
              class="ticker-item"
              :class="{ 'is-active': isActive(item.game.id) }"
              :tabindex="copy === 2 ? -1 : undefined"
              :aria-current="isActive(item.game.id) ? 'true' : undefined"
              @click="store.selectGameById(item.game.id)"
            >
              <span
                class="ticker-swatch"
                :style="{ backgroundColor: item.game.titleColor }"
                aria-hidden="true"
              ></span>
              {{ item.game.title }}
            </button>
          </li>
        </ul>
      </div>
    </div>
    <p v-else class="ticker-empty">Nothing scheduled yet.</p>
  </div>
</template>

<style scoped>
.ticker {
  min-height: 3.25rem;
  background: var(--surface-0);
  border: 1px solid var(--border-1);
}

.ticker-label {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.55rem;
  padding: 0 1.25rem;
  background: rgba(126, 210, 235, 0.08);
  font-family: "Geist Mono", monospace;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #7ed2eb;
  white-space: nowrap;
}

.ticker-dot {
  height: 0.4rem;
  width: 0.4rem;
  border-radius: 9999px;
  background: #7ed2eb;
}

.ticker-viewport {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  touch-action: pan-y;
  user-select: none;
}

.ticker-viewport.is-scrollable {
  cursor: grab;
  mask-image: linear-gradient(
    90deg,
    transparent,
    #000 3rem,
    #000 calc(100% - 3rem),
    transparent
  );
}

.ticker-viewport.is-dragging {
  cursor: grabbing;
}

.ticker-track {
  display: flex;
  width: max-content;
  will-change: transform;
}

.ticker-list {
  display: flex;
  align-items: center;
}

.ticker-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 1.5rem;
  white-space: nowrap;
}

.ticker-empty {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  padding: 0 1.25rem;
  font-size: 0.8rem;
  color: rgba(207, 250, 254, 0.45);
}

.ticker-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.7rem;
  white-space: nowrap;
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(229, 226, 225, 0.85);
  cursor: inherit;
  transition: background 150ms ease, color 150ms ease;
}

.ticker-item:hover {
  background: rgba(126, 210, 235, 0.06);
  color: #e5e2e1;
}

.ticker-item:focus-visible {
  outline: 2px solid rgba(126, 210, 235, 0.45);
  outline-offset: -2px;
}

.ticker-item.is-active {
  background: rgba(126, 210, 235, 0.12);
  color: #eafcff;
}

.ticker-swatch {
  height: 0.45rem;
  width: 0.45rem;
  flex-shrink: 0;
}

.ticker-remaining {
  margin-right: 0.5rem;
  font-family: "Geist Mono", monospace;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #7ed2eb;
}

.ticker-date {
  margin-right: 0.65rem;
  font-family: "Geist Mono", monospace;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(207, 250, 254, 0.4);
}
</style>
