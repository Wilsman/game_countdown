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
  enableGameBackground: boolean;
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
  titleColor: string;
  targetDate: Date;
  targetTimezone: string;
  type: "game" | "utility";
}

export const useTimerStore = defineStore("timer", () => {
  // Get user's current timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Function to handle URL parameters
  const handleUrlParams = () => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');
    const dateStr = params.get('date');
    const timezone = params.get('timezone');
    const color = params.get('color');
    const bgEnabled = params.get('bg');
    
    // Find the game by ID
    if (gameId) {
      const gameIndex = games.value.findIndex(g => g.id === gameId);
      if (gameIndex !== -1) {
        setActiveGameIndex(gameIndex);
        
        // Update the game's date and timezone if provided
        if (dateStr) {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            setTargetDate(date, timezone || userTimezone);
          }
        }
        
        // Update the game's color if provided
        if (color) {
          setGameTitleColor(`#${color}`);
        }
      }
    }
    
    // Update background setting if provided
    if (bgEnabled !== null) {
      updateSettings({ enableGameBackground: bgEnabled === '1' });
    }
  };

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
      titleColor: "#ffffff",
      targetDate: createDateMinutesFromNow(30),
      targetTimezone: userTimezone,
      type: "utility",
    },
    {
      id: "break-15",
      title: "Be Right Back (15min)",
      titleColor: "#ffffff",
      targetDate: createDateMinutesFromNow(15),
      targetTimezone: userTimezone,
      type: "utility",
    },
    {
      id: "break-10",
      title: "Be Right Back (10min)",
      titleColor: "#ffffff",
      targetDate: createDateMinutesFromNow(10),
      targetTimezone: userTimezone,
      type: "utility",
    },
    {
      id: "break-5",
      title: "Snack Break (5min)",
      titleColor: "#ffffff",
      targetDate: createDateMinutesFromNow(5),
      targetTimezone: userTimezone,
      type: "utility",
    },
    {
      id: "tarkov-wipe-maintenance",
      title: "Escape from Tarkov 0.16.8.0 Hardcore Wipe: Maintenance Start",
      titleColor: "#ffffff",
      targetDate: new Date("2025-07-09T07:00:00Z"), // July 9, 2025 8:00 AM BST
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "tarkov-wipe-start",
      title: "EFT Hardcore Wipe: Start",
      titleColor: "#ffffff",
      targetDate: new Date("2025-07-09T13:00:00Z"), // July 9, 2025 2:00 PM BST
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "poe-3-26",
      title: "POE1 3.26",
      titleColor: "#ffffff",
      targetDate: new Date(2025, 5, 13, 21, 0, 0), // June 13, 2025 9:00 PM
      targetTimezone: userTimezone,
      type: "game",
    },
    {
      id: "arc-raiders",
      title: "ARC Raiders",
      titleColor: "#ffffff",
      targetDate: new Date(2025, 9, 30, 0, 0, 0), // October 30, 2025
      targetTimezone: "Europe/Stockholm",
      type: "game",
    },
    {
      id: "starcitizen-42",
      title: "Star Citizen: Squadron 42",
      titleColor: "#ffffff",
      targetDate: new Date(2025, 11, 1, 0, 0, 0), // December 1, 2025 (estimated)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "marvel-1943",
      title: "Marvel 1943: Rise of Hydra",
      titleColor: "#ffffff",
      targetDate: new Date(2025, 2, 1, 0, 0, 0), // March 1, 2025
      targetTimezone: "America/Los_Angeles",
      type: "game",
    },
    {
      id: "path-of-exile-2",
      title: "Path of Exile 2 - New League",
      titleColor: "#ffffff",
      targetDate: new Date(2025, 7, 29, 0, 0, 0), // August 29, 2025
      targetTimezone: "UTC",
      type: "game",
    },
  ];

  // Store state
  const games = ref<Game[]>(defaultGames);
  // Will be set to the soonest ending game by findAndSetNextUpcomingGame
  const activeGameIndex = ref(0);
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
    enableGameBackground: true,
  });

  const hasReachedZero = ref(false);
  const audio =
    typeof window !== "undefined" ? new Audio("/timer-end.mp3") : null;
  let celebrationInterval: number | null = null;
  const currentTime = ref(new Date());

  // Computed properties for active game
  const activeGame = computed<Game>(() => games.value[activeGameIndex.value]);
  const gameTitle = computed(() => activeGame.value.title);
  const gameTitleColor = computed(() => activeGame.value.titleColor);
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
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const now = new Date();
    let nextGameIndex = 0; // Default to first game if none found
    let minTimeDiff = Infinity;
    let foundGame = false;

    games.value.forEach((game, index) => {
      // Only consider games, not utilities
      if (game.type === 'game') {
        const diff = differenceInSeconds(game.targetDate, now);
        // Find the game with the smallest positive time difference
        if (diff > 0 && diff < minTimeDiff) {
          minTimeDiff = diff;
          nextGameIndex = index;
          foundGame = true;
        }
      }
    });

    // Only update if we found a valid game
    if (foundGame) {
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
    games.value
      .filter((game) => game.type === "game")
      .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())
  );
  const utilityOptions = computed(() =>
    games.value
      .filter((game) => game.type === "utility")
      .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime())
  );

  const setTargetDate = (date: Date, timezone: string = userTimezone): void => {
    if (games.value[activeGameIndex.value]) {
      games.value[activeGameIndex.value].targetDate = date;
      games.value[activeGameIndex.value].targetTimezone = timezone;
    }
  };

  const setGameTitleColor = (color: string): void => {
    const gameIndex = activeGameIndex.value;
    if (gameIndex !== -1 && games.value[gameIndex]) {
      games.value[gameIndex] = { ...games.value[gameIndex], titleColor: color };
      
      // Update CSS variables if running in browser
      if (typeof window !== 'undefined') {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', color);
        
        // Create a slightly darker shade for hover state
        const hex = color.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, 
          (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        
        if (result) {
          const r = Math.max(0, parseInt(result[1], 16) - 40).toString(16).padStart(2, '0');
          const g = Math.max(0, parseInt(result[2], 16) - 40).toString(16).padStart(2, '0');
          const b = Math.max(0, parseInt(result[3], 16) - 40).toString(16).padStart(2, '0');
          root.style.setProperty('--primary-color-hover', `#${r}${g}${b}`);
        }
      }
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
      titleColor: "#ffffff", // Default color for new games
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

    function restartCountdown(id: string) {
    const gameIndex = games.value.findIndex((g) => g.id === id);
    if (gameIndex === -1) return;

    const game = games.value[gameIndex];
    // Match titles like "Be Right Back (10min)"
    const match = game.title.match(/\((\d+)min\)/);
    if (!match || game.type !== "utility") return;

    const minutes = parseInt(match[1], 10);
    games.value[gameIndex].targetDate = createDateMinutesFromNow(minutes);

    // If the active game is the one we just restarted, reset the celebration flag
    if (activeGameIndex.value === gameIndex) {
      hasReachedZero.value = false;
      stopCelebration(); // Stop any ongoing celebration
    }
  }

  function getShareableUrl() {
    const game = activeGame.value;
    if (!game) return '';
    
    const url = new URL(window.location.href.split('?')[0]);
    url.searchParams.set('game', game.id);
    url.searchParams.set('date', game.targetDate.toISOString());
    url.searchParams.set('timezone', game.targetTimezone);
    
    // Add the current game title color to the URL
    if (game.titleColor) {
      url.searchParams.set('color', game.titleColor.replace('#', ''));
    }
    
    // Add the game background setting to the URL
    url.searchParams.set('bg', settings.value.enableGameBackground ? '1' : '0');
    
    return url.toString();
  }

  // Set the initial active game to the soonest ending one
  if (typeof window !== 'undefined') {
    findAndSetNextUpcomingGame();
  }

  return {
    games,
    activeGameIndex,
    activeGame,
    handleUrlParams,
    targetDate,
    targetTimezone,
    isEditMode,
    settings,
    gameTitle,
    gameTitleColor,
    timeRemaining,
    setTargetDate,
    setGameTitle,
    setGameTitleColor,
    setActiveGameIndex,
    addGame,
    removeGame,
    resetGames,
    toggleMode,
    updateSettings,

    getShareableUrl,
    restartCountdown,
    startTimer,
    stopTimer,
    gameOptions,
    utilityOptions,
  };
});
