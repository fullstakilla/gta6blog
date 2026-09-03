"use client";

import { useEffect, useState } from "react";

interface Tile {
  id: string;
  caption: string;
  colSpan: number;
  rowSpan: number;
  imageUrl?: string | null;
}

export function GalleryClient({ items }: { items: Tile[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
      if (e.key === "ArrowRight") setOpenIndex((i) => (i === null ? null : (i + 1) % items.length));
      if (e.key === "ArrowLeft") setOpenIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, items.length]);

  const current = openIndex !== null ? items[openIndex] : null;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0,1fr))",
          gridAutoRows: "140px",
          gap: 16,
        }}
        className="gallery-grid"
      >
        {items.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="gallery-tile-btn"
            style={{
              gridColumn: `span ${t.colSpan}`,
              gridRow: `span ${t.rowSpan}`,
              display: "flex",
              flexDirection: "column",
              padding: 0,
              background: "transparent",
              border: 0,
              cursor: "pointer",
              textAlign: "left",
              color: "var(--color-text)",
            }}
          >
            <div
              className="gallery-tile-image"
              style={{
                flex: 1,
                border: "1px solid var(--color-border-default)",
                borderRadius: 2,
                background: t.imageUrl
                  ? `center / cover no-repeat url("${t.imageUrl}")`
                  : "var(--color-surface)",
                backgroundImage: t.imageUrl
                  ? undefined
                  : "repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 7px)",
                transition:
                  "transform 200ms ease-out, border-color 200ms ease-out",
              }}
            />
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.16em",
                color: "var(--color-muted)",
                paddingTop: 8,
              }}
            >
              {t.caption}
            </div>
          </button>
        ))}
      </div>

      {current && (
        <div
          onClick={() => setOpenIndex(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            cursor: "zoom-out",
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex(null);
            }}
            aria-label="Закрыть"
            style={{
              position: "absolute",
              top: 20,
              right: 24,
              background: "transparent",
              border: 0,
              color: "var(--color-text)",
              fontFamily: "var(--font-mono)",
              fontSize: 24,
              cursor: "pointer",
            }}
          >
            ×
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length));
            }}
            aria-label="Предыдущая"
            style={arrowStyle("left")}
          >
            ‹
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "min(1400px, 92vw)",
              maxHeight: "82vh",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              cursor: "auto",
            }}
          >
            {current.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.imageUrl}
                alt={current.caption}
                style={{
                  maxWidth: "100%",
                  maxHeight: "72vh",
                  objectFit: "contain",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: 2,
                }}
              />
            ) : (
              <div
                style={{
                  width: "min(900px, 90vw)",
                  height: "min(600px, 65vh)",
                  border: "1px solid var(--color-border-default)",
                  borderRadius: 2,
                  background: "var(--color-surface)",
                  backgroundImage:
                    "repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 7px)",
                }}
              />
            )}
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.16em",
                color: "var(--color-muted)",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{current.caption}</span>
              <span>
                {(openIndex ?? 0) + 1} / {items.length}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex((i) => (i === null ? null : (i + 1) % items.length));
            }}
            aria-label="Следующая"
            style={arrowStyle("right")}
          >
            ›
          </button>
        </div>
      )}

      <style>{`
        .gallery-tile-btn:hover .gallery-tile-image { transform: scale(1.015); border-color: var(--color-accent) !important; }
        .gallery-tile-btn:hover { color: var(--color-accent) !important; }
        @media (max-width: 900px) {
          .gallery-grid { grid-template-columns: repeat(2, minmax(0,1fr)) !important; grid-auto-rows: 180px !important; }
          .gallery-grid > button { grid-column: span 1 !important; grid-row: span 1 !important; }
        }
      `}</style>
    </>
  );
}

function arrowStyle(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    [side]: 24,
    width: 44,
    height: 44,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid var(--color-border-default)",
    borderRadius: 2,
    color: "var(--color-text)",
    fontFamily: "var(--font-mono)",
    fontSize: 22,
    cursor: "pointer",
  };
}
