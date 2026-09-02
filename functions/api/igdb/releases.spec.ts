import { describe, expect, it } from "bun:test";

import { normalizeReleaseDates } from "./releases";

describe("IGDB release normalization", () => {
  it("keeps exact-day records, merges regions, and builds image URLs", () => {
    const releases = normalizeReleaseDates([
      {
        id: 100,
        date: 1790208000,
        date_format: 0,
        human: "Sep 24, 2026",
        release_region: { region: "worldwide" },
        game: {
          id: 42,
          name: "Example Game",
          slug: "example-game",
          hypes: 9,
          cover: { image_id: "cover-id" },
          artworks: [{ image_id: "art-id" }],
          involved_companies: [
            { developer: true, company: { name: "Example Studio" } },
            { publisher: true, company: { name: "Example Publisher" } },
          ],
        },
      },
      {
        id: 101,
        date: 1790208000,
        date_format: 0,
        human: "Sep 24, 2026",
        release_region: { region: "europe" },
        game: { id: 42, name: "Example Game", slug: "example-game" },
      },
      {
        id: 102,
        date: 1788220800,
        date_format: 1,
        human: "Sep 2026",
        game: { id: 43, name: "Month-only Game" },
      },
    ]);

    expect(releases).toHaveLength(1);
    expect(releases[0]?.regions).toEqual(["worldwide", "europe"]);
    expect(releases[0]?.developer).toBe("Example Studio");
    expect(releases[0]?.publisher).toBe("Example Publisher");
    expect(releases[0]?.coverUrl).toContain("t_cover_big_2x/cover-id.jpg");
    expect(releases[0]?.heroUrl).toContain("t_720p/art-id.jpg");
    expect(releases[0]?.dateOnly).toBe(true);
  });
});
