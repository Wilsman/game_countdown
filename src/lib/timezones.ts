export const timezones = [
  { name: "Baker Island Time (BIT)", id: "Etc/GMT+12" },
  { name: "Niue Time (NUT)", id: "Pacific/Niue" },
  { name: "Samoa Standard Time (SST)", id: "Pacific/Pago_Pago" },
  { name: "Hawaii-Aleutian Standard Time (HAST)", id: "Pacific/Honolulu" },
  { name: "Cook Islands Time (CKT)", id: "Pacific/Rarotonga" },
  { name: "Tahiti Time (TAHT)", id: "Pacific/Tahiti" },
  { name: "Marquesas Time (MART)", id: "Pacific/Marquesas" },
  { name: "Alaska Standard Time (AKST)", id: "America/Anchorage" },
  { name: "Gambier Islands Time (GAMT)", id: "Pacific/Gambier" },
  { name: "Pacific Standard Time (PST)", id: "America/Los_Angeles" },
  { name: "Clipperton Island Time (CIT)", id: "Pacific/Pitcairn" },
  { name: "Mountain Standard Time (MST)", id: "America/Denver" },
  { name: "Central Standard Time (CST)", id: "America/Chicago" },
  { name: "Galapagos Time (GALT)", id: "Pacific/Galapagos" },
  { name: "Eastern Standard Time (EST)", id: "America/New_York" },
  { name: "Cuba Standard Time (CST)", id: "America/Havana" },
  { name: "Colombia Time (COT)", id: "America/Bogota" },
  { name: "Peru Time (PET)", id: "America/Lima" },
  { name: "Ecuador Time (ECT)", id: "America/Guayaquil" },
  { name: "Venezuela Standard Time (VET)", id: "America/Caracas" },
  { name: "Atlantic Standard Time (AST)", id: "America/Halifax" },
  { name: "Bolivia Time (BOT)", id: "America/La_Paz" },
  { name: "Chile Standard Time (CLT)", id: "America/Santiago" },
  { name: "Newfoundland Standard Time (NST)", id: "America/St_Johns" },
  {
    name: "Argentina Time (ART)",
    id: "America/Argentina/Buenos_Aires",
  },
  { name: "Brasilia Time (BRT)", id: "America/Sao_Paulo" },
  { name: "Uruguay Time (UYT)", id: "America/Montevideo" },
  { name: "South Georgia Time (GST)", id: "Atlantic/South_Georgia" },
  { name: "Azores Standard Time (AZOT)", id: "Atlantic/Azores" },
  { name: "Cape Verde Time (CVT)", id: "Atlantic/Cape_Verde" },
  { name: "Greenwich Mean Time (GMT)", id: "GMT" },
  { name: "Coordinated Universal Time (UTC)", id: "UTC" },
  { name: "Western European Time (WET)", id: "Europe/Lisbon" },
  { name: "British Summer Time (BST)", id: "Europe/London" },
  { name: "Central European Time (CET)", id: "Europe/Paris" },
  { name: "West Africa Time (WAT)", id: "Africa/Lagos" },
  { name: "Western European Summer Time (WEST)", id: "Atlantic/Canary" },
  { name: "South Africa Standard Time (SAST)", id: "Africa/Johannesburg" },
  { name: "Israel Standard Time (IST)", id: "Asia/Jerusalem" },
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
  { name: "Australian Central Standard Time (ACST)", id: "Australia/Adelaide" },
  { name: "Australian Eastern Standard Time (AEST)", id: "Australia/Sydney" },
  { name: "Lord Howe Standard Time (LHST)", id: "Australia/Lord_Howe" },
  { name: "Solomon Islands Time (SBT)", id: "Pacific/Guadalcanal" },
  { name: "New Zealand Standard Time (NZST)", id: "Pacific/Auckland" },
  { name: "Fiji Time (FJT)", id: "Pacific/Fiji" },
  { name: "Chatham Islands Time (CHAST)", id: "Pacific/Chatham" },
  { name: "Tonga Time (TOT)", id: "Pacific/Tongatapu" },
  { name: "Line Islands Time (LINT)", id: "Pacific/Kiritimati" },
].sort((a, b) => {
  const getOffset = (tz: string) => {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        timeZoneName: "short",
        hour: "2-digit",
        hour12: false,
      });
      const parts = formatter.formatToParts(new Date());
      const tzPart =
        parts.find((part) => part.type === "timeZoneName")?.value || "";
      const offsetStr = tzPart.replace(/^[^\d+-]+/, "");
      return parseInt(offsetStr, 10) || 0;
    } catch {
      return 0;
    }
  };

  return getOffset(a.id) - getOffset(b.id);
});

export const getTimezoneName = (timezoneId: string) =>
  timezones.find((timezone) => timezone.id === timezoneId)?.name || timezoneId;

export const formatTimezoneOption = (timezoneId: string) => {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezoneId,
      timeZoneName: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const tzName = timezoneId.split("/").pop()?.replace("_", " ") || timezoneId;
    const tzPart = parts.find((part) => part.type === "timeZoneName");
    const tzOffset = tzPart ? tzPart.value : "";
    return `(${tzOffset}) ${tzName}`;
  } catch {
    return timezoneId;
  }
};

const getOffsetMinutes = (timeZone: string, date: Date) => {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find((part) => part.type === "timeZoneName");
    if (!tzPart) return 0;

    const offsetStr = tzPart.value.replace("GMT", "");
    const firstCharCode = offsetStr.charCodeAt(0);
    const sign = firstCharCode === 45 || firstCharCode === 8722 ? -1 : 1;
    const [hours, minutes] = offsetStr.substring(1).split(":").map(Number);
    return (hours * 60 + (minutes || 0)) * sign;
  } catch {
    return new Date().getTimezoneOffset();
  }
};

export const localToUTCDate = (dateString: string, timezone: string): Date => {
  if (!dateString) return new Date();

  const [datePart, timePart] = dateString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  try {
    const tempDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    const targetOffsetMinutes = getOffsetMinutes(timezone, tempDate);
    return new Date(tempDate.getTime() - targetOffsetMinutes * 60 * 1000);
  } catch {
    const localDate = new Date(
      Date.UTC(year, month - 1, day, hours, minutes, 0),
    );
    return new Date(
      localDate.getTime() - localDate.getTimezoneOffset() * 60000,
    );
  }
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
