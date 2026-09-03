# GTA6·БЛОГ — Roadmap до MVP

Живой документ. Обновляется после каждой итерации. Источник правды по
статусу проекта — тут, а не в скиллах (там — «как устроено», здесь — «что
осталось»).

**Обновлено:** 2026-09-04 · **Легенда:** ✅ сделано · 🚧 в работе · ⏳ ждёт · 🅿️ отложено · ❌ отброшено

**Прогресс:** P0 — 4/5 (остался деплой). P1 — всё закрыто, кроме Метрики (перенесена в деплой).

**Что дальше:** остался только блок «Деплой» — самый последний этап.

---

## Готово

- ✅ Каркас: Next.js 16 + Prisma 7 + PostgreSQL 16 + iron-session
- ✅ Дизайн-система (brutalist, токены, шрифты Space Grotesk / Inter / JetBrains Mono)
- ✅ Полная русификация UI
- ✅ Публичные страницы: `/`, `/blog`, `/blog/[slug]`, `/gallery`, `/guide`, `/guide/[section]`, `/about`, `/privacy`, `/cookies`, `not-found`
- ✅ `(public)` route group + PublicChrome (TopBar / Header / Footer / Splash / ExitIntent / MiniTimer / ProgressBar / CookieBanner)
- ✅ Админка: `/admin/login`, `/admin`, `/admin/articles/new`, `/admin/articles/[id]`
- ✅ Article CRUD (Server Actions с zod, транзакция для `is_featured`)
- ✅ Image upload (`/api/admin/upload`, whitelist MIME, 8 MB)
- ✅ WYSIWYG-редактор — BlockNote с русской локалью и dark theme
- ✅ SEO: `metadataBase`, `sitemap.ts`, `robots.ts`, `manifest.ts`, JSON-LD Article + WebSite + Organization
- ✅ Security helpers: `lib/rate-limit.ts` (in-memory), `lib/request.ts` (IP-hash, fingerprint), `lib/sanitize.ts`
- ✅ Security headers в `next.config.ts` (X-Frame, nosniff, Referrer-Policy, Permissions-Policy, HSTS в проде)
- ✅ `requireAdmin()` во всех admin Server Actions
- ✅ Cookie consent banner
- ✅ Git репо на GitHub: [fullstakilla/gta6blog](https://github.com/fullstakilla/gta6blog)
- ✅ Комментарии, реакции, подписка (Ф3) — таблицы, Server Actions, публичный UI, admin-модерация
- ✅ README.md + `.env.example` (клон-и-запусти инструкция)
- ✅ Галерея из БД + `/admin/gallery` CRUD, TrendingBar из БД с fallback, view tracking с 10-мин-дедупом
- ✅ `next/image` для hero и cover статьи, `loading.tsx`/`error.tsx` (public + admin), mobile-адаптив (hover-shift off на touch, компактный header <700px)

---

## P0 — блокеры запуска

Без этих пунктов запускать нельзя.

- [x] **Комментарии**
  - [x] Таблица `comments` (миграция `20260903200541_interactions`)
  - [x] Server Action `createComment` (zod + `sanitizeComment` + rate limit 3/мин)
  - [x] Форма на `/blog/[slug]` (name + email опционально + content)
  - [x] Nested-рендер до 3 уровней
  - [x] `/admin/comments?status=pending` с bulk approve/reject/spam
- [x] **Реакции** 🔥 ❤️ 😂 🤔 💯
  - [x] Таблица `reactions` (миграция)
  - [x] Компонент `<ReactionBar articleId>` под статьёй
  - [x] Server Action `toggleReaction` (fingerprint-дедуп, rate 10/мин)
  - [x] Оптимистичные счётчики
- [x] **Подписка email рабочая**
  - [x] Таблица `subscribers` (миграция)
  - [x] Server Action `subscribeEmail` (zod + rate 5/час)
  - [x] Форма Subscribe + ExitIntent завязана на action
  - [x] `/admin/subscribers` — список + экспорт CSV (`/api/admin/subscribers.csv`)
  - [ ] Double opt-in через email — перенесён в P1
- [x] **`README.md` + `frontend/.env.example`**
  - [x] Инструкция клона + запуска (createdb, prisma migrate, seed, npm run dev)
  - [x] Плейсхолдеры для env-vars без секретов
- [ ] 🅿️ **Деплой** — самый последний этап MVP
  - [ ] Выбрать хостинг (Vercel / self-host Docker / Railway / Fly.io)
  - [ ] Production Postgres + `IRON_SESSION_SECRET`, `IP_HASH_SALT`, `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` в prod env
  - [ ] HTTPS + auto-renew
  - [ ] Backup Postgres (cron `pg_dump`, ротация 30 дней) + backup `public/uploads/`
  - [ ] Подключить Яндекс.Метрику, Яндекс.Вебмастер, Google Search Console — submit sitemap

---

## P1 — важно, можно после запуска

- [x] **Галерея из БД**
  - [x] Таблица `gallery_items` (миграция `gallery_and_views`)
  - [x] `/admin/gallery` — CRUD с upload + сортировка
  - [x] `/gallery` и teaser на главной переключены с моков на fetch из БД
- [x] **TrendingBar из БД**
  - [x] Query по last-hour просмотрам через `article_views` (fallback — свежие)
- [x] **View tracking**
  - [x] Таблица `article_views` (миграция)
  - [x] Server Action `trackView({articleId})` — дедуп 10 мин по IP-хэшу
  - [x] Вызов из клиента при монтировании страницы статьи через `<ViewTracker>`
  - [x] Инкремент `articles.views_count` в одной транзакции
- [x] **`next/image` вместо `<img>` для обложек** — EditorialHero + статья (priority)
- [x] **Mobile audit** — hover-shift отключен на тач, скрыты длинные подписи в header на <700px, TopBar CTA compact
- [x] **`loading.tsx` / `error.tsx`** — по обеим веткам (public + admin), skeleton + error boundary
- [ ] 🅿️ **Яндекс.Метрика + Вебмастер + Google Search Console** — перенесено в блок «Деплой» (нужны реальный домен и HTTPS)

---

## P2 — приятные бонусы

- [ ] **RSS-фид** `/rss.xml`
- [ ] **Автосохранение draft** в редакторе (debounce 5s)
- [ ] **Feature flags** через env (`NEXT_PUBLIC_COMMENTS_ENABLED` и т.п.)
- [ ] **Search на `/blog?q=`** — простой `WHERE title ILIKE '%q%'`
- [ ] **Email провайдер** (Resend / Yandex SMTP) для рассылки
- [ ] **`/admin/settings`** — общая страница настроек
- [ ] **Sentry** для отслеживания ошибок в проде
- [ ] **Uptime мониторинг** (UptimeRobot, betterstack)
- [ ] **CI/CD** (GitHub Actions: lint + build на PR)

---

## Явно отброшено (для памяти)

- ❌ Go бэкенд (ADR-001 — заменён на Next.js all-in)
- ❌ Личный кабинет / регистрация пользователей (не в MVP)
- ❌ Форум / треды
- ❌ Интерактивная карта Vice City
- ❌ База транспорта / оружия / персонажей как data-объекты
- ❌ Мобильное приложение, мерч, донаты
- ❌ Мультиязычность и светлая тема
- ❌ Страницы авторов (кроме имени в статье)
- ❌ Рекомендательная система
- ❌ Полнотекстовый поиск (только простой LIKE)
- ❌ Смена пароля админа из UI (2026-09-03: 1-3 админа, менять через seed/SQL)
- ❌ Double opt-in для подписки (2026-09-03: не в MVP, разберёмся после запуска с email провайдером)

---

## Оценка времени

- **P0 активный остаток:** нет — всё сделано
- **P0 отложено:** деплой = **1-2 сессии** — самый последний шаг MVP
- **P1** = ✅ **закрыто** (кроме Метрики, которая идёт с деплоем)
- **P2** = по желанию, не блокирует запуск

## Cross-references

- Архитектурные решения → [decisions](.claude/skills/decisions/SKILL.md)
- Схема БД → [data-model](.claude/skills/data-model/SKILL.md)
- Server Actions / API → [api-contract](.claude/skills/api-contract/SKILL.md)
- Продуктовое позиционирование → [product](.claude/skills/product/SKILL.md)
