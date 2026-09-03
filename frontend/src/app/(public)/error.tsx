"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("public error boundary:", error);
  }, [error]);

  return (
    <section
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "80px 24px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.25em",
          color: "var(--color-danger)",
          marginBottom: 16,
        }}
      >
        {"// "}ОШИБКА
      </div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(40px, 6vw, 72px)",
          lineHeight: 1.02,
          letterSpacing: "-0.035em",
          margin: 0,
        }}
      >
        Что-то пошло не так
      </h1>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 17,
          lineHeight: 1.55,
          color: "var(--color-muted)",
          maxWidth: "48ch",
          marginTop: 24,
        }}
      >
        Мы уже знаем и починим. Попробуй перезагрузить страницу или вернуться
        на главную.
      </p>
      {error.digest && (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            color: "var(--color-muted)",
            marginTop: 12,
          }}
        >
          КОД: {error.digest}
        </p>
      )}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 32 }}>
        <button
          type="button"
          onClick={reset}
          className="cta-primary"
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.15em",
            background: "var(--color-accent)",
            color: "var(--color-bg)",
            border: "1px solid var(--color-accent)",
            borderRadius: 2,
            padding: "14px 26px",
            cursor: "pointer",
          }}
        >
          → ПОПРОБОВАТЬ СНОВА
        </button>
        <Link
          href="/"
          className="cta-secondary"
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.15em",
            color: "var(--color-text)",
            padding: "14px 26px",
            borderRadius: 2,
            border: "1px solid rgba(255,255,255,0.4)",
          }}
        >
          НА ГЛАВНУЮ
        </Link>
      </div>
    </section>
  );
}
