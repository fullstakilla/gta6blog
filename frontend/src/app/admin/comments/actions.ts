"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

const CommentStatusEnum = z.enum(["pending", "approved", "rejected", "spam"]);

export async function moderateComment(id: string, status: string) {
  await requireAdmin();
  const parsed = CommentStatusEnum.safeParse(status);
  if (!parsed.success) return { ok: false as const, error: "Invalid status" };

  const comment = await db.comment.update({
    where: { id },
    data: { status: parsed.data },
    include: { article: { select: { slug: true } } },
  });

  revalidatePath("/admin/comments");
  if (comment.article) revalidatePath(`/blog/${comment.article.slug}`);
  return { ok: true as const };
}

export async function moderateCommentsBulk(ids: string[], status: string) {
  await requireAdmin();
  const parsed = CommentStatusEnum.safeParse(status);
  if (!parsed.success) return { ok: false as const, error: "Invalid status" };

  const affected = await db.comment.findMany({
    where: { id: { in: ids } },
    select: { id: true, article: { select: { slug: true } } },
  });

  await db.comment.updateMany({
    where: { id: { in: ids } },
    data: { status: parsed.data },
  });

  revalidatePath("/admin/comments");
  const slugs = new Set(affected.map((c) => c.article?.slug).filter(Boolean));
  for (const slug of slugs) revalidatePath(`/blog/${slug}`);
  return { ok: true as const, count: affected.length };
}

export async function deleteCommentPermanent(id: string) {
  await requireAdmin();
  const comment = await db.comment.findUnique({
    where: { id },
    include: { article: { select: { slug: true } } },
  });
  if (!comment) return { ok: false as const };
  await db.comment.delete({ where: { id } });
  revalidatePath("/admin/comments");
  if (comment.article) revalidatePath(`/blog/${comment.article.slug}`);
  return { ok: true as const };
}
