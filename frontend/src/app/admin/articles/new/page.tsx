import { db } from "@/lib/db";
import { ArticleForm } from "@/components/admin/ArticleForm";

export default async function NewArticlePage() {
  const currentFeatured = await db.article.findFirst({
    where: { isFeatured: true },
    select: { title: true },
  });
  return <ArticleForm mode="create" currentFeaturedTitle={currentFeatured?.title ?? null} />;
}
