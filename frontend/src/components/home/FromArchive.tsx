import Link from "next/link";
import { CATEGORY_LABEL_UPPER } from "@/lib/i18n";
import type { LatestArticle } from "./LatestSection";

const dateFmt = new Intl.DateTimeFormat("ru-RU", { dateStyle: "short" });

export function FromArchive({ articles }: { articles: LatestArticle[] }) {
  if (articles.length === 0) return null;
  return (
    <section
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "40px 24px 88px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 24,
          paddingBottom: 28,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.25em",
              color: "var(--color-accent)",
            }}
          >
            {"// "}ИЗ АРХИВА
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontStyle: "italic",
              fontSize: 28,
              letterSpacing: "-0.02em",
              margin: "10px 0 0",
            }}
          >
            Не потеряй важное
          </h2>
        </div>
        <a
          href="#latest"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            color: "var(--color-muted)",
          }}
        >
          → ВЕСЬ АРХИВ ↓
        </a>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 20,
        }}
        className="archive-grid"
      >
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/blog/${a.slug}`}
            className="archive-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              padding: 20,
              border: "1px solid var(--color-border-default)",
              borderRadius: 2,
              color: "var(--color-text)",
              transition: "border-color 160ms ease-out, transform 160ms ease-out",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "var(--color-accent)",
              }}
            >
              {CATEGORY_LABEL_UPPER[a.category]}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: 20,
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
              }}
            >
              {a.title}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.12em",
                color: "var(--color-muted)",
                marginTop: "auto",
              }}
            >
              {a.publishedAt ? dateFmt.format(new Date(a.publishedAt)) : "—"}
            </div>
          </Link>
        ))}
      </div>
      <style>{`
        .archive-card:hover { border-color: var(--color-accent) !important; transform: translateY(-2px); }
        @media (max-width: 900px) {
          .archive-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
