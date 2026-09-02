CREATE TYPE "public"."application_status" AS ENUM('new', 'reviewing', 'shortlisted', 'rejected', 'hired');--> statement-breakpoint
CREATE TABLE "application" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vacancy_id" uuid,
	"vacancy_title" text,
	"department_id" uuid,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"city" text NOT NULL,
	"experience" text NOT NULL,
	"english" text NOT NULL,
	"availability" text NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"resume_url" text NOT NULL,
	"resume_pathname" text NOT NULL,
	"resume_name" text NOT NULL,
	"resume_size" integer NOT NULL,
	"resume_type" text NOT NULL,
	"status" "application_status" DEFAULT 'new' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_vacancy_id_vacancy_id_fk" FOREIGN KEY ("vacancy_id") REFERENCES "public"."vacancy"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_department_id_department_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "application_vacancyId_idx" ON "application" USING btree ("vacancy_id");--> statement-breakpoint
CREATE INDEX "application_status_createdAt_idx" ON "application" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "application_email_idx" ON "application" USING btree ("email");