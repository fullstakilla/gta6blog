import "server-only";
import { getIpHash } from "./request";

/**
 * Простой in-memory token-bucket rate-limiter.
 * Достаточен для single-instance self-host. Для multi-instance деплоя
 * заменить на @upstash/ratelimit + Redis (см. ADR-007 в decisions).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// периодическая уборка чтобы Map не разрастался
if (typeof globalThis !== "undefined" && !(globalThis as { __rlCleanupStarted?: boolean }).__rlCleanupStarted) {
  (globalThis as { __rlCleanupStarted?: boolean }).__rlCleanupStarted = true;
  setInterval(() => {
    const now = Date.now();
    for (const [k, b] of buckets) if (b.resetAt < now) buckets.delete(k);
  }, 60_000).unref?.();
}

export interface RateLimitOptions {
  /** Название бакета — обычно тип действия (comment, reaction, subscribe) */
  bucket: string;
  /** Максимум операций в окне */
  max: number;
  /** Окно в секундах */
  windowSec: number;
  /** Кастомный ключ вместо IP-хэша */
  key?: string;
}

export class RateLimitError extends Error {
  code = "RATE_LIMITED" as const;
  retryAfterSec: number;
  constructor(retryAfterSec: number) {
    super(`Слишком много запросов. Подожди ${retryAfterSec} сек.`);
    this.retryAfterSec = retryAfterSec;
  }
}

/**
 * Проверяет лимит по ключу (по умолчанию IP-хэш) и, если превышен, бросает
 * RateLimitError. Иначе — увеличивает счётчик.
 */
export async function rateLimit(opts: RateLimitOptions): Promise<void> {
  const key = opts.key ?? (await getIpHash());
  const bucketKey = `${opts.bucket}:${key}`;
  const now = Date.now();
  const existing = buckets.get(bucketKey);

  if (!existing || existing.resetAt < now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + opts.windowSec * 1000 });
    return;
  }

  if (existing.count >= opts.max) {
    throw new RateLimitError(Math.ceil((existing.resetAt - now) / 1000));
  }

  existing.count += 1;
}
