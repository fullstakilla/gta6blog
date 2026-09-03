import { db } from "@/lib/db";
import { GalleryAdminClient } from "@/components/admin/GalleryAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const items = await db.galleryItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      imageUrl: true,
      caption: true,
      source: true,
      sortOrder: true,
    },
  });

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.25em",
            color: "var(--color-accent)",
          }}
        >
          {"// "}ГАЛЕРЕЯ · {items.length} ЭЛЕМЕНТОВ
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 36,
            letterSpacing: "-0.02em",
            margin: "12px 0 0",
          }}
        >
          Галерея
        </h1>
      </div>

      <GalleryAdminClient items={items} />
    </>
  );
}
