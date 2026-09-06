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

---

## ADR-011 · 2026-09-06 · Хостинг: Vercel + свой VPS (гибрид)

**Контекст.** MVP-код готов, надо выбрать где хостить. Три варианта — Vercel полностью, self-host полностью, гибрид.

**Решение.** Гибрид: **Vercel** для Next.js app (serverless в fra1 Frankfurt), **свой VPS** (Ubuntu 24.04, 2 vCPU, 1.8GB RAM, IP 5.180.172.132) для Postgres + MinIO + Caddy в Docker.

**Почему.**
- Vercel — родная платформа для Next.js, деплой на push, zero-ops, встроенный CDN.
- Postgres на VPS = полный контроль над данными, нет vendor lock, легко бэкапить.
- MinIO на VPS = не платим за S3 traffic, никакого cold-start для картинок.
- РФ-риск Vercel-бан — данные не потеряем, если случится (VPS у нас).

**Отклонённые.**
- **Vercel всё (+ Vercel Postgres/Neon/Blob)** — платно за Postgres и Blob, привязка. Плюс не все Postgres-фичи доступны (partial index для `is_featured` работал бы).
- **Self-host всё (Docker + nginx на VPS)** — 1.8GB RAM не потянет Next.js SSR под нагрузкой. Plus CI/CD и observability придётся строить с нуля.
- **Railway / Fly.io** — платные, менее очевидная модель ценообразования, СНГ-платёжка нестабильна.

**Последствия.**
- **Латентность:** Vercel fra1 ↔ VPS в Хельсинки ~30-50мс — приемлемо. С iad1 (US East, дефолт) было бы 150-200мс.
- **Postgres открыт всему интернету** — Vercel Hobby не даёт static outbound IP, whitelist невозможен. Защита: 48-char password, TLS обязателен, (планируется) fail2ban.
- **Прод-миграции** идут не автоматически — надо руками `prisma migrate deploy` с локальной машины на прод-URL. Автоматизировать в CI позже.

**Cross-refs:** `infrastructure` (полная схема), `api-contract`.

---

## ADR-012 · 2026-09-06 · Хранение медиа: MinIO на VPS, S3 API

**Контекст.** Vercel serverless — файловая система read-only после деплоя, `public/uploads/` не переживёт первый rebuild. Нужен персистентный store для обложек и картинок галереи.

**Решение.** **MinIO** в Docker на нашем VPS. S3-совместимый API. Экспонирован через `https://gta6media.duckdns.org` (Caddy + Let's Encrypt). Public bucket `gta6-uploads` для anonymous download.

**Почему.**
- Один VPS = один backup контур, никаких доп. расходов на S3 traffic.
- Прямой AWS SDK — код `/api/admin/upload` уже совместим.
- App-user с ограниченной policy (только `gta6-uploads` RW) — украденные ключи не дадут admin-доступа.

**Отклонённые.**
- **Vercel Blob** — работает из коробки, но платно за GB + traffic + мало контроля.
- **Backblaze B2 / Cloudflare R2** — дёшево, но ещё одна учётка/платёжка + СНГ-нюансы.
- **Локальная FS `public/uploads/`** — не работает на serverless.

**Последствия.**
- **MinIO данные не бэкапятся автоматически** — при потере VPS уйдут все обложки. Планируем rclone-синк на внешнее хранилище (P1).
- **Public bucket** — любой знающий имя файла (24-hex hash) может скачать. Приемлемо для обложек статей.
- **Caddy reverse-proxy** обязателен — MinIO не умеет сам Let's Encrypt правильно, и нам нужно `Host: gta6media.duckdns.org` для SIGv4.

**Cross-refs:** `infrastructure`, `admin`.

---

## ADR-013 · 2026-09-06 · Vercel Hobby-план (не Pro)

**Контекст.** MVP, надо минимизировать расходы.

**Решение.** **Vercel Hobby** ($0). Ограничения приняты.

**Ограничения Hobby, которые нас касаются:**
- **Serverless function timeout 10s** — все наши эндпоинты укладываются, upload с 8MB тоже. Если появится media-processing — придётся апать на Pro (60s).
- **Только один участник** — деплой запускается только с коммитов, автор которых привязан к нашему GitHub-аккаунту. Никаких `Co-Authored-By` trailer'ов.
- **Нет static outbound IP** — Postgres firewall whitelist невозможен, полагаемся на пароль + TLS.
- **Нет Team/Preview URLs с паролем** — preview деплои публичны.
- **Не более 100GB bandwidth/мес** — при 10K уников/день с обложками должно хватать (~50-70GB/мес по прикидке).

**Триггер апа на Pro ($20/мес):**
- Уник в день > 5K и bandwidth > 60GB/мес.
- Нужны background tasks > 10s.
- Хочется static outbound IP для Postgres.

**Cross-refs:** `infrastructure`.

---

## ADR-014 · 2026-09-06 · Проксирование трафика через VPS (Caddy → Vercel)

**Контекст.** После деплоя выяснилось, что российский провайдер (МТС Home) режет TLS-handshake к Vercel edge IP `216.198.79.1`. Клиент видит `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`. Из других стран и через VPN — работает. Из **некоторых** РФ-провайдеров — тоже работает (check-host показал Moscow/SPb OK), значит блокировка не глобальная РКН, а DPI-фильтрация части операторов на конкретные Vercel-диапазоны.

**Решение.** Поставить наш VPS-Caddy как reverse-proxy между клиентом и Vercel:
- DNS `gta6blog.ru A @` → `5.180.172.132` (наш VPS в Хельсинки), не Vercel-IP
- Caddy принимает запрос на `gta6blog.ru`, терминирует TLS (Let's Encrypt cert)
- Проксирует к `https://gta6blog.vercel.app` с `Host: gta6blog.vercel.app` (Vercel мапит по своему домену)
- Ответ стримит клиенту
- `www.gta6blog.ru` → 308 → apex (на уровне Caddy, до Vercel не долетает)

Клиент видит URL `gta6blog.ru` весь путь, поисковики индексируют `gta6blog.ru`, Vercel работает как обычно под капотом.

**Отклонённые.**
- **Cloudflare (proxied DNS)** — CF-диапазоны тоже периодически банят в РФ, рулетка.
- **Российский хостинг (Yandex Cloud / VK Cloud)** — переезд с Vercel, потеря serverless-модели и удобства auto-deploy. Слишком дорогая сдача для решения точечной проблемы.
- **Ждать пока РКН откроет Vercel** — непредсказуемо, могут заблокировать сильнее в любой момент.

**Последствия.**
- **+30-50мс латентности** — extra hop Vercel (Frankfurt) ← VPS (Хельсинки) ← клиент. Приемлемо.
- **Наш VPS теперь SPOF** — если он ляжет, сайт не работает. Раньше нас мог уронить только Vercel-outage. Компенсируется бэкапами Postgres + возможностью откатиться на прямой Vercel-IP за одну DNS-правку.
- **Vercel Analytics искажена** — все запросы идут «с IP 5.180.172.132» (Финляндия). Для нормальной аналитики по гео и посещаемости — использовать Яндекс.Метрику на клиенте (в браузере видит настоящий IP).
- **Пропускная способность лимитирована VPS** — 1 vCPU для Caddy, ~100 Mbps. Пока не проблема, при взрывном росте — вторая машина или переезд на Cloudflare.
- **Vercel Domains** — `gta6blog.ru` НЕ должен быть привязан к проекту, иначе конфликт «Invalid Configuration + 403». Только `gta6blog.vercel.app`.

**Возврат назад:** одна правка DNS на reg.ru (A @ → Vercel-IP, вернуть CNAME www на vercel-dns) + вернуть `gta6blog.ru` в Vercel Domains. Всё остальное не трогать.

**Cross-refs:** `infrastructure`.

---

## ADR-015 · 2026-09-06 · Домен: gta6blog.ru через reg.ru

**Контекст.** Нужен основной публичный домен вместо `.vercel.app`.

**Решение.** `gta6blog.ru`, купленный на reg.ru.

**Почему.**
- **`.ru`** — короче и понятнее для СНГ-аудитории, чем `.com` / `.dev`.
- **reg.ru** — стандартный игрок в РФ, аккредитован Coordination Center for TLD RU, лицензия на приём платежей от российских физлиц и ИП (мы не хотим играться с иностранными регистраторами).
- **Free DNS-hosting reg.ru** (ns1/ns2.reg.ru) — не нужен свой NS.

**Важное:**
- Reg.ru default DNS **держит TXT `_globalsign-domain-verification`** — оставили, не мешает.
- Reg.ru после добавления новых A-записей может **до 15 минут** не отдавать их через свои же `ns1.reg.ru`. Клиенты (LE) видят старые записи. Backoff-retry Caddy рано или поздно попадает.

**Cross-refs:** `infrastructure`.
