interface Env {
  TWITCH_CLIENT_ID?: string;
  TWITCH_CLIENT_SECRET?: string;
}

interface TwitchTokenResponse {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
}

interface IgdbImage {
  image_id?: string;
}

interface IgdbCompany {
  company?: { name?: string };
  developer?: boolean;
  publisher?: boolean;
}

interface IgdbReleaseDate {
  id?: number;
  date?: number;
  date_format?: number;
  human?: string;
  release_region?: { region?: string };
  game?: {
    id?: number;
    name?: string;
    slug?: string;
    hypes?: number;
    cover?: IgdbImage;
    artworks?: IgdbImage[];
    screenshots?: IgdbImage[];
    involved_companies?: IgdbCompany[];
  };
}

export interface NormalizedIgdbRelease {
  id: number;
  gameId: number;
  name: string;
  slug: string;
  releaseAt: string;
  displayDate: string;
  dateOnly: true;
  platform: "PC";
  regions: string[];
  developer: string | null;
  publisher: string | null;
  hypes: number;
  coverUrl: string | null;
  heroUrl: string | null;
  igdbUrl: string;
}

const IGDB_RELEASE_DATES_URL = "https://api.igdb.com/v4/release_dates";
const TWITCH_TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const PC_PLATFORM_ID = 6;
const EXACT_DATE_FORMAT_ID = 0;
const MAX_RANGE_DAYS = 62;
const MAX_RESULTS = 200;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

let tokenCache: { accessToken: string; expiresAt: number } | null = null;

function jsonResponse(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": status === 200
        ? "public, max-age=900, s-maxage=21600, stale-while-revalidate=86400"
        : "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function parseUtcDate(value: string | null, fallback: Date): Date | null {
  if (!value) return fallback;
  if (!DATE_PATTERN.test(value)) return null;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  if (parsed.toISOString().slice(0, 10) !== value) return null;
  return parsed;
}

function utcDateOnly(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function addUtcDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function imageUrl(imageId: string | undefined, size: string): string | null {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

function companyName(
  companies: IgdbCompany[] | undefined,
  role: "developer" | "publisher",
): string | null {
  return companies?.find((company) => company[role])?.company?.name ?? null;
}

export function normalizeReleaseDates(
  rawReleases: IgdbReleaseDate[],
): NormalizedIgdbRelease[] {
  const releases = new Map<string, NormalizedIgdbRelease>();

  for (const rawRelease of rawReleases) {
    const game = rawRelease.game;
    if (
      rawRelease.date_format !== EXACT_DATE_FORMAT_ID ||
      typeof rawRelease.id !== "number" ||
      typeof rawRelease.date !== "number" ||
      typeof game?.id !== "number" ||
      !game.name
    ) {
      continue;
    }

    const releaseAt = new Date(rawRelease.date * 1000);
    if (Number.isNaN(releaseAt.getTime())) continue;

    const key = `${game.id}:${rawRelease.date}`;
    const existing = releases.get(key);
    const region = rawRelease.release_region?.region;

    if (existing) {
      if (region && !existing.regions.includes(region)) {
        existing.regions.push(region);
      }
      continue;
    }

    const artworkId = game.artworks?.[0]?.image_id;
    const screenshotId = game.screenshots?.[0]?.image_id;
    const coverId = game.cover?.image_id;
    const slug = game.slug ?? String(game.id);

    releases.set(key, {
      id: rawRelease.id,
      gameId: game.id,
      name: game.name,
      slug,
      releaseAt: releaseAt.toISOString(),
      displayDate: rawRelease.human ?? releaseAt.toISOString().slice(0, 10),
      dateOnly: true,
      platform: "PC",
      regions: region ? [region] : [],
      developer: companyName(game.involved_companies, "developer"),
      publisher: companyName(game.involved_companies, "publisher"),
      hypes: typeof game.hypes === "number" ? game.hypes : 0,
      coverUrl: imageUrl(coverId, "cover_big_2x"),
      heroUrl: imageUrl(artworkId ?? screenshotId, "720p"),
      igdbUrl: `https://www.igdb.com/games/${encodeURIComponent(slug)}`,
    });
  }

  return [...releases.values()].sort((left, right) => {
    const dateOrder = left.releaseAt.localeCompare(right.releaseAt);
    if (dateOrder !== 0) return dateOrder;
    if (left.hypes !== right.hypes) return right.hypes - left.hypes;
    return left.name.localeCompare(right.name);
  });
}

async function getAppAccessToken(env: Env): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 5 * 60 * 1000) {
    return tokenCache.accessToken;
  }

  const clientId = env.TWITCH_CLIENT_ID?.trim();
  const clientSecret = env.TWITCH_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("IGDB credentials are not configured");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });
  const response = await fetch(TWITCH_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(`Twitch app authentication failed (${response.status})`);
  }

  const token = (await response.json()) as TwitchTokenResponse;
  if (!token.access_token) {
    throw new Error("Twitch app authentication returned no access token");
  }

  tokenCache = {
    accessToken: token.access_token,
    expiresAt: now + Math.max(60, token.expires_in ?? 3600) * 1000,
  };
  return token.access_token;
}

export async function onRequestGet(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const today = utcDateOnly(new Date());
  const start = parseUtcDate(url.searchParams.get("start"), today);
  const end = parseUtcDate(url.searchParams.get("end"), addUtcDays(today, 31));

  if (!start || !end || end <= start) {
    return jsonResponse(
      { error: "Use a valid UTC date range: start=YYYY-MM-DD&end=YYYY-MM-DD" },
      400,
    );
  }

  const rangeDays = (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000);
  if (rangeDays > MAX_RANGE_DAYS) {
    return jsonResponse(
      { error: `Date ranges cannot exceed ${MAX_RANGE_DAYS} days` },
      400,
    );
  }

  const requestedLimit = Number(url.searchParams.get("limit") ?? 120);
  const limit = Number.isInteger(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), MAX_RESULTS)
    : 120;
  const requestedMinimumHype = Number(url.searchParams.get("minimumHype") ?? 1);
  const minimumHype = Number.isInteger(requestedMinimumHype)
    ? Math.min(Math.max(requestedMinimumHype, 0), 1000)
    : 1;
  const search = url.searchParams.get("search")?.trim() ?? "";
  if (search.length > 80) {
    return jsonResponse({ error: "Search terms cannot exceed 80 characters" }, 400);
  }

  try {
    const accessToken = await getAppAccessToken(env);
    const clientId = env.TWITCH_CLIENT_ID?.trim() ?? "";
    const effectiveStart = search ? today : start;
    const effectiveMinimumHype = search ? 0 : minimumHype;
    const startUnix = Math.floor(effectiveStart.getTime() / 1000);
    const endUnix = Math.floor(end.getTime() / 1000);
    const escapedSearch = search.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    const query = [
      "fields id,date,date_format,human,release_region.region,",
      "game.id,game.name,game.slug,game.hypes,game.cover.image_id,",
      "game.artworks.image_id,game.screenshots.image_id,",
      "game.involved_companies.company.name,",
      "game.involved_companies.developer,game.involved_companies.publisher;",
      `where platform = ${PC_PLATFORM_ID}`,
      search
        ? ` & date >= ${startUnix}`
        : ` & date >= ${startUnix} & date < ${endUnix}`,
      ` & date_format = ${EXACT_DATE_FORMAT_ID} & game.game_type = 0`,
      search ? ` & game.name ~ *"${escapedSearch}"*` : "",
      effectiveMinimumHype > 0
        ? ` & game.hypes >= ${effectiveMinimumHype};`
        : ";",
      "sort date asc;",
      `limit ${limit};`,
    ].join("");

    const igdbResponse = await fetch(IGDB_RELEASE_DATES_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Client-ID": clientId,
        "Content-Type": "text/plain",
      },
      body: query,
    });

    if (!igdbResponse.ok) {
      throw new Error(`IGDB request failed (${igdbResponse.status})`);
    }

    const rawReleases = (await igdbResponse.json()) as IgdbReleaseDate[];
    const releases = normalizeReleaseDates(rawReleases);

    return jsonResponse({
      releases,
      range: {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
      },
      platform: "PC",
      datePrecision: "day",
      minimumHype: effectiveMinimumHype,
      searchScope: search ? "all-upcoming" : "selected-month",
      truncated: rawReleases.length >= limit,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "IGDB request failed";
    console.error("IGDB releases error:", message);

    return jsonResponse(
      {
        error: message === "IGDB credentials are not configured"
          ? message
          : "Upcoming releases are temporarily unavailable",
      },
      message === "IGDB credentials are not configured" ? 503 : 502,
    );
  }
}
