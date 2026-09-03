import { HomePage } from "@/components/home/HomePage";
import {
  getHeroArticle,
  listPublishedArticles,
  listArchiveArticles,
} from "@/lib/api";

export const revalidate = 60;

export default async function Page() {
  const hero = await getHeroArticle();
  const [articles, archive] = await Promise.all([
    listPublishedArticles({ excludeSlug: hero?.slug, limit: 8 }),
    listArchiveArticles(3),
  ]);
  return <HomePage hero={hero} articles={articles} archive={archive} />;
}
