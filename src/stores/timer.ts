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
  enableChristmasTheme: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface RegionalReleaseTime {
  timezone: string;
  date: Date;
}

interface Game {
  id: string;
  title: string;
  titleColor: string;
  targetDate: Date;
  targetTimezone: string;
  type: "game" | "utility";
  regionalReleaseTimes?: RegionalReleaseTime[];
}

export const useTimerStore = defineStore("timer", () => {
  // Get user's current timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Function to handle URL parameters
  const handleUrlParams = () => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const gameId = params.get("game");
    const dateStr = params.get("date");
    const timezone = params.get("timezone");
    const titleParam = params.get("title");
    const color = params.get("color");
    const bgEnabled = params.get("bg");
    const obsMode = params.get("obs");

    // Find the game by ID
    if (gameId) {
      const gameIndex = games.value.findIndex((g) => g.id === gameId);
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
      } else if (dateStr) {
        // Game not found: reconstruct a manual timer from URL params
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          const newTitle = titleParam || "Custom Timer";
          const tz = timezone || userTimezone;
          const colorHex = color ? `#${color.replace(/^#/, "")}` : undefined;
          // Create with the provided id so subsequent shares are stable
          addGame(newTitle, date, tz, "game", gameId);
          // Apply color if provided
          if (colorHex) setGameTitleColor(colorHex);
        }
      }
    }

    // Update background setting if provided
    if (bgEnabled !== null) {
      updateSettings({ enableGameBackground: bgEnabled === "1" });
    }

    // Set OBS mode if parameter is present
    if (obsMode === "1") {
      isObsMode.value = true;
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
      id: "break-60",
      title: "eepy time 😴 (60min)",
      titleColor: "#ffffff",
      targetDate: createDateMinutesFromNow(60), // 60 minutes
      targetTimezone: userTimezone,
      type: "utility",
    },
    {
      id: "break-45 ",
      title: "Be Right Back (45min)",
      titleColor: "#ffffff",
      targetDate: createDateMinutesFromNow(45), // 45 minutes
      targetTimezone: userTimezone,
      type: "utility",
    },
    {
      id: "break-30",
      title: "Be Right Back (30min)",
      titleColor: "#ffffff",
      targetDate: createDateMinutesFromNow(30), // 30 minutes
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
      id: "tarkov-servers-going-offline",
      title: "EFT going offline",
      titleColor: "#ffffff",
      targetDate: new Date(1763118000 * 1000),
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "tarkov-website-back-online",
      title: "EFT website back online",
      titleColor: "#ffffff",
      targetDate: new Date("2025-11-14T16:00:00Z"), // 4pm GMT on Nov 14, 2025
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "tarkov-special-tarkovtv",
      title: "Special TarkovTV",
      titleColor: "#ffffff",
      targetDate: new Date(1763193600 * 1000),
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "high-on-life-2-13-february-2026",
      title: "High on Life 2 (Q4 placeholder)",
      titleColor: "#ffffff",
      targetDate: new Date("2026-02-13T00:00:00Z"), // Q4 2025 start (midnight UTC)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "starcitizen-42",
      title: "Star Citizen: Squadron 42",
      titleColor: "#ffffff",
      targetDate: new Date("2026-12-01T00:00:00Z"), // December 1, 2026 (estimated)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "midnight-walkers",
      title: "The Midnight Walkers (Early Access)",
      titleColor: "#ffffff",
      targetDate: new Date("2026-01-29T00:00:00Z"), // January 29, 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "slay-the-spire-2",
      title: "Slay the Spire 2 (Early Access)",
      titleColor: "#ff69b4",
      targetDate: new Date("2025-11-01T00:00:00Z"), // Late 2025 placeholder
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "enter-the-gungeon-2",
      title: "Enter the Gungeon 2",
      titleColor: "#ff4500",
      targetDate: new Date("2026-07-01T00:00:00Z"), // 2026 placeholder
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "tarkov-1-0-servers-down",
      title: "EFT 1.0 servers down",
      titleColor: "#ffffff",
      targetDate: new Date("2025-12-01T05:00:00Z"), // December 1, 2025 - 12:00 AM GMT
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "tarkov-1-0-servers-up",
      title: "EFT 1.0 servers up",
      titleColor: "#ffffff",
      targetDate: new Date("2025-12-01T11:00:00Z"), // December 1, 2025 - 11:00 AM GMT
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "tarkov-1-0-1-0-servers-down",
      title: "EFT 1.0.1.0 servers down",
      titleColor: "#ffffff",
      targetDate: new Date("2025-12-24T06:00:00Z"),
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "tarkov-1-0-1-0-servers-up",
      title: "EFT 1.0.1.0 servers up",
      titleColor: "#ffffff",
      targetDate: new Date("2025-12-24T12:00:00Z"),
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "tarkovtv-new-years-special-2025",
      title: "TarkovTV LIVE New Year's Special",
      titleColor: "#ffffff",
      targetDate: new Date("2025-12-27T16:00:00Z"),
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "path-of-exile-2-the-last-of-the-druids",
      title: "PoE2: The Last of the Druids",
      titleColor: "#ffffff",
      targetDate: new Date("2025-12-12T19:00:00Z"), // December 12, 2025 - 11:00 AM PST
      targetTimezone: "America/Los_Angeles",
      type: "game",
    },
    {
      id: "pubg-black-budget-alpha-week-1",
      title: "PUBG: Black Budget — Alpha Week 1",
      titleColor: "#ff6b35",
      targetDate: new Date("2025-12-12T01:00:00-08:00"), // December 12, 2025 - 1:00 AM PST
      targetTimezone: "America/Los_Angeles",
      type: "game",
    },
    {
      id: "pubg-black-budget-alpha-week-2",
      title: "PUBG: Black Budget — Alpha Week 2",
      titleColor: "#ff6b35",
      targetDate: new Date("2025-12-19T01:00:00-08:00"), // December 19, 2025 - 1:00 AM PST
      targetTimezone: "America/Los_Angeles",
      type: "game",
    },
    {
      id: "pubg-black-budget-alpha-week-1-ends",
      title: "PUBG: Black Budget — Alpha Week 1 Ends",
      titleColor: "#ff6b35",
      targetDate: new Date("2025-12-14T23:59:00-08:00"), // December 14, 2025 - 11:59 PM PST
      targetTimezone: "America/Los_Angeles",
      type: "game",
    },
    {
      id: "pubg-black-budget-alpha-week-2-ends",
      title: "PUBG: Black Budget — Alpha Week 2 Ends",
      titleColor: "#ff6b35",
      targetDate: new Date("2025-12-21T23:59:00-08:00"), // December 21, 2025 - 11:59 PM PST
      targetTimezone: "America/Los_Angeles",
      type: "game",
    },
    {
      id: "game-awards-2025",
      title: "The Game Awards 2025",
      titleColor: "#ffd700",
      targetDate: new Date("2025-12-11T16:30:00-08:00"), // December 11, 2025 - 4:30 PM PST
      targetTimezone: "America/Los_Angeles",
      type: "game",
    },
    {
      id: "tarkov-snow",
      title: "Tarkov Snow Event",
      titleColor: "#00bfff",
      targetDate: new Date("2025-12-11T08:00:00Z"), // December 11, 2025 - 8:00 AM GMT
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "arc-raiders-snow",
      title: "Arc Raiders Snow Event",
      titleColor: "#ff1493",
      targetDate: new Date("2025-12-16T09:30:00Z"), // December 16, 2025 - 9:30 AM GMT
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "quarantine-zone",
      title: "Quarantine Zone: The Last Check",
      titleColor: "#ffffff",
      targetDate: new Date("2026-01-15T00:00:00Z"), // Approx Jan 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "marathon",
      title: "Marathon",
      titleColor: "#00ff00",
      targetDate: new Date("2026-03-01T00:00:00Z"), // Approx March 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "mistfall-hunter",
      title: "Mistfall Hunter",
      titleColor: "#800080",
      targetDate: new Date("2026-03-15T00:00:00Z"), // Approx March 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "decadent",
      title: "Decadent",
      titleColor: "#8b0000",
      targetDate: new Date("2026-05-01T00:00:00Z"), // Est 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "nakwon",
      title: "Nakwon: Last Paradise",
      titleColor: "#ff4500",
      targetDate: new Date("2026-06-01T00:00:00Z"), // Est mid 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "road-to-vostok",
      title: "Road to Vostok (Update/Release)",
      titleColor: "#ffffff",
      targetDate: new Date("2026-07-01T00:00:00Z"), // Est 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "gray-zone-warfare-1",
      title: "Gray Zone Warfare 1.0",
      titleColor: "#a9a9a9",
      targetDate: new Date("2026-08-01T00:00:00Z"), // Est 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "judas",
      title: "Judas",
      titleColor: "#daa520",
      targetDate: new Date("2026-09-01T00:00:00Z"), // Est 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "project-lll",
      title: "Project LLL (Cinder City)",
      titleColor: "#ff6347",
      targetDate: new Date("2026-10-01T00:00:00Z"), // Est Late 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "forever-winter-1",
      title: "The Forever Winter 1.0",
      titleColor: "#add8e6",
      targetDate: new Date("2026-11-01T00:00:00Z"), // Est Late 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "beautiful-light",
      title: "Beautiful Light",
      titleColor: "#ff00ff",
      targetDate: new Date("2026-12-01T00:00:00Z"), // Dec 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "state-of-decay-3",
      title: "State of Decay 3",
      titleColor: "#228b22",
      targetDate: new Date("2027-01-01T00:00:00Z"), // Est 2027
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "perfect-dark",
      title: "Perfect Dark",
      titleColor: "#00008b",
      targetDate: new Date("2027-04-01T00:00:00Z"), // Est 2027
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "division-3",
      title: "The Division 3",
      titleColor: "#ff8c00",
      targetDate: new Date("2027-09-01T00:00:00Z"), // Est 2027
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "rainbow-six-mobile",
      title: "Rainbow Six Mobile",
      titleColor: "#00bfff",
      targetDate: new Date("2026-02-23T00:00:00Z"), // Confirmed Feb 23, 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "toxic-commando",
      title: "John Carpenter's Toxic Commando",
      titleColor: "#32cd32",
      targetDate: new Date("2026-03-12T00:00:00Z"), // Confirmed March 12, 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "rules-of-engagement",
      title: "Rules of Engagement: The Grey State",
      titleColor: "#708090",
      targetDate: new Date("2026-06-01T00:00:00Z"), // Est 2026
      targetTimezone: "UTC",
      type: "game",
    },
  ];

  // Store state
  const games = ref<Game[]>(defaultGames);
  // Will be set to the soonest ending game by findAndSetNextUpcomingGame
  const activeGameIndex = ref(0);
  const isEditMode = ref(false);
  const isObsMode = ref(false);
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
    enableChristmasTheme: true,
  });

  const hasReachedZero = ref(false);
  const audio =
    typeof window !== "undefined" ? new Audio("/timer-end.mp3") : null;
  let celebrationInterval: number | null = null;
  const currentTime = ref(new Date());

  // Helper function to get the appropriate target date based on user's timezone
  const getTargetDateForTimezone = (
    game: Game
  ): { date: Date; timezone: string } => {
    if (!game.regionalReleaseTimes || game.regionalReleaseTimes.length === 0) {
      return { date: game.targetDate, timezone: game.targetTimezone };
    }

    // Find a matching regional release time for the user's timezone
    const regionalMatch = game.regionalReleaseTimes.find(
      (regional) => regional.timezone === userTimezone
    );

    if (regionalMatch) {
      return { date: regionalMatch.date, timezone: regionalMatch.timezone };
    }

    // No match found, use the default
    return { date: game.targetDate, timezone: game.targetTimezone };
  };

  // Computed properties for active game
  const activeGame = computed<Game>(() => games.value[activeGameIndex.value]);
  const gameTitle = computed(() => activeGame.value.title);
  const gameTitleColor = computed(() => activeGame.value.titleColor);
  const targetDate = computed(() => {
    const { date } = getTargetDateForTimezone(activeGame.value);
    return date;
  });
  const targetTimezone = computed(() => {
    const { timezone } = getTargetDateForTimezone(activeGame.value);
    return timezone;
  });

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
    if (typeof window === "undefined") return;

    const now = new Date();
    let nextGameIndex = 0; // Default to first game if none found
    let minTimeDiff = Infinity;
    let foundGame = false;

    games.value.forEach((game, index) => {
      // Only consider games, not utilities
      if (game.type === "game") {
        const { date } = getTargetDateForTimezone(game);
        const diff = differenceInSeconds(date, now);
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
      if (typeof window !== "undefined") {
        const root = document.documentElement;
        root.style.setProperty("--primary-color", color);

        // Create a slightly darker shade for hover state
        const hex = color.replace(
          /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
          (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`
        );
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        if (result) {
          const r = Math.max(0, parseInt(result[1], 16) - 40)
            .toString(16)
            .padStart(2, "0");
          const g = Math.max(0, parseInt(result[2], 16) - 40)
            .toString(16)
            .padStart(2, "0");
          const b = Math.max(0, parseInt(result[3], 16) - 40)
            .toString(16)
            .padStart(2, "0");
          root.style.setProperty("--primary-color-hover", `#${r}${g}${b}`);
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
    type: "game" | "utility" = "game",
    idOverride?: string
  ): void => {
    const id = idOverride || `game-${Date.now()}`;
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

    // Apply font family to document if running in browser
    if (typeof window !== "undefined" && newSettings.fontFamily) {
      document.documentElement.style.setProperty(
        "--font-family",
        newSettings.fontFamily
      );
    }

    // Apply font size to timer display if running in browser
    if (typeof window !== "undefined" && newSettings.fontSize) {
      document.documentElement.style.setProperty(
        "--timer-font-size",
        `${newSettings.fontSize}px`
      );
    }
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
    if (!game) return "";

    const url = new URL(window.location.href.split("?")[0]);
    url.searchParams.set("game", game.id);
    url.searchParams.set("date", game.targetDate.toISOString());
    url.searchParams.set("timezone", game.targetTimezone);
    url.searchParams.set("title", game.title);

    // Add the current game title color to the URL
    if (game.titleColor) {
      url.searchParams.set("color", game.titleColor.replace("#", ""));
    }

    // Add the game background setting to the URL
    url.searchParams.set("bg", settings.value.enableGameBackground ? "1" : "0");

    return url.toString();
  }

  // Set the initial active game to the soonest ending one
  if (typeof window !== "undefined") {
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
    isObsMode,
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
