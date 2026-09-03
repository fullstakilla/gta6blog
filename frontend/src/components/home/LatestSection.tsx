import Link from "next/link";
import { CATEGORY_LABEL_UPPER } from "@/lib/i18n";
import type { ArticleTag } from "@/types/api";

export interface LatestArticle {
  slug: string;
  title: string;
  category: ArticleTag;
  publishedAt: Date | string | null;
}

const dateFmt = new Intl.DateTimeFormat("ru-RU", { dateStyle: "short" });

export function LatestSection({ articles }: { articles: LatestArticle[] }) {
  const shown = articles.slice(0, 8);
  return (
    <section
      id="latest"
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "88px 24px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontStyle: "italic",
            fontSize: 32,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Свежее
        </h2>
        <Link
          href="/blog"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            color: "var(--color-muted)",
          }}
        >
          → ВСЕ МАТЕРИАЛЫ
        </Link>
      </div>

      <div style={{ height: 1, background: "var(--color-border-default)", marginTop: 28 }} />
      {shown.map((r, i) => (
        <Link
          key={r.slug}
          href={`/blog/${r.slug}`}
          className="article-row"
          style={{
            display: "grid",
            gridTemplateColumns: "44px 110px minmax(0,1fr) 100px",
            alignItems: "center",
            gap: 20,
            padding: "20px 0",
            borderBottom: "1px solid var(--color-border-subtle)",
            color: "var(--color-text)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--color-muted)",
            }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.16em",
              color: "var(--color-accent)",
            }}
          >
            {CATEGORY_LABEL_UPPER[r.category]}
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: 20,
              lineHeight: 1.3,
              letterSpacing: "-0.02em",
            }}
          >
            {r.title}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--color-muted)",
              textAlign: "right",
            }}
          >
            {r.publishedAt ? dateFmt.format(new Date(r.publishedAt)) : "—"}
          </span>
        </Link>
      ))}

      {shown.length === 0 && (
        <div
          style={{
            padding: "60px 0",
            textAlign: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.14em",
            color: "var(--color-muted)",
          }}
        >
          Пока нет опубликованных материалов.
        </div>
      )}
    </section>
  );
}
