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
  // OBS Overlay specific
  digitColor: string | null;
  labelColor: string | null;
  digitSize: number | null;
  labelSize: number | null;
  titleSize: number | null;
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

interface RegionalReleaseTime {
  id: string;
  label: string;
  timezone: string;
  date: Date;
}

export type GameSource = "default" | "custom";

export interface Game {
  id: string;
  title: string;
  titleColor: string;
  targetDate: Date;
  targetTimezone: string;
  type: "game" | "utility";
  source: GameSource;
  createdAt: Date | null;
  regionalReleaseTimes?: RegionalReleaseTime[];
}

type GameBase = Omit<Game, "source" | "createdAt">;

export const useTimerStore = defineStore("timer", () => {
  const CUSTOM_GAMES_STORAGE_KEY = "game-countdown.custom-games";
  const ACTIVE_CUSTOM_GAME_STORAGE_KEY = "game-countdown.active-custom-game-id";

  // Get user's current timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const crimsonDesertGlobalReleaseDate = new Date("2026-03-19T22:00:00Z");

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
    }

    // Update background setting if provided
    if (bgEnabled !== null) {
      updateSettings({ enableGameBackground: bgEnabled === "1" });
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
      updateSettings(customizations);
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

  // Default games
  const defaultGames: GameBase[] = [
    {
      id: "refund-2hour",
      title: "2hour Refund Window",
      titleColor: "#ffffff",
      targetDate: createDateMinutesFromNow(119),
      targetTimezone: userTimezone,
      type: "utility",
    },
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
      id: "arc-raiders-",
      title: "Arc Raiders - Riven Tides",
      titleColor: "#ffffff",
      targetDate: new Date("2026-04-28T09:00:00Z"), // April 28 - 9am BST
      targetTimezone: "Europe/London",
      type: "game",
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
      id: "wow-midnight",
      title: "World of Warcraft: Midnight",
      titleColor: "#ffd700",
      targetDate: new Date("2026-03-02T23:00:00Z"), // March 2, 2026 at 3:00 PM PST
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "slay-the-spire-2",
      title: "Slay the Spire 2 (Early Access)",
      titleColor: "#ff69b4",
      targetDate: new Date("2026-03-05T18:00:00Z"), // UK (London): Thursday, March 5, 2026 at 6:00 PM GMT
      targetTimezone: "Europe/London",
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
      id: "quarantine-zone",
      title: "Quarantine Zone: The Last Check",
      titleColor: "#ffffff",
      targetDate: new Date("2026-01-15T00:00:00Z"), // Approx Jan 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "marathon",
      title: "Marathon: UK",
      titleColor: "#00ff00",
      targetDate: new Date("2026-03-05T18:00:00Z"), // UK: Wednesday, March 5, 2026 at 6:00 PM GMT
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "marathon-cryo-archive",
      title: "Marathon | Cryo Archive",
      titleColor: "#00ff00",
      targetDate: new Date("2026-03-20T17:00:00Z"), // March 20, 2026 at 10:00 AM PT
      targetTimezone: "America/Los_Angeles",
      type: "game",
    },
    {
      id: "marathon-server-slam-open-beta",
      title: "Marathon - Server Slam (Open Beta, Feb 26-Mar 2)",
      titleColor: "#00ff00",
      targetDate: new Date("2026-02-26T18:00:00Z"), // Starts 10:00 AM PST / 12:00 PM CST / 1:00 PM EST / 6:00 PM GMT
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "crimson-desert",
      title: "Crimson Desert (Full Launch)",
      titleColor: "#dc143c",
      targetDate: crimsonDesertGlobalReleaseDate,
      targetTimezone: "UTC",
      type: "game",
      regionalReleaseTimes: [
        {
          id: "los-angeles",
          label: "Los Angeles",
          timezone: "America/Los_Angeles",
          date: crimsonDesertGlobalReleaseDate,
        },
        {
          id: "dallas",
          label: "Dallas",
          timezone: "America/Chicago",
          date: crimsonDesertGlobalReleaseDate,
        },
        {
          id: "new-york",
          label: "New York",
          timezone: "America/New_York",
          date: crimsonDesertGlobalReleaseDate,
        },
        {
          id: "sao-paulo",
          label: "Sao Paulo",
          timezone: "America/Sao_Paulo",
          date: crimsonDesertGlobalReleaseDate,
        },
        {
          id: "london",
          label: "London",
          timezone: "Europe/London",
          date: crimsonDesertGlobalReleaseDate,
        },
        {
          id: "berlin",
          label: "Berlin",
          timezone: "Europe/Berlin",
          date: crimsonDesertGlobalReleaseDate,
        },
        {
          id: "paris",
          label: "Paris",
          timezone: "Europe/Paris",
          date: crimsonDesertGlobalReleaseDate,
        },
        {
          id: "cape-town",
          label: "Cape Town",
          timezone: "Africa/Johannesburg",
          date: crimsonDesertGlobalReleaseDate,
        },
        {
          id: "istanbul",
          label: "Istanbul",
          timezone: "Europe/Istanbul",
          date: crimsonDesertGlobalReleaseDate,
        },
        {
          id: "dubai",
          label: "Dubai",
          timezone: "Asia/Dubai",
          date: crimsonDesertGlobalReleaseDate,
        },
        {
          id: "singapore",
          label: "Singapore",
          timezone: "Asia/Singapore",
          date: crimsonDesertGlobalReleaseDate,
        },
        {
          id: "beijing",
          label: "Beijing",
          timezone: "Asia/Shanghai",
          date: crimsonDesertGlobalReleaseDate,
        },
        {
          id: "seoul",
          label: "Seoul",
          timezone: "Asia/Seoul",
          date: crimsonDesertGlobalReleaseDate,
        },
        {
          id: "tokyo",
          label: "Tokyo",
          timezone: "Asia/Tokyo",
          date: crimsonDesertGlobalReleaseDate,
        },
        {
          id: "sydney",
          label: "Sydney",
          timezone: "Australia/Sydney",
          date: crimsonDesertGlobalReleaseDate,
        },
      ],
    },
    {
      id: "death-stranding-2",
      title: "Death Stranding 2: On the Beach",
      titleColor: "#6b7280",
      targetDate: new Date("2026-03-19T00:00:00Z"), // March 19, 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "mlb-the-show-26",
      title: "MLB The Show 26",
      titleColor: "#1d4ed8",
      targetDate: new Date("2026-03-17T00:00:00Z"), // March 17, 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "pon-early-access",
      title: "P.O.N (Early Access - Q1 2026 Window)",
      titleColor: "#ffffff",
      targetDate: new Date("2026-03-31T00:00:00Z"), // Q1 2026 placeholder
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
      id: "nakwon-closed-alpha-test",
      title: "NAKWON: Closed Alpha",
      titleColor: "#ff4500",
      targetDate: new Date("2026-03-11T23:00:00Z"), // Wednesday, March 11, 2026 at 4:00 PM PT
      targetTimezone: "America/Los_Angeles",
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
      title: "Road to Vostok (Early Access)",
      titleColor: "#ffffff",
      targetDate: new Date("2026-04-07T15:00:00Z"), // April 7, 2026 8:00 AM PT
      targetTimezone: "America/Los_Angeles",
      type: "game",
    },
    {
      id: "replaced",
      title: "REPLACED",
      titleColor: "#ffffff",
      targetDate: new Date("2026-04-14T00:00:00Z"), // April 14, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "mouse-pi-for-hire",
      title: "MOUSE: P.I. For Hire",
      titleColor: "#ffffff",
      targetDate: new Date("2026-04-16T00:00:00Z"), // April 16, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "tides-of-tomorrow",
      title: "Tides of Tomorrow",
      titleColor: "#ffffff",
      targetDate: new Date("2026-04-22T00:00:00Z"), // April 22, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "outbound",
      title: "Outbound",
      titleColor: "#ffffff",
      targetDate: new Date("2026-04-23T00:00:00Z"), // April 23, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "moomintroll-winters-warmth",
      title: "Moomintroll: Winter's Warmth",
      titleColor: "#ffffff",
      targetDate: new Date("2026-04-27T00:00:00Z"), // April 27, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "hades-ii-xbox-pc-pc-game-pass",
      title: "Hades II on Xbox PC / PC Game Pass",
      titleColor: "#ffffff",
      targetDate: new Date("2026-04-14T00:00:00Z"), // April 14, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "diablo-iv-lord-of-hatred",
      title: "Diablo IV: Lord of Hatred",
      titleColor: "#ffffff",
      targetDate: new Date("2026-04-28T00:00:00Z"), // April 28, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "will-follow-the-light",
      title: "WILL: Follow The Light",
      titleColor: "#ffffff",
      targetDate: new Date("2026-04-28T00:00:00Z"), // April 28, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "heroes-of-might-and-magic-olden-era",
      title: "Heroes of Might and Magic: Olden Era",
      titleColor: "#ffffff",
      targetDate: new Date("2026-04-30T00:00:00Z"), // April 30, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "wax-heads",
      title: "Wax Heads",
      titleColor: "#ffffff",
      targetDate: new Date("2026-05-05T00:00:00Z"), // May 5, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "mixtape",
      title: "Mixtape",
      titleColor: "#ffffff",
      targetDate: new Date("2026-05-07T00:00:00Z"), // May 7, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "zero-parades-for-dead-spies",
      title: "ZERO PARADES: For Dead Spies",
      titleColor: "#ffffff",
      targetDate: new Date("2026-05-21T00:00:00Z"), // May 21, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "paralives",
      title: "Paralives",
      titleColor: "#ffffff",
      targetDate: new Date("2026-05-25T00:00:00Z"), // May 25, 2026 (time not announced)
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
      id: "grayzone-warfare-drops-stage-2-start",
      title: "Grayzone Warfare Drops Stage 2 - PB Laugo Arms (Starts)",
      titleColor: "#a9a9a9",
      targetDate: new Date("2026-04-04T13:00:00Z"), // April 4, 2026 at 15:00 CEST
      targetTimezone: "Europe/Berlin",
      type: "game",
    },
    {
      id: "grayzone-warfare-hotfix-shutdown",
      title: "Gray Zone Warfare: Hotfix Shutdown Starts",
      titleColor: "#a9a9a9",
      targetDate: new Date("2026-04-08T07:30:00Z"), // April 8, 2026 at 3:30 AM EDT / 9:30 AM CEST
      targetTimezone: "America/New_York",
      type: "game",
    },
    {
      id: "grayzone-warfare-hotfix-down",
      title: "Gray Zone Warfare: Servers Down",
      titleColor: "#a9a9a9",
      targetDate: new Date("2026-04-08T08:00:00Z"), // April 8, 2026 at 4:00 AM EDT / 10:00 AM CEST
      targetTimezone: "America/New_York",
      type: "game",
    },
    {
      id: "grayzone-warfare-hotfix-up",
      title: "Gray Zone Warfare: Servers Back Online",
      titleColor: "#a9a9a9",
      targetDate: new Date("2026-04-08T08:40:00Z"), // April 8, 2026 at 4:40 AM EDT / 10:40 AM CEST
      targetTimezone: "America/New_York",
      type: "game",
    },
    {
      id: "grayzone-warfare-twitch-drops-stage-3-start",
      title: "Gray Zone Warfare: Twitch Drops Stage 3 (Starts)",
      titleColor: "#a9a9a9",
      targetDate: new Date("2026-04-08T13:00:00Z"), // April 8, 2026 at 9 AM ET / 2 PM UK / 3 PM CET
      targetTimezone: "America/New_York",
      type: "game",
    },
    {
      id: "grayzone-warfare-twitch-drops-stage-3-end",
      title: "Gray Zone Warfare: Twitch Drops Stage 3 (Ends)",
      titleColor: "#a9a9a9",
      targetDate: new Date("2026-04-12T23:59:00-04:00"), // April 12, 2026 at 11:59 PM ET (end of day)
      targetTimezone: "America/New_York",
      type: "game",
    },
    {
      id: "cor3-teaser-video",
      title: "COR3 teaser video",
      titleColor: "#ffffff",
      targetDate: new Date("2026-02-01T15:00:00Z"), // Sunday, 1 February 2026 at 15:00:00 GMT
      targetTimezone: "GMT",
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
      id: "nor-0ath-of-blood",
      title: "Norse: Oath of Blood",
      titleColor: "#ffffff",
      targetDate: new Date("2026-02-03T00:00:00Z"),
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "yapyap",
      title: "Yapyap",
      titleColor: "#ffffff",
      targetDate: new Date("2026-02-03T00:00:00Z"),
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "nioh-3",
      title: "Nioh 3",
      titleColor: "#ff0000",
      targetDate: new Date("2026-02-05T00:00:00Z"),
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "pubg-blindspot",
      title: "PUBG Blindspot",
      titleColor: "#ff6b35",
      targetDate: new Date("2026-02-05T00:00:00Z"),
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "wow-burning-crusade-beta",
      title: "WoW: Burning Crusade (Beta)",
      titleColor: "#ffd700",
      targetDate: new Date("2026-02-05T00:00:00Z"),
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "sea-of-remnants-beta",
      title: "Sea of Remnants (Beta)",
      titleColor: "#00bfff",
      targetDate: new Date("2026-02-05T00:00:00Z"),
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "duckov-tarkov-collab",
      title: "Duckov × Escape from Tarkov Collab 🦆",
      titleColor: "#ffd700",
      targetDate: new Date("2026-02-10T00:00:00Z"),
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "crisol-theater-of-idols",
      title: "Crisol: Theater of Idols",
      titleColor: "#8b4513",
      targetDate: new Date("2026-02-10T00:00:00Z"),
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "reanimal",
      title: "Reanimal",
      titleColor: "#800080",
      targetDate: new Date("2026-02-13T00:00:00Z"),
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "high-on-life-2-13-february-2026",
      title: "High on Life 2 (Feb 13, 2026)",
      titleColor: "#ff1493",
      targetDate: new Date("2026-02-13T00:00:00Z"),
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "styx-blades-of-greed",
      title: "Styx: Blades of Greed",
      titleColor: "#2e8b57",
      targetDate: new Date("2026-02-19T00:00:00Z"),
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "the-cube-save-us-beta",
      title: "THE CUBE (Beta Starts)",
      titleColor: "#ff6347",
      targetDate: new Date("2026-02-20T01:00:00Z"), // Feb 20, 2026 10:00 AM KST / Feb 19, 2026 5:00 PM Los Angeles (PST, UTC-8)
      targetTimezone: "America/Los_Angeles",
      type: "game",
    },
    {
      id: "the-cube-save-us-beta-ends",
      title: "THE CUBE (Beta Ends)",
      titleColor: "#ff6347",
      targetDate: new Date("2026-02-23T01:00:00Z"), // Feb 23, 2026 10:00 AM KST / Feb 22, 2026 5:00 PM Los Angeles (PST, UTC-8)
      targetTimezone: "America/Los_Angeles",
      type: "game",
    },
    {
      id: "resident-evil-requiem",
      title: "Resident Evil Requiem",
      titleColor: "#8b0000",
      targetDate: new Date("2026-02-27T00:00:00Z"),
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
      id: "fatal-frame-2-crimson-butterfly-remake",
      title: "Fatal Frame II: Crimson Butterfly Remake",
      titleColor: "#b91c1c",
      targetDate: new Date("2026-03-12T00:00:00Z"), // March 12, 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "solasta-2",
      title: "Solasta II (Early Access)",
      titleColor: "#7c3aed",
      targetDate: new Date("2026-03-12T00:00:00Z"), // March 12, 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "monster-hunter-stories-3",
      title: "Monster Hunter Stories 3: Twisted Reflection",
      titleColor: "#f59e0b",
      targetDate: new Date("2026-03-13T00:00:00Z"), // March 13, 2026
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "sand",
      title: "SAND: Raiders of Sophie",
      titleColor: "#c2b280",
      targetDate: new Date("2026-03-31T00:00:00Z"), // March 2026 placeholder (TBD day)
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
    {
      id: "gothic-1-remake",
      title: "Gothic 1 Remake",
      titleColor: "#ffffff",
      targetDate: new Date("2026-06-05T00:00:00Z"), // June 5, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "the-adventures-of-elliot-the-millennium-tales",
      title: "The Adventures of Elliot: The Millennium Tales",
      titleColor: "#ffffff",
      targetDate: new Date("2026-06-18T00:00:00Z"), // June 18, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "ascend-to-zero",
      title: "Ascend to Zero",
      titleColor: "#ffffff",
      targetDate: new Date("2026-07-13T00:00:00Z"), // July 13, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "grave-seasons",
      title: "Grave Seasons",
      titleColor: "#ffffff",
      targetDate: new Date("2026-08-14T00:00:00Z"), // August 14, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "metal-gear-solid-master-collection-vol-2",
      title: "Metal Gear Solid: Master Collection Vol. 2",
      titleColor: "#ffffff",
      targetDate: new Date("2026-08-27T00:00:00Z"), // August 27, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "people-of-note",
      title: "People of Note",
      titleColor: "#ffffff",
      targetDate: new Date("2026-04-07T00:00:00Z"), // April 7, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "morbid-metal",
      title: "Morbid Metal",
      titleColor: "#ffffff",
      targetDate: new Date("2026-04-08T00:00:00Z"), // April 8, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "the-occultist",
      title: "The Occultist",
      titleColor: "#ffffff",
      targetDate: new Date("2026-04-08T00:00:00Z"), // April 8, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "find-your-words",
      title: "Find Your Words",
      titleColor: "#ffffff",
      targetDate: new Date("2026-04-08T00:00:00Z"), // April 8, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "wind-rose",
      title: "Wind Rose",
      titleColor: "#ffffff",
      targetDate: new Date("2026-04-14T08:00:00Z"), // April 14, 2026 at 9:00 AM BST (UTC+1)
      targetTimezone: "Europe/London",
      type: "game",
    },
  ];

  const createDefaultGames = () => defaultGames.map(toDefaultGame);

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
    titleSize: null,
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

  const updateSettings = (newSettings: Partial<TimerSettings>): void => {
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
