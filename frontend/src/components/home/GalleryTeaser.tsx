import Link from "next/link";
import { listGalleryItems } from "@/lib/api";

const LAYOUTS = [
  { colSpan: 3, rowSpan: 2 },
  { colSpan: 3, rowSpan: 1 },
  { colSpan: 2, rowSpan: 1 },
  { colSpan: 1, rowSpan: 1 },
  { colSpan: 2, rowSpan: 2 },
  { colSpan: 4, rowSpan: 1 },
];

export async function GalleryTeaser() {
  const tiles = await listGalleryItems(6);
  if (tiles.length === 0) return null;

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
          → ВСЕ ИЗОБРАЖЕНИЯ
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
        {tiles.map((t, i) => {
          const layout = LAYOUTS[i % LAYOUTS.length];
          return (
            <figure
              key={t.id}
              style={{
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gridColumn: `span ${layout.colSpan}`,
                gridRow: `span ${layout.rowSpan}`,
              }}
            >
              <Link
                href="/gallery"
                className="gallery-tile"
                aria-label={t.caption ?? "gallery tile"}
                style={{
                  flex: 1,
                  border: "1px solid var(--color-border-default)",
                  borderRadius: 2,
                  background: `center / cover no-repeat url("${t.imageUrl}")`,
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
                {t.caption ?? ""}
              </figcaption>
            </figure>
          );
        })}
      </div>
      <style>{`
        .gallery-tile:hover { transform: scale(1.015); border-color: var(--color-accent) !important; }
      `}</style>
    </section>
  );
}
