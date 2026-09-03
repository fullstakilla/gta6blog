import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 · Страница не найдена",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        color: "var(--color-text)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 640, textAlign: "left" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.25em",
            color: "var(--color-accent)",
            marginBottom: 12,
          }}
        >
          {"// "}404 · СТРАНИЦА НЕ НАЙДЕНА
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(80px, 14vw, 200px)",
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            margin: 0,
            color: "var(--color-elevated)",
          }}
        >
          404
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 18,
            lineHeight: 1.5,
            color: "var(--color-muted)",
            maxWidth: "42ch",
            marginTop: 32,
          }}
        >
          Тут ничего нет. Возможно, статью удалили, ссылка устарела или в URL
          опечатка.
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 40,
          }}
        >
          <Link
            href="/"
            className="cta-primary"
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.15em",
              background: "var(--color-accent)",
              color: "var(--color-bg)",
              padding: "14px 26px",
              borderRadius: 2,
              border: "1px solid var(--color-accent)",
            }}
          >
            → НА ГЛАВНУЮ
          </Link>
          <Link
            href="/blog"
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
            ВСЕ СТАТЬИ
          </Link>
        </div>
      </div>
    </div>
  );
}
