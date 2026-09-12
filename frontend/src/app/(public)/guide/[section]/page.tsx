import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import MapContent from "@/content/guide/map";
import CharactersContent from "@/content/guide/characters";
import VehiclesContent from "@/content/guide/vehicles";
import GameplayContent from "@/content/guide/gameplay";

const SECTIONS: Record<
  string,
  { title: string; tag: string; description: string; body: () => React.ReactElement }
> = {
  map: {
    title: "Карта Vice City и штата Леонида",
    tag: "КАРТА",
    description:
      "5 подтверждённых регионов открытого мира GTA VI — от порта Геллена до национального парка гор Калага.",
    body: MapContent,
  },
  characters: {
    title: "Персонажи GTA VI",
    tag: "ПЕРСОНАЖИ",
    description:
      "Люсия Каминос, Джейсон Дюваль и семь ключевых NPC. Полный разбор всего что известно.",
    body: CharactersContent,
  },
  vehicles: {
    title: "Транспорт GTA VI",
    tag: "ТРАНСПОРТ",
    description:
      "Машины, мотоциклы, лодки, вертолёты. Разбор классов транспорта показанных в трейлерах.",
    body: VehiclesContent,
  },
  gameplay: {
    title: "Геймплей GTA VI",
    tag: "ГЕЙМПЛЕЙ",
    description:
      "Кооп между Люсией и Джейсоном, Criminal Profile, Snapmatic, фитнес-система и свободные активности.",
    body: GameplayContent,
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

  const Body = s.body;

  return (
    <section
      style={{
        maxWidth: 760,
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

      <div style={{ marginTop: 24 }}>
        <Body />
      </div>
    </section>
  );
}
