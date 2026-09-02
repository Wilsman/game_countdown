export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export type ViewMode = "grid" | "list";

export type SortOption = "default" | "az" | "za" | "hype_desc" | "hype_asc";

export type DateTypeKey = "exact" | "approx" | "tba";
