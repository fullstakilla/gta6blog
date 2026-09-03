import "server-only";
import { db } from "@/lib/db";
import type { ArticleTag } from "@/types/api";

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
  return db.article.findMany({
    where: {
      status: "published",
      ...(opts?.excludeSlug ? { slug: { not: opts.excludeSlug } } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: opts?.limit,
    select: { slug: true, title: true, category: true, publishedAt: true },
  });
}

/**
 * «Из архива» — 3 отобранных материала (пока: старейшие published).
 * Позже добавим ручной флаг `is_evergreen` в БД для настоящего курирования.
 */
export async function listArchiveArticles(limit = 3): Promise<LatestListArticle[]> {
  return db.article.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "asc" },
    take: limit,
    select: { slug: true, title: true, category: true, publishedAt: true },
  });
}

/**
 * Полная опубликованная статья по slug. Возвращает null если не найдена.
 */
export async function getArticleBySlug(slug: string) {
  return db.article.findFirst({
    where: { slug, status: "published" },
    include: { author: { select: { name: true } } },
  });
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
  const rows = await db.comment.findMany({
    where: { articleId, status: "approved" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      parentId: true,
      authorName: true,
      content: true,
      createdAt: true,
    },
  });

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
