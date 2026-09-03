"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, RateLimitError } from "@/lib/rate-limit";
import { getIpHash, getFingerprint } from "@/lib/request";
import { sanitizeComment } from "@/lib/sanitize";

const REACTION_TYPES = ["fire", "love", "laugh", "think", "hundred"] as const;

const CommentInput = z.object({
  articleId: z.string().uuid(),
  authorName: z.string().min(1).max(40),
  authorEmail: z.string().email().optional().or(z.literal("")),
  content: z.string().min(1).max(2000),
  parentId: z.string().uuid().optional(),
});

export async function createComment(input: unknown) {
  const parsed = CommentInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, code: "INVALID_INPUT" as const, message: parsed.error.issues[0]?.message };
  }
  const data = parsed.data;

  try {
    await rateLimit({ bucket: "comment", max: 3, windowSec: 60 });
  } catch (e) {
    if (e instanceof RateLimitError) {
      return { ok: false as const, code: "RATE_LIMITED" as const, message: e.message };
    }
    throw e;
  }

  // безопасность: если parentId — убедиться, что коммент того же article_id
  if (data.parentId) {
    const parent = await db.comment.findUnique({
      where: { id: data.parentId },
      select: { articleId: true },
    });
    if (!parent || parent.articleId !== data.articleId) {
      return { ok: false as const, code: "INVALID_INPUT" as const, message: "Некорректный parent" };
    }
  }

  const clean = sanitizeComment(data.content);
  const ipHash = await getIpHash();

  const comment = await db.comment.create({
    data: {
      articleId: data.articleId,
      parentId: data.parentId ?? null,
      authorName: data.authorName,
      authorEmail: data.authorEmail || null,
      content: clean,
      status: "pending",
      ipHash,
    },
    select: { id: true, status: true },
  });

  return { ok: true as const, id: comment.id, status: comment.status };
}

const ReactionInput = z.object({
  articleId: z.string().uuid(),
  reactionType: z.enum(REACTION_TYPES),
});

export async function toggleReaction(input: unknown) {
  const parsed = ReactionInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, code: "INVALID_INPUT" as const };
  }
  const data = parsed.data;

  try {
    await rateLimit({ bucket: "reaction", max: 10, windowSec: 60 });
  } catch (e) {
    if (e instanceof RateLimitError) {
      return { ok: false as const, code: "RATE_LIMITED" as const, message: e.message };
    }
    throw e;
  }

  const [fingerprint, ipHash] = await Promise.all([getFingerprint(), getIpHash()]);

  // toggle: если уже есть — удалить, иначе добавить
  const existing = await db.reaction.findUnique({
    where: {
      articleId_reactionType_fingerprint: {
        articleId: data.articleId,
        reactionType: data.reactionType,
        fingerprint,
      },
    },
  });

  let action: "added" | "removed";
  if (existing) {
    await db.reaction.delete({ where: { id: existing.id } });
    action = "removed";
  } else {
    await db.reaction.create({
      data: {
        articleId: data.articleId,
        reactionType: data.reactionType,
        fingerprint,
        ipHash,
      },
    });
    action = "added";
  }

  const counts = await countReactions(data.articleId);
  return { ok: true as const, action, counts, userType: existing ? null : data.reactionType };
}

async function countReactions(articleId: string) {
  const rows = await db.reaction.groupBy({
    by: ["reactionType"],
    where: { articleId },
    _count: { _all: true },
  });
  const map: Record<(typeof REACTION_TYPES)[number], number> = {
    fire: 0,
    love: 0,
    laugh: 0,
    think: 0,
    hundred: 0,
  };
  for (const r of rows) map[r.reactionType] = r._count._all;
  return map;
}

export async function getReactionCounts(articleId: string) {
  return countReactions(articleId);
}

/**
 * Проверяет, какие реакции ставил текущий пользователь на статью
 * (по fingerprint). Возвращает set типов, которые уже стоят.
 */
const ViewInput = z.object({ articleId: z.string().uuid() });

/**
 * Инкремент просмотра статьи. Дедуп по IP-хэшу в окне 10 минут.
 * Fire-and-forget с клиента при монтировании страницы статьи.
 */
export async function trackView(input: unknown): Promise<{ ok: boolean }> {
  const parsed = ViewInput.safeParse(input);
  if (!parsed.success) return { ok: false };

  const ipHash = await getIpHash();
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const recent = await db.articleView.findFirst({
    where: {
      articleId: parsed.data.articleId,
      ipHash,
      viewedAt: { gte: tenMinutesAgo },
    },
    select: { id: true },
  });
  if (recent) return { ok: true }; // тихо игнорим повторный view

  await db.$transaction([
    db.articleView.create({
      data: { articleId: parsed.data.articleId, ipHash },
    }),
    db.article.update({
      where: { id: parsed.data.articleId },
      data: { viewsCount: { increment: 1 } },
    }),
  ]);
  return { ok: true };
}

export async function getMyReactions(articleId: string): Promise<string[]> {
  const fingerprint = await getFingerprint();
  const mine = await db.reaction.findMany({
    where: { articleId, fingerprint },
    select: { reactionType: true },
  });
  return mine.map((r) => r.reactionType);
}
