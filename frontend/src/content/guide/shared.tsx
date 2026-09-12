import type { CSSProperties, ReactNode } from "react";

export const P: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 17,
  lineHeight: 1.65,
  color: "var(--color-text)",
  margin: "0 0 20px",
};

export const H2: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: 28,
  letterSpacing: "-0.02em",
  margin: "48px 0 16px",
};

export const H3: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 500,
  fontSize: 22,
  letterSpacing: "-0.015em",
  margin: "32px 0 12px",
};

export const UL: CSSProperties = {
  paddingLeft: 20,
  margin: "0 0 24px",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: 17,
  lineHeight: 1.65,
};

export const LI: CSSProperties = {
  marginBottom: 8,
};

export function Callout({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warn" }) {
  const border = tone === "warn" ? "var(--color-danger)" : "var(--color-accent)";
  return (
    <div
      style={{
        borderLeft: `2px solid ${border}`,
        padding: "12px 0 12px 20px",
        margin: "24px 0",
        color: "var(--color-muted)",
        fontFamily: "var(--font-body)",
        fontSize: 15,
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  );
}

export function Meta({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 32,
        flexWrap: "wrap",
        margin: "24px 0 40px",
        paddingBottom: 24,
        borderBottom: "1px solid var(--color-border-subtle)",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.14em",
        color: "var(--color-muted)",
      }}
    >
      {children}
    </div>
  );
}

export function MetaItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span style={{ color: "var(--color-accent)" }}>{label} · </span>
      <span style={{ color: "var(--color-text)" }}>{value}</span>
    </div>
  );
}
