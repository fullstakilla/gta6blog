import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

const SECTIONS: Record<
  string,
  { title: string; tag: string; description: string }
> = {
  map: {
    title: "Карта Vice City",
    tag: "КАРТА",
    description: "Порт-Гелена, болота, центр, побережье — что мы знаем.",
  },
  characters: {
    title: "Персонажи",
    tag: "ПЕРСОНАЖИ",
    description: "Люсия, Джейсон, антагонисты, второстепенные.",
  },
  vehicles: {
    title: "Транспорт",
    tag: "ТРАНСПОРТ",
    description: "Машины, мотоциклы, лодки, вертолёты.",
  },
  gameplay: {
    title: "Геймплей",
    tag: "ГЕЙМПЛЕЙ",
    description: "Кооп, стрельба, вождение, ограбления.",
  },
};

interface Props {
  params: Promise<{ section: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  const s = SECTIONS[section];
  if (!s) return {};
  return {
    title: `${s.title} · Гид по GTA VI`,
    description: s.description,
    alternates: { canonical: `/guide/${section}` },
  };
}

export function generateStaticParams() {
  return Object.keys(SECTIONS).map((section) => ({ section }));
}

export default async function GuideSectionPage({ params }: Props) {
  const { section } = await params;
  const s = SECTIONS[section];
  if (!s) notFound();

  return (
    <section
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: "56px 24px 96px",
      }}
    >
      <Link
        href="/guide"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.14em",
          color: "var(--color-muted)",
        }}
      >
        ← к гиду
      </Link>

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.25em",
          color: "var(--color-accent)",
          marginTop: 32,
        }}
      >
        {"// "}{s.tag}
      </div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "clamp(40px, 5.4vw, 64px)",
          lineHeight: 1.05,
          letterSpacing: "-0.035em",
          margin: "16px 0 0",
        }}
      >
        {s.title}
      </h1>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 18,
          lineHeight: 1.55,
          color: "var(--color-muted)",
          maxWidth: "60ch",
          marginTop: 24,
        }}
      >
        {s.description}
      </p>

      <div
        style={{
          marginTop: 64,
          padding: 32,
          border: "1px dashed var(--color-border-default)",
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.25em",
            color: "var(--color-accent)",
            marginBottom: 12,
          }}
        >
          {"// "}В РАБОТЕ
        </div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 15,
            color: "var(--color-muted)",
            maxWidth: "48ch",
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          Собираем материалы. Следите за{" "}
          <Link href="/blog" style={{ color: "var(--color-accent)" }}>
            новостями
          </Link>{" "}
          или{" "}
          <a href="#subscribe" style={{ color: "var(--color-accent)" }}>
            подпишитесь на рассылку
          </a>
          , чтобы не пропустить.
        </p>
      </div>
    </section>
  );
}
