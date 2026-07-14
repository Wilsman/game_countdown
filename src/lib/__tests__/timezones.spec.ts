import { describe, expect, it } from "bun:test";

import {
  formatTimezoneOption,
  getTimezoneName,
  resolveLocalDateTime,
  timezones,
} from "../timezones";

const expectResolvedDate = (
  dateTime: string,
  timezone: string,
  expectedIso: string,
) => {
  const result = resolveLocalDateTime(dateTime, timezone);

  expect(result.status).toBe("exact");
  if (result.status === "exact") {
    expect(result.date.toISOString()).toBe(expectedIso);
  }
};

describe("timezone labels", () => {
  it("sorts picker options from western to eastern UTC offsets", () => {
    const referenceDate = new Date();
    const offsets = timezones.map(({ id }) => {
      const offsetName = new Intl.DateTimeFormat("en-US", {
        timeZone: id,
        timeZoneName: "longOffset",
      })
        .formatToParts(referenceDate)
        .find((part) => part.type === "timeZoneName")?.value;

      if (!offsetName || offsetName === "GMT") return 0;

      const match = offsetName.match(/^GMT([+-])(\d{1,2}):(\d{2})$/);
      if (!match) throw new Error(`Unexpected offset ${offsetName} for ${id}`);

      const sign = match[1] === "-" ? -1 : 1;
      return sign * (Number(match[2]) * 60 + Number(match[3]));
    });

    expect(offsets).toEqual([...offsets].sort((left, right) => left - right));
  });

  it("uses neutral names for zones whose abbreviations change seasonally", () => {
    const expectedNames = new Map([
      ["America/Havana", "Cuba Time"],
      ["America/Santiago", "Chile Time"],
      ["America/St_Johns", "Newfoundland Time"],
      ["America/Anchorage", "Alaska Time"],
      ["America/Los_Angeles", "Pacific Time"],
      ["America/Denver", "Mountain Time"],
      ["America/Chicago", "Central Time"],
      ["America/New_York", "Eastern Time"],
      ["America/Halifax", "Atlantic Time"],
      ["Atlantic/Azores", "Azores Time"],
      ["Europe/Lisbon", "Lisbon Time"],
      ["Europe/London", "London Time"],
      ["Atlantic/Canary", "Canary Islands Time"],
      ["Europe/Paris", "Central European Time"],
      ["Asia/Jerusalem", "Israel Time"],
      ["Australia/Adelaide", "Australian Central Time"],
      ["Australia/Sydney", "Australian Eastern Time"],
      ["Australia/Lord_Howe", "Lord Howe Time"],
      ["Pacific/Auckland", "New Zealand Time"],
      ["Pacific/Chatham", "Chatham Islands Time"],
    ]);

    for (const [timezoneId, expectedName] of expectedNames) {
      expect(getTimezoneName(timezoneId)).toBe(expectedName);
      expect(timezones.find(({ id }) => id === timezoneId)?.name).toBe(
        expectedName,
      );
    }
  });

  it("formats the effective abbreviation for the scheduled date", () => {
    expect(
      formatTimezoneOption(
        "America/Denver",
        new Date("2026-07-14T18:00:00Z"),
      ),
    ).toBe("(MDT) Denver");
    expect(
      formatTimezoneOption(
        "America/Denver",
        new Date("2026-01-14T19:00:00Z"),
      ),
    ).toBe("(MST) Denver");
  });
});

describe("resolveLocalDateTime", () => {
  it("applies Denver daylight time in summer and standard time in winter", () => {
    expectResolvedDate(
      "2026-07-14T12:00",
      "America/Denver",
      "2026-07-14T18:00:00.000Z",
    );
    expectResolvedDate(
      "2026-01-14T12:00",
      "America/Denver",
      "2026-01-14T19:00:00.000Z",
    );
  });

  it("rejects a local time skipped by the Denver spring transition", () => {
    expect(
      resolveLocalDateTime("2026-03-08T02:30", "America/Denver"),
    ).toEqual({ status: "nonexistent" });
  });

  it("resolves valid times immediately after Denver clock changes", () => {
    expectResolvedDate(
      "2026-03-08T03:30",
      "America/Denver",
      "2026-03-08T09:30:00.000Z",
    );
    expectResolvedDate(
      "2026-11-01T02:30",
      "America/Denver",
      "2026-11-01T09:30:00.000Z",
    );
  });

  it("selects the earlier instant when Denver repeats an autumn time", () => {
    const result = resolveLocalDateTime(
      "2026-11-01T01:30",
      "America/Denver",
    );

    expect(result.status).toBe("ambiguous");
    if (result.status === "ambiguous") {
      expect(result.date.toISOString()).toBe("2026-11-01T07:30:00.000Z");
      expect(result.alternatives.map((date) => date.toISOString())).toEqual([
        "2026-11-01T07:30:00.000Z",
        "2026-11-01T08:30:00.000Z",
      ]);
    }
  });

  it("handles Lord Howe's 30-minute transition", () => {
    const repeatedTime = resolveLocalDateTime(
      "2026-04-05T01:45",
      "Australia/Lord_Howe",
    );

    expect(repeatedTime.status).toBe("ambiguous");
    if (repeatedTime.status === "ambiguous") {
      expect(repeatedTime.date.toISOString()).toBe("2026-04-04T14:45:00.000Z");
    }
    expect(
      resolveLocalDateTime("2026-10-04T02:15", "Australia/Lord_Howe"),
    ).toEqual({ status: "nonexistent" });
  });

  it("supports non-DST fractional offsets", () => {
    expectResolvedDate(
      "2026-07-14T12:00",
      "Asia/Kathmandu",
      "2026-07-14T06:15:00.000Z",
    );
  });

  it("distinguishes malformed input from an unsupported timezone", () => {
    expect(resolveLocalDateTime("2026-02-30T12:00", "UTC")).toEqual({
      status: "malformed",
    });
    expect(
      resolveLocalDateTime("2026-07-14T12:00", "Not/A_Timezone"),
    ).toEqual({ status: "unsupported-zone" });
  });
});
