# GTA6·БЛОГ

Независимый хаб новостей о GTA VI на русском. Editorial-блог с админкой,
комментариями, реакциями и email-подпиской.

**Дизайн:** underground editorial / brutalist. Charcoal + lime accent.
Space Grotesk / Inter / JetBrains Mono.

Прогресс до MVP → [ROADMAP.md](ROADMAP.md). Архитектурные решения →
[.claude/skills/decisions](.claude/skills/decisions/SKILL.md).

---

## Стек

- **Next.js 16** (App Router, Server Actions, RSC, Turbopack)
- **TypeScript** strict
- **Prisma 7** + **PostgreSQL 16** (адаптер pg)
- **iron-session** — encrypted-cookie сессии админа
- **BlockNote** — WYSIWYG-редактор в админке
- **zod** — валидация Server Actions
- **sanitize-html** — санитайз пользовательского контента
- **marked** — рендер Markdown на страницах статей

Отдельного бэкенда **нет** — всё в Next.js. См.
[ADR-001](.claude/skills/decisions/SKILL.md).

---

## Быстрый старт

### 1. Prerequisites

- Node.js ≥ 22
- PostgreSQL 16+ (локально через Homebrew: `brew install postgresql@16 && brew services start postgresql@16`)

### 2. Установка

```bash
git clone https://github.com/fullstakilla/gta6blog.git gta6-blog
cd gta6-blog/frontend
npm install
```

### 3. База данных

Создать локальную БД:

```bash
createdb gta6_blog
```

Скопировать env-шаблон и заполнить секреты:

```bash
cp .env.example .env
# Открой .env и замени значения:
#   DATABASE_URL              — если Postgres не на localhost:5432 или другой юзер
#   IRON_SESSION_SECRET       — openssl rand -base64 32
#   IP_HASH_SALT              — openssl rand -hex 16
#   S3_*                      — MinIO/S3 креды для upload обложек (см. ниже)
```

Для локальной разработки без загрузки картинок S3-переменные можно временно
пропустить — все остальные функции работают. С прод-бакетом можно работать
и локально, но осторожно: залитое отправится на реальный MinIO.

Прогнать миграции + seed:

```bash
npx prisma migrate deploy
npx prisma generate
npx tsx prisma/seed.ts
```

Seed создаст:
- Админа: **admin@gta6blog.ru / dev**
- 4 демо-статьи (одна помечена `is_featured`)

### 4. Запуск

```bash
npm run dev
```

Открой:
- **http://localhost:3000** — публичный сайт
- **http://localhost:3000/admin** — админка

---

## Структура

```
gta6-blog/
├── .claude/skills/          9 проектных скиллов (продукт, дизайн, API, БД, ADR)
├── frontend/                Next.js приложение
│   ├── prisma/              Схема + миграции + seed
│   ├── public/uploads/      Загруженные обложки (в .gitignore)
│   └── src/
│       ├── app/             App Router
│       │   ├── (public)/    Публичный сайт: /, /blog, /gallery, /guide, /about, ...
│       │   ├── admin/       Админка: /admin/login, /articles/*, /comments, /subscribers
│       │   └── api/         Route handlers (upload, subscribers.csv)
│       ├── components/      layout / home / blog / admin / overlays / seo / gallery
│       ├── hooks/           useCountdown / useScrollProgress / useSplash / useExitIntent
│       ├── lib/             db / session / api / rate-limit / sanitize / request / i18n / seo
│       ├── types/           DTO типы
│       ├── generated/prisma Сгенерированный Prisma-клиент (в .gitignore)
│       └── proxy.ts         Next 16 middleware (auth guard для /admin/*)
├── ROADMAP.md               Статус до MVP
└── README.md                Этот файл
```

## Скилл-документация

Всё «как устроено» лежит в [.claude/skills/](.claude/skills/). Кратко:

- **[product](.claude/skills/product/SKILL.md)** — позиционирование, аудитория, tone-of-voice
- **[design-system](.claude/skills/design-system/SKILL.md)** — токены, brutal-правила, лейблы категорий
- **[site-map](.claude/skills/site-map/SKILL.md)** — карта роутов, раскладка главной, z-index
- **[data-model](.claude/skills/data-model/SKILL.md)** — Prisma-схема, инварианты, партиционирование
- **[api-contract](.claude/skills/api-contract/SKILL.md)** — Server Actions, RSC-фетчи, rate limits
- **[admin](.claude/skills/admin/SKILL.md)** — админка, auth (iron-session), модерация
- **[retention-features](.claude/skills/retention-features/SKILL.md)** — 5 фишек удержания
- **[seo](.claude/skills/seo/SKILL.md)** — стратегии рендера, JSON-LD, sitemap
- **[decisions](.claude/skills/decisions/SKILL.md)** — ADR-лог принятых решений

---

## Разработка

### Изменить схему БД

1. Отредактировать `frontend/prisma/schema.prisma`
2. `npx prisma migrate dev --name <короткое-описание>` — создаст миграцию и применит
3. `npx prisma generate` — обновит типизированный клиент

### Открыть визуальный редактор БД

```bash
npx prisma studio
```

### Пересидить БД

```bash
npx prisma migrate reset  # ⚠ дропает БД + пересоздаёт + запускает seed
```

### Сброс сессии админа

Сгенерируй новый `IRON_SESSION_SECRET` в `.env` и перезапусти `npm run dev`.
Все активные сессии инвалидируются.

### Билд

```bash
npm run build   # production build
npm start       # запуск production сборки
npm run lint    # ESLint
```

---

## Deploy

Пока не задеплоено — см. секцию «Деплой» в [ROADMAP.md](ROADMAP.md).
Планируем self-host Docker или Vercel (решение впереди).

---

## Лицензия

Unofficial fan site. Код не под открытой лицензией (all rights reserved).
GTA VI © Rockstar Games & Take-Two Interactive.
