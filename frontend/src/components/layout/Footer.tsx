import Link from "next/link";

export function Footer() {
  return (
    <footer
      id="footer"
      style={{
        borderTop: "1px solid var(--color-border-default)",
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(64px, 15.5vw, 190px)",
            lineHeight: 0.86,
            letterSpacing: "-0.04em",
            color: "var(--color-elevated)",
            padding: "48px 0 32px",
            whiteSpace: "nowrap",
          }}
        >
          GTA6·БЛОГ
        </div>
        <div style={{ height: 1, background: "var(--color-border-subtle)" }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 24,
            padding: "40px 0 48px",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            lineHeight: 2.2,
            letterSpacing: "0.12em",
            color: "var(--color-muted)",
          }}
        >
          <div>
            <div
              style={{
                color: "var(--color-text)",
                fontWeight: 700,
                letterSpacing: "0.2em",
              }}
            >
              GTA6_БЛОГ<span style={{ color: "var(--color-accent)" }}>_</span>
            </div>
            <div style={{ maxWidth: "24ch", lineHeight: 1.9, paddingTop: 8 }}>
              Независимый хаб новостей о GTA VI. Без хайпа.
            </div>
          </div>
          <FooterColumn
            title="НАВИГАЦИЯ"
            items={[
              { href: "/blog", label: "Блог" },
              { href: "/gallery", label: "Галерея" },
              { href: "/guide", label: "Всё что известно" },
              { href: "/about", label: "О проекте" },
            ]}
          />
          <FooterColumn
            title="КАТЕГОРИИ"
            items={[
              { href: "/blog?category=TRAILER", label: "Трейлеры" },
              { href: "/blog?category=LEAK", label: "Утечки" },
              { href: "/blog?category=MAP", label: "Карта" },
              { href: "/blog?category=CHARACTER", label: "Персонажи" },
            ]}
          />
          <FooterColumn
            title="ЛЕГАЛ"
            items={[
              { href: "/privacy", label: "Политика" },
              { href: "/cookies", label: "Cookies" },
              { href: "/about", label: "Контакты" },
            ]}
          />
        </div>
        <div style={{ height: 1, background: "var(--color-border-subtle)" }} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            padding: "24px 0",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.14em",
            color: "var(--color-muted)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span>© 2026 GTA6·БЛОГ</span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "var(--color-accent)",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--color-accent)",
                  animation: "pulseDot 1.6s ease-in-out infinite",
                }}
              />
247 сейчас онлайн
            </span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {["TG", "YT", "X"].map((s) => (
              <a
                key={s}
                href="#"
                style={{
                  width: 30,
                  height: 30,
                  border: "1px solid var(--color-border-default)",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: "var(--color-muted)",
                }}
              >
                {s}
              </a>
            ))}
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.16em",
            color: "var(--color-muted)",
            paddingBottom: 32,
          }}
        >
НЕОФИЦИАЛЬНЫЙ ФАН-САЙТ. GTA VI © ROCKSTAR GAMES & TAKE-TWO INTERACTIVE.
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { href: string; label: string }[];
}) {
  return (
    <div>
      <div style={{ color: "var(--color-text)" }}>{title}</div>
      {items.map((it) => (
        <Link
          key={it.label}
          href={it.href}
          style={{ display: "block", color: "var(--color-muted)" }}
        >
          {it.label}
        </Link>
      ))}
    </div>
  );
}
