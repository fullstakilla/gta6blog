# GTA6·БЛОГ — Roadmap до MVP

Живой документ. Обновляется после каждой итерации. Источник правды по
статусу проекта — тут, а не в скиллах (там — «как устроено», здесь — «что
осталось»).

**Обновлено:** 2026-09-03 · **Легенда:** ✅ сделано · 🚧 в работе · ⏳ ждёт · 🅿️ отложено · ❌ отброшено

**Прогресс P0:** 3 из 5 блоков закрыто. Осталось: README (активно) + деплой (отложен).

**Что дальше:** README.md + `frontend/.env.example`. После — берём P1.

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
- [ ] **`README.md` + `frontend/.env.example`**
  - [ ] Инструкция клона + запуска (createdb, prisma migrate, seed, npm run dev)
  - [ ] Плейсхолдеры для env-vars без секретов
- [ ] 🅿️ **Деплой** — решено 2026-09-03 отложить: сначала добить P1
      (мобилка, галерея из БД, view tracking, `next/image`, `loading`/`error`).
      Заходим сюда, когда контент и полировка готовы, чтобы не деплоить дважды.
  - [ ] Выбрать хостинг (Vercel / self-host Docker / Railway / Fly.io) — решение отдельно
  - [ ] Настроить production Postgres
  - [ ] `IRON_SESSION_SECRET`, `IP_HASH_SALT`, `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL` в prod env
  - [ ] HTTPS + auto-renew
  - [ ] Backup Postgres (cron `pg_dump`, ротация 30 дней) + backup `public/uploads/`

---

## P1 — важно, можно после запуска

- [ ] **Галерея из БД**
  - [ ] Таблица `gallery_items` (миграция)
  - [ ] `/admin/gallery` — CRUD с upload
  - [ ] `/gallery` переключить с моков на fetch из БД
- [ ] **TrendingBar из БД**
  - [ ] Query по last-hour просмотрам
  - [ ] Cache 60s
- [ ] **View tracking**
  - [ ] Таблица `article_views` (миграция)
  - [ ] Server Action `trackView({articleId})` — дедуп 10 мин по IP-хэшу
  - [ ] Вызов из клиента при монтировании страницы статьи
  - [ ] Инкремент `articles.views_count` (денормализация)
- [ ] **`next/image` вместо `<img>` для обложек** — оптимизация
- [ ] **Mobile audit** — прогнать все страницы на 375px, поправить проблемные
- [ ] **`loading.tsx` / `error.tsx`** — глобальные skeleton + error boundary
- [ ] **Смена пароля админа из UI** — форма `/admin/settings/password`
- [ ] **Яндекс.Метрика + Вебмастер + Google Search Console**
- [ ] **Double opt-in для подписки** — token в БД + email confirm + `/confirm/[token]` endpoint. Требует email провайдера (Resend / Yandex SMTP)

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

---

## Оценка времени

- **P0 активный остаток:** README + `.env.example` = **0.25 сессии**
- **P0 отложено:** деплой = **1-2 сессии** — вернёмся после P1
- **P1** = **1 сессия** плотной работы
- **P2** = по желанию, не блокирует запуск

## Cross-references

- Архитектурные решения → [decisions](.claude/skills/decisions/SKILL.md)
- Схема БД → [data-model](.claude/skills/data-model/SKILL.md)
- Server Actions / API → [api-contract](.claude/skills/api-contract/SKILL.md)
- Продуктовое позиционирование → [product](.claude/skills/product/SKILL.md)
