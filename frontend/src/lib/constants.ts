export const RELEASE_DATE = "2026-11-19T00:00:00Z";
export const RELEASE_DATE_HUMAN = "19 ноября 2026";
export const RELEASE_DATE_SHORT = "19.11.2026";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gta6blog.ru";

// Пока не подключён — оставляем пустым. Когда появится, вписать сюда,
// UI автоматически покажет ссылку в about/privacy.
export const CONTACT_EMAIL = "";

export const PRIVACY_UPDATED_AT_HUMAN = "3 сентября 2026";

export const LS_KEYS = {
  firstVisit: "gta6_firstVisit",
  miniClosed: "gta6_miniClosed",
  subscribed: "gta6_subscribed",
} as const;

export const MINI_TIMER_SHOW_AT = 0.75;
export const EXIT_INTENT_TOP_THRESHOLD = 0;

export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
