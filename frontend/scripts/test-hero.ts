import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const db = new PrismaClient({ adapter });

  const featured = await db.article.findFirst({
    where: { isFeatured: true, status: "published" },
    select: { title: true, isFeatured: true, status: true },
  });
  console.log("featured:", featured);

  const latest = await db.article.findFirst({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    select: { title: true, publishedAt: true, status: true },
  });
  console.log("latest:", latest);

  const all = await db.article.findMany({
    select: { title: true, isFeatured: true, status: true },
  });
  console.log("all:", all);

  await db.$disconnect();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
