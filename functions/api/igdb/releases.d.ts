interface Env {
    TWITCH_CLIENT_ID?: string;
    TWITCH_CLIENT_SECRET?: string;
}
interface IgdbImage {
    image_id?: string;
}
interface IgdbCompany {
    company?: {
        name?: string;
    };
    developer?: boolean;
    publisher?: boolean;
}
interface IgdbWebsite {
    url?: string;
}
interface IgdbReleaseDate {
    id?: number;
    date?: number;
    date_format?: number;
    human?: string;
    release_region?: {
        region?: string;
    };
    game?: {
        id?: number;
        name?: string;
        slug?: string;
        hypes?: number;
        cover?: IgdbImage;
        artworks?: IgdbImage[];
        screenshots?: IgdbImage[];
        involved_companies?: IgdbCompany[];
        websites?: IgdbWebsite[];
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
    steamUrl: string | null;
}
export declare function normalizeReleaseDates(rawReleases: IgdbReleaseDate[]): NormalizedIgdbRelease[];
export declare function onRequestGet(context: {
    request: Request;
    env: Env;
}): Promise<Response>;
export {};
