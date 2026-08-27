CREATE TABLE "department" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"icon" text DEFAULT 'workflow' NOT NULL,
	"label" text NOT NULL,
	"short_label" text NOT NULL,
	"responsibilities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "department_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DROP INDEX "vacancy_department_idx";--> statement-breakpoint
ALTER TABLE "vacancy" ADD COLUMN "department_id" uuid;--> statement-breakpoint
CREATE INDEX "department_sortOrder_idx" ON "department" USING btree ("sort_order");--> statement-breakpoint
ALTER TABLE "vacancy" ADD CONSTRAINT "vacancy_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "vacancy_departmentId_idx" ON "vacancy" USING btree ("department_id");