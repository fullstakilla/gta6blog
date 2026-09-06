import { HomePage } from "@/components/home/HomePage";
import {
  getHeroArticle,
  listPublishedArticles,
  listArchiveArticles,
  getGuideStats,
  getSubscribersCount,
} from "@/lib/api";

export const revalidate = 60;

export default async function Page() {
  const hero = await getHeroArticle();
  const [articles, archive, guideStats, subscribersCount] = await Promise.all([
    listPublishedArticles({ excludeSlug: hero?.slug, limit: 8 }),
    listArchiveArticles(3),
    getGuideStats(),
    getSubscribersCount(),
  ]);
  return (
    <HomePage
      hero={hero}
      articles={articles}
      archive={archive}
      guideStats={guideStats}
      subscribersCount={subscribersCount}
    />
  );
}
