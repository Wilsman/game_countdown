import type { GameBase } from "../types/game";

function minutesFromNow(minutes: number): Date {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  return date;
}

// Default countdowns shipped with the app.
//
// Past events are pruned (reference: 2026-09-14). Utility timers are relative
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
      id: "witcher-3-remastered",
      title: "The Witcher 3: Wild Hunt - Remastered",
      titleColor: "#ffd700",
      targetDate: new Date("2026-09-29T10:00:00Z"), // September 29, 2026 at 6:00 AM ET / 3:00 AM PT
      targetTimezone: "America/New_York",
      type: "game",
    },
    {
      id: "gta-6",
      title: "Grand Theft Auto VI",
      titleColor: "#ff69b4",
      targetDate: new Date("2026-11-19T00:00:00Z"), // November 19, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "planet-zoo-2",
      title: "Planet Zoo 2",
      titleColor: "#7cfc00",
      targetDate: new Date("2026-10-13T00:00:00Z"), // October 13, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "boltgun-2",
      title: "Warhammer 40,000: Boltgun 2",
      titleColor: "#b22222",
      targetDate: new Date("2026-10-14T00:00:00Z"), // October 14, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "stranger-than-heaven",
      title: "Stranger Than Heaven",
      titleColor: "#dc143c",
      targetDate: new Date("2027-01-15T00:00:00Z"), // January 15, 2027 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "metroid-ravenous",
      title: "Metroid Ravenous",
      titleColor: "#ff4500",
      targetDate: new Date("2027-01-28T00:00:00Z"), // January 28, 2027 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "tomb-raider-legacy-of-atlantis",
      title: "Tomb Raider: Legacy of Atlantis",
      titleColor: "#20b2aa",
      targetDate: new Date("2027-02-12T00:00:00Z"), // February 12, 2027 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "fable",
      title: "Fable",
      titleColor: "#32cd32",
      targetDate: new Date("2027-02-18T00:00:00Z"), // February 18, 2027 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "persona-4-revival",
      title: "Persona 4 Revival",
      titleColor: "#ffd700",
      targetDate: new Date("2027-02-18T00:00:00Z"), // February 18, 2027 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "atelier-karia",
      title: "Atelier Karia",
      titleColor: "#ffb6c1",
      targetDate: new Date("2027-02-25T00:00:00Z"), // February 25, 2027 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "hyrule-warriors-age-of-calamity-de",
      title: "Hyrule Warriors: Age of Calamity - Definitive Edition",
      titleColor: "#1e90ff",
      targetDate: new Date("2027-02-25T00:00:00Z"), // February 25, 2027 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "wo-long-2",
      title: "Wo Long 2",
      titleColor: "#8b0000",
      targetDate: new Date("2027-03-04T00:00:00Z"), // March 4, 2027 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "trine-6",
      title: "Trine 6",
      titleColor: "#9370db",
      targetDate: new Date("2027-03-04T00:00:00Z"), // March 4, 2027 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "eternal-anima",
      title: "Eternal Anima",
      titleColor: "#40e0d0",
      targetDate: new Date("2027-03-04T00:00:00Z"), // March 4, 2027 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "dragon-quest-monsters-withered-world",
      title: "Dragon Quest Monsters: The Withered World",
      titleColor: "#4169e1",
      targetDate: new Date("2026-12-03T00:00:00Z"), // December 3, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "rayman-legends-retold",
      title: "Rayman Legends Retold",
      titleColor: "#ff8c00",
      targetDate: new Date("2026-12-03T00:00:00Z"), // December 3, 2026 (time not announced)
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
      id: "marathon-nightfall-refresh",
      title: "Marathon: Nightfall Refresh",
      titleColor: "#00ff00",
      targetDate: new Date("2026-10-06T15:00:00Z"), // October 6, 2026 at 4:00 PM BST (usual update time)
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "marathon-symbiosis",
      title: "Marathon: Symbiosis",
      titleColor: "#00ff00",
      targetDate: new Date("2026-12-08T15:00:00Z"), // December 8, 2026 at 3:00 PM GMT (usual update time)
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
      id: "arc-raiders-pve-toggle-beta",
      title: "ARC Raiders: PvE Toggle Beta",
      titleColor: "#ffffff",
      targetDate: new Date("2026-10-13T00:00:00Z"), // October 13-20, 2026 test (start; time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "arc-raiders-pve-toggle-beta-end",
      title: "ARC Raiders: PvE Toggle Beta Ends",
      titleColor: "#ffffff",
      targetDate: new Date("2026-10-20T00:00:00Z"), // October 13-20, 2026 test (end; time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "hunger-closed-beta",
      title: "HUNGER: Closed Beta",
      titleColor: "#f5f0e6",
      targetDate: new Date("2026-10-19T09:00:00Z"), // October 19, 2026 at 10:00 AM BST / 2:00 AM PDT
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "hunger-closed-beta-end",
      title: "HUNGER: Closed Beta Ends",
      titleColor: "#f5f0e6",
      targetDate: new Date("2026-10-26T09:00:00Z"), // October 26, 2026 at 9:00 AM GMT (TBC)
      targetTimezone: "Europe/London",
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
      id: "wardogs-season-2",
      title: "WARDOGS Season 2",
      titleColor: "#ffffff",
      targetDate: new Date("2026-10-15T00:00:00Z"), // October 15, 2026 (time not announced)
      targetTimezone: "UTC",
      type: "game",
    },
    {
      id: "tarkov-patch-1-2-0-0-start",
      title: "Escape from Tarkov: Patch 1.2.0.0 Installation Starts",
      titleColor: "#ff7a00",
      targetDate: new Date("2026-10-06T07:00:00Z"), // October 6, 2026 at 8:00 AM BST / 3:00 AM EDT
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "tarkov-patch-1-2-0-0-end",
      title: "Escape from Tarkov: Patch 1.2.0.0 Installation Ends (Estimated 5–7 Hours, May Be Extended)",
      titleColor: "#ff7a00",
      targetDate: new Date("2026-10-06T14:00:00Z"), // Estimated window: 1:00–3:00 PM BST / 8:00–10:00 AM EDT; countdown uses 7 hours.
      targetTimezone: "Europe/London",
      type: "game",
    },
    {
      id: "tarkov-season-2",
      title: "Tarkov Season 2",
      titleColor: "#ff7a00",
      targetDate: new Date("2026-12-07T08:00:00Z"), // December 7, 2026 at 8:00 AM UK (GMT)
      targetTimezone: "Europe/London",
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
