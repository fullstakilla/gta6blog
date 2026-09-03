import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("dev", 12);
  const admin = await db.author.upsert({
    where: { email: "admin@gta6-blog.ru" },
    update: {},
    create: {
      name: "Админ",
      email: "admin@gta6-blog.ru",
      passwordHash,
      role: "admin",
    },
  });

  const articles = [
    {
      slug: "trailer-2-detailed-breakdown",
      title: "Второй трейлер GTA 6: детальный разбор каждой сцены",
      excerpt: "Прошли по кадрам, разобрали каждую сцену, каждого персонажа, каждую отсылку.",
      content: "# Введение\n\nВторой трейлер GTA 6 вышел вчера...\n\n## Первая сцена\n\n...",
      category: "TRAILER" as const,
      tags: ["trailer", "vice-city", "trailer-2"],
      status: "published" as const,
      publishedAt: new Date("2026-09-12T10:00:00Z"),
    },
    {
      slug: "map-full-leak",
      title: "Полная карта Vice City слита в сеть — инсайдеры раскрывают детали",
      excerpt:
        "Инсайдеры раскрывают детали открытого мира — от Порт-Гелены до болот. Разбираем, что подтверждает предыдущие утечки, а что вбрасывается впервые.",
      content: "# Что мы знаем\n\nВчера в сеть попала карта, которую инсайдеры давно обещали...",
      category: "LEAK" as const,
      tags: ["leak", "map", "vice-city"],
      status: "published" as const,
      publishedAt: new Date("2026-09-10T08:00:00Z"),
      isFeatured: true,
    },
    {
      slug: "lucia-full-portrait",
      title: "Кто такая Люсия: полный портрет главной героини",
      excerpt: "Разбираемся, кто такая Люсия, откуда она, что мы знаем о её истории.",
      content: "# Люсия\n\nПервая женщина-протагонист в основной серии GTA...",
      category: "CHARACTER" as const,
      tags: ["character", "lucia"],
      status: "published" as const,
      publishedAt: new Date("2026-09-08T12:00:00Z"),
    },
    {
      slug: "coop-mechanics",
      title: "Механика напарника: как работает кооперативное ограбление",
      excerpt: "Разбираемся, как устроен кооп в GTA 6 и что известно про Джейсона.",
      content: "# Кооп\n\nРокстар подтвердили, что можно играть в паре...",
      category: "GAMEPLAY" as const,
      tags: ["gameplay", "coop"],
      status: "draft" as const,
    },
  ];

  for (const a of articles) {
    await db.article.upsert({
      where: { slug: a.slug },
      update: {},
      create: { ...a, authorId: admin.id },
    });
  }

  console.log("✓ Seed complete");
  console.log(`  Admin: admin@gta6-blog.ru / dev`);
  console.log(`  Articles: ${articles.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
