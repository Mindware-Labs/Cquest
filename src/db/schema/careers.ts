import { index, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { department } from "./department";

// "Programado" no se guarda: es published con publishedAt en el futuro, igual que post.
export const vacancyStatus = pgEnum("vacancy_status", ["draft", "published", "hidden"]);

export const vacancy = pgTable(
  "vacancy",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Se deriva del título al publicar por primera vez y no vuelve a cambiar.
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),

    // Si se borra el departamento la vacante sobrevive sin él.
    departmentId: uuid("department_id").references(() => department.id, { onDelete: "set null" }),
    track: text("track"), // "entry" | "professional"
    workMode: text("work_mode"), // "onsite" | "hybrid" | "remote"
    employmentType: text("employment_type"), // "full-time" | "part-time"

    location: text("location"),
    schedule: text("schedule"),
    summary: text("summary").notNull().default(""),

    responsibilities: jsonb("responsibilities").notNull().default([]),
    requirements: jsonb("requirements").notNull().default([]),
    niceToHave: jsonb("nice_to_have").notNull().default([]),

    status: vacancyStatus("status").notNull().default("draft"),

    authorId: text("author_id").references(() => user.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("vacancy_status_publishedAt_idx").on(table.status, table.publishedAt),
    index("vacancy_departmentId_idx").on(table.departmentId),
  ],
);

export type Vacancy = typeof vacancy.$inferSelect;
