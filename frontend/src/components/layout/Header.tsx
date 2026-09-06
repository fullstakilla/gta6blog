"use client";

import Link from "next/link";

interface HeaderProps {
  scrolled: boolean;
}

export function Header({ scrolled }: HeaderProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: scrolled ? "rgba(13,13,13,0.85)" : "var(--color-bg)",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(10px)" : "none",
        transition: "background 200ms ease-out",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 32,
          justifyContent: 'space-between'
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: "0.2em",
              color: "var(--color-text)",
            }}
          >
            GTA6_БЛОГ<span style={{ color: "var(--color-accent)" }}>_</span>
          </span>
          <span
            className="public-header-subtitle"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              letterSpacing: "0.16em",
              color: "var(--color-muted)",
            }}
          >
            НЕЗАВИСИМЫЕ НОВОСТИ · УТЕЧКИ · РАЗБОРЫ
          </span>
        </Link>
        <nav
          className="public-header-nav"
          style={{
            display: "flex",
            gap: 22,
            marginLeft: 24,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            color: "var(--color-muted)",
          }}
        >
          <Link
            href="/blog"
            style={{
              color: "var(--color-text)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            БЛОГ
            <span
              style={{
                width: 5,
                height: 5,
                background: "var(--color-accent)",
                borderRadius: "50%",
                animation: "pulseDot 2.4s ease-in-out infinite",
              }}
            />
          </Link>
          <Link href="/gallery">ГАЛЕРЕЯ</Link>
          <Link href="/guide">ВСЁ ЧТО ИЗВЕСТНО</Link>
          <Link href="/about">О ПРОЕКТЕ</Link>
        </nav>
        <Link
          href="/#subscribe"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.15em",
            border: "1px solid var(--color-border-default)",
            padding: "8px 14px",
            borderRadius: 2,
          }}
        >
          [ПОДПИСАТЬСЯ]
        </Link>
      </div>
      <div style={{ height: 1, background: "var(--color-border-default)" }} />
    </header>
  );
}
