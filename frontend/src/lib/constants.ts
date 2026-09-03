export const RELEASE_DATE = "2026-05-26T00:00:00Z";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gta6blog.ru";

export const LS_KEYS = {
  firstVisit: "gta6_firstVisit",
  miniClosed: "gta6_miniClosed",
  subscribed: "gta6_subscribed",
} as const;

export const MINI_TIMER_SHOW_AT = 0.75;
export const EXIT_INTENT_TOP_THRESHOLD = 0;
