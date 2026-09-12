"use client";

import Image from "next/image";
import { CATEGORY_LABEL_UPPER } from "@/lib/i18n";
import { CategoryCover } from "@/components/seo/CategoryCover";
import type { ArticleTag } from "@/types/api";

export interface EditorialHeroProps {
  hero: {
    slug: string;
    title: string;
    excerpt: string | null;
    coverImage: string | null;
    coverCaption: string | null;
    category: string;
    publishedAt: Date | string | null;
    readingMinutes: number;
  } | null;
}

const DEFAULT_EXCERPT =
  "Читай главную новость дня о GTA VI. Утечки, разборы, теории — без хайпа и кликбейта.";

export function EditorialHero({ hero }: EditorialHeroProps) {
  if (!hero) {
    return (
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 40px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.25em",
            color: "var(--color-muted)",
          }}
        >
          {"// "}ГОТОВИМ ПЕРВЫЕ МАТЕРИАЛЫ — ЗАГЛЯНИ ПОЗЖЕ
        </div>
      </section>
    );
  }

  const dateStr = hero.publishedAt
    ? new Intl.DateTimeFormat("ru-RU", { dateStyle: "short" }).format(
        new Date(hero.publishedAt),
      )
    : "";
  const excerpt = hero.excerpt ?? DEFAULT_EXCERPT;
  const categoryLabel = CATEGORY_LABEL_UPPER[hero.category as ArticleTag] ?? hero.category;

  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 40px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 480px)",
          gap: 40,
          alignItems: "stretch",
        }}
        className="editorial-hero-grid"
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 420 }}>
          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.2em",
            }}
          >
            <span style={{ color: "var(--color-accent)" }}>{categoryLabel}</span>
            {dateStr && (
              <>
                <span style={{ color: "var(--color-muted)" }}>·</span>
                <span style={{ color: "var(--color-muted)" }}>{dateStr}</span>
              </>
            )}
            <span style={{ color: "var(--color-muted)" }}>·</span>
            <span style={{ color: "var(--color-muted)" }}>{hero.readingMinutes} МИН ЧТЕНИЯ</span>
          </div>
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(44px, 6.4vw, 88px)",
                lineHeight: 0.98,
                letterSpacing: "-0.035em",
                margin: "24px 0 0",
                maxWidth: "18ch",
              }}
            >
              {hero.title}
            </h1>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 17,
                lineHeight: 1.55,
                color: "var(--color-muted)",
                maxWidth: "48ch",
                margin: "24px 0 0",
                textWrap: "pretty",
              }}
            >
              {excerpt}
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 32 }}>
            <a
              href={`/blog/${hero.slug}`}
              className="cta-primary"
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.15em",
                background: "var(--color-accent)",
                color: "var(--color-bg)",
                padding: "14px 26px",
                borderRadius: 2,
                border: "1px solid var(--color-accent)",
              }}
            >
              → ЧИТАТЬ ДАЛЬШЕ
            </a>
            <a
              href="#latest"
              className="cta-secondary"
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.15em",
                color: "var(--color-text)",
                padding: "14px 26px",
                borderRadius: 2,
                border: "1px solid rgba(255,255,255,0.4)",
              }}
            >
              ВСЕ НОВОСТИ ↓
            </a>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            className="hero-cover"
            style={{
              position: "relative",
              minHeight: 420,
              border: "1px solid var(--color-border-default)",
              overflow: "hidden",
            }}
          >
            {hero.coverImage ? (
              <Image
                src={hero.coverImage}
                alt=""
                fill
                sizes="(max-width: 900px) 100vw, 480px"
                priority
                style={{ objectFit: "cover" }}
              />
            ) : (
              <CategoryCover category={hero.category} title={hero.title} variant="hero" />
            )}
          </div>
          {hero.coverCaption && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.14em",
                color: "var(--color-muted)",
              }}
            >
              {hero.coverCaption}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .editorial-hero-grid { grid-template-columns: 1fr !important; }
          .hero-cover { min-height: 240px !important; }
        }
      `}</style>
    </section>
  );
}
