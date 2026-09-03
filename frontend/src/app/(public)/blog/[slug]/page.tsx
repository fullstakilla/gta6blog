import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { marked } from "marked";
import { getArticleBySlug, listPublishedArticles } from "@/lib/api";
import { CATEGORY_LABEL_UPPER } from "@/lib/i18n";
import type { ArticleTag } from "@/types/api";
import { StructuredData } from "@/components/seo/StructuredData";
import { articleJsonLd } from "@/lib/seo";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.metaTitle ?? article.title,
    description: article.metaDesc ?? article.excerpt ?? undefined,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt ?? undefined,
      publishedTime: article.publishedAt?.toISOString(),
      authors: article.author ? [article.author.name] : undefined,
      images: article.coverImage ? [{ url: article.coverImage }] : undefined,
    },
  };
}

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "long",
});

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await listPublishedArticles({
    excludeSlug: slug,
    limit: 3,
  });

  const html = await marked.parse(article.content, { async: true });
  const category = CATEGORY_LABEL_UPPER[article.category as ArticleTag] ?? article.category;

  return (
    <article
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "56px 24px 88px",
      }}
    >
      <StructuredData
        data={articleJsonLd({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          coverImage: article.coverImage,
          publishedAt: article.publishedAt,
          updatedAt: article.updatedAt,
          authorName: article.author?.name ?? null,
          category: article.category,
        })}
      />
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.14em",
          color: "var(--color-muted)",
        }}
      >
        ← ко всем статьям
      </Link>

      <div
        style={{
          display: "flex",
          gap: 14,
          alignItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.2em",
          marginTop: 32,
        }}
      >
        <span style={{ color: "var(--color-accent)" }}>{category}</span>
        {article.publishedAt && (
          <>
            <span style={{ color: "var(--color-muted)" }}>·</span>
            <span style={{ color: "var(--color-muted)" }}>
              {dateFmt.format(new Date(article.publishedAt))}
            </span>
          </>
        )}
        {article.author && (
          <>
            <span style={{ color: "var(--color-muted)" }}>·</span>
            <span style={{ color: "var(--color-muted)" }}>
              {article.author.name}
            </span>
          </>
        )}
      </div>

      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(36px, 5.4vw, 64px)",
          lineHeight: 1.05,
          letterSpacing: "-0.035em",
          margin: "24px 0 0",
        }}
      >
        {article.title}
      </h1>

      {article.excerpt && (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 20,
            lineHeight: 1.5,
            color: "var(--color-muted)",
            margin: "24px 0 0",
            textWrap: "pretty",
          }}
        >
          {article.excerpt}
        </p>
      )}

      {article.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverImage}
          alt=""
          style={{
            width: "100%",
            height: "auto",
            marginTop: 40,
            border: "1px solid var(--color-border-default)",
            borderRadius: 2,
          }}
        />
      )}

      <div
        className="article-body"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 18,
          lineHeight: 1.7,
          color: "var(--color-text)",
          marginTop: 48,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {article.tags.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid var(--color-border-subtle)",
          }}
        >
          {article.tags.map((t) => (
            <span
              key={t}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.16em",
                color: "var(--color-muted)",
                border: "1px solid var(--color-border-default)",
                borderRadius: 2,
                padding: "6px 10px",
              }}
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <section style={{ marginTop: 72 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.25em",
              color: "var(--color-accent)",
              marginBottom: 20,
            }}
          >
            {"// "}ЧИТАЙ ЕЩЁ
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="related-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "14px 0",
                  borderBottom: "1px solid var(--color-border-subtle)",
                  color: "var(--color-text)",
                  transition: "transform 160ms ease-out, color 160ms ease-out",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    letterSpacing: "0.16em",
                    color: "var(--color-accent)",
                    width: 90,
                  }}
                >
                  {CATEGORY_LABEL_UPPER[r.category]}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    fontSize: 18,
                    lineHeight: 1.3,
                  }}
                >
                  {r.title}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <style>{`
        .article-body h1, .article-body h2, .article-body h3 {
          font-family: var(--font-display);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 40px 0 16px;
        }
        .article-body h1 { font-size: 32px; }
        .article-body h2 { font-size: 26px; }
        .article-body h3 { font-size: 22px; }
        .article-body p { margin: 0 0 20px; }
        .article-body a { color: var(--color-accent); text-decoration: underline; text-underline-offset: 3px; }
        .article-body ul, .article-body ol { padding-left: 24px; margin: 0 0 20px; }
        .article-body li { margin-bottom: 8px; }
        .article-body code {
          font-family: var(--font-mono);
          font-size: 0.9em;
          background: var(--color-surface);
          padding: 2px 6px;
          border-radius: 2px;
        }
        .article-body pre {
          background: var(--color-surface);
          border: 1px solid var(--color-border-default);
          border-radius: 2px;
          padding: 16px;
          overflow-x: auto;
          margin: 0 0 20px;
        }
        .article-body pre code { background: transparent; padding: 0; }
        .article-body blockquote {
          border-left: 2px solid var(--color-accent);
          padding-left: 20px;
          margin: 24px 0;
          color: var(--color-muted);
          font-style: italic;
        }
        .article-body img { max-width: 100%; height: auto; border: 1px solid var(--color-border-default); border-radius: 2px; margin: 24px 0; }
        .article-body hr { border: 0; border-top: 1px solid var(--color-border-subtle); margin: 32px 0; }
        .related-row:hover { transform: translateX(8px); color: var(--color-accent) !important; }
      `}</style>
    </article>
  );
}
