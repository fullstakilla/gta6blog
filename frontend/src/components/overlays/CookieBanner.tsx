"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const LS_KEY = "gta6_cookieConsent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(LS_KEY)) setVisible(true);
    } catch {}
  }, []);

  function accept(mode: "all" | "essential") {
    try {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ mode, at: new Date().toISOString() }),
      );
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: 20,
        right: 20,
        bottom: 20,
        zIndex: 70,
        background: "var(--color-surface)",
        border: "1px solid var(--color-accent)",
        borderRadius: 2,
        padding: "20px 24px",
        display: "flex",
        gap: 24,
        alignItems: "center",
        flexWrap: "wrap",
        maxWidth: 1200,
        margin: "0 auto",
      }}
      role="dialog"
      aria-label="Cookie consent"
    >
      <div
        style={{
          flex: "1 1 320px",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          lineHeight: 1.55,
          color: "var(--color-text)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.25em",
            color: "var(--color-accent)",
            marginBottom: 8,
          }}
        >
          {"// "}COOKIES
        </div>
        Мы используем cookies для работы сайта и запоминания твоих
        предпочтений. Аналитики и трекеров нет. Подробнее —{" "}
        <Link
          href="/cookies"
          style={{
            color: "var(--color-accent)",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          политика cookies
        </Link>
        .
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          type="button"
          onClick={() => accept("essential")}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.15em",
            color: "var(--color-text)",
            background: "transparent",
            border: "1px solid var(--color-border-default)",
            borderRadius: 2,
            padding: "12px 18px",
            cursor: "pointer",
          }}
        >
          [ТОЛЬКО НУЖНЫЕ]
        </button>
        <button
          type="button"
          onClick={() => accept("all")}
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.15em",
            background: "var(--color-accent)",
            color: "var(--color-bg)",
            border: "1px solid var(--color-accent)",
            borderRadius: 2,
            padding: "12px 18px",
            cursor: "pointer",
          }}
        >
          [ПРИНЯТЬ]
        </button>
      </div>
    </div>
  );
}
