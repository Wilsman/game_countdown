import { describe, expect, it } from "bun:test";

import { fetchIgdbReleases } from "../igdb";

describe("IGDB client", () => {
  it("requests an encoded date range and validates releases", async () => {
    const originalFetch = globalThis.fetch;
    let requestedUrl = "";

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      requestedUrl = String(input);
      return Response.json({
        releases: [
          {
            id: 20,
            gameId: 10,
            name: "Example Game",
            slug: "example-game",
            releaseAt: "2026-09-24T00:00:00.000Z",
            displayDate: "Sep 24, 2026",
            dateOnly: true,
            platform: "PC",
            regions: ["worldwide"],
            developer: "Example Studio",
            publisher: "Example Publisher",
            hypes: 5,
            coverUrl: null,
            heroUrl: null,
            igdbUrl: "https://www.igdb.com/games/example-game",
          },
        ],
        range: { start: "2026-09-01", end: "2026-10-01" },
        platform: "PC",
        datePrecision: "day",
        minimumHype: 1,
        truncated: false,
        generatedAt: "2026-09-02T12:00:00.000Z",
      });
    }) as typeof fetch;

    try {
      const result = await fetchIgdbReleases("2026-09-01", "2026-10-01");
      expect(requestedUrl).toBe(
        "/api/igdb/releases?start=2026-09-01&end=2026-10-01&limit=200&minimumHype=1",
      );
      expect(result.releases[0]?.name).toBe("Example Game");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("requests unfiltered global search results", async () => {
    const originalFetch = globalThis.fetch;
    let requestedUrl = "";

    globalThis.fetch = (async (input: RequestInfo | URL) => {
      requestedUrl = String(input);
      return Response.json({
        releases: [],
        range: { start: "2026-09-01", end: "2026-10-01" },
        platform: "PC",
        datePrecision: "day",
        minimumHype: 0,
        truncated: false,
        generatedAt: "2026-09-02T12:00:00.000Z",
      });
    }) as typeof fetch;

    try {
      await fetchIgdbReleases(
        "2026-09-01",
        "2026-10-01",
        undefined,
        "Wardogs",
      );
      expect(requestedUrl).toBe(
        "/api/igdb/releases?start=2026-09-01&end=2026-10-01&limit=200&minimumHype=0&search=Wardogs",
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("surfaces API errors", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      Response.json({ error: "IGDB credentials are not configured" }, { status: 503 })) as typeof fetch;

    try {
      await expect(
        fetchIgdbReleases("2026-09-01", "2026-10-01"),
      ).rejects.toThrow("IGDB credentials are not configured");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
