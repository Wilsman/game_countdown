import { onMounted, onUnmounted, watch } from "vue";
import {
  parseSharedTimerPayload,
  sharedTimerApiPath,
} from "../lib/sharedTimers";
import { useTimerStore } from "../stores/timer";

const POLL_INTERVAL_MS = 30_000;

// Keeps the shared timer on screen in sync with the server so viewers and OBS
// overlays see edits from the streamer or their mods without a refresh.
export function useSharedTimer(): void {
  const store = useTimerStore();
  let intervalId: number | null = null;
  let inFlight = false;

  async function refresh(): Promise<void> {
    const id = store.followedSharedTimerId;
    if (!id || inFlight) return;
    inFlight = true;

    try {
      const response = await fetch(sharedTimerApiPath(id), { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as Record<string, unknown>;
      const timer = parseSharedTimerPayload(payload);
      if (timer?.id === id && typeof payload.updatedAt === "string") {
        store.applySharedTimer(timer, payload.updatedAt);
      }
    } catch {
      // Offline; keep showing what we have.
    } finally {
      inFlight = false;
    }
  }

  function handleVisibilityChange(): void {
    if (document.visibilityState === "visible") void refresh();
  }

  watch(
    () => store.followedSharedTimerId,
    (id) => {
      if (id) void refresh();
    },
  );

  onMounted(() => {
    void refresh();
    intervalId = window.setInterval(() => void refresh(), POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);
  });

  onUnmounted(() => {
    if (intervalId !== null) {
      window.clearInterval(intervalId);
      intervalId = null;
    }
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  });
}
