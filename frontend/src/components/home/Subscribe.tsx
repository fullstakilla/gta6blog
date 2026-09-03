"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { RELEASE_DATE } from "@/lib/constants";

export function Subscribe() {
  const { days: daysUntil } = useCountdown(RELEASE_DATE);
  return (
    <section
      id="subscribe"
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 24px 96px",
      }}
    >
      <div style={{ height: 2, background: "var(--color-accent)", width: "100%" }} />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 32,
          paddingTop: 44,
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: "1 1 min(100%, 560px)" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(34px, 4vw, 48px)",
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              margin: 0,
            }}
          >
Раз в неделю на почту
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 16,
              color: "var(--color-muted)",
              margin: "20px 0 32px",
            }}
          >
Только важное. Отписаться можно в любой момент.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              maxWidth: 520,
            }}
          >
            <input
              type="email"
              placeholder="your@email.com"
              style={{
                flex: 1,
                minWidth: 220,
                background: "var(--color-surface)",
                border: "1px solid var(--color-border-default)",
                borderRadius: 2,
                color: "var(--color-text)",
                fontSize: 13,
                letterSpacing: "0.08em",
                padding: "15px 16px",
              }}
            />
            <button
              type="submit"
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.15em",
                background: "var(--color-accent)",
                color: "var(--color-bg)",
                border: "1px solid var(--color-accent)",
                borderRadius: 2,
                padding: "15px 26px",
                cursor: "pointer",
              }}
            >
              [ПОДПИСАТЬСЯ →]
            </button>
          </form>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--color-accent)",
              paddingTop: 20,
            }}
          >
{"// "}12 847 подписчиков · {daysUntil} дней до релиза
          </div>
        </div>
        <div
          style={{
            flex: "0 1 300px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              border: "1px dashed var(--color-border-default)",
              width: 300,
              height: 250,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.3em",
              color: "var(--color-muted)",
            }}
          >
РЕКЛАМА · 300×250
          </div>
        </div>
      </div>
    </section>
  );
}
