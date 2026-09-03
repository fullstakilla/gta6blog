---
name: decisions
description: ADR-лог принятых архитектурных и продуктовых решений — что выбрали, почему, какие альтернативы отклонили. Триггерь когда возникает вопрос "а почему у нас X, а не Y" или "может нам заменить X на Y" — сначала проверь, обсуждалось ли уже здесь.
---

# Architectural Decision Log

Короткие ADR-записи: **Контекст → Решение → Альтернативы → Последствия**. Дата в заголовке — когда решение принято.

---

## ADR-001 · 2026-09-01 · Стек: Next.js all-in вместо Next + Go

**Контекст.** В исходном ТЗ бэк планировался на Go (chi + sqlc + pgx). Фронт — Next.js 16. Между ними — REST + JWT + CORS + отдельный docker-compose.

**Решение.** Отказаться от Go-сервиса. Вся бэк-логика — **прямо в Next.js через Server Actions + Route Handlers + Prisma + PostgreSQL**.

**Почему.**
- Продукт read-heavy с ISR-cache — большинство запросов даже не касаются рантайма.
- Server Actions идеально ложатся на формы (комменты, реакции, подписка, admin).
- Автосинхронизация типов БД → бэк → RSC → UI через Prisma.
- Один язык, одна кодовая база, одна деплой-цепочка.
- Команда маленькая, TS-native. Держать два языка = замедление.
- Time-to-market MVP — приоритет над теоретическим ceiling'ом производительности.

**Отклонённые альтернативы.**
- **Go + chi + sqlc** — исходный план. Overkill для нашего масштаба; удваивает поверхность поддержки.
- **Гибрид (Next MVP → Go для узких мест позже)** — тоже рассмотрено. Итог тот же: сейчас Next+Prisma; если появится реальное узкое место (например `/api/articles/trending` при 500 RPS) — точечно вынести именно его.

**Последствия.**
- Производительный потолок ниже, чем у Go. Не проблема до значительного трафика.
- Rate limiting и cron-задачи — требуют доп. библиотек (`@upstash/ratelimit`, Vercel Cron / внешний cron). В Go были нативно.
- Vendor lock на Prisma. Слазить больно, но актуальность не под угрозой.
- В РФ Vercel ненадёжен — self-host в Docker (Next + Node) — работает, но чуть менее вылизано, чем Go-бинарник.

**Что удалено.** Папка `backend/` вместе с 46 Go-скиллами (samber/cc-skills-golang).

**Cross-refs:** `api-contract`, `data-model`, `admin`.

---

## ADR-002 · 2026-09-01 · ORM: Prisma вместо sqlc / drizzle / kysely

**Контекст.** Раз бэк — на TS, нужен способ работать с Postgres.

**Решение.** **Prisma** как основной ORM.

**Почему.**
- Type-safety из коробки, миграции первоклассные, отличный DX.
- Экосистема (Prisma Studio, seed-скрипты, миграции dev/deploy).
- Автогенерируемый клиент даёт готовые типы для Server Actions/RSC.

**Отклонённые альтернативы.**
- **Drizzle** — легче, ближе к SQL, но экосистема младше, меньше плагинов.
- **Kysely** — только query-builder, миграции руками. Хорошо для больших команд, для нашего размера — оверхед.
- **Raw pg + zod** — максимальный контроль, но лишний boilerplate.

**Последствия.**
- Тяжёлый сгенерированный клиент (5-15MB).
- N+1 запросы легко случайно написать — держать `Prisma.log` в dev + code-review.
- Complex SQL (window functions, полнотекстовый поиск) — через `$queryRaw`. В MVP редко.

**Cross-refs:** `data-model`, `api-contract`.

---

## ADR-003 · 2026-09-01 · Auth: iron-session вместо JWT

**Контекст.** Нужна авторизация для `/admin/*`. 1-3 админа, нет мобильного приложения, нет SSO, нет OAuth.

**Решение.** **`iron-session`** — encrypted cookie, без таблицы `sessions` в БД.

**Почему.**
- Проще, чем JWT + refresh-cycle. Session data сериализуется в encrypted cookie.
- Нет distributed cache для отзыва токенов — а он нам не нужен на 3 админа.
- Прекрасно совместим с Server Actions и middleware.

**Отклонённые альтернативы.**
- **JWT + refresh** (изначальный план) — overkill без мобильного клиента.
- **NextAuth.js** — тащит много абстракций и провайдеров, которые нам не нужны.
- **Lucia** — хорошая альтернатива, но требует таблицу sessions.
- **Clerk / Auth0** — платно, внешний сервис, недопустимо для СНГ-независимости.

**Последствия.**
- Отозвать сессию можно только сменой `IRON_SESSION_SECRET` (инвалидит ВСЕ). Для наших 3 админов приемлемо.
- Секрет надо хранить в env, не логировать, ротировать при подозрении на утечку.

**Cross-refs:** `admin`.

---

## ADR-004 · 2026-09-01 · Hero-статья: ручной выбор редактора + fallback

**Контекст.** На главной есть editorial hero (крупный блок под header). Что показывать?

**Решение.** Ручной флаг `articles.is_hero` в БД, ставится редактором в админке. Fallback — последняя опубликованная статья.

**Почему.**
- Классика newsroom-моделей (The Verge, Polygon).
- Редакция контролирует, что важно ← важнее «свежести» или «трендящести».
- Fallback защищает от «редактор в отпуске».

**Отклонённые альтернативы.**
- **Автоматически последняя опубликованная** — обесценивает hero.
- **Trending за 24ч** — rich-get-richer, требует стабильной аналитики (в MVP нет).
- **Карусель 3-5 pinned** — карусели плохо конвертят (nngroup).

**Последствия.**
- Одна колонка `is_hero boolean` + partial unique index в Postgres.
- Тумблер в редакторе статьи; при вкл — снимает флаг с предыдущей в транзакции.
- Fetch — простая функция `getHeroArticle()`, вызывается из RSC главной.

**Cross-refs:** `data-model`, `admin`, `api-contract`, `site-map`.

---

## ADR-005 · 2026-09-01 · Язык UI: полностью русский

**Контекст.** Исходный дизайн был bilingual (Latest dispatches, Get the dispatch, // WAIT, WHY IT MATTERS). Аудитория — массовая СНГ (18-35, часть — школьники/студенты).

**Решение.** Весь UI и контент — на **русском**. Английский только в: именах собственных (GTA VI, Vice City, Rockstar), технических константах в коде (`TRAILER`, `LEAK` — маппятся в UI через `lib/i18n.ts`), splash CRT-terminal (код-эстетика), wordmark `GTA6_БЛОГ_`.

**Почему.**
- Английский editorial-стиль считывается массовой аудиторией как pretentious/foreign.
- Кириллица + латиница вперемешку — шум.

**Отклонённые.**
- Гибрид (русский UI + английские подзаголовки-акценты) — половинчатое, всё равно требует объяснения.
- Оставить bilingual — потеря массового охвата ради узкой лояльности ядра.

**Cross-refs:** `product`, `design-system`.

---

## ADR-006 · 2026-09-01 · IA главной: news-first с editorial hero

**Контекст.** Первый экран должен считываться как «медиа», а не как «фан-сайт с обратным отсчётом». Изначально был крупный слоган `Vice City is coming` + гигантский Countdown.

**Решение.** Первый экран = **свежая lead-статья** (EditorialHero). Countdown уходит в TopBar (микро) + отдельную секцию-tracker в середине страницы (`CountdownTracker`, `id="countdown"`).

**Почему.**
- Editorial hub первым касанием должен показывать контент, а не лендинг-promise релиза.
- Countdown важен, но как виджет-tracker, а не как единственная точка входа.

**Отклонённые.**
- **News-first hard (The Verge стиль):** одна lid + сетка secondary. Теряется атмосфера дизайна.
- **Netflix-style slider + категорийные ряды:** карусели плохо конвертят, требует 15+ статей.

**Cross-refs:** `site-map`, `retention-features`.

---

## ADR-007 · 2026-09-03 · Rate limiting — in-memory Map

**Контекст.** Публичные мутационные Server Actions (реакции, комменты, подписка) требуют rate-limit против спама/абьюза. Ставить Redis ради MVP на 1 инстанс — избыточно.

**Решение.** Простой in-memory token-bucket в `lib/rate-limit.ts` (Map + interval для уборки). Ключ = `${bucket}:${ipHash}`.

**Отклонённые.**
- **@upstash/ratelimit + Redis** — правильно для multi-instance, но требует внешнюю инфраструктуру. Отложено до реальной необходимости.
- **Middleware-based rate limit** — не работает для Server Actions (они не идут через middleware в App Router).

**Последствия.**
- **Ограничения не переносятся между инстансами.** При масштабировании — переключиться на Redis (готово в интерфейсе `RateLimitOptions`).
- **При рестарте счётчики сбрасываются.** Приемлемо, окна короткие (секунды/минуты).
- Memory-leak защита: interval раз в минуту чистит истёкшие бакеты.

**Cross-refs:** `api-contract` — все мутации должны звать `rateLimit(...)`.

---

## ADR-008 · 2026-09-03 · Sanitize комментов — `sanitize-html`

**Контекст.** Комменты будут принимать HTML-ish контент от пользователей. Без санитайза — XSS.

**Решение.** `sanitize-html` в `lib/sanitize.ts::sanitizeComment`. Whitelist: `p, br, strong, em, a, blockquote, code`. Только `http, https, mailto` в схемах. Ссылки — принудительно `target=_blank rel="noopener nofollow ugc"`.

**Отклонённые.**
- **DOMPurify** — работает через `jsdom` на сервере, тяжелее.
- **Свой regex-санитайз** — почти всегда протекает.

**Cross-refs:** `api-contract` — все Server Actions с пользовательским HTML должны звать `sanitizeComment(...)`.

---

## ADR-009 · 2026-09-03 · Security headers — через `next.config.ts`

**Решение.** Заголовки прописаны в `next.config.ts::headers()` для `/:path*`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (только в проде)

**Что НЕ добавили в MVP.**
- **Content-Security-Policy** — Next.js App Router генерирует inline styles/scripts, для строгого CSP нужен nonce-based подход (сложнее). Отложено. В MVP приемлемо иметь всё остальное + рассчитывать на `X-Frame-Options`.

**Cross-refs:** —

---

## ADR-010 · 2026-09-03 · Cookie consent — только essential

**Контекст.** 152-ФЗ + GDPR требуют информирования и согласия перед non-essential cookies.

**Решение.** В MVP у нас **нет non-essential cookies** — только сессия админа, флаги localStorage. Показываем баннер с двумя кнопками `[ПРИНЯТЬ]` / `[ТОЛЬКО НУЖНЫЕ]` — но фактически они делают одно и то же (записывают отметку в `localStorage.gta6_cookieConsent`), потому что аналитики ещё нет.

При подключении Яндекс.Метрики / Google Analytics — банер получит третий режим и логику: подключать трекеры только при `mode === "all"`.

**Cross-refs:** `site-map` (LS keys), `product`.
