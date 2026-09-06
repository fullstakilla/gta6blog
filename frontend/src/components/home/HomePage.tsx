import Link from "next/link";
import { EditorialHero, type EditorialHeroProps } from "./EditorialHero";
import { TrendingBar } from "./TrendingBar";
import { LatestSection, type LatestArticle } from "./LatestSection";
import { FromArchive } from "./FromArchive";
import { CountdownTracker } from "./CountdownTracker";
import { GalleryTeaser } from "./GalleryTeaser";
import { Subscribe } from "./Subscribe";
import type { GuideStats } from "@/lib/api";

interface HomePageProps {
  hero: EditorialHeroProps["hero"];
  articles: LatestArticle[];
  archive: LatestArticle[];
  guideStats: GuideStats;
  subscribersCount: number;
}

export function HomePage({ hero, articles, archive, guideStats, subscribersCount }: HomePageProps) {
  const accent = "var(--color-accent)";

  return (
    <>
      <EditorialHero hero={hero} />
      <TrendingBar />
      <LatestSection articles={articles} />

      <FromArchive articles={archive} />

      <CountdownTracker />

      <section
        id="featured"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px 88px",
        }}
      >
        <div style={{ height: 2, background: accent, width: "100%" }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            gap: 40,
            alignItems: "center",
            paddingTop: 32,
          }}
          className="featured-promo-grid"
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.25em",
                color: accent,
              }}
            >
              {"// "}БАЗА ЗНАНИЙ · ОБНОВЛЯЕТСЯ ЕЖЕДНЕВНО
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(28px, 3.6vw, 44px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                margin: "12px 0 0",
                maxWidth: "20ch",
              }}
            >
              Всё, что известно о GTA VI
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 15,
                lineHeight: 1.55,
                color: "var(--color-muted)",
                maxWidth: "60ch",
                margin: "12px 0 0",
              }}
            >
              {guideStats.facts} фактов · {guideStats.leaks} утечек · {guideStats.trailers} трейлеров — единый источник правды.
            </p>
          </div>
          <Link
            href="/guide"
            className="cta-primary"
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: "0.15em",
              background: "var(--color-accent)",
              color: "var(--color-bg)",
              padding: "14px 24px",
              borderRadius: 2,
              border: "1px solid var(--color-accent)",
              whiteSpace: "nowrap",
            }}
          >
            → ЧИТАТЬ ГИД
          </Link>
        </div>
      </section>

      <GalleryTeaser />
      <Subscribe subscribersCount={subscribersCount} />

      <style>{`
        @media (max-width: 700px) {
          .featured-promo-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
