"use client";

import { useState, useTransition } from "react";
import { subscribeEmail } from "@/app/(public)/actions";
import { LS_KEYS } from "@/lib/constants";

interface ExitIntentProps {
  onClose: () => void;
}

export function ExitIntent({ onClose }: ExitIntentProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  async function onSubmit(fd: FormData) {
    startTransition(async () => {
      const res = await subscribeEmail({ email: String(fd.get("email") ?? "") });
      if (res.ok) {
        setStatus("success");
        try {
          localStorage.setItem(LS_KEYS.subscribed, "1");
        } catch {}
        setTimeout(onClose, 1500);
      } else {
        setStatus("error");
      }
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--color-surface)",
          border: "1px solid var(--color-accent)",
          borderRadius: 2,
          padding: 32,
          animation: "modalIn 250ms ease-out",
          position: "relative",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "transparent",
            border: 0,
            color: "var(--color-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: 15,
            cursor: "pointer",
          }}
          aria-label="Закрыть"
        >
          ×
        </button>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.25em",
            color: "var(--color-accent)",
          }}
        >
{"// "}ПОДОЖДИ
        </div>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 32,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            margin: "20px 0 0",
          }}
        >
Не уходи с пустыми руками
        </h3>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 15,
            lineHeight: 1.6,
            color: "var(--color-muted)",
            margin: "16px 0 26px",
          }}
        >
Подпишись на еженедельную рассылку. Только важное. Отписаться можно в любой момент.
        </p>
        <form action={onSubmit} style={{ display: "flex", gap: 8 }}>
          <input
            name="email"
            type="email"
            required
            placeholder="your@email.com"
            style={{
              flex: 1,
              minWidth: 0,
              background: "var(--color-bg)",
              border: "1px solid var(--color-border-default)",
              borderRadius: 2,
              color: "var(--color-text)",
              fontSize: 13,
              padding: 14,
              letterSpacing: "0.08em",
            }}
          />
          <button
            type="submit"
            disabled={isPending}
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: "0.15em",
              background: "var(--color-accent)",
              color: "var(--color-bg)",
              border: 0,
              borderRadius: 2,
              padding: "14px 18px",
              cursor: isPending ? "wait" : "pointer",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            {isPending ? "…" : "[ОК →]"}
          </button>
        </form>
        {status === "success" && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--color-success)",
              paddingTop: 12,
            }}
          >
            ✓ Готово. Ждём тебя в почте.
          </div>
        )}
        {status === "error" && (
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--color-danger)",
              paddingTop: 12,
            }}
          >
            Не удалось подписаться, попробуй позже.
          </div>
        )}
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "transparent",
            border: 0,
            color: "var(--color-muted)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.15em",
            cursor: "pointer",
            padding: "22px 0 0",
          }}
        >
→ НЕТ, СПАСИБО
        </button>
      </div>
    </div>
  );
}
