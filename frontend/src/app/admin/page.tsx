import Link from "next/link";
import { db } from "@/lib/db";
import { CATEGORY_LABEL_UPPER } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  draft: "Черновик",
  published: "Опубликовано",
  archived: "В архиве",
};

const STATUS_COLOR: Record<string, string> = {
  draft: "var(--color-muted)",
  published: "var(--color-success)",
  archived: "var(--color-danger)",
};

export default async function AdminArticlesPage() {
  const articles = await db.article.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      status: true,
      isFeatured: true,
      publishedAt: true,
      updatedAt: true,
    },
  });

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 24,
          marginBottom: 32,
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
            {"// "}ВСЕГО СТАТЕЙ: {articles.length}
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 36,
              letterSpacing: "-0.02em",
              margin: "12px 0 0",
            }}
          >
            Статьи
          </h1>
        </div>
        <Link
          href="/admin/articles/new"
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.15em",
            background: "var(--color-accent)",
            color: "var(--color-bg)",
            border: "1px solid var(--color-accent)",
            borderRadius: 2,
            padding: "14px 22px",
          }}
        >
          [+ НОВАЯ СТАТЬЯ]
        </Link>
      </div>

      <div style={{ border: "1px solid var(--color-border-default)", borderRadius: 2 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1fr) 100px 120px 100px 120px 120px",
            gap: 16,
            padding: "12px 20px",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.16em",
            color: "var(--color-muted)",
            borderBottom: "1px solid var(--color-border-default)",
          }}
        >
          <div>ЗАГОЛОВОК</div>
          <div>КАТЕГОРИЯ</div>
          <div>СТАТУС</div>
          <div>HERO</div>
          <div>ОБНОВЛЕНО</div>
          <div style={{ textAlign: "right" }}>ДЕЙСТВИЯ</div>
        </div>

        {articles.map((a) => (
          <div
            key={a.id}
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1fr) 100px 120px 100px 120px 120px",
              gap: 16,
              padding: "16px 20px",
              alignItems: "center",
              borderBottom: "1px solid var(--color-border-subtle)",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 15,
                  fontWeight: 500,
                  lineHeight: 1.3,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {a.title}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--color-muted)",
                  marginTop: 4,
                }}
              >
                /{a.slug}
              </div>
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.16em",
                color: "var(--color-accent)",
              }}
            >
              {CATEGORY_LABEL_UPPER[a.category]}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.14em",
                color: STATUS_COLOR[a.status] ?? "var(--color-muted)",
              }}
            >
              {STATUS_LABEL[a.status] ?? a.status}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: a.isFeatured ? "var(--color-accent)" : "var(--color-muted)",
              }}
            >
              {a.isFeatured ? "★ HERO" : "—"}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--color-muted)",
              }}
            >
              {new Intl.DateTimeFormat("ru-RU", {
                dateStyle: "short",
                timeStyle: "short",
              }).format(a.updatedAt)}
            </div>
            <div style={{ textAlign: "right" }}>
              <Link
                href={`/admin/articles/${a.id}`}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  color: "var(--color-accent)",
                }}
              >
                → РЕДАКТ
              </Link>
            </div>
          </div>
        ))}

        {articles.length === 0 && (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "var(--color-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
            }}
          >
            Пока пусто. Нажми <b>[+ НОВАЯ СТАТЬЯ]</b> чтобы начать.
          </div>
        )}
      </div>
    </>
  );
}
