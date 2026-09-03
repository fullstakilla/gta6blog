"use client";

import { useEffect, useState, useTransition } from "react";
import { toggleReaction, getMyReactions, getReactionCounts } from "@/app/(public)/blog/[slug]/actions";

const TYPES = [
  { key: "fire", label: "🔥" },
  { key: "love", label: "❤️" },
  { key: "laugh", label: "😂" },
  { key: "think", label: "🤔" },
  { key: "hundred", label: "💯" },
] as const;

type ReactionType = (typeof TYPES)[number]["key"];

interface Props {
  articleId: string;
  initialCounts: Record<ReactionType, number>;
}

export function ReactionBar({ articleId, initialCounts }: Props) {
  const [counts, setCounts] = useState(initialCounts);
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getMyReactions(articleId).then((types) => setMine(new Set(types)));
  }, [articleId]);

  function onClick(type: ReactionType) {
    // оптимистичный тоггл
    setMine((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
    setCounts((prev) => ({
      ...prev,
      [type]: prev[type] + (mine.has(type) ? -1 : 1),
    }));

    startTransition(async () => {
      const res = await toggleReaction({ articleId, reactionType: type });
      if (res.ok) {
        setCounts(res.counts);
      } else {
        // откат при ошибке
        setMine((prev) => {
          const next = new Set(prev);
          if (next.has(type)) next.delete(type);
          else next.add(type);
          return next;
        });
      }
    });
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        padding: "24px 0",
        borderTop: "1px solid var(--color-border-subtle)",
        borderBottom: "1px solid var(--color-border-subtle)",
        marginTop: 40,
      }}
    >
      {TYPES.map((t) => {
        const active = mine.has(t.key);
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onClick(t.key)}
            disabled={isPending}
            aria-pressed={active}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              background: active ? "rgba(212,255,0,0.08)" : "transparent",
              border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border-default)"}`,
              borderRadius: 2,
              color: active ? "var(--color-accent)" : "var(--color-text)",
              cursor: isPending ? "wait" : "pointer",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              transition: "all 160ms ease-out",
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{t.label}</span>
            <span style={{ fontSize: 11, letterSpacing: "0.1em", minWidth: 20 }}>
              {counts[t.key] > 0 ? counts[t.key] : ""}
            </span>
          </button>
        );
      })}
    </div>
  );
}
