-- Nombre de categoría en inglés. Nullable a propósito: las categorías que ya
-- existen no tienen traducción y el blog en inglés cae a `name` mientras no la
-- tengan, en vez de quedarse sin etiqueta.
ALTER TABLE "Category" ADD COLUMN "nameEn" TEXT;

-- Quién guardó por última vez el artículo.
ALTER TABLE "Post" ADD COLUMN "updatedById" INTEGER;

ALTER TABLE "Post"
  ADD CONSTRAINT "Post_updatedById_fkey"
  FOREIGN KEY ("updatedById") REFERENCES "AdminUser"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Relacionados y anterior/siguiente: mismo idioma, misma categoría, publicados,
-- ordenados por fecha.
CREATE INDEX "Post_locale_status_categoryId_publishedAt_idx"
  ON "Post"("locale", "status", "categoryId", "publishedAt");
