import type { ArticleTag } from "@/types/api";

export interface Article {
  tag: ArticleTag;
  title: string;
  date: string;
  reactions: string;
  excerpt?: string;
  is_hero?: boolean;
}

export const ARTICLES: Article[] = [
  { tag: "TRAILER", title: "Второй трейлер GTA 6: детальный разбор каждой сцены", date: "12.09.2026", reactions: "2.4K" },
  {
    tag: "LEAK",
    title: "Полная карта Vice City слита в сеть — инсайдеры раскрывают детали",
    date: "10.09.2026",
    reactions: "5.1K",
    is_hero: true,
    excerpt:
      "Инсайдеры раскрывают детали открытого мира — от Порт-Гелены до болот. Разбираем, что подтверждает предыдущие утечки, а что вбрасывается впервые.",
  },
  { tag: "CHARACTER", title: "Кто такая Люсия: полный портрет главной героини", date: "08.09.2026", reactions: "1.8K" },
  { tag: "MAP", title: "Leonida от Порт-Гелены до болот: чего ждать от открытого мира", date: "05.09.2026", reactions: "912" },
  { tag: "GAMEPLAY", title: "Механика напарника: как работает кооперативное ограбление", date: "03.09.2026", reactions: "1.2K" },
  { tag: "RUMOR", title: "Слух: одиночная кампания получит сезонные обновления", date: "01.09.2026", reactions: "744" },
  { tag: "TRAILER", title: "Разбор саундтрека: 14 треков, которые уже опознали", date: "28.08.2026", reactions: "633" },
  { tag: "LEAK", title: "Внутренний билд 2024 года: что осталось в финальной версии", date: "26.08.2026", reactions: "3.3K" },
  { tag: "CHARACTER", title: "Джейсон: тихий напарник с самой сложной аркой", date: "24.08.2026", reactions: "1.1K" },
  { tag: "MAP", title: "Транспорт и дороги: как устроена система движения в Vice City", date: "21.08.2026", reactions: "588" },
  { tag: "GAMEPLAY", title: "Перестрелки переписали с нуля — что говорят тестеры", date: "19.08.2026", reactions: "1.9K" },
  { tag: "RUMOR", title: "PC-версия: почему её ждать не раньше 2027 года", date: "17.08.2026", reactions: "2.7K" },
  { tag: "TRAILER", title: "Кадр за кадром: 27 деталей первого тизера", date: "14.08.2026", reactions: "421" },
  { tag: "LEAK", title: "Список радиостанций из утечки — 11 подтверждённых", date: "11.08.2026", reactions: "1.4K" },
  { tag: "MAP", title: "Подводный мир: рифы, затонувшие суда и что там прячут", date: "09.08.2026", reactions: "377" },
];

export const FILTERS: ("ALL" | ArticleTag)[] = [
  "ALL",
  "TRAILER",
  "LEAK",
  "MAP",
  "CHARACTER",
  "GAMEPLAY",
  "RUMOR",
];

export interface GalleryTile {
  colSpan: number;
  rowSpan: number;
  caption: string;
}

export const GALLERY_TILES: GalleryTile[] = [
  { colSpan: 3, rowSpan: 2, caption: "VICE BEACH · 3840×2160" },
  { colSpan: 3, rowSpan: 1, caption: "ЛЮСИЯ · КЛЮЧЕВОЙ АРТ" },
  { colSpan: 2, rowSpan: 1, caption: "DOWNTOWN · НОЧЬ" },
  { colSpan: 1, rowSpan: 1, caption: "ФРАГМЕНТ КАРТЫ" },
  { colSpan: 2, rowSpan: 2, caption: "БОЛОТА · КОНЦЕПТ" },
  { colSpan: 4, rowSpan: 1, caption: "ТРЕЙЛЕР 02 · КАДР 0:47" },
];

export const TRENDING = [
  { title: "Map leak: что показали инсайдеры", count: 234 },
  { title: "Trailer 02: разбор каждой сцены", count: 187 },
  { title: "Кто такая Люсия", count: 141 },
];
