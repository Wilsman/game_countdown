import { onMounted, onUnmounted } from "vue";
import { LIVE_COUNTDOWNS_PATH, parseLiveCountdowns } from "../lib/liveCountdowns";
import { useTimerStore } from "../stores/timer";

const POLL_INTERVAL_MS = 60_000;

// Keeps built-in countdowns in sync with the deployed /countdowns.json so
// long-lived pages (OBS overlays especially) see edits without a refresh.
export function useLiveCountdowns(): void {
  const store = useTimerStore();
  let intervalId: number | null = null;
  let inFlight = false;

  async function refresh(): Promise<void> {
    if (inFlight) return;
    inFlight = true;

    try {
      // no-cache revalidates with the CDN (cheap 304 when nothing changed).
      const response = await fetch(LIVE_COUNTDOWNS_PATH, { cache: "no-cache" });
      if (!response.ok) return;

      const games = parseLiveCountdowns(await response.json());
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
