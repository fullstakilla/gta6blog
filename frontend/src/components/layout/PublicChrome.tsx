"use client";

import { useState } from "react";
import { TopBar } from "./TopBar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Splash } from "@/components/overlays/Splash";
import { ExitIntent } from "@/components/overlays/ExitIntent";
import { CookieBanner } from "@/components/overlays/CookieBanner";
import { useCountdown } from "@/hooks/useCountdown";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useSplash } from "@/hooks/useSplash";
import { useExitIntent } from "@/hooks/useExitIntent";
import { RELEASE_DATE } from "@/lib/constants";

export function PublicChrome({ children }: { children: React.ReactNode }) {
  const timer = useCountdown(RELEASE_DATE);
  const splash = useSplash();
  const { progress, scrolled, pastMiniTimerThreshold } = useScrollProgress();
  const exit = useExitIntent();
  const [miniClosed, setMiniClosed] = useState(false);

  const accent = "var(--color-accent)";

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          zIndex: 60,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            height: 2,
            background: accent,
            width: `${(progress * 100).toFixed(2)}vw`,
            transition: "width 90ms linear",
          }}
        />
      </div>

      {splash.visible && <Splash lines={splash.lines} />}

      <TopBar />
      <Header scrolled={scrolled} />

      <main style={{ position: "relative", zIndex: 1 }}>{children}</main>

      <Footer />

      {pastMiniTimerThreshold && !miniClosed && (
        <div
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-default)",
            borderRadius: 2,
            padding: "11px 12px 11px 16px",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.12em",
          }}
        >
          <span style={{ color: "var(--color-accent)", fontWeight: 700 }}>
            {timer.days}д {timer.hrs}ч
          </span>
          <span style={{ color: "var(--color-muted)" }}>GTA VI</span>
          <button
            type="button"
            onClick={() => setMiniClosed(true)}
            aria-label="Закрыть таймер"
            style={{
              background: "transparent",
              border: 0,
              color: "var(--color-muted)",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              cursor: "pointer",
              padding: "0 2px",
            }}
          >
            ×
          </button>
        </div>
      )}

      {exit.open && <ExitIntent onClose={exit.close} />}

      <CookieBanner />

      <style>{`
        .cta-primary:hover {
          background: var(--color-accent-bright) !important;
          border-color: var(--color-accent-bright) !important;
          color: var(--color-bg) !important;
        }
        .cta-secondary:hover {
          border-color: var(--color-text) !important;
          color: var(--color-text) !important;
        }
      `}</style>
    </>
  );
}
