import "server-only";
import { db } from "@/lib/db";
import type { ArticleTag } from "@/types/api";

/**
 * Оборачивает Prisma-запрос — если БД недоступна (build time в CI,
 * временная авария), возвращаем fallback вместо падения. Логируем ошибку.
 * В нормальном runtime — БД всегда доступна, ошибка не должна возникать.
 */
async function safeDb<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.warn("[safeDb] DB query failed, using fallback:", (e as Error).message);
    return fallback;
  }
}

export type HeroArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string;
  publishedAt: Date | null;
};

/**
 * Editorial hero главной. Стратегия (см. ADR-004 в skill `decisions`):
 *   1. Опубликованная статья с is_featured = true.
 *   2. Fallback — последняя опубликованная (published_at DESC).
 */
export async function getHeroArticle(): Promise<HeroArticle | null> {
  return safeDb(async () => {
    const featured = await db.article.findFirst({
      where: { isFeatured: true, status: "published" },
      select: heroSelect,
    });
    if (featured) return featured;
    return db.article.findFirst({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      select: heroSelect,
    });
  }, null);
}

const heroSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImage: true,
  category: true,
  publishedAt: true,
} as const;

export type LatestListArticle = {
  slug: string;
  title: string;
  category: ArticleTag;
  publishedAt: Date | null;
};

/**
 * Список опубликованных статей для Latest-секции главной и /blog.
 * Опционально исключает slug (например, hero-статью, чтобы не дублировать).
 */
export async function listPublishedArticles(opts?: {
  excludeSlug?: string;
  limit?: number;
}): Promise<LatestListArticle[]> {
  return safeDb(
    () =>
      db.article.findMany({
        where: {
          status: "published",
          ...(opts?.excludeSlug ? { slug: { not: opts.excludeSlug } } : {}),
        },
        orderBy: { publishedAt: "desc" },
        take: opts?.limit,
        select: { slug: true, title: true, category: true, publishedAt: true },
      }),
    [],
  );
}

/**
 * «Из архива» — 3 отобранных материала (пока: старейшие published).
 * Позже добавим ручной флаг `is_evergreen` в БД для настоящего курирования.
 */
export async function listArchiveArticles(limit = 3): Promise<LatestListArticle[]> {
  return safeDb(
    () =>
      db.article.findMany({
        where: { status: "published" },
        orderBy: { publishedAt: "asc" },
        take: limit,
        select: { slug: true, title: true, category: true, publishedAt: true },
      }),
    [],
  );
}

/**
 * Полная опубликованная статья по slug. Возвращает null если не найдена.
 */
export async function getArticleBySlug(slug: string) {
  return safeDb(
    () =>
      db.article.findFirst({
        where: { slug, status: "published" },
        include: { author: { select: { name: true } } },
      }),
    null,
  );
}

interface CommentNode {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date;
  replies: CommentNode[];
}

/**
 * Одобренные комментарии статьи, свёрнутые в дерево (parent → replies).
 * Ограничение глубины (3) — на клиенте (`CommentSection`).
 */
export async function listApprovedComments(articleId: string): Promise<CommentNode[]> {
  const rows = await safeDb(
    () =>
      db.comment.findMany({
        where: { articleId, status: "approved" },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          parentId: true,
          authorName: true,
          content: true,
          createdAt: true,
        },
      }),
    [] as Array<{
      id: string;
      parentId: string | null;
      authorName: string;
      content: string;
      createdAt: Date;
    }>,
  );

  const byId = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];
  for (const r of rows) {
    byId.set(r.id, {
      id: r.id,
      authorName: r.authorName,
      content: r.content,
      createdAt: r.createdAt,
      replies: [],
    });
  }
  for (const r of rows) {
    const node = byId.get(r.id)!;
    if (r.parentId && byId.has(r.parentId)) {
      byId.get(r.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export interface TrendingArticle {
  slug: string;
  title: string;
  count: number;
}

/**
 * Топ статей по просмотрам за последний час.
 * Fallback — если недавних просмотров нет, показываем последние 3 published.
 */
export async function listTrending(limit = 3): Promise<TrendingArticle[]> {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const rows = await safeDb(
    () =>
      db.articleView.groupBy({
        by: ["articleId"],
        where: { viewedAt: { gte: hourAgo } },
        _count: { _all: true },
        orderBy: { _count: { articleId: "desc" } },
        take: limit,
      }),
    [] as Array<{ articleId: string; _count: { _all: number } }>,
  );

  if (rows.length === 0) {
    // fallback — просто свежие статьи с их totalViews
    const fresh = await safeDb(
      () =>
        db.article.findMany({
          where: { status: "published" },
          orderBy: { publishedAt: "desc" },
          take: limit,
          select: { slug: true, title: true, viewsCount: true },
        }),
      [] as Array<{ slug: string; title: string; viewsCount: bigint }>,
    );
    return fresh.map((a) => ({
      slug: a.slug,
      title: a.title,
      count: Number(a.viewsCount),
    }));
  }

  const articles = await safeDb(
    () =>
      db.article.findMany({
        where: { id: { in: rows.map((r) => r.articleId) } },
        select: { id: true, slug: true, title: true },
      }),
    [] as Array<{ id: string; slug: string; title: string }>,
  );
  const byId = new Map(articles.map((a) => [a.id, a]));
  return rows
    .map((r) => {
      const a = byId.get(r.articleId);
      return a ? { slug: a.slug, title: a.title, count: r._count._all } : null;
    })
    .filter((x): x is TrendingArticle => x !== null);
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  caption: string | null;
  source: string;
  width: number | null;
  height: number | null;
}

export async function listGalleryItems(limit?: number): Promise<GalleryItem[]> {
  return safeDb(
    () =>
      db.galleryItem.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: limit,
        select: {
          id: true,
          imageUrl: true,
          caption: true,
          source: true,
          width: true,
          height: true,
        },
      }),
    [],
  );
}
