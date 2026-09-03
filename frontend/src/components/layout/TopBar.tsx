"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { RELEASE_DATE } from "@/lib/constants";

export function TopBar() {
  const t = useCountdown(RELEASE_DATE);
  return (
    <div
      style={{
        position: "relative",
        zIndex: 41,
        borderBottom: "1px solid var(--color-border-subtle)",
        background: "#050505",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.2em",
          color: "var(--color-muted)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "var(--color-accent)" }}>{"//"}</span>
          <span>
            <span style={{ color: "var(--color-text)" }}>
              {t.days}д {t.hrs}ч
            </span>{" "}
            ДО РЕЛИЗА
          </span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>26.05.2026</span>
        </div>
        <a
          href="#countdown"
          className="public-topbar-cta"
          style={{ color: "var(--color-muted)" }}
        >
          [ПОЧЕМУ ЭТО ВАЖНО →]
        </a>
      </div>
    </div>
  );
}
