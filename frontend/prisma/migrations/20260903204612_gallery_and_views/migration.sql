-- CreateEnum
CREATE TYPE "GallerySource" AS ENUM ('trailer', 'screenshot', 'leak', 'concept');

-- CreateTable
CREATE TABLE "gallery_items" (
    "id" UUID NOT NULL,
    "image_url" TEXT NOT NULL,
    "caption" TEXT,
    "source" "GallerySource" NOT NULL DEFAULT 'screenshot',
    "width" INTEGER,
    "height" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "article_views" (
    "id" BIGSERIAL NOT NULL,
    "article_id" UUID NOT NULL,
    "ip_hash" TEXT,
    "viewed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gallery_items_sort_order_idx" ON "gallery_items"("sort_order");

-- CreateIndex
CREATE INDEX "article_views_article_id_viewed_at_idx" ON "article_views"("article_id", "viewed_at" DESC);
