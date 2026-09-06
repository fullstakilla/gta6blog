import type { Metadata } from "next";
import { GalleryClient } from "@/components/gallery/GalleryClient";
import { listGalleryItems } from "@/lib/api";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Галерея",
  description:
    "Скриншоты, концепты и кадры трейлеров GTA VI. Всё, что мы собрали.",
  alternates: { canonical: "/gallery" },
};

// Простое авто-раскладывание: чередуем крупные и мелкие плитки для asymmetric-эффекта
const LAYOUTS = [
  { colSpan: 3, rowSpan: 2 },
  { colSpan: 3, rowSpan: 1 },
  { colSpan: 2, rowSpan: 1 },
  { colSpan: 1, rowSpan: 1 },
  { colSpan: 2, rowSpan: 2 },
  { colSpan: 4, rowSpan: 1 },
];

export default async function GalleryPage() {
  const rows = await listGalleryItems();
  const items = rows.map((r, i) => ({
    id: r.id,
    caption: r.caption ?? "",
    imageUrl: r.imageUrl,
    ...LAYOUTS[i % LAYOUTS.length],
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

      {items.length === 0 ? (
        <div
          style={{
            padding: "80px 20px",
            textAlign: "center",
            border: "1px dashed var(--color-border-default)",
            borderRadius: 2,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.14em",
            color: "var(--color-muted)",
          }}
        >
          Галерея пока пуста. Возвращайтесь позже —{" "}
          скоро появятся кадры трейлеров, концепты и скриншоты.
        </div>
      ) : (
        <GalleryClient items={items} />
      )}
    </section>
  );
}
