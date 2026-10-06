import { describe, expect, it } from "bun:test";

import { createDefaultGameBases } from "../../data/default-games";
import {
  getGameBaseSignature,
  parseLiveCountdowns,
  serializeDefaultGames,
} from "../liveCountdowns";

describe("live countdowns feed", () => {
  it("round-trips the built-in game countdowns and skips utility timers", () => {
    const bases = createDefaultGameBases("UTC");
    const payload = JSON.parse(JSON.stringify(serializeDefaultGames(bases)));
    const parsed = parseLiveCountdowns(payload);

    const games = bases.filter((game) => game.type === "game");
    expect(parsed).not.toBeNull();
    expect(parsed?.map(getGameBaseSignature)).toEqual(
      games.map(getGameBaseSignature),
    );
    expect(parsed?.some((game) => game.type !== "game")).toBe(false);
  });

  it("rejects unknown payload versions", () => {
    expect(parseLiveCountdowns({ version: 2, games: [] })).toBeNull();
    expect(parseLiveCountdowns(null)).toBeNull();
  });

  it("drops entries without an ISO 8601 UTC target date", () => {
    const parsed = parseLiveCountdowns({
      version: 1,
      games: [
        {
          id: "ok",
          title: "OK",
          titleColor: "#fff",
          targetDate: "2026-12-01T18:00:00.000Z",
          targetTimezone: "UTC",
          type: "game",
        },
        {
          id: "local-time",
          title: "Local",
          titleColor: "#fff",
          targetDate: "2026-12-01T18:00:00",
          targetTimezone: "UTC",
          type: "game",
        },
      ],
    });

    expect(parsed?.map((game) => game.id)).toEqual(["ok"]);
  });
});
