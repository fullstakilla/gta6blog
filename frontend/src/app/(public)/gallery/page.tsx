import type { Metadata } from "next";
import { GalleryClient } from "@/components/gallery/GalleryClient";
import { GALLERY_TILES } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Галерея",
  description:
    "Скриншоты, концепты и кадры трейлеров GTA VI. Всё, что мы собрали.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  // Пока моки — таблица gallery_items и админ добавятся в Фазе 4
  const items = GALLERY_TILES.map((t, i) => ({
    id: String(i),
    caption: t.caption,
    colSpan: t.colSpan,
    rowSpan: t.rowSpan,
  }));

  return (
    <section
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "56px 24px 96px",
      }}
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
          {"// "}ГАЛЕРЕЯ · {String(items.length).padStart(3, "0")} ИЗОБРАЖЕНИЙ
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(40px, 5.4vw, 64px)",
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            margin: "16px 0 40px",
          }}
        >
          Галерея
        </h1>
      </div>

      <GalleryClient items={items} />
    </section>
  );
}
