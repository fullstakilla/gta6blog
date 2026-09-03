"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, RateLimitError } from "@/lib/rate-limit";
import { getIpHash } from "@/lib/request";

const SubscribeInput = z.object({
  email: z.string().email().max(254),
});

export type SubscribeResult =
  | { ok: true; alreadySubscribed: boolean }
  | { ok: false; code: "INVALID_INPUT" | "RATE_LIMITED"; message?: string };

export async function subscribeEmail(input: unknown): Promise<SubscribeResult> {
  const parsed = SubscribeInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: "INVALID_INPUT" };
  }
  const email = parsed.data.email.trim().toLowerCase();

  try {
    await rateLimit({ bucket: "subscribe", max: 5, windowSec: 3600 });
  } catch (e) {
    if (e instanceof RateLimitError) {
      return { ok: false, code: "RATE_LIMITED", message: e.message };
    }
    throw e;
  }

  const ipHash = await getIpHash();

  const existing = await db.subscriber.findUnique({ where: { email } });
  if (existing) {
    return { ok: true, alreadySubscribed: true };
  }

  await db.subscriber.create({
    data: {
      email,
      confirmed: true, // MVP: без double opt-in, добавим в P1
      ipHash,
    },
  });
  return { ok: true, alreadySubscribed: false };
}
