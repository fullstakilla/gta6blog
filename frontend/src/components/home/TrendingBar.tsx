import Link from "next/link";
import { listTrending, type TrendingArticle } from "@/lib/api";

export async function TrendingBar() {
  let items: TrendingArticle[] = [];
  try {
    items = await listTrending(3);
  } catch {
    // fallback — молча пустой
  }

  if (items.length === 0) return null;

  const loop = [...items, ...items];
  return (
    <section
      style={{
        borderTop: "1px solid var(--color-border-default)",
        borderBottom: "1px solid var(--color-border-default)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          gap: 28,
          height: 46,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            flexShrink: 0,
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: "0.2em",
            color: "var(--color-accent)",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--color-accent)",
              animation: "pulseDot 1.6s ease-in-out infinite",
            }}
          />
          СЕЙЧАС ЧИТАЮТ
        </div>
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <div
            style={{
              display: "flex",
              width: "max-content",
              animation: "marquee 42s linear infinite",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.1em",
              color: "var(--color-muted)",
              whiteSpace: "nowrap",
            }}
          >
            {loop.map((it, i) => (
              <Link
                key={i}
                href={`/blog/${it.slug}`}
                style={{
                  paddingRight: 40,
                  color: "var(--color-muted)",
                }}
              >
                {it.title}
                <span style={{ color: "var(--color-accent)", marginLeft: 12 }}>
                  {it.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
