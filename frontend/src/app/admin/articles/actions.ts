"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

const CATEGORIES = ["TRAILER", "LEAK", "MAP", "CHARACTER", "GAMEPLAY", "RUMOR"] as const;
const STATUSES = ["draft", "published", "archived"] as const;

const ArticleInput = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(120),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(300).optional().nullable(),
  content: z.string().min(1),
  coverImage: z
    .string()
    .refine(
      (v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v),
      "Некорректный URL обложки",
    )
    .optional()
    .nullable(),
  category: z.enum(CATEGORIES),
  tags: z.array(z.string()).default([]),
  status: z.enum(STATUSES).default("draft"),
  metaTitle: z.string().max(160).optional().nullable(),
  metaDesc: z.string().max(300).optional().nullable(),
  isFeatured: z.boolean().default(false),
});

function fromForm(fd: FormData) {
  const rawTitle = String(fd.get("title") ?? "");
  const rawSlug = String(fd.get("slug") ?? "").trim();
  return {
    slug:
      rawSlug ||
      slugify(rawTitle, { lower: true, strict: true, locale: "ru" }).slice(0, 120),
    title: rawTitle,
    excerpt: (fd.get("excerpt") as string) || null,
    content: String(fd.get("content") ?? ""),
    coverImage: (fd.get("coverImage") as string) || null,
    category: fd.get("category") as (typeof CATEGORIES)[number],
    tags: String(fd.get("tags") ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    status: (fd.get("status") as (typeof STATUSES)[number]) || "draft",
    metaTitle: (fd.get("metaTitle") as string) || null,
    metaDesc: (fd.get("metaDesc") as string) || null,
    isFeatured: fd.get("isFeatured") === "on",
  };
}

export async function createArticle(fd: FormData) {
  const session = await requireAdmin();
  const parsed = ArticleInput.safeParse(fromForm(fd));
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const article = await db.$transaction(async (tx) => {
    if (data.isFeatured) {
      await tx.article.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false },
      });
    }
    return tx.article.create({
      data: {
        ...data,
        publishedAt: data.status === "published" ? new Date() : null,
        authorId: session.userId!,
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(`/admin/articles/${article.id}?ok=created`);
}

export async function updateArticle(id: string, fd: FormData) {
  await requireAdmin();
  const parsed = ArticleInput.safeParse(fromForm(fd));
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const existing = await db.article.findUnique({ where: { id } });
  if (!existing) return { ok: false as const, error: "Not found" };

  const article = await db.$transaction(async (tx) => {
    if (data.isFeatured && !existing.isFeatured) {
      await tx.article.updateMany({
        where: { isFeatured: true, NOT: { id } },
        data: { isFeatured: false },
      });
    }
    return tx.article.update({
      where: { id },
      data: {
        ...data,
        publishedAt:
          data.status === "published" && !existing.publishedAt
            ? new Date()
            : existing.publishedAt,
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/admin/articles/${id}`);
  return { ok: true as const, slug: article.slug };
}

export async function deleteArticle(id: string) {
  await requireAdmin();
  await db.article.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}
