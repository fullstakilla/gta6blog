import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

/**
 * S3-совместимый клиент. Используется для upload и delete картинок.
 * В проде — MinIO на VPS (gta6media.duckdns.org).
 * В dev можно поставить локальный MinIO через docker compose или использовать
 * прод-бакет (аккуратно).
 */
export const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT!,
  region: process.env.S3_REGION ?? "us-east-1",
  forcePathStyle: true, // MinIO требует path-style, а не virtual-hosted
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

export const S3_BUCKET = process.env.S3_BUCKET!;
export const S3_PUBLIC_BASE =
  process.env.S3_PUBLIC_BASE ?? `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}`;

/**
 * Возвращает публичный URL для объекта в бакете. Бакет должен быть с
 * anonymous download-политикой (`mc anonymous set download`).
 */
export function publicUrlFor(key: string): string {
  return `${S3_PUBLIC_BASE}/${key}`;
}
