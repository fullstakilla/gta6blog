---
name: admin
description: Админка (/admin/*) — авторизация, роуты, компоненты, редактор статей, модерация, revalidate webhook. Триггерь при любой работе с админ-панелью, аутентификацией, JWT, rich-text редактором, модерацией комментов.
---

# Admin — GTA6·БЛОГ

Защищённая часть на `/admin/*`. Тот же Next.js апп, что и публичный сайт (не отдельный домен). Изоляция — через middleware, layout и код-сплиттинг App Router (JS админки не попадает в бандл публички).

**Стек:** Next.js Server Actions + Prisma. Auth — **iron-session** (encrypted cookie, без таблицы `sessions`). Причина: у нас 1-3 админа, реального смысла в токен-стеке нет. См. skill `decisions`.

---

## Роуты

| Route | Файл | Назначение |
|---|---|---|
| `/admin/login` | `src/app/admin/login/page.tsx` | Логин |
| `/admin` | `src/app/admin/page.tsx` | Dashboard: краткая статистика, быстрые ссылки |
| `/admin/articles` | `src/app/admin/articles/page.tsx` | Список статей + фильтры + поиск |
| `/admin/articles/new` | `src/app/admin/articles/new/page.tsx` | Создание статьи |
| `/admin/articles/[id]` | `src/app/admin/articles/[id]/page.tsx` | Редактор существующей |
| `/admin/comments` | `src/app/admin/comments/page.tsx` | Модерация (default: `status=pending`) |
| `/admin/subscribers` | (позже) | Экспорт CSV, статус подтверждения |

Все под общим layout `src/app/admin/layout.tsx` — sidebar-навигация, header с email пользователя и logout.

---

## Middleware — авторизация

`frontend/src/middleware.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const isAdmin = req.nextUrl.pathname.startsWith('/admin');
  const isLogin = req.nextUrl.pathname === '/admin/login';
  const session = req.cookies.get('gta6_session')?.value;

  if (isAdmin && !isLogin && !session) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.set('from', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  if (isLogin && session) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
```

**НЕ расшифровывать cookie в middleware** — только проверять наличие. Расшифровка и валидация — в Server Action / RSC через `iron-session`. Middleware — быстрый UX-фильтр (без Prisma-запроса).

Также layout `/admin/layout.tsx` содержит `robots` meta `noindex, nofollow` (см. skill `seo`).

---

## Аутентификация — iron-session

Пакет: `iron-session` (encrypted, tamper-proof cookie; секрет в env).

**Схема:**
- `IRON_SESSION_SECRET` — 32+ символов, env-var, генерить `openssl rand -base64 32`.
- Cookie `gta6_session` — httpOnly, Secure, SameSite=Lax, TTL 7 дней.
- Внутри cookie (зашифровано): `{ userId, role }`.
- **Нет таблицы `sessions` в БД.** Отозвать сессию можно только сменой `IRON_SESSION_SECRET` (инвалидит все).

**Хелпер `lib/session.ts`:**

```ts
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface Session {
  userId?: string;
  role?: "author" | "editor" | "admin";
}

export async function getSession() {
  return getIronSession<Session>(await cookies(), {
    password: process.env.IRON_SESSION_SECRET!,
    cookieName: "gta6_session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    },
  });
}

export async function requireAdmin() {
  const s = await getSession();
  if (!s.userId) throw new Error("UNAUTHORIZED");
  return s;
}
```

**Server Actions:**

```ts
// app/admin/auth/actions.ts
"use server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

const LoginInput = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function login(input: unknown) {
  const { email, password } = LoginInput.parse(input);
  const user = await db.author.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { ok: false, code: "INVALID_CREDENTIALS" as const };
  }
  const session = await getSession();
  session.userId = user.id;
  session.role = user.role;
  await session.save();
  redirect("/admin");
}

export async function logout() {
  const s = await getSession();
  s.destroy();
  redirect("/admin/login");
}
```

**Все админ-Server-Actions** начинают с `await requireAdmin()`. Если нет сессии — бросается ошибка, клиент показывает форму логина.

**Пароли**: `bcryptjs` cost 12. Reset — не в MVP (admin создаёт учётку руками через `prisma db seed` или консольный скрипт).

---

## Список статей (`/admin/articles`)

- Таблица: колонки — Title, Category, Status (badge), Author, Published at, Views, Actions (Edit / Publish / Archive).
- Фильтры: category, status (все / draft / published / archived), поиск по title (fuzzy на клиенте, если <500 записей; иначе — на бэке `?q=`).
- Пагинация 20/страницу.
- Кнопка `+ New article` → `/admin/articles/new`.

---

## Редактор статьи (`/admin/articles/[id]` и `/new`)

**Форма (react-hook-form + zod):**

- Title (input, 1-160 chars)
- Slug (input, кнопка `Auto` — транслит из title). Валидация `[a-z0-9-]+`.
- Category (select — 6 фиксированных значений, см. `product`)
- Tags (multiselect / creatable)
- Excerpt (textarea, 1-300 chars)
- Cover image (upload → S3-compatible, возвращается URL)
- Content (**rich-text редактор**, см. ниже)
- Meta title / meta desc (optional, SEO override)
- Status: `draft` | `published` | `archived` (select)
- Published at (datetime, автозаполняется при переходе в published)
- **`is_hero`** — тумблер `Показать в hero главной`. При включении бэк снимает флаг с предыдущей hero-статьи (одна транзакция, гарантия partial unique index). В UI показывать хинт: «Заменит текущую hero: <title>».

**Actions:**
- `[Save draft]` — сохранить в draft
- `[Publish]` — сохранить + status=published + триггер revalidate
- `[Preview]` — открыть черновик в новой вкладке (SSR draft-preview с секретом)
- `[Archive]` — status=archived
- `[Delete]` — hard delete, только для draft; для published только archive

### Rich-text редактор

**Выбор: TipTap** (расширяемый ProseMirror). Альтернатива: Lexical (Meta).

Расширения:
- Bold / Italic / Strike
- Heading 2 / 3 (H1 = title статьи, в контент не идёт)
- Paragraph, Blockquote
- Ordered / Unordered list
- Link (URL валидатор)
- Code inline, code block (syntax highlight через `lowlight`)
- Image (upload + caption)
- Horizontal rule
- Embed (YouTube / Vimeo — через custom node)

**Хранение**: в БД — Markdown (`content` text). TipTap ↔ Markdown через `@tiptap/extension-markdown` или собственный сериализатор. Причина: Markdown портативен, легко diff, легко перевозить.

**Dynamic import**: редактор весит ~200KB — грузить только в `/admin/articles/*` через `dynamic(() => import(...), { ssr: false })`.

---

## Модерация комментов (`/admin/comments`)

- Табличный / карточный вид.
- Default filter: `status=pending`.
- Быстрые действия на карточке: `[Approve]` / `[Reject]` / `[Spam]` — PATCH без перезагрузки.
- Показ полного текста, `article` (title + link), `author_name`, `created_at`, `ip_hash` (для банов).
- Bulk actions: select all → approve/reject.
- Optimistic updates (React Query / SWR).

---

## Revalidate

**Webhook больше НЕ нужен.** Server Actions (в том же процессе Next.js) вызывают `revalidatePath()` напрямую:

```ts
// app/admin/articles/[id]/actions.ts
"use server";
import { requireAdmin } from "@/lib/session";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function publishArticle(id: string) {
  await requireAdmin();
  const article = await db.article.update({
    where: { id },
    data: { status: "published", publishedAt: new Date() },
  });
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${article.slug}`);
  return article;
}
```

Ни `/api/revalidate`, ни секретов, ни webhook'ов.

---

## Layout / UI

Админка — то же brutalist-настроение, но:
- Больше воздуха между полями формы (paddings *1.5).
- Все поля с явными label (`<label>` над input).
- Ошибки формы под полем красным (`--color-danger`).
- Кнопки `[Primary]` (accent bg) и `[Secondary]` (outline). Deletion — `Danger` (danger border).

Обязательно сохраняем шрифты, скобки, `//` префиксы — это связывает админку с публичным дизайном.

---

## Что делает клиент, а что сервер (границы в Next.js all-in)

| Задача | Кто |
|---|---|
| Валидация формы (UX) | Client Component (`react-hook-form` + zod) |
| Валидация входа (безопасность) | Server Action (тот же zod-schema) |
| Sanitize HTML комментов | Server Action (`sanitize-html`) |
| Транслит slug | Client (при вводе, `slugify`) + Server Action (при отсутствии в input) |
| Автосохранение draft | Client (debounce 5s → Server Action) — планируется |
| Upload картинок | Route Handler `POST /api/admin/upload` → `public/uploads/YYYY-MM/<hex>.<ext>` → URL сохраняется как `article.coverImage`. Лимит 8MB, whitelist MIME (jpg/png/webp/avif/gif). Позже — переезд на S3-совместимое хранилище. |
| Auto-updated_at | Prisma `@updatedAt` |
| Revalidate | Server Action → `revalidatePath()` inline |

---

## Роли (`authors.role`)

| Role | Может |
|---|---|
| `author` | CRUD своих статей, модерация комментов к своим статьям |
| `editor` | CRUD любых статей, полная модерация |
| `admin` | + управление авторами, stats |

В MVP различий по правам почти нет — один-два пользователя. Полная схема прав — вторая волна.

---

## СТАТУС (2026-09-01)

Не реализовано. Отсутствуют: middleware.ts, /admin/* роуты, backend auth эндпоинты, redis для сессий (если нужно). Начинать с login + articles list + editor как минимум для 1-й полезной итерации.

## Cross-references

- Эндпоинты → `api-contract`
- Схема authors/articles/comments → `data-model`
- Revalidate → `seo`
