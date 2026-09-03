import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";

// force-dynamic — чтобы CI/prerender без DATABASE_URL не падал на build
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await db.article.findMany({
    where: { status: "published" },
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const now = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/gallery`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/guide`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/guide/map`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/guide/characters`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/guide/vehicles`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/guide/gameplay`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/about`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/cookies`, changeFrequency: "yearly", priority: 0.2 },
    ...articles.map((a) => ({
      url: `${SITE_URL}/blog/${a.slug}`,
      lastModified: new Date(a.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
