import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import { differenceInSeconds } from "date-fns";
import confetti from "canvas-confetti";

interface TimerSettings {
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  fontSize: number;
  enableAnimation: boolean;
  enableSound: boolean;
  enableSoundToggle: boolean;
  theme: "light" | "dark";
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface Game {
  id: string;
  title: string;
  targetDate: Date;
  targetTimezone: string;
  type: "game" | "utility";
}

export const useTimerStore = defineStore("timer", () => {
  // Get user's current timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Helper function to create a date that's X minutes from now
  const createDateMinutesFromNow = (minutes: number): Date => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    return date;
  };

  // Default games
  const defaultGames: Game[] = [
    {
      id: "break-30",
      title: "Be Right Back (30min)",
      targetDate: createDateMinutesFromNow(30),
      targetTimezone: userTimezone,
      type: "utility",
    },
    {
      id: "break-15",
      title: "Be Right Back (15min)",
      targetDate: createDateMinutesFromNow(15),
      targetTimezone: userTimezone,
      type: "utility",
    },
    {
      id: "break-10",
      title: "Be Right Back (10min)",
      targetDate: createDateMinutesFromNow(10),
      targetTimezone: userTimezone,
      type: "utility",
    },
    {
      id: "tarkov-wipe-maintenance",
      title: "Escape from Tarkov 0.16.8.0 Hardcore Wipe: Maintenance Start",
      targetDate: new Date(2025, 6, 9, 8, 0, 0), // July 9, 2025 8:00 AM
      targetTimezone: "Europe/Moscow",
      type: "game",
    },
    {
      id: "tarkov-wipe-start",
      title: "Escape from Tarkov 0.16.8.0 Hardcore Wipe: Start (Approx)",
      targetDate: new Date(2025, 6, 9, 14, 0, 0), // July 9, 2025 2:00 PM
      targetTimezone: "Europe/Moscow",
      type: "game",
    },
    {
      id: "poe-3-26",
      title: "POE1 3.26",
      targetDate: new Date(2025, 5, 13, 21, 0, 0), // June 13, 2025 9:00 PM
      targetTimezone: userTimezone,
      type: "game",
    },
    {
      id: "arc-raiders",
      title: "ARC Raiders",
      targetDate: new Date(2025, 9, 30, 0, 0, 0), // October 30, 2025
      targetTimezone: "Europe/Stockholm",
      type: "game",
    },
    {
      id: "starcitizen-42",
      title: "Star Citizen: Squadron 42",
      targetDate: new Date(2025, 11, 1, 0, 0, 0), // December 1, 2025 (estimated)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "marvel-1943",
      title: "Marvel 1943: Rise of Hydra",
      targetDate: new Date(2025, 2, 1, 0, 0, 0), // March 1, 2025
      targetTimezone: "America/Los_Angeles",
      type: "game",
    },
  ];

  // Store state
  const games = ref<Game[]>(defaultGames);
  // Set default active game to Tarkov Wipe Maintenance
  const activeGameIndex = ref(
    defaultGames.findIndex(game => game.id === 'tarkov-wipe-maintenance')
  );
  const isEditMode = ref(false);
  const settings: Ref<TimerSettings> = ref({
    fontFamily: "Inter",
    textColor: "#ffffff",
    backgroundColor: "#1a1a1a",
    fontSize: 48,
    enableAnimation: true,
    enableSound: false,
    enableSoundToggle: true,
    theme: "dark",
  });

  const hasReachedZero = ref(false);
  const audio =
    typeof window !== "undefined" ? new Audio("/timer-end.mp3") : null;
  let celebrationInterval: number | null = null;
  const currentTime = ref(new Date());

  // Computed properties for active game
  const activeGame = computed<Game>(() => games.value[activeGameIndex.value]);
  const gameTitle = computed(() => activeGame.value.title);
  const targetDate = computed(() => activeGame.value.targetDate);
  const targetTimezone = computed(() => activeGame.value.targetTimezone);

  const timeRemaining = computed<TimeRemaining>(() => {
    const diff = differenceInSeconds(targetDate.value, currentTime.value);

    // Check if timer just reached zero
    if (diff <= 0 && !hasReachedZero.value) {
      hasReachedZero.value = true;
      startCelebration();

      // Find the next upcoming game
      findAndSetNextUpcomingGame();
    } else if (diff > 0 && hasReachedZero.value) {
      hasReachedZero.value = false;
      stopCelebration();
    }

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const days = Math.floor(diff / (24 * 60 * 60));
    const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((diff % (60 * 60)) / 60);
    const seconds = diff % 60;

    return { days, hours, minutes, seconds };
  });

  // Find the next upcoming game and set it as active
  function findAndSetNextUpcomingGame() {
    const now = new Date();
    let nextGameIndex = -1;
    let minTimeDiff = Infinity;

    games.value.forEach((game, index) => {
      const diff = differenceInSeconds(game.targetDate, now);
      if (diff > 0 && diff < minTimeDiff) {
        minTimeDiff = diff;
        nextGameIndex = index;
      }
    });

    if (nextGameIndex !== -1) {
      activeGameIndex.value = nextGameIndex;
    }
  }

  let intervalId: number | null = null;

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  function fireConfetti() {
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const particleCount = 20;

    // Random bursts from different positions
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ["#ff0000", "#ffd700", "#00ff00", "#0000ff", "#ff00ff"],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ["#ff0000", "#ffd700", "#00ff00", "#0000ff", "#ff00ff"],
    });

    // Occasional star burst from the center
    if (Math.random() < 0.3) {
      confetti({
        particleCount: 30,
        spread: 100,
        origin: { y: 0.6 },
        startVelocity: 50,
        gravity: 0.7,
        shapes: ["star"],
        colors: ["#FFD700", "#FFA500", "#FF4500"],
      });
    }

    // Occasional streamers
    if (Math.random() < 0.2) {
      const streamers = {
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#ffd700", "#ffb300"],
      };

      confetti({
        ...streamers,
        origin: { x: Math.random() < 0.5 ? 0 : 1 },
        angle: Math.random() < 0.5 ? 60 : 120,
      });
    }
  }

  function startCelebration() {
    // Play sound if enabled
    if (settings.value.enableSound && audio) {
      audio.play().catch(console.error);
    }

    // Initial intense burst
    for (let i = 0; i < 5; i++) {
      setTimeout(() => fireConfetti(), i * 200);
    }

    // Continue with regular intervals
    celebrationInterval = window.setInterval(fireConfetti, 300);
  }

  function stopCelebration() {
    if (celebrationInterval) {
      clearInterval(celebrationInterval);
      celebrationInterval = null;
    }
  }

  function startTimer() {
    if (intervalId) return;
    intervalId = window.setInterval(() => {
      currentTime.value = new Date();
    }, 1000);
  }

  function stopTimer() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    stopCelebration();
  }

  const gameOptions = computed(() =>
    games.value.filter((game) => game.type === "game")
  );
  const utilityOptions = computed(() =>
    games.value.filter((game) => game.type === "utility")
  );

  const setTargetDate = (date: Date, timezone: string = userTimezone): void => {
    if (games.value[activeGameIndex.value]) {
      games.value[activeGameIndex.value].targetDate = date;
      games.value[activeGameIndex.value].targetTimezone = timezone;
    }
  };

  const setGameTitle = (title: string): void => {
    if (games.value[activeGameIndex.value]) {
      games.value[activeGameIndex.value].title = title;
    }
  };

  const setActiveGameIndex = (index: number): void => {
    if (index >= 0 && index < games.value.length) {
      activeGameIndex.value = index;
    }
  };

  const addGame = (
    title: string,
    date: Date,
    timezone: string = userTimezone,
    type: "game" | "utility" = "game"
  ): void => {
    const id = `game-${Date.now()}`;
    games.value.push({
      id,
      title,
      targetDate: date,
      targetTimezone: timezone,
      type,
    });
    // Set the newly added game as active
    activeGameIndex.value = games.value.length - 1;
  };

  const removeGame = (index: number): void => {
    if (index >= 0 && index < games.value.length && games.value.length > 1) {
      games.value.splice(index, 1);
      // Adjust active index if needed
      if (activeGameIndex.value >= games.value.length) {
        activeGameIndex.value = games.value.length - 1;
      }
    }
  };

  const resetGames = (): void => {
    games.value = JSON.parse(JSON.stringify(defaultGames));
    activeGameIndex.value = 0;
    findAndSetNextUpcomingGame();
  };

  function toggleMode(): void {
    isEditMode.value = !isEditMode.value;
  }

  const updateSettings = (newSettings: Partial<TimerSettings>): void => {
    settings.value = { ...settings.value, ...newSettings };
  };

  function getShareableUrl() {
    const params = new URLSearchParams({
      target: targetDate.value.toISOString(),
      theme: settings.value.theme,
      title: gameTitle.value,
    });
    return `${window.location.origin}?${params.toString()}`;
  }

  return {
    games,
    activeGameIndex,
    activeGame,
    targetDate,
    targetTimezone,
    isEditMode,
    settings,
    gameTitle,
    timeRemaining,
    setTargetDate,
    setGameTitle,
    setActiveGameIndex,
    addGame,
    removeGame,
    resetGames,
    toggleMode,
    updateSettings,

    getShareableUrl,
    startTimer,
    stopTimer,
    gameOptions,
    utilityOptions,
  };
});
