import type { ArticleTag } from "@/types/api";

export const CATEGORY_LABEL: Record<ArticleTag, string> = {
  TRAILER: "Трейлер",
  LEAK: "Утечка",
  MAP: "Карта",
  CHARACTER: "Персонаж",
  GAMEPLAY: "Геймплей",
  RUMOR: "Слух",
};

export const CATEGORY_LABEL_ALL: Record<"ALL" | ArticleTag, string> = {
  ALL: "Все",
  ...CATEGORY_LABEL,
};

export const CATEGORY_LABEL_UPPER: Record<ArticleTag, string> = {
  TRAILER: "ТРЕЙЛЕР",
  LEAK: "УТЕЧКА",
  MAP: "КАРТА",
  CHARACTER: "ПЕРСОНАЖ",
  GAMEPLAY: "ГЕЙМПЛЕЙ",
  RUMOR: "СЛУХ",
};
