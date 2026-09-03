import "server-only";
import { headers } from "next/headers";
import { createHash } from "node:crypto";

/**
 * Возвращает IP клиента из заголовков (X-Forwarded-For приоритетно).
 * В dev — обычно локальный.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip") ?? "0.0.0.0";
}

/**
 * SHA-256 хэш IP + соль. Используется как обезличенный идентификатор
 * для антиспама, rate-limit, дедупа реакций/просмотров.
 * Соль обязательна (152-ФЗ, GDPR — иначе можно восстановить исходный IP).
 */
export async function getIpHash(): Promise<string> {
  const ip = await getClientIp();
  const salt = process.env.IP_HASH_SALT ?? "";
  if (!salt) {
    throw new Error("IP_HASH_SALT env is required for privacy");
  }
  return createHash("sha256").update(`${ip}${salt}`).digest("hex");
}

/**
 * Fingerprint для дедупа реакций/лайков без cookies.
 * Комбинирует IP-хэш + первые байты User-Agent — грубо, но достаточно
 * для MVP анонимных реакций.
 */
export async function getFingerprint(): Promise<string> {
  const h = await headers();
  const ipHash = await getIpHash();
  const ua = (h.get("user-agent") ?? "").slice(0, 200);
  return createHash("sha256").update(`${ipHash}${ua}`).digest("hex");
}
