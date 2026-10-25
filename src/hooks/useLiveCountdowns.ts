import { onMounted, onUnmounted } from "vue";
import {
  LIVE_COUNTDOWNS_API_PATH,
  LIVE_COUNTDOWNS_PATH,
  parseLiveCountdowns,
} from "../lib/liveCountdowns";
import { useTimerStore } from "../stores/timer";

const POLL_INTERVAL_MS = 60_000;

async function fetchCountdowns(path: string) {
  try {
    // no-cache revalidates (cheap 304 when nothing changed).
    const response = await fetch(path, { cache: "no-cache" });
    if (!response.ok) return null;
    return parseLiveCountdowns(await response.json());
  } catch {
    return null;
  }
}

// Keeps countdowns in sync with the deployed list plus mod edits so
// long-lived pages (OBS overlays especially) see changes without a refresh.
export function useLiveCountdowns(): void {
  const store = useTimerStore();
  let intervalId: number | null = null;
  let inFlight = false;

  async function refresh(): Promise<void> {
    if (inFlight) return;
    inFlight = true;

    try {
      // Prefer the Function (built-ins plus mod edits). Fall back to the static
      // build output if it is unavailable, e.g. under `vite preview`.
      const games =
        (await fetchCountdowns(LIVE_COUNTDOWNS_API_PATH)) ??
        (await fetchCountdowns(LIVE_COUNTDOWNS_PATH));
      if (games) store.syncPublishedGames(games);
    } catch {
      // Offline or mid-deploy; keep showing what we have.
    } finally {
      inFlight = false;
    }
  }

  function handleVisibilityChange(): void {
    if (document.visibilityState === "visible") void refresh();
  }

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
