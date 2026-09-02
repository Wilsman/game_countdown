export interface IgdbRelease {
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

interface IgdbReleaseResponse {
  releases: IgdbRelease[];
  range: { start: string; end: string };
  platform: "PC";
  datePrecision: "day";
  minimumHype: number;
  truncated: boolean;
  generatedAt: string;
}

interface IgdbErrorResponse {
  error?: string;
}

function isIgdbRelease(value: unknown): value is IgdbRelease {
  if (!value || typeof value !== "object") return false;
  const release = value as Partial<IgdbRelease>;

  return (
    typeof release.id === "number" &&
    typeof release.gameId === "number" &&
    typeof release.name === "string" &&
    typeof release.releaseAt === "string" &&
    release.platform === "PC" &&
    release.dateOnly === true
  );
}

export async function fetchIgdbReleases(
  start: string,
  end: string,
  signal?: AbortSignal,
  search?: string,
): Promise<IgdbReleaseResponse> {
  const normalizedSearch = search?.trim() ?? "";
  const params = new URLSearchParams({
    start,
    end,
    limit: "200",
    minimumHype: normalizedSearch ? "0" : "1",
  });
  if (normalizedSearch) params.set("search", normalizedSearch);
  const response = await fetch(`/api/igdb/releases?${params.toString()}`, {
    headers: { Accept: "application/json" },
    signal,
  });
  const body = (await response.json().catch(() => ({}))) as
    | Partial<IgdbReleaseResponse>
    | IgdbErrorResponse;

  if (!response.ok) {
    const error = "error" in body && body.error
      ? body.error
      : "Unable to load upcoming releases";
    throw new Error(error);
  }

  const releases = "releases" in body ? body.releases : undefined;
  if (!Array.isArray(releases) || !releases.every(isIgdbRelease)) {
    throw new Error("IGDB returned an unexpected response");
  }

  return body as IgdbReleaseResponse;
}
