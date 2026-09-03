---
name: api-contract
description: Контракт бэк-логики — Server Actions, Route Handlers, DTO. Стек — Next.js (RSC + Server Actions) + Prisma + PostgreSQL, БЕЗ отдельного Go-сервиса. Триггерь при любой работе с fetch'ем данных, мутациями (формы, реакции, подписка), созданием админ-эндпоинтов, типизацией.
---

# Backend Contract — Next.js + Prisma

**Стек:** Next.js 16 App Router + Prisma + PostgreSQL. Отдельного бэк-сервиса **НЕТ** (см. skill `decisions`). Вся серверная логика — прямо в Next.js.

## Три способа делать «бэк» в Next.js

### 1. RSC-fetch (чтение публичного контента) — по умолчанию

Server Components вызывают функции из `frontend/src/lib/db/*` или `lib/api.ts` напрямую (это уже Node, не браузер). Никакого `/api/*` не нужно.

```ts
// app/(public)/page.tsx  — Server Component
import { getHeroArticle } from "@/lib/db/articles";
export default async function Page() {
  const hero = await getHeroArticle();
  return <HomePage hero={hero} />;
}
```

ISR: `export const revalidate = 60;` на файле страницы. Точечный сброс — `revalidatePath('/blog/[slug]')` из Server Action / webhook.

### 2. Server Action (мутации от пользователя — комменты, реакции, подписка, admin-формы)

Определяются с `"use server"`, вызываются из клиентских компонентов как обычная функция. Автоматическая сериализация, встроенный CSRF, работают с `<form action={fn}>`.

```ts
// app/(public)/blog/[slug]/actions.ts
"use server";
import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeComment } from "@/lib/sanitize";
import { getIpHash } from "@/lib/request";

const CommentInput = z.object({
  articleId: z.string().uuid(),
  authorName: z.string().min(1).max(40),
  authorEmail: z.string().email().optional().nullable(),
  content: z.string().min(1).max(2000),
  parentId: z.string().uuid().optional().nullable(),
});

export async function createComment(input: z.infer<typeof CommentInput>) {
  const data = CommentInput.parse(input);
  await rateLimit("comment", { max: 3, windowSec: 60 });   // 3/мин с IP
  const clean = sanitizeComment(data.content);
  const comment = await db.comment.create({
    data: {
      articleId: data.articleId,
      authorName: data.authorName,
      authorEmail: data.authorEmail ?? null,
      content: clean,
      parentId: data.parentId ?? null,
      status: "pending",
      ipHash: await getIpHash(),
    },
  });
  return { id: comment.id, status: comment.status as const };
}
```

Клиент:
```tsx
"use client";
import { createComment } from "./actions";
// ... в форме onSubmit → const res = await createComment({...})
```

### 3. Route Handler (`app/api/*/route.ts`) — только для webhook'ов и когда нужен REST

Использовать когда:
- Внешние webhook'и (email confirm, revalidate от админ-инструментов не в Next.js).
- Публичные `GET`, которые надо кэшировать через CDN по URL (например `/api/stats/online` для клиентского polling'а).
- Endpoint нужно вызывать из внешнего мира (партнёр, mobile-app в будущем).

Для внутренних форм и мутаций **всегда предпочитать Server Actions.**

---

## Публичные операции (перечень)

Формат: **имя** → тип (Server Action / Route) → расположение → лимит.

| Что | Тип | Where | Rate |
|---|---|---|---|
| `listArticles(filter)` | RSC-fn | `lib/db/articles.ts` | — |
| `getArticleBySlug(slug)` | RSC-fn | `lib/db/articles.ts` | — |
| `getHeroArticle()` | RSC-fn | `lib/db/articles.ts` | — |
| `listTrending(limit)` | RSC-fn | `lib/db/articles.ts` | — |
| `createReaction({articleId, type})` | Server Action | `app/(public)/blog/[slug]/actions.ts` | 10/мин / IP |
| `createComment({...})` | Server Action | `app/(public)/blog/[slug]/actions.ts` | 3/мин / IP |
| `subscribeEmail({email})` | Server Action | `app/(public)/actions.ts` | 5/час / IP |
| `trackView({articleId})` | Server Action | `app/(public)/blog/[slug]/actions.ts` | fire-and-forget, дедуп 10 мин |
| `getOnlineCount()` | Route `GET /api/stats/online` | `app/api/stats/online/route.ts` | публично, cache 30s |
| `getHealth()` | Route `GET /api/health` | `app/api/health/route.ts` | публично |
| `uploadImage(file)` | Route `POST /api/admin/upload` | `app/api/admin/upload/route.ts` | admin, 8MB, image/* whitelist |

## Admin операции

Все под `app/admin/*` (auth в `middleware.ts` — см. skill `admin`). Server Actions в `app/admin/*/actions.ts`.

| Что | Тип |
|---|---|
| `login({email, password})` | Server Action (устанавливает session cookie) |
| `logout()` | Server Action |
| `createArticle({...})` | Server Action |
| `updateArticle(id, {...})` | Server Action |
| `deleteArticle(id)` | Server Action (soft → status=archived) |
| `setArticleStatus(id, status)` | Server Action + `revalidatePath()` |
| `setArticleHero(id)` | Server Action (в транзакции снимает флаг с прошлой hero, ставит новую) |
| `listPendingComments()` | RSC-fn |
| `moderateComment(id, status)` | Server Action |
| `getAdminStats()` | RSC-fn |

**Auth**: `iron-session` (encrypted cookie, без БД-таблицы `sessions`) — простое, безопасное для 1-3 админов. См. skill `admin`.

---

## DTO (типы)

Единый источник истины — **Prisma-сгенерированные типы**. Не дублировать вручную.

```ts
import type { Article as PrismaArticle, Comment as PrismaComment } from "@prisma/client";

// Публичный article — без чувствительных полей автора
export type Article = Omit<PrismaArticle, "internal_notes"> & {
  author: { id: string; name: string };
  reactions?: Record<ReactionType, number>;
};

// Server Action возвращает уже готовые типы — не надо руками
export type CommentCreateInput = z.infer<typeof CommentInput>;
```

Файл `frontend/src/types/api.ts` **остаётся** только для литеральных union-типов (`ArticleTag`, `ReactionType`, `CommentStatus`) — они удобны в UI-мапах (`CATEGORY_LABEL_UPPER`). Сущности (Article, Comment) — берём из `@prisma/client`.

---

## Rate limiting

Хелпер `lib/rate-limit.ts`. Реализация: `@upstash/ratelimit` + Redis (планируется) или in-memory Map + LRU для одного инстанса dev/self-host.

Все Server Actions с мутациями — обязательный `await rateLimit(bucket, {...})`. Ключ бакета = `${bucket}:${ipHash}`.

## Валидация

**Всегда** `zod` на входе Server Action. Первая строка — `Schema.parse(input)`. Если не парсится → throws → Next возвращает клиенту error.

## Санитайз

`lib/sanitize.ts` — `sanitizeComment(html)`. Реализация: `sanitize-html` (Node) со строгой политикой (только `<p>`, `<a href>`, `<br>`, `<strong>`, `<em>`).

## IP-хэш

`lib/request.ts` → `getIpHash()`:
- Читает `x-forwarded-for` из `headers()` (Next.js).
- `sha256(ip + process.env.IP_HASH_SALT)`.
- Без соли — 152-ФЗ/GDPR риск.

## Ошибки

Server Actions бросают исключения. Клиент оборачивает вызов в try/catch и показывает toast. Для типизированных ошибок — возвращать `{ ok: false, code: "RATE_LIMITED" }` из Action вместо throw.

## Revalidation

- Публикация статьи (admin action) → `revalidatePath('/')` + `revalidatePath('/blog')` + `revalidatePath('/blog/'+slug)`.
- Правка hero → `revalidatePath('/')`.
- Одобрение комментария → `revalidatePath('/blog/'+slug)`.
- Никаких webhook'ов на `/api/revalidate` — Server Action сама вызывает `revalidatePath`.

## СТАТУС (2026-09-03)

**Реализовано:**
- `lib/api.ts` — `getHeroArticle`, `listPublishedArticles`, `listArchiveArticles`, `getArticleBySlug`, `listApprovedComments`
- `app/(public)/blog/[slug]/actions.ts` — `createComment` (sanitize + rate 3/min), `toggleReaction` (fingerprint-dedup, rate 10/min), `getReactionCounts`, `getMyReactions`
- `app/(public)/actions.ts` — `subscribeEmail` (rate 5/hour)
- `app/admin/articles/actions.ts` — `createArticle`, `updateArticle`, `deleteArticle` (transaction для `is_featured`)
- `app/admin/comments/actions.ts` — `moderateComment`, `moderateCommentsBulk`, `deleteCommentPermanent`
- `app/admin/auth/actions.ts` — `login`, `logout`
- `app/api/admin/upload/route.ts` — image upload
- `app/api/admin/subscribers.csv/route.ts` — CSV-экспорт

**Не реализовано:**
- `trendings` из БД (Ф4)
- Article view tracking (Ф4)
- `/api/stats/online` (Ф4)
- Double opt-in для подписки (P1)

## Cross-references

- Prisma-схема и структура таблиц → `data-model`
- Auth-стратегия (iron-session) → `admin`
- Почему нет Go → `decisions`
