CREATE TYPE "public"."post_status" AS ENUM('draft', 'published', 'hidden');--> statement-breakpoint
CREATE TABLE "post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"category_id" uuid,
	"cover_url" text,
	"cover_alt" text,
	"cover_pathname" text,
	"content" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"content_html" text,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"reading_minutes" integer DEFAULT 0 NOT NULL,
	"author_id" text,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "post_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post" ADD CONSTRAINT "post_author_id_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_status_publishedAt_idx" ON "post" USING btree ("status","published_at");--> statement-breakpoint
CREATE INDEX "post_categoryId_idx" ON "post" USING btree ("category_id");