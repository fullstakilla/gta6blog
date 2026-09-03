export const RELEASE_DATE = "2026-05-26T00:00:00Z";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gta6-blog.ru";

export const LS_KEYS = {
  firstVisit: "gta6_firstVisit",
  miniClosed: "gta6_miniClosed",
  subscribed: "gta6_subscribed",
} as const;

export const MINI_TIMER_SHOW_AT = 0.75;
export const EXIT_INTENT_TOP_THRESHOLD = 0;
