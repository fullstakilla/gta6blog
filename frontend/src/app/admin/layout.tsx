import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { logout } from "./auth/actions";

export const metadata: Metadata = {
  title: "Админка · GTA6·БЛОГ",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const isLoggedIn = !!session.userId;

  if (!isLoggedIn) {
    return <>{children}</>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      <header
        style={{
          borderBottom: "1px solid var(--color-border-default)",
          background: "#050505",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 56,
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
        >
          <Link
            href="/admin"
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.2em",
            }}
          >
            GTA6_БЛОГ<span style={{ color: "var(--color-accent)" }}>_</span>
            <span
              style={{
                color: "var(--color-muted)",
                marginLeft: 12,
                fontSize: 10,
                letterSpacing: "0.25em",
              }}
            >
              АДМИНКА
            </span>
          </Link>
          <nav
            style={{
              display: "flex",
              gap: 20,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.16em",
              color: "var(--color-muted)",
            }}
          >
            <Link href="/admin">СТАТЬИ</Link>
            <Link href="/admin/comments">КОММЕНТЫ</Link>
            <Link href="/admin/gallery">ГАЛЕРЕЯ</Link>
            <Link href="/admin/subscribers">ПОДПИСЧИКИ</Link>
            <Link href="/" target="_blank">
              → САЙТ
            </Link>
          </nav>
          <div style={{ flex: 1 }} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--color-muted)",
            }}
          >
            {session.name}
          </span>
          <form action={logout}>
            <button
              type="submit"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.15em",
                background: "transparent",
                color: "var(--color-muted)",
                border: "1px solid var(--color-border-default)",
                borderRadius: 2,
                padding: "6px 12px",
                cursor: "pointer",
              }}
            >
              [ВЫЙТИ]
            </button>
          </form>
        </div>
      </header>
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        {children}
      </main>
    </div>
  );
}
