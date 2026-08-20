-- CreateEnum
CREATE TYPE "PostLocale" AS ENUM ('es', 'en');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "locale" "PostLocale" NOT NULL DEFAULT 'es';

-- CreateIndex
CREATE INDEX "Post_locale_status_publishedAt_idx" ON "Post"("locale", "status", "publishedAt");
