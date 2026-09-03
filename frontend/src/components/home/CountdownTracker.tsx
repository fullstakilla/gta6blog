"use client";

import { Countdown } from "@/components/primitives/Countdown";
import { useCountdown } from "@/hooks/useCountdown";
import { RELEASE_DATE } from "@/lib/constants";

export function CountdownTracker() {
  const t = useCountdown(RELEASE_DATE);
  return (
    <section
      id="countdown"
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "88px 24px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 320px) minmax(0, 1fr)",
          gap: 48,
          alignItems: "start",
        }}
        className="tracker-grid"
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.25em",
              color: "var(--color-accent)",
            }}
          >
            {"// "}ОБРАТНЫЙ ОТСЧЁТ
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontStyle: "italic",
              fontSize: 32,
              letterSpacing: "-0.02em",
              margin: "16px 0 20px",
            }}
          >
Почему это важно
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              lineHeight: 1.6,
              color: "var(--color-muted)",
              margin: 0,
              maxWidth: "38ch",
            }}
          >
            Каждая секунда до 26 мая 2026 — это ещё один кадр из трейлера,
            ещё одна утечка, ещё один разбор. Мы следим за всеми.
          </p>
          <a
            href="#featured"
            style={{
              display: "inline-block",
              marginTop: 24,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.14em",
              color: "var(--color-muted)",
            }}
          >
            → ВСЁ ЧТО ИЗВЕСТНО О GTA VI
          </a>
        </div>
        <div>
          <Countdown
            days={t.days}
            hrs={t.hrs}
            mins={t.mins}
            secs={t.secs}
            flip={t.flip}
          />
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .tracker-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
