"use client";

import { CSSProperties } from "react";
import { RELEASE_DATE_SHORT } from "@/lib/constants";

interface CountdownProps {
  days: string;
  hrs: string;
  mins: string;
  secs: string;
  flip: { d: number; h: number; m: number; s: number };
}

function flipStyle(parity: number): CSSProperties {
  return {
    display: "inline-block",
    animation: `${parity ? "flipA" : "flipB"} 400ms ease-out`,
    transformOrigin: "50% 50%",
  };
}

export function Countdown({ days, hrs, mins, secs, flip }: CountdownProps) {
  return (
    <>
      <div style={{ height: 1, background: "var(--color-border-default)" }} />
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 44,
          padding: "26px 0 22px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: "clamp(56px, 8vw, 88px)",
              lineHeight: 0.82,
              color: "var(--color-accent)",
              display: "inline-block",
            }}
          >
            <span key={`d-${days}`} style={flipStyle(flip.d)}>{days}</span>
          </span>
          <span style={labelStyle}>ДНЕЙ</span>
        </div>
        <TimeUnit value={hrs} parity={flip.h} label="ЧАСОВ" />
        <TimeUnit value={mins} parity={flip.m} label="МИНУТ" />
        <TimeUnit value={secs} parity={flip.s} label="СЕКУНД" />
        <div style={{ flex: 1 }} />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.16em",
            color: "var(--color-muted)",
            paddingBottom: 8,
          }}
        >
РЕЛИЗ — {RELEASE_DATE_SHORT} · PS5 / XBOX
        </span>
      </div>
      <div style={{ height: 1, background: "var(--color-border-default)" }} />
    </>
  );
}

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: "0.2em",
  color: "var(--color-muted)",
  paddingBottom: 4,
};

function TimeUnit({
  value,
  parity,
  label,
}: {
  value: string;
  parity: number;
  label: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: 56,
          lineHeight: 0.82,
          display: "inline-block",
        }}
      >
        <span key={`${label}-${value}`} style={flipStyle(parity)}>{value}</span>
      </span>
      <span style={labelStyle}>{label}</span>
    </div>
  );
}
