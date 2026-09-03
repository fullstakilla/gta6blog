import Link from "next/link";
import { GALLERY_TILES } from "@/lib/mock-data";

export function GalleryTeaser() {
  const tiles = GALLERY_TILES.slice(0, 6);
  return (
    <section
      id="gallery"
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 24px 96px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 24,
          paddingBottom: 28,
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontStyle: "italic",
            fontSize: 32,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Галерея
        </h2>
        <Link
          href="/gallery"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.18em",
            color: "var(--color-muted)",
          }}
        >
          → ВСЕ 247 ИЗОБРАЖЕНИЙ
        </Link>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0,1fr))",
          gridAutoRows: "118px",
          gap: 16,
        }}
        className="gallery-teaser-grid"
      >
        {tiles.map((t, i) => (
          <figure
            key={i}
            style={{
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gridColumn: `span ${t.colSpan}`,
              gridRow: `span ${t.rowSpan}`,
            }}
          >
            <div
              className="gallery-tile"
              style={{
                flex: 1,
                border: "1px solid var(--color-border-default)",
                background: "var(--color-surface)",
                backgroundImage:
                  "repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 7px)",
                transition:
                  "transform 200ms ease-out, border-color 200ms ease-out",
              }}
            />
            <figcaption
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.16em",
                color: "var(--color-muted)",
                paddingTop: 8,
              }}
            >
              {t.caption}
            </figcaption>
          </figure>
        ))}
      </div>
      <style>{`
        .gallery-tile:hover { transform: scale(1.015); border-color: var(--color-accent) !important; }
      `}</style>
    </section>
  );
}
