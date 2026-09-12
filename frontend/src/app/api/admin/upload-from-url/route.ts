import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSession } from "@/lib/session";
import { s3, S3_BUCKET, publicUrlFor } from "@/lib/s3";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);
const MAX_BYTES = 8 * 1024 * 1024;

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

  let url: string;
  try {
    const body = (await req.json()) as { url?: unknown };
    if (typeof body.url !== "string") throw new Error();
    url = body.url.trim();
  } catch {
    return NextResponse.json({ ok: false, code: "BAD_BODY" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ ok: false, code: "BAD_URL" }, { status: 400 });
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.json({ ok: false, code: "BAD_PROTOCOL" }, { status: 400 });
  }

  const upstream = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "gta6blog-image-fetcher/1.0",
      Accept: "image/*",
    },
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { ok: false, code: "FETCH_FAILED", message: `Upstream ${upstream.status}` },
      { status: 400 },
    );
  }

  const contentType = (upstream.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_TYPE",
        message: `Разрешены: ${[...ALLOWED_TYPES].join(", ")} — получено ${contentType || "?"}`,
      },
      { status: 400 },
    );
  }

  const contentLength = Number(upstream.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, code: "TOO_LARGE", message: "Максимум 8 MB" },
      { status: 400 },
    );
  }

  const body = Buffer.from(await upstream.arrayBuffer());
  if (body.byteLength > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, code: "TOO_LARGE", message: "Максимум 8 MB" },
      { status: 400 },
    );
  }

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const ext = EXT_BY_TYPE[contentType];
  const key = `${year}-${month}/${randomBytes(12).toString("hex")}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return NextResponse.json({ ok: true, url: publicUrlFor(key) });
}
