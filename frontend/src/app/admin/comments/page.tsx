import Link from "next/link";
import { db } from "@/lib/db";
import { CommentsClient } from "@/components/admin/CommentsClient";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = ["pending", "approved", "rejected", "spam", "all"] as const;

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminCommentsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const status = (STATUS_FILTERS as readonly string[]).includes(sp.status ?? "")
    ? (sp.status as (typeof STATUS_FILTERS)[number])
    : "pending";

  const where = status === "all" ? {} : { status };
  const comments = await db.comment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      article: { select: { slug: true, title: true } },
    },
  });

  const counts = await db.comment.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));
  const total = counts.reduce((s, c) => s + c._count._all, 0);

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.25em",
            color: "var(--color-accent)",
          }}
        >
          {"// "}МОДЕРАЦИЯ · {countMap.pending ?? 0} НА ПРОВЕРКЕ
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
          Комментарии
        </h1>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {STATUS_FILTERS.map((f) => {
          const active = f === status;
          const label =
            f === "all"
              ? `Все (${total})`
              : f === "pending"
                ? `На проверке (${countMap.pending ?? 0})`
                : f === "approved"
                  ? `Одобрено (${countMap.approved ?? 0})`
                  : f === "rejected"
                    ? `Отклонено (${countMap.rejected ?? 0})`
                    : `Спам (${countMap.spam ?? 0})`;
          return (
            <Link
              key={f}
              href={`/admin/comments?status=${f}`}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.14em",
                padding: "9px 14px",
                border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border-default)"}`,
                background: active ? "rgba(212,255,0,0.08)" : "transparent",
                color: active ? "var(--color-accent)" : "var(--color-muted)",
                borderRadius: 2,
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {comments.length === 0 ? (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.14em",
            color: "var(--color-muted)",
            border: "1px solid var(--color-border-default)",
            borderRadius: 2,
          }}
        >
          Пусто в этом фильтре.
        </div>
      ) : (
        <CommentsClient
          comments={comments.map((c) => ({
            id: c.id,
            authorName: c.authorName,
            authorEmail: c.authorEmail,
            content: c.content,
            status: c.status,
            createdAt: c.createdAt.toISOString(),
            article: c.article
              ? { slug: c.article.slug, title: c.article.title }
              : null,
          }))}
        />
      )}
    </>
  );
}
