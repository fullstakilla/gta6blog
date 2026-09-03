"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  moderateComment,
  moderateCommentsBulk,
  deleteCommentPermanent,
} from "@/app/admin/comments/actions";

interface CommentRow {
  id: string;
  authorName: string;
  authorEmail: string | null;
  content: string;
  status: string;
  createdAt: string;
  article: { slug: string; title: string } | null;
}

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
  timeStyle: "short",
});

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending: { label: "На проверке", color: "var(--color-muted)" },
  approved: { label: "Одобрено", color: "var(--color-success)" },
  rejected: { label: "Отклонено", color: "var(--color-danger)" },
  spam: { label: "Спам", color: "var(--color-danger)" },
};

export function CommentsClient({ comments }: { comments: CommentRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(
      selected.size === comments.length
        ? new Set()
        : new Set(comments.map((c) => c.id)),
    );

  const singleAction = (id: string, status: string) => {
    startTransition(async () => {
      await moderateComment(id, status);
    });
  };

  const bulkAction = (status: string) => {
    if (selected.size === 0) return;
    startTransition(async () => {
      await moderateCommentsBulk([...selected], status);
      setSelected(new Set());
    });
  };

  const removeOne = (id: string) => {
    if (!confirm("Удалить безвозвратно?")) return;
    startTransition(async () => {
      await deleteCommentPermanent(id);
    });
  };

  return (
    <>
      {selected.size > 0 && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 5,
            display: "flex",
            gap: 8,
            alignItems: "center",
            padding: "12px 16px",
            background: "var(--color-surface)",
            border: "1px solid var(--color-accent)",
            borderRadius: 2,
            marginBottom: 16,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
          }}
        >
          <span style={{ color: "var(--color-accent)", flex: 1 }}>
            ВЫБРАНО: {selected.size}
          </span>
          <button
            type="button"
            onClick={() => bulkAction("approved")}
            disabled={isPending}
            style={bulkBtn("var(--color-success)")}
          >
            [ОДОБРИТЬ]
          </button>
          <button
            type="button"
            onClick={() => bulkAction("rejected")}
            disabled={isPending}
            style={bulkBtn("var(--color-danger)")}
          >
            [ОТКЛОНИТЬ]
          </button>
          <button
            type="button"
            onClick={() => bulkAction("spam")}
            disabled={isPending}
            style={bulkBtn("var(--color-danger)")}
          >
            [СПАМ]
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            style={bulkBtn("var(--color-muted)")}
          >
            снять
          </button>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button
          type="button"
          onClick={toggleAll}
          style={{
            background: "transparent",
            border: 0,
            color: "var(--color-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.16em",
            cursor: "pointer",
          }}
        >
          {selected.size === comments.length ? "СНЯТЬ ВСЕ" : "ВЫБРАТЬ ВСЕ"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {comments.map((c) => {
          const st = STATUS_LABEL[c.status];
          return (
            <div
              key={c.id}
              style={{
                display: "grid",
                gridTemplateColumns: "auto minmax(0, 1fr) auto",
                gap: 16,
                padding: 20,
                border: "1px solid var(--color-border-default)",
                borderRadius: 2,
                background: selected.has(c.id) ? "rgba(212,255,0,0.04)" : undefined,
              }}
            >
              <input
                type="checkbox"
                checked={selected.has(c.id)}
                onChange={() => toggle(c.id)}
                style={{ marginTop: 2 }}
              />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "baseline",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.1em",
                    color: "var(--color-muted)",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: "var(--color-text)", fontWeight: 700 }}>
                    {c.authorName}
                  </span>
                  {c.authorEmail && <span>· {c.authorEmail}</span>}
                  <span>· {dateFmt.format(new Date(c.createdAt))}</span>
                  {c.article && (
                    <>
                      <span>·</span>
                      <Link
                        href={`/blog/${c.article.slug}`}
                        target="_blank"
                        style={{ color: "var(--color-accent)" }}
                      >
                        → {c.article.title.slice(0, 50)}
                        {c.article.title.length > 50 ? "…" : ""}
                      </Link>
                    </>
                  )}
                  <span style={{ color: st?.color, marginLeft: "auto" }}>
                    {st?.label ?? c.status}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: "var(--color-text)",
                  }}
                  dangerouslySetInnerHTML={{ __html: c.content }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  minWidth: 120,
                }}
              >
                {c.status !== "approved" && (
                  <button
                    type="button"
                    onClick={() => singleAction(c.id, "approved")}
                    disabled={isPending}
                    style={actionBtn("var(--color-success)")}
                  >
                    ✓ ОДОБРИТЬ
                  </button>
                )}
                {c.status !== "rejected" && (
                  <button
                    type="button"
                    onClick={() => singleAction(c.id, "rejected")}
                    disabled={isPending}
                    style={actionBtn("var(--color-danger)")}
                  >
                    × ОТКЛОНИТЬ
                  </button>
                )}
                {c.status !== "spam" && (
                  <button
                    type="button"
                    onClick={() => singleAction(c.id, "spam")}
                    disabled={isPending}
                    style={actionBtn("var(--color-danger)")}
                  >
                    ⚠ СПАМ
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeOne(c.id)}
                  disabled={isPending}
                  style={{
                    ...actionBtn("var(--color-muted)"),
                    marginTop: 6,
                    borderColor: "var(--color-border-default)",
                  }}
                >
                  удалить
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function actionBtn(color: string): React.CSSProperties {
  return {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    letterSpacing: "0.14em",
    color,
    background: "transparent",
    border: `1px solid ${color}`,
    borderRadius: 2,
    padding: "6px 10px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}

function bulkBtn(color: string): React.CSSProperties {
  return {
    fontFamily: "var(--font-mono)",
    fontWeight: 700,
    fontSize: 10,
    letterSpacing: "0.14em",
    color,
    background: "transparent",
    border: `1px solid ${color}`,
    borderRadius: 2,
    padding: "8px 12px",
    cursor: "pointer",
  };
}
