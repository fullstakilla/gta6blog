import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSession } from "@/lib/session";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json(
      { ok: false, code: "UNAUTHORIZED" },
      { status: 401 },
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, code: "NO_FILE" },
      { status: 400 },
    );
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { ok: false, code: "INVALID_TYPE", message: `Разрешены: ${[...ALLOWED_TYPES].join(", ")}` },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, code: "TOO_LARGE", message: "Максимум 8 MB" },
      { status: 400 },
    );
  }

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const ext = EXT_BY_TYPE[file.type];
  const filename = `${randomBytes(12).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", `${year}-${month}`);
  await mkdir(dir, { recursive: true });
  const abs = path.join(dir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(abs, bytes);

  const url = `/uploads/${year}-${month}/${filename}`;
  return NextResponse.json({ ok: true, url });
}
