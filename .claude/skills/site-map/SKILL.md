---
name: site-map
description: Карта сайта GTA6·БЛОГ — какие есть страницы, из каких блоков состоит каждая, что sticky/fixed, какие модалки. Триггерь при любой задаче, требующей понимания структуры сайта, порядка блоков, того "где что находится". Позволяет ориентироваться без чтения JSX.
---

# Карта сайта GTA6·БЛОГ

## Публичные страницы

Общий layout: `frontend/src/app/(public)/layout.tsx` → `PublicChrome` (client) — TopBar, Header, Footer, grain, ProgressBar, MiniTimer, Splash, ExitIntent. Все публичные страницы автоматически заворачиваются в него.

| Route | Файл | Рендер | Назначение |
|---|---|---|---|
| `/` | `app/(public)/page.tsx` → `HomePage` | ISR 60s | Главная: hero + trending + latest(8) + archive(3) + countdown + guide-promo + gallery-teaser + subscribe |
| `/blog` | `app/(public)/blog/page.tsx` | ISR 300s | Список published с фильтром категории (?category=), пагинация 20/страница |
| `/blog/[slug]` | `app/(public)/blog/[slug]/page.tsx` | ISR 3600s | Статья: категория/дата/автор, cover, markdown (marked), теги, «Читай ещё», JSON-LD Article |
| `/gallery` | `app/(public)/gallery/page.tsx` | SSG | Полная сетка 6-col + модалка просмотра (кл/стрелки/Esc). Пока моки |
| `/guide` | `app/(public)/guide/page.tsx` | SSG | «Всё что известно» — evergreen, ссылки на 4 подраздела |
| `/guide/[section]` | `app/(public)/guide/[section]/page.tsx` | SSG | map/characters/vehicles/gameplay — заглушки «в работе» |
| `/about` | `app/(public)/about/page.tsx` | SSG | О проекте + контакт |
| `/privacy`, `/cookies` | `app/(public)/{privacy,cookies}/page.tsx` | SSG | Легал 152-ФЗ / GDPR |
| `/not-found` | `app/not-found.tsx` | SSG | Brutalist 404 |
| `/sitemap.xml` | `app/sitemap.ts` | dynamic | Динамический из БД + статические роуты |
| `/robots.txt` | `app/robots.ts` | static | Allow /, disallow /admin + /api |
| `/manifest.webmanifest` | `app/manifest.ts` | static | PWA manifest |

## Admin (`/admin/*`)

Защищено middleware.ts (JWT в httpOnly cookie). См. skill `admin`.

## СТАТУС РЕАЛИЗАЦИИ (2026-09-01)

- ✅ **Главная** — свёрстана полностью в `HomePage.tsx`, все секции работают, данные мок из `lib/mock-data.ts`
- ❌ Остальные страницы — НЕ созданы
- ❌ Go backend — НЕ создан (папки `backend/` пока нет)

## Главная (`/`) — блоки сверху вниз (IA v3, после Фазы 1)

**Изменения v3:** убраны фильтры категорий из LatestSection (переехали на `/blog`), убран Ad-плейсхолдер 728×90, убран огромный Featured-блок (превращён в компактный промо на `/guide`), Gallery стала teaser-грид (6 плиток) со ссылкой на `/gallery`. Header nav ведёт на реальные роуты.

### Раскладка

**Продуктовый принцип:** первый экран = свежий контент. Countdown — виджет, не hero. Слоган про Vice City убран.

```
┌───────────────────────────────────────────────────────────┐
│ [fixed z=60] Reading progress bar (2px lime, слева→право) │
├───────────────────────────────────────────────────────────┤
│ [fixed z=90] Splash CRT terminal (2.1s, только 1-й визит)│
├───────────────────────────────────────────────────────────┤
│ TopBar (32px, z=41): //247d 14h TO RELEASE · 26.05.2026  │
│   справа: [WHY IT MATTERS →]  (якорь на #countdown)       │
├───────────────────────────────────────────────────────────┤
│ [sticky z=40] Header: logo (2 строки: GTA6_БЛОГ_ +        │
│   «INDEPENDENT NEWS · УТЕЧКИ · РАЗБОРЫ»), nav, date,      │
│   [SUBSCRIBE]. Blur при scrollY>30                        │
├───────────────────────────────────────────────────────────┤
│ EditorialHero (компонент EditorialHero.tsx)               │
│  • [УТЕЧКА · 10.09.2026 · 5 МИН ЧТЕНИЯ]                   │
│  • h1: заголовок hero-статьи                              │
│  • параграф-excerpt                                        │
│  • [→ ЧИТАТЬ ДАЛЬШЕ] [ВСЕ НОВОСТИ ↓]                     │
│  • справа: cover-плитка (сейчас placeholder)              │
│  Источник: getHeroArticle() в lib/api.ts — статья с       │
│  is_hero=true, fallback на последнюю опубликованную.      │
│  Ставится вручную редактором в админке (см. admin skill). │
├───────────────────────────────────────────────────────────┤
│ TrendingBar: ● NOW READING + marquee (топ-3 статьи)      │
├───────────────────────────────────────────────────────────┤
│ Latest (id=latest) — H2 «Свежее» + → ВСЕ МАТЕРИАЛЫ       │
│  • Показывает 8 материалов из БД (server component)       │
│  • Ссылка → /blog для полного списка + фильтров           │
├───────────────────────────────────────────────────────────┤
│ FromArchive (FromArchive.tsx)                             │
│  • // FROM THE ARCHIVE + «Не потеряй важное» italic       │
│  • 3 карточки в grid (tag/title/date/reactions)           │
│  • hover: lime border + translateY(-2px)                  │
│  • → ВЕСЬ АРХИВ (ссылка на #latest)                       │
├───────────────────────────────────────────────────────────┤
│ CountdownTracker (id=countdown, CountdownTracker.tsx)     │
│  • Слева: // THE COUNTDOWN + «Why it matters» italic +    │
│    короткий копирайт + → ВСЁ ЧТО ИЗВЕСТНО                 │
│  • Справа: крупные цифры Countdown (flip-анимация)        │
├───────────────────────────────────────────────────────────┤
│ Featured promo (id=featured) — компактный блок           │
│  • lime hr + заголовок + короткая meta + [→ ЧИТАТЬ ГИД]  │
│  • Кнопка ведёт на /guide                                 │
├───────────────────────────────────────────────────────────┤
│ Gallery teaser (id=gallery) — 6-col grid + → /gallery    │
├───────────────────────────────────────────────────────────┤
│ Subscribe (id=subscribe) — email + Ad 300×250            │
├───────────────────────────────────────────────────────────┤
│ Footer (id=footer)                                        │
├───────────────────────────────────────────────────────────┤
│ [fixed z=50] Mini-timer (bottom-right, scrollY > 75vh)   │
├───────────────────────────────────────────────────────────┤
│ [fixed z=80] Exit-intent modal (mouseleave к верху, 1×)  │
├───────────────────────────────────────────────────────────┤
│ [fixed z=70] CookieBanner (1-й визит, localStorage flag) │
└───────────────────────────────────────────────────────────┘
```

**Что ушло из IA v1:**
- Гигантский hero-слоган `Vice City is coming^vi` — теперь считывалось как фан-сайт, не как медиа
- Крупный inline Countdown в hero — переехал в CountdownTracker-секцию (id=countdown)
- CTA row `[→ ЧИТАТЬ БЛОГ] [СМОТРЕТЬ ТРЕЙЛЕР]` под таймером — заменён на CTA в hero-статье
- Правая meta-панель `ISSUE #047 · PLATFORM · SOURCES TRACKED` в hero — удалена

**Причина изменений:** пользователь на первом экране должен увидеть свежий контент, а не landing-обещание релиза. См. skill `product` о позиционировании как medium.

## Anchor-ссылки внутри главной

Из TopBar / header / footer:
- `#countdown` → CountdownTracker (из TopBar `[WHY IT MATTERS →]`)
- `#latest` → секция Latest
- `#gallery` → Gallery
- `#featured` → Featured
- `#subscribe` → Subscribe
- `#footer` → Footer

## z-index иерархия

| z | Что |
|---|---|
| 90 | Splash CRT |
| 80 | Exit-intent modal |
| 60 | Reading progress bar |
| 50 | Mini-timer |
| 70 | Cookie consent banner |
| 41 | TopBar (32px микро-таймер) |
| 40 | Sticky header |
| 3  | Grain overlay (pointer-events:none) |
| 1  | main / footer |

## Sticky / fixed элементы

Всегда помни, что они перекрывают контент — при hero-паддингах учитывай высоту header (64px).

## LocalStorage keys

| Key | Ставится когда | Проверяется где |
|---|---|---|
| `gta6_firstVisit` | Первое посещение (после показа splash) | `useSplash` → определяет, показывать splash |
| `gta6_cookieConsent` | Пользователь нажал ПРИНЯТЬ или ТОЛЬКО НУЖНЫЕ | `CookieBanner` — не показывать снова |
| `gta6_miniClosed` | (planned) юзер закрыл mini-timer | Пока только state |
| `gta6_subscribed` | (planned) успешная подписка | Не показывать exit-intent |

## Мобилка

Все секции flex-wrap. Хватает `flex-wrap: wrap` на hero/featured/subscribe row. Отдельного mobile-хука пока нет — тестировать при виде <768px.
