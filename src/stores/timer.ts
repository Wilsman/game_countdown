import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import { differenceInSeconds } from "date-fns";
import confetti from "canvas-confetti";
import { createDefaultGameBases } from "../data/default-games";
import type { Game, GameBase, RegionalReleaseTime } from "../types/game";

export type { Game, GameBase, GameSource, RegionalReleaseTime } from "../types/game";

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
  // OBS Overlay specific
  digitColor: string | null;
  labelColor: string | null;
  digitSize: number | null;
  labelSize: number | null;
  titleSize: number | null;
  showTitle: boolean;
  showLabels: boolean;
  framePadding: number | null;
  segmentGap: number | null;
  glowColor: string | null;
  glowIntensity: number | null;
  glowSpread: number | null;
  showScanlines: boolean;
  backgroundOpacity: number | null;
  bgBlur: number | null;
  obsFontFamily: string | null;
  borderWidth: number | null;
  borderColor: string | null;
  animationSpeed: number | null;
  scanlineOpacity: number | null;
  showShine: boolean;
  shineOpacity: number | null;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const useTimerStore = defineStore("timer", () => {
  const CUSTOM_GAMES_STORAGE_KEY = "game-countdown.custom-games";
  const ACTIVE_CUSTOM_GAME_STORAGE_KEY = "game-countdown.active-custom-game-id";
  const SETTINGS_STORAGE_KEY = "game-countdown.settings";

  // Get user's current timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const cloneRegionalReleaseTimes = (
    regionalReleaseTimes?: RegionalReleaseTime[],
  ) =>
    regionalReleaseTimes?.map((regionalRelease) => ({
      ...regionalRelease,
      date: new Date(regionalRelease.date),
    }));

  const toDefaultGame = (game: GameBase): Game => ({
    ...game,
    targetDate: new Date(game.targetDate),
    source: "default",
    createdAt: null,
    regionalReleaseTimes: cloneRegionalReleaseTimes(game.regionalReleaseTimes),
  });

  const toCustomGame = (game: Game): Game => ({
    ...game,
    targetDate: new Date(game.targetDate),
    createdAt: game.createdAt ? new Date(game.createdAt) : new Date(),
    regionalReleaseTimes: cloneRegionalReleaseTimes(game.regionalReleaseTimes),
  });

  const isValidStoredCustomGame = (value: unknown): value is Game => {
    if (!value || typeof value !== "object") return false;

    const game = value as Record<string, unknown>;
    const parsedTargetDate = new Date(String(game.targetDate ?? ""));
    const parsedCreatedAt = new Date(
      String(game.createdAt ?? game.targetDate ?? ""),
    );

    return (
      typeof game.id === "string" &&
      typeof game.title === "string" &&
      typeof game.titleColor === "string" &&
      typeof game.targetTimezone === "string" &&
      game.type === "game" &&
      game.source === "custom" &&
      !Number.isNaN(parsedTargetDate.getTime()) &&
      !Number.isNaN(parsedCreatedAt.getTime())
    );
  };

  const loadPersistedCustomGames = (): Game[] => {
    if (typeof window === "undefined") return [];

    try {
      const raw = window.localStorage.getItem(CUSTOM_GAMES_STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed.filter(isValidStoredCustomGame).map((game) =>
        toCustomGame({
          ...game,
          targetDate: new Date(game.targetDate),
          createdAt: new Date(game.createdAt ?? game.targetDate),
        }),
      );
    } catch {
      return [];
    }
  };

  const loadPersistedActiveCustomGameId = (): string | null => {
    if (typeof window === "undefined") return null;

    try {
      return window.localStorage.getItem(ACTIVE_CUSTOM_GAME_STORAGE_KEY);
    } catch {
      return null;
    }
  };

  const loadPersistedSettings = (): Partial<TimerSettings> | null => {
    if (typeof window === "undefined") return null;

    try {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return null;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return null;
      }

      return parsed as Partial<TimerSettings>;
    } catch {
      return null;
    }
  };

  const persistSettings = (): void => {
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(settings.value),
      );
    } catch {
      // Ignore storage failures so the timer keeps working.
    }
  };

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

    // Customization params
    const dColor = params.get("dcolor");
    const lColor = params.get("lcolor");
    const dSize = params.get("dsize");
    const lSize = params.get("lsize");
    const tSize = params.get("tsize");
    const showTitle = params.get("showtitle");
    const showLabels = params.get("showlabels");
    const framePadding = params.get("padding");
    const segmentGap = params.get("gap");
    const gColor = params.get("gcolor");
    const gIntensity = params.get("gintensity");
    const gSpread = params.get("gspread");
    const scan = params.get("scan");
    const bOpacity = params.get("bopacity");
    const bBlur = params.get("bblur");
    const font = params.get("font");
    const bWidth = params.get("bwidth");
    const bColor = params.get("bcolor");
    const speed = params.get("speed");
    const sopacity = params.get("sopacity");
    const shine = params.get("shine");
    const shineOpactiy = params.get("shopacity");

    // Find the game by ID
    if (gameId) {
      const gameIndex = games.value.findIndex((g) => g.id === gameId);
      if (gameIndex !== -1) {
        setActiveGameIndex(gameIndex);
        if (titleParam !== null) setGameTitle(titleParam);

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
          addCustomTimer(newTitle, date, tz, gameId);
          // Apply color if provided
          if (colorHex) setGameTitleColor(colorHex);
        }
      }
    } else if (dateStr) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        addGame(
          titleParam || "Custom Timer",
          date,
          timezone || userTimezone,
          "game",
          "shared-overlay",
        );
        if (color) setGameTitleColor(`#${color.replace(/^#/, "")}`);
      }
    }

    // Update background setting if provided
    if (bgEnabled !== null) {
      updateSettings({ enableGameBackground: bgEnabled === "1" }, false);
    }

    // Set OBS mode if parameter is present
    if (obsMode === "1") {
      isObsMode.value = true;
    }

    // Apply customizations
    const customizations: Partial<TimerSettings> = {};
    if (dColor) customizations.digitColor = `#${dColor}`;
    if (lColor) customizations.labelColor = `#${lColor}`;
    if (dSize) customizations.digitSize = parseInt(dSize);
    if (lSize) customizations.labelSize = parseInt(lSize);
    if (tSize) customizations.titleSize = parseInt(tSize);
    if (showTitle !== null) customizations.showTitle = showTitle === "1";
    if (showLabels !== null) customizations.showLabels = showLabels === "1";
    if (framePadding) customizations.framePadding = parseInt(framePadding);
    if (segmentGap) customizations.segmentGap = parseInt(segmentGap);
    if (gColor) customizations.glowColor = `#${gColor}`;
    if (gIntensity) customizations.glowIntensity = parseFloat(gIntensity);
    if (gSpread) customizations.glowSpread = parseFloat(gSpread);
    if (scan) customizations.showScanlines = scan === "1";
    if (bOpacity) customizations.backgroundOpacity = parseFloat(bOpacity);
    if (bBlur) customizations.bgBlur = parseFloat(bBlur);
    if (font) customizations.obsFontFamily = font;
    if (bWidth) customizations.borderWidth = parseInt(bWidth);
    if (bColor) customizations.borderColor = `#${bColor}`;
    if (speed) customizations.animationSpeed = parseFloat(speed);
    if (sopacity) customizations.scanlineOpacity = parseFloat(sopacity);
    if (shine) customizations.showShine = shine === "1";
    if (shineOpactiy) customizations.shineOpacity = parseFloat(shineOpactiy);

    if (Object.keys(customizations).length > 0) {
      updateSettings(customizations, false);
    }
  };

  // Helper function to create a date that's X minutes from now
  const createDateMinutesFromNow = (minutes: number): Date => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    return date;
  };

  const getUtilityTimerDurationMinutes = (title: string): number | null => {
    const minuteMatch = title.match(/\((\d+)min\)/i);
    if (minuteMatch) {
      return parseInt(minuteMatch[1], 10);
    }

    const hourMinuteMatch = title.match(/\((\d+)h\s*(\d+)m\)/i);
    if (hourMinuteMatch) {
      return (
        parseInt(hourMinuteMatch[1], 10) * 60 + parseInt(hourMinuteMatch[2], 10)
      );
    }

    return null;
  };

  const createDefaultGames = (): Game[] =>
    createDefaultGameBases(userTimezone).map(toDefaultGame);

  const persistCustomGames = () => {
    if (typeof window === "undefined") return;

    try {
      const customGames = games.value
        .filter((game) => game.source === "custom")
        .map((game) => ({
          ...game,
          targetDate: game.targetDate.toISOString(),
          createdAt: game.createdAt?.toISOString() ?? new Date().toISOString(),
        }));

      window.localStorage.setItem(
        CUSTOM_GAMES_STORAGE_KEY,
        JSON.stringify(customGames),
      );
    } catch {
      // Ignore storage failures so the timer keeps working.
    }
  };

  const setPersistedActiveCustomGameId = (gameId: string | null) => {
    if (typeof window === "undefined") return;

    try {
      if (gameId) {
        window.localStorage.setItem(ACTIVE_CUSTOM_GAME_STORAGE_KEY, gameId);
      } else {
        window.localStorage.removeItem(ACTIVE_CUSTOM_GAME_STORAGE_KEY);
      }
    } catch {
      // Ignore storage failures so the timer keeps working.
    }
  };

  // Store state
  const games = ref<Game[]>([
    ...createDefaultGames(),
    ...loadPersistedCustomGames(),
  ]);
  // Will be set to the soonest ending game by findAndSetNextUpcomingGame
  const activeGameIndex = ref(0);
  const persistedActiveCustomGameId = ref(loadPersistedActiveCustomGameId());
  const pendingRegionalReleaseGameId = ref<string | null>(null);
  const isEditMode = ref(false);
  const isObsMode = ref(false);
  const persistedSettings = loadPersistedSettings();
  const settings: Ref<TimerSettings> = ref({
    fontFamily: "Geist Sans",
    textColor: "#ffffff",
    backgroundColor: "#1a1a1a",
    fontSize: 48,
    enableAnimation: true,
    enableSound: false,
    enableSoundToggle: true,
    theme: "dark",
    enableGameBackground: true,
    enableChristmasTheme: false,
    digitColor: null,
    labelColor: null,
    digitSize: 100,
    labelSize: null,
    titleSize: 48,
    showTitle: true,
    showLabels: true,
    framePadding: 24,
    segmentGap: 0,
    glowColor: null,
    glowIntensity: null,
    glowSpread: null,
    showScanlines: true,
    backgroundOpacity: null,
    bgBlur: null,
    obsFontFamily: null,
    borderWidth: null,
    borderColor: null,
    animationSpeed: null,
    scanlineOpacity: null,
    showShine: true,
    shineOpacity: null,
    ...persistedSettings,
  });

  const hasReachedZero = ref(false);
  const audio =
    typeof window !== "undefined" ? new Audio("/timer-end.mp3") : null;
  let celebrationInterval: number | null = null;
  const currentTime = ref(new Date());

  // Helper function to get the appropriate target date based on user's timezone
  const getTargetDateForTimezone = (
    game: Game,
  ): { date: Date; timezone: string } => {
    return {
      date: new Date(game.targetDate),
      timezone: game.targetTimezone,
    };
  };

  // Computed properties for active game
  const activeGame = computed<Game>(() => games.value[activeGameIndex.value]);
  const pendingRegionalReleaseGame = computed<Game | null>(() => {
    if (!pendingRegionalReleaseGameId.value) return null;

    return (
      games.value.find(
        (game) => game.id === pendingRegionalReleaseGameId.value,
      ) || null
    );
  });
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
      setActiveGameIndex(nextGameIndex);
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

  const customGameOptions = computed(() =>
    games.value
      .filter((game) => game.source === "custom")
      .sort((a, b) => {
        const timeDiff = a.targetDate.getTime() - b.targetDate.getTime();
        if (timeDiff !== 0) return timeDiff;

        return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
      }),
  );
  const gameOptions = computed(() =>
    games.value
      .filter((game) => game.type === "game" && game.source === "default")
      .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime()),
  );
  const utilityOptions = computed(() =>
    games.value
      .filter((game) => game.type === "utility")
      .sort((a, b) => a.targetDate.getTime() - b.targetDate.getTime()),
  );

  const syncCustomGamePersistence = (gameId: string) => {
    const game = games.value.find((candidate) => candidate.id === gameId);
    if (!game) return;

    if (game.source === "custom") {
      persistCustomGames();
    }
  };

  const setTargetDate = (date: Date, timezone: string = userTimezone): void => {
    if (games.value[activeGameIndex.value]) {
      games.value[activeGameIndex.value].targetDate = date;
      games.value[activeGameIndex.value].targetTimezone = timezone;
      syncCustomGamePersistence(games.value[activeGameIndex.value].id);
    }
  };

  const setGameTitleColor = (color: string): void => {
    const gameIndex = activeGameIndex.value;
    if (gameIndex !== -1 && games.value[gameIndex]) {
      games.value[gameIndex] = { ...games.value[gameIndex], titleColor: color };
      syncCustomGamePersistence(games.value[gameIndex].id);

      // Update CSS variables if running in browser
      if (typeof window !== "undefined") {
        const root = document.documentElement;
        root.style.setProperty("--primary-color", color);

        // Create a slightly darker shade for hover state
        const hex = color.replace(
          /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
          (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`,
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
      syncCustomGamePersistence(games.value[activeGameIndex.value].id);
    }
  };

  const setActiveGameIndex = (index: number): void => {
    if (index >= 0 && index < games.value.length) {
      activeGameIndex.value = index;
      const activeGame = games.value[index];
      const customGameId =
        activeGame?.source === "custom" ? activeGame.id : null;
      persistedActiveCustomGameId.value = customGameId;
      setPersistedActiveCustomGameId(customGameId);
    }
  };

  const selectGameById = (gameId: string): void => {
    const index = games.value.findIndex((game) => game.id === gameId);
    if (index === -1) return;

    const game = games.value[index];
    if (
      game.type === "game" &&
      game.regionalReleaseTimes &&
      game.regionalReleaseTimes.length > 0
    ) {
      pendingRegionalReleaseGameId.value = gameId;
      return;
    }

    setActiveGameIndex(index);

    if (gameId.startsWith("break-")) {
      const minutes = parseInt(gameId.replace("break-", ""), 10);
      if (!Number.isNaN(minutes)) {
        const newDate = new Date();
        newDate.setMinutes(newDate.getMinutes() + minutes);
        setTargetDate(newDate, game.targetTimezone);
      }
    }
  };

  const cancelRegionalReleaseSelection = (): void => {
    pendingRegionalReleaseGameId.value = null;
  };

  const confirmPendingRegionalRelease = (regionalReleaseId: string): void => {
    const game = pendingRegionalReleaseGame.value;
    if (!game?.regionalReleaseTimes) return;

    const gameIndex = games.value.findIndex(
      (candidate) => candidate.id === game.id,
    );
    const regionalRelease = game.regionalReleaseTimes.find(
      (candidate) => candidate.id === regionalReleaseId,
    );

    if (gameIndex === -1 || !regionalRelease) return;

    setActiveGameIndex(gameIndex);
    setTargetDate(new Date(regionalRelease.date), regionalRelease.timezone);
    pendingRegionalReleaseGameId.value = null;
  };

  const addGame = (
    title: string,
    date: Date,
    timezone: string = userTimezone,
    type: "game" | "utility" = "game",
    idOverride?: string,
  ): void => {
    const id = idOverride || `game-${Date.now()}`;
    games.value.push({
      id,
      title,
      titleColor: "#ffffff", // Default color for new games
      targetDate: date,
      targetTimezone: timezone,
      type,
      source: "default",
      createdAt: null,
    });
    // Set the newly added game as active
    setActiveGameIndex(games.value.length - 1);
  };

  const addCustomTimer = (
    title: string,
    date: Date,
    timezone: string = userTimezone,
    idOverride?: string,
  ): Game => {
    const id = idOverride || `custom-${Date.now()}`;
    const customGame: Game = {
      id,
      title,
      titleColor: "#ffffff",
      targetDate: date,
      targetTimezone: timezone,
      type: "game",
      source: "custom",
      createdAt: new Date(),
    };

    const existingIndex = games.value.findIndex((game) => game.id === id);
    if (existingIndex !== -1) {
      games.value[existingIndex] = customGame;
      setActiveGameIndex(existingIndex);
    } else {
      games.value.push(customGame);
      setActiveGameIndex(games.value.length - 1);
    }

    persistCustomGames();
    return customGame;
  };

  const updateCustomTimer = (
    gameId: string,
    updates: Pick<Game, "title" | "targetDate" | "targetTimezone">,
  ): void => {
    const gameIndex = games.value.findIndex((game) => game.id === gameId);
    if (gameIndex === -1 || games.value[gameIndex].source !== "custom") return;

    games.value[gameIndex] = {
      ...games.value[gameIndex],
      title: updates.title,
      targetDate: updates.targetDate,
      targetTimezone: updates.targetTimezone,
    };

    setActiveGameIndex(gameIndex);
    persistCustomGames();
  };

  const removeCustomTimer = (gameId: string): void => {
    const gameIndex = games.value.findIndex((game) => game.id === gameId);
    if (gameIndex === -1 || games.value[gameIndex].source !== "custom") return;

    const wasActive = activeGameIndex.value === gameIndex;
    games.value.splice(gameIndex, 1);
    persistCustomGames();

    if (wasActive) {
      persistedActiveCustomGameId.value = null;
      setPersistedActiveCustomGameId(null);
      activeGameIndex.value = 0;
      findAndSetNextUpcomingGame();
      return;
    }

    if (activeGameIndex.value > gameIndex) {
      activeGameIndex.value -= 1;
    }
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
    const customGames = games.value
      .filter((game) => game.source === "custom")
      .map(toCustomGame);

    games.value = [...createDefaultGames(), ...customGames];
    persistedActiveCustomGameId.value = null;
    setPersistedActiveCustomGameId(null);
    activeGameIndex.value = 0;
    pendingRegionalReleaseGameId.value = null;
    findAndSetNextUpcomingGame();
  };

  function toggleMode(): void {
    isEditMode.value = !isEditMode.value;
  }

  const updateSettings = (
    newSettings: Partial<TimerSettings>,
    persist = true,
  ): void => {
    settings.value = { ...settings.value, ...newSettings };

    // Apply font family to document if running in browser
    if (typeof window !== "undefined" && newSettings.fontFamily) {
      document.documentElement.style.setProperty(
        "--font-family",
        newSettings.fontFamily,
      );
    }

    // Apply font size to timer display if running in browser
    if (typeof window !== "undefined" && newSettings.fontSize) {
      document.documentElement.style.setProperty(
        "--timer-font-size",
        `${newSettings.fontSize}px`,
      );
    }

    if (persist) persistSettings();
  };

  function restartCountdown(id: string) {
    const gameIndex = games.value.findIndex((g) => g.id === id);
    if (gameIndex === -1) return;

    const game = games.value[gameIndex];
    if (game.type !== "utility") return;

    const minutes = getUtilityTimerDurationMinutes(game.title);
    if (minutes === null) return;

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

    // Add customizations
    if (settings.value.digitColor)
      url.searchParams.set(
        "dcolor",
        settings.value.digitColor.replace("#", ""),
      );
    if (settings.value.labelColor)
      url.searchParams.set(
        "lcolor",
        settings.value.labelColor.replace("#", ""),
      );
    if (settings.value.digitSize)
      url.searchParams.set("dsize", settings.value.digitSize.toString());
    if (settings.value.labelSize)
      url.searchParams.set("lsize", settings.value.labelSize.toString());
    if (settings.value.titleSize)
      url.searchParams.set("tsize", settings.value.titleSize.toString());
    url.searchParams.set("showtitle", settings.value.showTitle ? "1" : "0");
    url.searchParams.set("showlabels", settings.value.showLabels ? "1" : "0");
    if (settings.value.framePadding !== null)
      url.searchParams.set("padding", settings.value.framePadding.toString());
    if (settings.value.segmentGap !== null)
      url.searchParams.set("gap", settings.value.segmentGap.toString());
    if (settings.value.glowColor)
      url.searchParams.set("gcolor", settings.value.glowColor.replace("#", ""));
    if (settings.value.glowIntensity !== null)
      url.searchParams.set(
        "gintensity",
        settings.value.glowIntensity.toString(),
      );
    if (settings.value.glowSpread !== null)
      url.searchParams.set("gspread", settings.value.glowSpread.toString());
    url.searchParams.set("scan", settings.value.showScanlines ? "1" : "0");
    if (settings.value.backgroundOpacity !== null)
      url.searchParams.set(
        "bopacity",
        settings.value.backgroundOpacity.toString(),
      );
    if (settings.value.bgBlur !== null)
      url.searchParams.set("bblur", settings.value.bgBlur.toString());
    if (settings.value.obsFontFamily)
      url.searchParams.set("font", settings.value.obsFontFamily);
    if (settings.value.borderWidth !== null)
      url.searchParams.set("bwidth", settings.value.borderWidth.toString());
    if (settings.value.borderColor)
      url.searchParams.set(
        "bcolor",
        settings.value.borderColor.replace("#", ""),
      );
    if (settings.value.animationSpeed !== null)
      url.searchParams.set("speed", settings.value.animationSpeed.toString());
    if (settings.value.scanlineOpacity !== null)
      url.searchParams.set(
        "sopacity",
        settings.value.scanlineOpacity.toString(),
      );
    url.searchParams.set("shine", settings.value.showShine ? "1" : "0");
    if (settings.value.shineOpacity !== null)
      url.searchParams.set("shopacity", settings.value.shineOpacity.toString());

    return url.toString();
  }

  function getObsOverlayUrl() {
    const shareableUrl = getShareableUrl();
    if (!shareableUrl) return "";

    const url = new URL(shareableUrl);
    url.searchParams.delete("game");
    url.searchParams.set("obs", "1");
    url.searchParams.set("bg", "0");

    return url.toString();
  }

  // Set the initial active game to a saved custom timer when available,
  // otherwise fall back to the soonest upcoming countdown.
  if (typeof window !== "undefined") {
    const savedCustomIndex = persistedActiveCustomGameId.value
      ? games.value.findIndex(
          (game) => game.id === persistedActiveCustomGameId.value,
        )
      : -1;

    if (savedCustomIndex >= 0) {
      setActiveGameIndex(savedCustomIndex);
    } else {
      findAndSetNextUpcomingGame();
    }
  }

  return {
    games,
    activeGameIndex,
    activeGame,
    pendingRegionalReleaseGame,
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
    selectGameById,
    confirmPendingRegionalRelease,
    cancelRegionalReleaseSelection,
    addGame,
    removeGame,
    resetGames,
    toggleMode,
    updateSettings,

    getShareableUrl,
    getObsOverlayUrl,
    restartCountdown,
    startTimer,
    stopTimer,
    customGameOptions,
    gameOptions,
    utilityOptions,
    addCustomTimer,
    updateCustomTimer,
    removeCustomTimer,
  };
});
