import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await db.article.findUnique({ where: { id } });
  if (!article) notFound();

  const currentFeatured = article.isFeatured
    ? null
    : await db.article.findFirst({
        where: { isFeatured: true },
        select: { title: true },
      });

  return (
    <ArticleForm
      mode="edit"
      initial={{
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        coverImage: article.coverImage,
        category: article.category,
        tags: article.tags,
        status: article.status,
        metaTitle: article.metaTitle,
        metaDesc: article.metaDesc,
        isFeatured: article.isFeatured,
      }}
      currentFeaturedTitle={currentFeatured?.title ?? null}
    />
  );
}
