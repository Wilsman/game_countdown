import type { GameBase } from "../types/game";

function minutesFromNow(minutes: number): Date {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}

// Default countdowns shipped with the app.
//
// Past events are pruned (reference: 2026-09-03). Utility timers are relative
// to "now", so they are built fresh on every call via the userTimezone param.
export function createDefaultGameBases(userTimezone: string): GameBase[] {
  return [
    {
      id: "refund-2hour",
      title: "2hour Refund Window",
      titleColor: "#ffffff",
      targetDate: minutesFromNow(119),
      targetTimezone: userTimezone,
      type: "utility",
    },
    {
      id: "break-60",
      title: "eepy time 😴 (60min)",
      titleColor: "#ffffff",
      targetDate: minutesFromNow(60), // 60 minutes
      targetTimezone: userTimezone,
      type: "utility",
    },
    {
      id: "break-45",
      title: "Be Right Back (45min)",
      titleColor: "#ffffff",
      targetDate: minutesFromNow(45), // 45 minutes
      targetTimezone: userTimezone,
      type: "utility",
    },
    {
      id: "break-30",
      title: "Be Right Back (30min)",
      titleColor: "#ffffff",
      targetDate: minutesFromNow(30), // 30 minutes
      targetTimezone: userTimezone,
      type: "utility",
    },
    {
      id: "break-15",
      title: "Be Right Back (15min)",
      titleColor: "#ffffff",
      targetDate: minutesFromNow(15),
      targetTimezone: userTimezone,
      type: "utility",
    },
    {
      id: "break-10",
      title: "Be Right Back (10min)",
      titleColor: "#ffffff",
      targetDate: minutesFromNow(10),
      targetTimezone: userTimezone,
      type: "utility",
    },
    {
      id: "break-5",
      title: "Snack Break (5min)",
      titleColor: "#ffffff",
      targetDate: minutesFromNow(5),
      targetTimezone: userTimezone,
      type: "utility",
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
      id: "marathon-season-3",
      title: "Marathon: Season 3 ",
      titleColor: "#00ff00",
      targetDate: new Date("2026-09-22T15:00:00Z"), // September 22, 2026 at 4:00 PM BST (usual update time)
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "metro-2039",
      title: "Metro 2039",
      titleColor: "#a9a9a9",
      targetDate: new Date("2026-12-01T00:00:00Z"), // Winter 2026 placeholder
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "clockwork-revolution",
      title: "Clockwork Revolution",
      titleColor: "#daa520",
      targetDate: new Date("2026-12-01T00:00:00Z"), // 2026 placeholder (date not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "judas",
      title: "Judas",
      titleColor: "#daa520",
      targetDate: new Date("2026-12-01T00:00:00Z"), // 2026 placeholder (date not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "the-blood-of-dawnwalker",
      title: "The Blood of Dawnwalker",
      titleColor: "#8b0000",
      targetDate: new Date("2026-09-03T00:00:00Z"), // September 3, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "no-law",
      title: "NO LAW",
      titleColor: "#ffffff",
      targetDate: new Date("2026-12-01T00:00:00Z"), // 2026 placeholder (date not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "supreme-experiment",
      title: "Supreme Experiment",
      titleColor: "#ffffff",
      targetDate: new Date("2026-12-01T00:00:00Z"), // 2026 placeholder (date not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "neo-berlin-2087",
      title: "NEO Berlin 2087",
      titleColor: "#00ffff",
      targetDate: new Date("2026-12-01T00:00:00Z"), // 2026 placeholder (date not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "exodus",
      title: "EXODUS",
      titleColor: "#87ceeb",
      targetDate: new Date("2027-01-01T00:00:00Z"), // 2027 placeholder (date not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "the-expanse-osiris-reborn",
      title: "The Expanse: Osiris Reborn",
      titleColor: "#add8e6",
      targetDate: new Date("2027-03-20T00:00:00Z"), // Spring 2027 placeholder
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "zero-sievert-2",
      title: "ZERO Sievert 2",
      titleColor: "#9acd32",
      targetDate: new Date("2026-12-01T00:00:00Z"), // Early Access planned; date not announced
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
      id: "guns-n-goblins",
      title: "Guns 'n Goblins",
      titleColor: "#6b8e23",
      targetDate: new Date("2027-01-01T00:00:00Z"), // Steam planned release year
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
      id: "fps-games-show-2026",
      title: "FPS Games Show",
      titleColor: "#ffffff",
      targetDate: new Date("2026-09-03T18:00:00Z"), // September 3, 2026 - 2:00 PM EDT / 7:00 PM BST
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "wardogs-early-access",
      title: "WARDOGS Steam Early Access",
      titleColor: "#ffd700",
      targetDate: new Date("2026-09-10T00:00:00Z"), // September 10, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "wardogs-second-closed-beta-start",
      title: "WARDOGS Second Closed Beta Starts",
      titleColor: "#ffd700",
      targetDate: new Date("2026-09-03T19:00:00Z"), // September 3, 2026 - 7:00 PM UTC / 8:00 PM BST
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "wardogs-second-closed-beta-end",
      title: "WARDOGS Second Closed Beta Ends",
      titleColor: "#ffd700",
      targetDate: new Date("2026-09-06T08:00:00Z"), // September 6, 2026 - 8:00 AM UTC
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "delta-force-season-11-reorientation",
      title: "Delta Force Season 11: Reorientation",
      titleColor: "#ffffff",
      targetDate: new Date("2026-09-08T00:00:00Z"), // September 8, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "arc-raiders-frozen-trail",
      title: "ARC Raiders: Frozen Trail",
      titleColor: "#ffffff",
      targetDate: new Date("2026-10-08T00:00:00Z"), // October 8, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "tokyo-game-show-2026",
      title: "Tokyo Game Show 2026",
      titleColor: "#ffffff",
      targetDate: new Date("2026-09-17T10:00:00+09:00"), // September 17, 2026 - 10:00 AM JST (business day start)
      targetTimezone: "Asia/Tokyo",
      type: "game",
    },
    {
      id: "the-game-awards-2026",
      title: "The Game Awards 2026",
      titleColor: "#ffd700",
      targetDate: new Date("2026-12-10T19:30:00-05:00"), // December 10, 2026 - 7:30 PM EST
      targetTimezone: "America/New_York",
      type: "game",
    },
    {
      id: "gamescom-2027",
      title: "gamescom 2027",
      titleColor: "#ffffff",
      targetDate: new Date("2027-08-23T00:00:00Z"), // August 23-29, 2027 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
  ];
}
