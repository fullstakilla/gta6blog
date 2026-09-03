import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Всё, что известно о GTA VI",
  description:
    "Единый источник правды: 47 подтверждённых фактов, 23 надёжные утечки, 12 официальных трейлеров.",
  alternates: { canonical: "/guide" },
};

const SECTIONS = [
  {
    slug: "map",
    tag: "КАРТА",
    title: "Карта Vice City",
    description:
      "Порт-Гелена, болота, центр, побережье — что мы знаем об открытом мире Leonida.",
  },
  {
    slug: "characters",
    tag: "ПЕРСОНАЖИ",
    title: "Персонажи",
    description:
      "Люсия, Джейсон, антагонисты, второстепенные — полный список подтверждённых.",
  },
  {
    slug: "vehicles",
    tag: "ТРАНСПОРТ",
    title: "Транспорт",
    description:
      "Машины, мотоциклы, лодки, вертолёты — всё, что показали в трейлерах.",
  },
  {
    slug: "gameplay",
    tag: "ГЕЙМПЛЕЙ",
    title: "Геймплей",
    description:
      "Кооп, стрельба, вождение, ограбления — механики, о которых говорят инсайдеры.",
  },
];

export default function GuidePage() {
  return (
    <section
      style={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: "56px 24px 96px",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.25em",
            color: "var(--color-accent)",
          }}
        >
          {"// "}БАЗА ЗНАНИЙ · ОБНОВЛЯЕТСЯ ЕЖЕДНЕВНО
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "clamp(48px, 6vw, 80px)",
            lineHeight: 0.98,
            letterSpacing: "-0.035em",
            margin: "20px 0 0",
            maxWidth: "18ch",
          }}
        >
          Всё, что известно о GTA VI
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 18,
            lineHeight: 1.55,
            color: "var(--color-muted)",
            maxWidth: "60ch",
            marginTop: 32,
          }}
        >
          47 подтверждённых фактов, 23 надёжные утечки, 12 официальных
          трейлеров. Единый источник правды о главной игре десятилетия.
          Обновляется, когда появляется что-то важное.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 48,
          flexWrap: "wrap",
          padding: "40px 0",
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          lineHeight: 2.2,
          letterSpacing: "0.16em",
          color: "var(--color-muted)",
        }}
      >
        <div>ФАКТОВ · 47</div>
        <div>УТЕЧЕК · 23</div>
        <div>ТРЕЙЛЕРОВ · 12</div>
        <div>ОБНОВЛЕНО · 12.09.2026</div>
      </div>

      <div style={{ height: 2, background: "var(--color-accent)", width: "100%" }} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 20,
          marginTop: 48,
        }}
        className="guide-grid"
      >
        {SECTIONS.map((s) => (
          <Link
            key={s.slug}
            href={`/guide/${s.slug}`}
            className="archive-card"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              padding: 24,
              border: "1px solid var(--color-border-default)",
              borderRadius: 2,
              color: "var(--color-text)",
              transition: "border-color 160ms ease-out, transform 160ms ease-out",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "var(--color-accent)",
              }}
            >
              → {s.tag}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 500,
                fontSize: 26,
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              {s.title}
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 14,
                lineHeight: 1.5,
                color: "var(--color-muted)",
              }}
            >
              {s.description}
            </div>
          </Link>
        ))}
      </div>

      <style>{`
        .archive-card:hover { border-color: var(--color-accent) !important; transform: translateY(-2px); }
        @media (max-width: 700px) {
          .guide-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
