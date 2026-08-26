DROP INDEX "category_nameEs_idx";--> statement-breakpoint
CREATE INDEX "category_name_idx" ON "category" USING btree ("name");--> statement-breakpoint
ALTER TABLE "category" DROP COLUMN "name_es";--> statement-breakpoint
ALTER TABLE "category" DROP COLUMN "name_en";--> statement-breakpoint
ALTER TABLE "category" DROP COLUMN "description_es";--> statement-breakpoint
ALTER TABLE "category" DROP COLUMN "description_en";