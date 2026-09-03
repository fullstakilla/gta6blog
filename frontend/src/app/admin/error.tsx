"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("admin error boundary:", error);
  }, [error]);

  return (
    <div
      style={{
        padding: 24,
        border: "1px solid var(--color-danger)",
        borderRadius: 2,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.25em",
          color: "var(--color-danger)",
          marginBottom: 12,
        }}
      >
        {"// "}ОШИБКА В АДМИНКЕ
      </div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 14, marginBottom: 16 }}>
        {error.message || "Что-то сломалось. Проверь консоль сервера."}
      </div>
      {error.digest && (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            color: "var(--color-muted)",
            marginBottom: 16,
          }}
        >
          КОД: {error.digest}
        </div>
      )}
      <button
        type="button"
        onClick={reset}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          letterSpacing: "0.15em",
          color: "var(--color-text)",
          background: "transparent",
          border: "1px solid var(--color-border-default)",
          borderRadius: 2,
          padding: "10px 18px",
          cursor: "pointer",
        }}
      >
        [ПОВТОРИТЬ]
      </button>
    </div>
  );
}
