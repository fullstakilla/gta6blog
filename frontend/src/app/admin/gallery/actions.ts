"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

const SOURCES = ["trailer", "screenshot", "leak", "concept"] as const;

const GalleryInput = z.object({
  imageUrl: z
    .string()
    .refine(
      (v) => v.startsWith("/") || /^https?:\/\//.test(v),
      "Некорректный URL",
    ),
  caption: z.string().max(200).optional().nullable(),
  source: z.enum(SOURCES).default("screenshot"),
  sortOrder: z.number().int().default(0),
});

function fromForm(fd: FormData) {
  return {
    imageUrl: String(fd.get("imageUrl") ?? ""),
    caption: (fd.get("caption") as string) || null,
    source: (fd.get("source") as (typeof SOURCES)[number]) || "screenshot",
    sortOrder: Number(fd.get("sortOrder") ?? 0),
  };
}

export async function createGalleryItem(fd: FormData) {
  await requireAdmin();
  const parsed = GalleryInput.safeParse(fromForm(fd));
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const item = await db.galleryItem.create({ data: parsed.data });
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { ok: true as const, id: item.id };
}

export async function deleteGalleryItem(id: string) {
  await requireAdmin();
  await db.galleryItem.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { ok: true as const };
}

export async function updateGalleryOrder(items: { id: string; sortOrder: number }[]) {
  await requireAdmin();
  await db.$transaction(
    items.map((it) =>
      db.galleryItem.update({
        where: { id: it.id },
        data: { sortOrder: it.sortOrder },
      }),
    ),
  );
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  return { ok: true as const };
}
