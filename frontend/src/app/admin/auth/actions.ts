"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginResult =
  | { ok: true }
  | { ok: false; code: "INVALID_INPUT" | "INVALID_CREDENTIALS" };

export async function login(formData: FormData): Promise<LoginResult> {
  const parsed = LoginInput.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, code: "INVALID_INPUT" };

  const user = await db.author.findUnique({
    where: { email: parsed.data.email },
  });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return { ok: false, code: "INVALID_CREDENTIALS" };
  }

  const session = await getSession();
  session.userId = user.id;
  session.role = user.role;
  session.name = user.name;
  await session.save();
  redirect("/admin");
}

export async function logout() {
  const s = await getSession();
  s.destroy();
  redirect("/admin/login");
}
