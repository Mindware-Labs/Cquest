CREATE TYPE "public"."vacancy_status" AS ENUM('draft', 'published', 'hidden');--> statement-breakpoint
CREATE TABLE "vacancy" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"department" text,
	"track" text,
	"work_mode" text,
	"employment_type" text,
	"location" text,
	"schedule" text,
	"summary" text DEFAULT '' NOT NULL,
	"responsibilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"nice_to_have" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" "vacancy_status" DEFAULT 'draft' NOT NULL,
	"author_id" text,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vacancy_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "vacancy" ADD CONSTRAINT "vacancy_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "vacancy_status_publishedAt_idx" ON "vacancy" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "vacancy_department_idx" ON "vacancy" USING btree ("department");