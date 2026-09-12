import type { ArticleTag } from "@/types/api";
import { CATEGORY_LABEL_UPPER } from "@/lib/i18n";

const PATTERNS: Record<ArticleTag, "trailer" | "leak" | "map" | "character" | "gameplay" | "rumor"> = {
  TRAILER: "trailer",
  LEAK: "leak",
  MAP: "map",
  CHARACTER: "character",
  GAMEPLAY: "gameplay",
  RUMOR: "rumor",
};

interface CategoryCoverProps {
  category: ArticleTag | string;
  title: string;
  variant?: "hero" | "card";
}

/**
 * SVG-обложка редакции. Рендерится когда у статьи нет coverImage.
 * Разные декоративные паттерны для каждой категории — единый стиль в дизайн-системе.
 */
export function CategoryCover({ category, title, variant = "card" }: CategoryCoverProps) {
  const pattern = PATTERNS[category as ArticleTag] ?? "gameplay";
  const label = CATEGORY_LABEL_UPPER[category as ArticleTag] ?? String(category);
  const short = title.length > 90 ? title.slice(0, 87).trim() + "…" : title;

  return (
    <svg
      viewBox="0 0 800 1000"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        background: "var(--color-elevated)",
      }}
    >
      <defs>
        <pattern id={`grid-${pattern}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="800" height="1000" fill="var(--color-elevated)" />
      <rect width="800" height="1000" fill={`url(#grid-${pattern})`} />

      {pattern === "trailer" && <TrailerPattern />}
      {pattern === "leak" && <LeakPattern />}
      {pattern === "map" && <MapPattern />}
      {pattern === "character" && <CharacterPattern />}
      {pattern === "gameplay" && <GameplayPattern />}
      {pattern === "rumor" && <RumorPattern />}

      <rect x="40" y="40" width="8" height="60" fill="var(--color-accent)" />
      <text
        x="60"
        y="88"
        fontFamily="var(--font-mono)"
        fontSize="24"
        letterSpacing="6"
        fill="var(--color-accent)"
      >
        {label}
      </text>

      <foreignObject x="40" y={variant === "hero" ? 780 : 700} width="720" height="220">
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: variant === "hero" ? "48px" : "42px",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            color: "var(--color-text)",
            wordBreak: "break-word",
          }}
        >
          {short}
        </div>
      </foreignObject>

      <text
        x="40"
        y="970"
        fontFamily="var(--font-mono)"
        fontSize="16"
        letterSpacing="4"
        fill="var(--color-muted)"
      >
        GTA6·БЛОГ
      </text>
    </svg>
  );
}

function TrailerPattern() {
  const strips = Array.from({ length: 8 }, (_, i) => 200 + i * 60);
  return (
    <>
      {strips.map((y, i) => (
        <rect
          key={y}
          x="80"
          y={y}
          width="640"
          height="4"
          fill="var(--color-muted)"
          opacity={0.15 + (i % 3) * 0.15}
        />
      ))}
      <text
        x="640"
        y="360"
        fontFamily="var(--font-mono)"
        fontSize="260"
        fontWeight="700"
        fill="var(--color-accent)"
        opacity="0.25"
        textAnchor="end"
      >
        02
      </text>
    </>
  );
}

function LeakPattern() {
  return (
    <>
      <rect x="60" y="220" width="680" height="14" fill="var(--color-accent)" opacity="0.9" />
      <rect x="80" y="242" width="640" height="6" fill="var(--color-accent)" opacity="0.4" />
      <rect x="140" y="260" width="500" height="10" fill="var(--color-accent)" opacity="0.7" />
      <rect x="60" y="290" width="200" height="4" fill="var(--color-muted)" opacity="0.5" />
      <rect x="300" y="290" width="440" height="4" fill="var(--color-muted)" opacity="0.5" />
      <g transform="translate(60,340)">
        {Array.from({ length: 16 }).map((_, i) => (
          <rect
            key={i}
            x={i * 44}
            y="0"
            width="40"
            height="200"
            fill="var(--color-bg)"
            opacity={0.3 + (i % 4) * 0.15}
          />
        ))}
      </g>
      <text
        x="60"
        y="680"
        fontFamily="var(--font-mono)"
        fontSize="42"
        fill="var(--color-muted)"
        opacity="0.5"
        letterSpacing="4"
      >
        ▓▓▓░░░ CLASSIFIED ░░░▓▓▓
      </text>
    </>
  );
}

function MapPattern() {
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={80 + i * 55}
          y1="200"
          x2={80 + i * 55}
          y2="700"
          stroke="var(--color-muted)"
          strokeWidth="1"
          opacity="0.25"
          strokeDasharray="4 6"
        />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1="80"
          y1={200 + i * 55}
          x2="740"
          y2={200 + i * 55}
          stroke="var(--color-muted)"
          strokeWidth="1"
          opacity="0.25"
          strokeDasharray="4 6"
        />
      ))}
      <g transform="translate(400,470)">
        <circle r="80" fill="none" stroke="var(--color-accent)" strokeWidth="2" opacity="0.8" />
        <circle r="14" fill="var(--color-accent)" />
        <line x1="-110" y1="0" x2="110" y2="0" stroke="var(--color-accent)" strokeWidth="1.5" opacity="0.8" />
        <line x1="0" y1="-110" x2="0" y2="110" stroke="var(--color-accent)" strokeWidth="1.5" opacity="0.8" />
      </g>
      <text
        x="400"
        y="600"
        fontFamily="var(--font-mono)"
        fontSize="18"
        fill="var(--color-accent)"
        opacity="0.9"
        textAnchor="middle"
        letterSpacing="4"
      >
        LEONIDA · 25.7°N 80.2°W
      </text>
    </>
  );
}

function CharacterPattern() {
  return (
    <>
      <g transform="translate(400,440)">
        <ellipse cx="0" cy="-80" rx="70" ry="90" fill="none" stroke="var(--color-accent)" strokeWidth="3" />
        <path
          d="M -140 200 C -140 60, -80 20, 0 20 C 80 20, 140 60, 140 200 Z"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="3"
        />
        <line x1="-140" y1="200" x2="140" y2="200" stroke="var(--color-accent)" strokeWidth="3" />
      </g>
      <g transform="translate(400,440)" opacity="0.4">
        <ellipse cx="0" cy="-80" rx="70" ry="90" fill="var(--color-accent)" />
      </g>
      <text
        x="400"
        y="720"
        fontFamily="var(--font-mono)"
        fontSize="16"
        fill="var(--color-muted)"
        opacity="0.7"
        textAnchor="middle"
        letterSpacing="4"
      >
        SUBJECT · PROFILE
      </text>
    </>
  );
}

function GameplayPattern() {
  return (
    <>
      <rect x="60" y="220" width="680" height="380" fill="none" stroke="var(--color-muted)" strokeWidth="2" opacity="0.5" />
      <rect x="80" y="240" width="180" height="26" fill="var(--color-accent)" opacity="0.9" />
      <rect x="80" y="270" width="140" height="6" fill="var(--color-muted)" opacity="0.6" />
      <rect x="80" y="284" width="90" height="6" fill="var(--color-muted)" opacity="0.6" />
      <g transform="translate(80,400)">
        {[220, 180, 260, 140, 200].map((h, i) => (
          <rect
            key={i}
            x={i * 60}
            y={-h + 200}
            width="30"
            height={h}
            fill="var(--color-accent)"
            opacity={0.6 + (i % 2) * 0.3}
          />
        ))}
      </g>
      <g transform="translate(540,400)">
        <circle r="60" fill="none" stroke="var(--color-accent)" strokeWidth="4" />
        <circle r="60" fill="none" stroke="var(--color-accent)" strokeWidth="4" strokeDasharray="120 250" strokeDashoffset="0" transform="rotate(-90)" />
        <text
          y="12"
          fontFamily="var(--font-mono)"
          fontSize="34"
          fontWeight="700"
          fill="var(--color-accent)"
          textAnchor="middle"
        >
          61%
        </text>
      </g>
    </>
  );
}

function RumorPattern() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <text
          key={i}
          x={100 + (i % 3) * 240}
          y={280 + Math.floor(i / 3) * 240}
          fontFamily="var(--font-display)"
          fontSize="220"
          fontWeight="700"
          fill="var(--color-accent)"
          opacity={0.08 + (i % 2) * 0.06}
        >
          ?
        </text>
      ))}
      <text
        x="400"
        y="680"
        fontFamily="var(--font-mono)"
        fontSize="16"
        fill="var(--color-muted)"
        opacity="0.7"
        textAnchor="middle"
        letterSpacing="4"
      >
        UNCONFIRMED · PROCEED WITH DOUBT
      </text>
    </>
  );
}
