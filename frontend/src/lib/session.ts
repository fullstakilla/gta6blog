import "server-only";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface Session {
  userId?: string;
  role?: "author" | "editor" | "admin";
  name?: string;
}

const cookieName = "gta6_session";

export async function getSession() {
  return getIronSession<Session>(await cookies(), {
    password: process.env.IRON_SESSION_SECRET!,
    cookieName,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    },
  });
}

export async function requireAdmin() {
  const s = await getSession();
  if (!s.userId) throw new Error("UNAUTHORIZED");
  return s;
}
