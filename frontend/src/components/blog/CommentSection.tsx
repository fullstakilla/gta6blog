"use client";

import { useState, useTransition } from "react";
import { createComment } from "@/app/(public)/blog/[slug]/actions";

interface CommentNode {
  id: string;
  authorName: string;
  content: string;
  createdAt: Date | string;
  replies: CommentNode[];
}

interface Props {
  articleId: string;
  comments: CommentNode[];
}

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function CommentSection({ articleId, comments: initialComments }: Props) {
  const [comments] = useState(initialComments);
  const [replyTo, setReplyTo] = useState<{
    id: string;
    author: string;
  } | null>(null);

  return (
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
        {"// "}КОММЕНТАРИИ · {comments.length}
      </div>

      <CommentForm
        articleId={articleId}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />

      <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 4 }}>
        {comments.length === 0 ? (
          <div
            style={{
              padding: "40px 0",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--color-muted)",
            }}
          >
            Пока нет комментариев. Будь первым.
          </div>
        ) : (
          comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              depth={0}
              onReply={(id, author) => setReplyTo({ id, author })}
            />
          ))
        )}
      </div>
    </section>
  );
}

function CommentItem({
  comment,
  depth,
  onReply,
}: {
  comment: CommentNode;
  depth: number;
  onReply: (id: string, author: string) => void;
}) {
  const maxDepth = 2; // 3 уровня: 0,1,2
  return (
    <div
      style={{
        borderTop: depth === 0 ? "1px solid var(--color-border-subtle)" : undefined,
        paddingTop: depth === 0 ? 20 : 12,
        paddingBottom: 12,
        marginLeft: depth > 0 ? 24 : 0,
        borderLeft: depth > 0 ? "1px solid var(--color-border-subtle)" : undefined,
        paddingLeft: depth > 0 ? 16 : 0,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "baseline",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.1em",
          color: "var(--color-muted)",
        }}
      >
        <span style={{ color: "var(--color-text)", fontWeight: 700 }}>{comment.authorName}</span>
        <span>·</span>
        <span>{dateFmt.format(new Date(comment.createdAt))}</span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 15,
          lineHeight: 1.55,
          color: "var(--color-text)",
          marginTop: 8,
        }}
        dangerouslySetInnerHTML={{ __html: comment.content }}
      />
      {depth < maxDepth && (
        <button
          type="button"
          onClick={() => onReply(comment.id, comment.authorName)}
          style={{
            marginTop: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "var(--color-muted)",
            background: "transparent",
            border: 0,
            padding: 0,
            cursor: "pointer",
          }}
        >
          → ОТВЕТИТЬ
        </button>
      )}
      {comment.replies.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {comment.replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentForm({
  articleId,
  replyTo,
  onCancelReply,
}: {
  articleId: string;
  replyTo: { id: string; author: string } | null;
  onCancelReply: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(fd: FormData) {
    setError(null);
    setSuccess(false);
    const input = {
      articleId,
      authorName: String(fd.get("authorName") ?? ""),
      authorEmail: String(fd.get("authorEmail") ?? ""),
      content: String(fd.get("content") ?? ""),
      parentId: replyTo?.id,
    };
    startTransition(async () => {
      const res = await createComment(input);
      if (res.ok) {
        setSuccess(true);
        onCancelReply();
        (document.getElementById("comment-form") as HTMLFormElement | null)?.reset();
      } else {
        setError(res.message ?? "Не удалось отправить");
      }
    });
  }

  return (
    <form
      id="comment-form"
      action={onSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 20,
        border: "1px solid var(--color-border-default)",
        borderRadius: 2,
      }}
    >
      {replyTo && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            color: "var(--color-accent)",
          }}
        >
          <span>→ ОТВЕТ ДЛЯ {replyTo.author.toUpperCase()}</span>
          <button
            type="button"
            onClick={onCancelReply}
            style={{
              background: "transparent",
              border: 0,
              color: "var(--color-muted)",
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: 14,
              padding: 0,
            }}
            aria-label="Отменить ответ"
          >
            ×
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <input
          name="authorName"
          type="text"
          required
          maxLength={40}
          placeholder="Имя *"
          style={inputStyle}
        />
        <input
          name="authorEmail"
          type="email"
          placeholder="Email (не публикуется)"
          style={inputStyle}
        />
      </div>
      <textarea
        name="content"
        required
        rows={4}
        maxLength={2000}
        placeholder="Ваш комментарий..."
        style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-body)" }}
      />

      {error && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            color: "var(--color-danger)",
          }}
        >
          {error}
        </div>
      )}
      {success && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            color: "var(--color-success)",
          }}
        >
          ✓ Отправлено. Появится после проверки модератора.
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "var(--color-muted)",
          }}
        >
          комментарии модерируются
        </span>
        <button
          type="submit"
          disabled={isPending}
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.15em",
            background: "var(--color-accent)",
            color: "var(--color-bg)",
            border: "1px solid var(--color-accent)",
            borderRadius: 2,
            padding: "12px 22px",
            cursor: isPending ? "wait" : "pointer",
            opacity: isPending ? 0.5 : 1,
          }}
        >
          {isPending ? "…" : "[ОТПРАВИТЬ →]"}
        </button>
      </div>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--color-bg)",
  border: "1px solid var(--color-border-default)",
  borderRadius: 2,
  color: "var(--color-text)",
  fontFamily: "var(--font-mono)",
  fontSize: 13,
  padding: "12px 14px",
  width: "100%",
};
