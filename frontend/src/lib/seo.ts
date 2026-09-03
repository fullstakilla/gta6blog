import { SITE_URL } from "./constants";

interface ArticleJsonLdInput {
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt: Date | string | null;
  updatedAt: Date | string;
  authorName?: string | null;
  category: string;
}

export function articleJsonLd(a: ArticleJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title,
    description: a.excerpt ?? undefined,
    image: a.coverImage ? [a.coverImage] : undefined,
    datePublished: a.publishedAt ? new Date(a.publishedAt).toISOString() : undefined,
    dateModified: new Date(a.updatedAt).toISOString(),
    author: a.authorName
      ? { "@type": "Person", name: a.authorName }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "GTA6·БЛОГ",
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${a.slug}`,
    },
    articleSection: a.category,
  };
}

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "GTA6·БЛОГ",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/blog?q={query}`,
    "query-input": "required name=query",
  },
} as const;

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "GTA6·БЛОГ",
  url: SITE_URL,
  description:
    "Независимый хаб новостей о GTA VI. Утечки, разборы, теории — без хайпа и кликбейта.",
} as const;
