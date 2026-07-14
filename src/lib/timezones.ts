const TIMEZONE_SORT_REFERENCE_DATE = new Date();

export const timezones = [
  { name: "Baker Island Time (BIT)", id: "Etc/GMT+12" },
  { name: "Niue Time (NUT)", id: "Pacific/Niue" },
  { name: "Samoa Standard Time (SST)", id: "Pacific/Pago_Pago" },
  { name: "Hawaii-Aleutian Standard Time (HAST)", id: "Pacific/Honolulu" },
  { name: "Cook Islands Time (CKT)", id: "Pacific/Rarotonga" },
  { name: "Tahiti Time (TAHT)", id: "Pacific/Tahiti" },
  { name: "Marquesas Time (MART)", id: "Pacific/Marquesas" },
  { name: "Alaska Time", id: "America/Anchorage" },
  { name: "Gambier Islands Time (GAMT)", id: "Pacific/Gambier" },
  { name: "Pacific Time", id: "America/Los_Angeles" },
  { name: "Clipperton Island Time (CIT)", id: "Pacific/Pitcairn" },
  { name: "Mountain Time", id: "America/Denver" },
  { name: "Central Time", id: "America/Chicago" },
  { name: "Galapagos Time (GALT)", id: "Pacific/Galapagos" },
  { name: "Eastern Time", id: "America/New_York" },
  { name: "Cuba Time", id: "America/Havana" },
  { name: "Colombia Time (COT)", id: "America/Bogota" },
  { name: "Peru Time (PET)", id: "America/Lima" },
  { name: "Ecuador Time (ECT)", id: "America/Guayaquil" },
  { name: "Venezuela Standard Time (VET)", id: "America/Caracas" },
  { name: "Atlantic Time", id: "America/Halifax" },
  { name: "Bolivia Time (BOT)", id: "America/La_Paz" },
  { name: "Chile Time", id: "America/Santiago" },
  { name: "Newfoundland Time", id: "America/St_Johns" },
  {
    name: "Argentina Time (ART)",
    id: "America/Argentina/Buenos_Aires",
  },
  { name: "Brasilia Time (BRT)", id: "America/Sao_Paulo" },
  { name: "Uruguay Time (UYT)", id: "America/Montevideo" },
  { name: "South Georgia Time (GST)", id: "Atlantic/South_Georgia" },
  { name: "Azores Time", id: "Atlantic/Azores" },
  { name: "Cape Verde Time (CVT)", id: "Atlantic/Cape_Verde" },
  { name: "Greenwich Mean Time (GMT)", id: "GMT" },
  { name: "Coordinated Universal Time (UTC)", id: "UTC" },
  { name: "Lisbon Time", id: "Europe/Lisbon" },
  { name: "London Time", id: "Europe/London" },
  { name: "Central European Time", id: "Europe/Paris" },
  { name: "West Africa Time (WAT)", id: "Africa/Lagos" },
  { name: "Canary Islands Time", id: "Atlantic/Canary" },
  { name: "South Africa Standard Time (SAST)", id: "Africa/Johannesburg" },
  { name: "Israel Time", id: "Asia/Jerusalem" },
  { name: "Moscow Standard Time (MSK)", id: "Europe/Moscow" },
  { name: "Arabia Standard Time (AST)", id: "Asia/Riyadh" },
  { name: "Iran Standard Time (IRST)", id: "Asia/Tehran" },
  { name: "United Arab Emirates Standard Time (GST)", id: "Asia/Dubai" },
  { name: "Afghanistan Time (AFT)", id: "Asia/Kabul" },
  { name: "Pakistan Standard Time (PKT)", id: "Asia/Karachi" },
  { name: "India Standard Time (IST)", id: "Asia/Kolkata" },
  { name: "Nepal Time (NPT)", id: "Asia/Kathmandu" },
  { name: "Bangladesh Standard Time (BST)", id: "Asia/Dhaka" },
  { name: "Myanmar Time (MMT)", id: "Asia/Yangon" },
  { name: "Indochina Time (ICT)", id: "Asia/Bangkok" },
  { name: "China Standard Time (CST)", id: "Asia/Shanghai" },
  { name: "Singapore Standard Time (SGT)", id: "Asia/Singapore" },
  { name: "Japan Standard Time (JST)", id: "Asia/Tokyo" },
  { name: "Korea Standard Time (KST)", id: "Asia/Seoul" },
  { name: "Australian Central Time", id: "Australia/Adelaide" },
  { name: "Australian Eastern Time", id: "Australia/Sydney" },
  { name: "Lord Howe Time", id: "Australia/Lord_Howe" },
  { name: "Solomon Islands Time (SBT)", id: "Pacific/Guadalcanal" },
  { name: "New Zealand Time", id: "Pacific/Auckland" },
  { name: "Fiji Time (FJT)", id: "Pacific/Fiji" },
  { name: "Chatham Islands Time", id: "Pacific/Chatham" },
  { name: "Tonga Time (TOT)", id: "Pacific/Tongatapu" },
  { name: "Line Islands Time (LINT)", id: "Pacific/Kiritimati" },
].sort((a, b) => {
  try {
    return (
      getOffsetMinutes(a.id, TIMEZONE_SORT_REFERENCE_DATE) -
      getOffsetMinutes(b.id, TIMEZONE_SORT_REFERENCE_DATE)
    );
  } catch {
    return 0;
  }
});

export const getTimezoneName = (timezoneId: string) =>
  timezones.find((timezone) => timezone.id === timezoneId)?.name || timezoneId;

export const formatTimezoneOption = (
  timezoneId: string,
  referenceDate: Date = new Date(),
) => {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezoneId,
      timeZoneName: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(referenceDate);
    const tzName =
      timezoneId.split("/").pop()?.replace(/_/g, " ") || timezoneId;
    const tzPart = parts.find((part) => part.type === "timeZoneName");
    const tzOffset = tzPart ? tzPart.value : "";
    return `(${tzOffset}) ${tzName}`;
  } catch {
    return timezoneId;
  }
};

type DateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export type LocalDateTimeResolution =
  | { status: "exact"; date: Date }
  | {
      status: "ambiguous";
      date: Date;
      alternatives: readonly [Date, Date];
    }
  | { status: "malformed" }
  | { status: "nonexistent" }
  | { status: "unsupported-zone" };

const DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const OFFSET_SAMPLE_HOURS = [-48, -36, -24, -12, 0, 12, 24, 36, 48];

const createWallDate = (parts: DateTimeParts) => {
  const date = new Date(0);
  date.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  date.setUTCHours(parts.hour, parts.minute, 0, 0);
  return date;
};

const isSameDateTime = (left: DateTimeParts, right: DateTimeParts) =>
  left.year === right.year &&
  left.month === right.month &&
  left.day === right.day &&
  left.hour === right.hour &&
  left.minute === right.minute;

function getOffsetMinutes(timeZone: string, date: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  });
  const parts = formatter.formatToParts(date);
  const offsetName =
    parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const normalizedOffset = offsetName.replace("−", "-");

  if (normalizedOffset === "GMT") return 0;

  const match = normalizedOffset.match(/^GMT([+-])(\d{1,2}):(\d{2})$/);
  if (!match) {
    throw new RangeError(`Unsupported timezone offset: ${offsetName}`);
  }

  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

const getDateTimeParts = (
  formatter: Intl.DateTimeFormat,
  date: Date,
): DateTimeParts => {
  const values = new Map(
    formatter
      .formatToParts(date)
      .filter((part) =>
        ["year", "month", "day", "hour", "minute"].includes(part.type),
      )
      .map((part) => [part.type, Number(part.value)]),
  );

  return {
    year: values.get("year") ?? Number.NaN,
    month: values.get("month") ?? Number.NaN,
    day: values.get("day") ?? Number.NaN,
    hour: values.get("hour") ?? Number.NaN,
    minute: values.get("minute") ?? Number.NaN,
  };
};

export const resolveLocalDateTime = (
  dateString: string,
  timezone: string,
): LocalDateTimeResolution => {
  const match = dateString.match(DATE_TIME_PATTERN);
  if (!match) return { status: "malformed" };

  const expectedParts: DateTimeParts = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
  };
  const wallDate = createWallDate(expectedParts);
  const wallDateParts: DateTimeParts = {
    year: wallDate.getUTCFullYear(),
    month: wallDate.getUTCMonth() + 1,
    day: wallDate.getUTCDate(),
    hour: wallDate.getUTCHours(),
    minute: wallDate.getUTCMinutes(),
  };

  if (!isSameDateTime(expectedParts, wallDateParts)) {
    return { status: "malformed" };
  }

  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
  } catch {
    return { status: "unsupported-zone" };
  }

  const offsets = new Set<number>();
  try {
    for (const sampleHours of OFFSET_SAMPLE_HOURS) {
      const sampleDate = new Date(
        wallDate.getTime() + sampleHours * 60 * 60 * 1000,
      );
      offsets.add(getOffsetMinutes(timezone, sampleDate));
    }
  } catch {
    return { status: "unsupported-zone" };
  }

  const candidateTimes = new Set<number>();
  for (const offsetMinutes of offsets) {
    const candidate = new Date(
      wallDate.getTime() - offsetMinutes * 60 * 1000,
    );
    if (isSameDateTime(getDateTimeParts(formatter, candidate), expectedParts)) {
      candidateTimes.add(candidate.getTime());
    }
  }

  const candidates = [...candidateTimes]
    .sort((left, right) => left - right)
    .map((timestamp) => new Date(timestamp));

  if (candidates.length === 0) return { status: "nonexistent" };
  if (candidates.length === 1) {
    return { status: "exact", date: candidates[0] };
  }

  const alternatives: [Date, Date] = [candidates[0], candidates[1]];
  return {
    status: "ambiguous",
    date: alternatives[0],
    alternatives,
  };
};

export const formatLocalDateTime = (date: Date, timezone: string) => {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const year = parts.find((part) => part.type === "year")?.value.padStart(4, "0");
    const month = parts
      .find((part) => part.type === "month")
      ?.value.padStart(2, "0");
    const day = parts.find((part) => part.type === "day")?.value.padStart(2, "0");
    const hour = parts.find((part) => part.type === "hour")?.value.padStart(2, "0");
    const minute = parts
      .find((part) => part.type === "minute")
      ?.value.padStart(2, "0");

    return `${year}-${month}-${day}T${hour}:${minute}`;
  } catch {
    return "";
  }
};
