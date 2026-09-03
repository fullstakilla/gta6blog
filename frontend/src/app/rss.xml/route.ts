import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";
import { CATEGORY_LABEL_UPPER } from "@/lib/i18n";
import type { ArticleTag } from "@/types/api";

// force-dynamic — чтобы CI/prerender без DATABASE_URL не падал.
// Cache-Control на response всё равно даёт 5 мин CDN-кэша.
export const dynamic = "force-dynamic";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const articles = await db.article.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: { author: { select: { name: true } } },
  });

  const now = new Date();
  const items = articles
    .map((a) => {
      const url = `${SITE_URL}/blog/${a.slug}`;
      const pubDate = (a.publishedAt ?? a.createdAt).toUTCString();
      const category = CATEGORY_LABEL_UPPER[a.category as ArticleTag] ?? a.category;
      const description = a.excerpt ?? "";
      const author = a.author?.name ?? "GTA6·БЛОГ";
      return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(category)}</category>
      <author>${escapeXml(author)}</author>
      <description>${escapeXml(description)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>GTA6·БЛОГ</title>
    <link>${SITE_URL}</link>
    <description>Независимый хаб новостей о GTA VI. Утечки, разборы, теории — без хайпа и кликбейта.</description>
    <language>ru</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
