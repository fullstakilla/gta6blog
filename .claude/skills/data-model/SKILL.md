---
name: data-model
description: PostgreSQL схема — таблицы, поля, индексы, инварианты, статусы, отношения. Триггерь при создании миграций, работе с sqlc-запросами, планировании новых полей/таблиц, любых вопросах "какие поля есть у ...".
---

# Data Model — PostgreSQL 16+ (через Prisma)

**Стек:** PostgreSQL 16+, ORM — **Prisma**. Отдельного Go-бэка нет (см. skill `decisions`).

- Schema: `frontend/prisma/schema.prisma`
- Миграции: `frontend/prisma/migrations/` (генерятся `prisma migrate dev`)
- Клиент: singleton в `frontend/src/lib/db.ts` (`import { db } from '@/lib/db'`)
- Запросы: пишем в `frontend/src/lib/db/articles.ts`, `.../comments.ts` и т.д. Возвращают уже Prisma-типы.

SQL ниже — **база истины схемы**. Prisma-схема должна её точно повторять. Если возник конфликт — SQL здесь главнее (может быть переведён в Prisma автоматически через `prisma db pull`, но лучше писать `schema.prisma` руками и держать этот скилл в актуальном виде).

## Диаграмма связей

```
authors ──1..*──> articles ──1..*──> comments (self-ref parent_id)
                       │
                       ├──1..*──> reactions
                       └──1..*──> article_views

subscribers (standalone)
gallery_items (standalone)
```

## Таблицы

### `authors`

Пользователи админки. Не публикуются в API как отдельная сущность (кроме имени).

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` | |
| `name` | text NOT NULL | | Отображается в статье |
| `email` | text UNIQUE NOT NULL | | Логин |
| `password_hash` | text NOT NULL | | bcrypt cost 12+ |
| `role` | text | `'author'` | `author` \| `editor` \| `admin` |
| `created_at` | timestamptz | `now()` | |

### `articles`

Основная сущность. Контент — Markdown.

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` | |
| `slug` | text UNIQUE NOT NULL | | URL, генерируется из title транслитом |
| `title` | text NOT NULL | | |
| `excerpt` | text | | Для карточек/OG |
| `content` | text NOT NULL | | Markdown |
| `cover_image` | text | | URL |
| `category` | text NOT NULL | | ENUM см. ниже |
| `tags` | text[] | `{}` | Свободные, для узких срезов |
| `author_id` | uuid FK → authors | | ON DELETE SET NULL (не удаляем автора живой статьи) |
| `status` | text | `'draft'` | `draft` \| `published` \| `archived` |
| `published_at` | timestamptz | | Устанавливается при переходе в published |
| `created_at` | timestamptz | `now()` | |
| `updated_at` | timestamptz | `now()` | Триггер на UPDATE |
| `views_count` | bigint | 0 | Денормализовано, инкрементируется |
| `meta_title` | text | | SEO override |
| `meta_desc` | text | | SEO override |
| `is_hero` | boolean | false | Ручной выбор редактора для editorial hero главной |

**Индексы:**
```sql
CREATE UNIQUE INDEX ON articles (slug);
CREATE INDEX ON articles (published_at DESC) WHERE status = 'published';
CREATE INDEX ON articles USING gin(tags);
-- Только одна hero-статья одновременно (partial unique)
CREATE UNIQUE INDEX articles_single_hero ON articles ((true)) WHERE is_hero = true;
```

**Инварианты:**
- `status = 'published'` ⇒ `published_at IS NOT NULL`
- Публичные эндпоинты ВСЕГДА фильтруют `WHERE status = 'published'`
- `slug` — только `[a-z0-9-]+`, длина 3-120
- Одновременно только одна статья может иметь `is_hero = true` (гарантируется partial unique index). При установке `is_hero=true` через `PATCH` бэк снимает флаг с предыдущей hero в одной транзакции.

### `reactions`

Анонимные, дедуп по fingerprint.

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` | |
| `article_id` | uuid FK → articles | | ON DELETE CASCADE |
| `reaction_type` | text NOT NULL | | `fire` \| `love` \| `laugh` \| `think` \| `hundred` |
| `fingerprint` | text NOT NULL | | hash(IP + UA + ...) |
| `ip_hash` | text NOT NULL | | sha256(ip + salt) |
| `created_at` | timestamptz | `now()` | |

**Индексы:** `UNIQUE(article_id, reaction_type, fingerprint)`, `INDEX(article_id)`.

Юзер = 1 реакция каждого типа на статью. Повторный POST меняет / удаляет.

### `comments`

Модерируемые. Nested (parent_id → self).

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` | |
| `article_id` | uuid FK → articles | | ON DELETE CASCADE |
| `parent_id` | uuid FK → comments | | NULL = корневой |
| `author_name` | text NOT NULL | | 1-40 символов |
| `author_email` | text | | Необязательный |
| `content` | text NOT NULL | | sanitized bluemonday |
| `status` | text | `'pending'` | `pending` \| `approved` \| `rejected` \| `spam` |
| `ip_hash` | text | | Для антиспама |
| `created_at` | timestamptz | `now()` | |

**Индексы:** `INDEX(article_id, status)`.

**Инварианты:**
- Публичные эндпоинты — только `status = 'approved'`
- `parent_id` должен указывать на коммент той же `article_id`
- Глубина ветки не ограничена в БД, но фронт рендерит max 3 уровня

### `subscribers`

Email-рассылка, double opt-in.

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` | |
| `email` | text UNIQUE NOT NULL | | lowercase, RFC 5322 |
| `confirmed` | boolean | false | true после клика по confirm-ссылке |
| `confirm_token` | text | | UUID, обнуляется после подтверждения |
| `subscribed_at` | timestamptz | `now()` | |

### `article_views`

Сырьё для trending и статистики. Растёт быстро.

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | bigserial PK | | |
| `article_id` | uuid FK → articles | | |
| `ip_hash` | text | | Дедуп в окне 10 мин |
| `viewed_at` | timestamptz | `now()` | |

**Индексы:** `INDEX(article_id, viewed_at DESC)`.

**Оперирование:**
- Партиционировать по `viewed_at` (месячно) при росте > 10M строк.
- Дропать партиции старше 30 дней (кроме агрегатов).

### `gallery_items`

Скрины и трейлеры.

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` | |
| `image_url` | text NOT NULL | | |
| `caption` | text | | Отображается под тайлом |
| `source` | text | | `trailer` \| `screenshot` \| `leak` |
| `width` | int | | Оригинальный размер |
| `height` | int | | |
| `sort_order` | int | 0 | Ручная сортировка |
| `created_at` | timestamptz | `now()` | |

## ENUM-подобные значения

Хранятся как **Prisma enum** (маппится в Postgres `enum` — проще foreign-guarantees, чем `text` + check). В коде — типизированные литералы:

```prisma
enum ArticleTag { TRAILER LEAK MAP CHARACTER GAMEPLAY RUMOR }
enum ArticleStatus { draft published archived }
enum ReactionType { fire love laugh think hundred }
enum CommentStatus { pending approved rejected spam }
enum AuthorRole { author editor admin }
```

В UI мапятся через `frontend/src/lib/i18n.ts` (`CATEGORY_LABEL_UPPER` и т.п.). Union-type на фронте (`frontend/src/types/api.ts`) — дублируется вручную (либо генерится через `prisma-json-types-generator`).

## Триггеры

- `updated_at` можно доверить Prisma (`@updatedAt`) — обновляется в клиенте, не в БД. Достаточно для наших сценариев.
- Если понадобится **гарантия на уровне БД** (сторонние апдейты через `psql`) — добавить plpgsql-триггер миграцией:

```sql
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER articles_updated_at BEFORE UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

## Denormalization

- `articles.views_count` — sync через `POST /api/articles/:id/view` (upsert + increment). НЕ рассчитывать из `article_views` на каждый запрос.
- Реакции: подсчёт `GROUP BY reaction_type` каждый раз (кол-во малое, ~1K/статью max).

## Seed

`frontend/prisma/seed.ts` (запускается `prisma db seed`): 10 тестовых статей во всех категориях (одна с `is_hero=true`), 1 admin author (`admin@gta6blog.ru / dev`), 20 тестовых комментов (mix статусов), 5 подписчиков, 15 gallery_items. Пароли через `bcrypt` cost 12.

## Backup

- PostgreSQL: ежедневный `pg_dump` в S3-совместимое хранилище, retention 30 дней.
- WAL archive для PITR — при росте > 100K статей.

## СТАТУС (2026-09-01)

Схема НЕ применена. `frontend/prisma/` не создана. Фронт работает на моках из `frontend/src/lib/mock-data.ts`. Ближайший шаг: `npx prisma init` в `frontend/`, скопировать эту схему в `schema.prisma`, поднять локальный Postgres в docker-compose, `prisma migrate dev`, написать seed.

## Cross-references

- Использование Prisma-клиента (Server Actions, RSC-fetch) → `api-contract`
- Auth-таблица `authors` + sessions → `admin`
- Почему Prisma, а не sqlc → `decisions`
