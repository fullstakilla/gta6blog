import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { CATEGORY_LABEL_UPPER, CATEGORY_LABEL_ALL } from "@/lib/i18n";
import type { ArticleTag } from "@/types/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Блог",
  description: "Все материалы GTA6·БЛОГ — трейлеры, утечки, разборы, слухи.",
  alternates: { canonical: "/blog" },
};

const PER_PAGE = 20;
const CATEGORIES: (ArticleTag | "ALL")[] = [
  "ALL",
  "TRAILER",
  "LEAK",
  "MAP",
  "CHARACTER",
  "GAMEPLAY",
  "RUMOR",
];

const dateFmt = new Intl.DateTimeFormat("ru-RU", { dateStyle: "short" });

interface Props {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function BlogListPage({ searchParams }: Props) {
  const sp = await searchParams;
  const currentPage = Math.max(1, Number(sp.page) || 1);
  const rawCategory = (sp.category ?? "ALL").toUpperCase();
  const category = (CATEGORIES as string[]).includes(rawCategory)
    ? (rawCategory as (typeof CATEGORIES)[number])
    : "ALL";

  const where = {
    status: "published" as const,
    ...(category !== "ALL" ? { category: category as ArticleTag } : {}),
  };

  const [total, articles] = await Promise.all([
    db.article.count({ where }),
    db.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (currentPage - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        category: true,
        publishedAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const buildQuery = (page: number) => {
    const params = new URLSearchParams();
    if (category !== "ALL") params.set("category", category);
    if (page > 1) params.set("page", String(page));
    const q = params.toString();
    return q ? `/blog?${q}` : "/blog";
  };

  return (
    <section
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "56px 24px 96px",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.25em",
            color: "var(--color-accent)",
          }}
        >
          {"// "}БЛОГ · {String(total).padStart(3, "0")} МАТЕРИАЛОВ
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(40px, 5.4vw, 64px)",
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            margin: "16px 0 0",
          }}
        >
Все материалы
        </h1>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          padding: "24px 0 32px",
        }}
      >
        {CATEGORIES.map((c) => {
          const active = c === category;
          const href = c === "ALL" ? "/blog" : `/blog?category=${c}`;
          return (
            <Link
              key={c}
              href={href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                borderRadius: 2,
                padding: "9px 14px",
                background: active ? "rgba(212,255,0,0.08)" : "transparent",
                border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border-default)"}`,
                color: active ? "var(--color-accent)" : "var(--color-muted)",
                transition: "all 160ms ease-out",
              }}
            >
              {CATEGORY_LABEL_ALL[c]}
            </Link>
          );
        })}
      </div>

      <div style={{ height: 1, background: "var(--color-border-default)" }} />

      {articles.length === 0 ? (
        <div
          style={{
            padding: "80px 0",
            textAlign: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.14em",
            color: "var(--color-muted)",
          }}
        >
          Пока нет статей в этой категории.
        </div>
      ) : (
        articles.map((a, i) => (
          <Link
            key={a.slug}
            href={`/blog/${a.slug}`}
            className="article-row"
            style={{
              display: "grid",
              gridTemplateColumns: "44px 110px minmax(0,1fr) 110px",
              alignItems: "center",
              gap: 20,
              padding: "22px 0",
              borderBottom: "1px solid var(--color-border-subtle)",
              color: "var(--color-text)",
              transition:
                "transform 160ms ease-out, border-color 160ms ease-out, color 160ms ease-out",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--color-muted)",
              }}
            >
              {String((currentPage - 1) * PER_PAGE + i + 1).padStart(3, "0")}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.16em",
                color: "var(--color-accent)",
              }}
            >
              {CATEGORY_LABEL_UPPER[a.category]}
            </span>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: 22,
                  lineHeight: 1.25,
                  letterSpacing: "-0.02em",
                }}
              >
                {a.title}
              </div>
              {a.excerpt && (
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    lineHeight: 1.4,
                    color: "var(--color-muted)",
                    marginTop: 6,
                    maxWidth: "72ch",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {a.excerpt}
                </div>
              )}
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--color-muted)",
                textAlign: "right",
              }}
            >
              {a.publishedAt ? dateFmt.format(new Date(a.publishedAt)) : "—"}
            </span>
          </Link>
        ))
      )}

      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 40,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.14em",
          }}
        >
          {currentPage > 1 ? (
            <Link href={buildQuery(currentPage - 1)} style={pagerLink}>
              ← НАЗАД
            </Link>
          ) : (
            <span style={{ ...pagerLink, opacity: 0.3 }}>← НАЗАД</span>
          )}
          <span style={{ color: "var(--color-muted)" }}>
            СТРАНИЦА {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages ? (
            <Link href={buildQuery(currentPage + 1)} style={pagerLink}>
              ВПЕРЁД →
            </Link>
          ) : (
            <span style={{ ...pagerLink, opacity: 0.3 }}>ВПЕРЁД →</span>
          )}
        </div>
      )}
    </section>
  );
}

const pagerLink: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  letterSpacing: "0.15em",
  color: "var(--color-text)",
  padding: "10px 18px",
  border: "1px solid var(--color-border-default)",
  borderRadius: 2,
};
