import { index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
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

export const applicationStatus = pgEnum("application_status", ["new", "reviewing", "shortlisted", "rejected", "hired"]);

export const application = pgTable(
  "application",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Null = candidatura abierta (banco de talento). Si se borra la vacante la
    // postulación sobrevive con el título que tenía copiado.
    vacancyId: uuid("vacancy_id").references(() => vacancy.id, { onDelete: "set null" }),
    vacancyTitle: text("vacancy_title"),
    departmentId: uuid("department_id").references(() => department.id, { onDelete: "set null" }),

    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    city: text("city").notNull(),
    experience: text("experience").notNull(),
    english: text("english").notNull(),
    availability: text("availability").notNull(),
    message: text("message").notNull().default(""),

    // Blob privado: la URL no sirve en público, el panel lo sirve por /api.
    resumeUrl: text("resume_url").notNull(),
    resumePathname: text("resume_pathname").notNull(),
    resumeName: text("resume_name").notNull(),
    resumeSize: integer("resume_size").notNull(),
    resumeType: text("resume_type").notNull(),

    status: applicationStatus("status").notNull().default("new"),
    notes: text("notes").notNull().default(""),

    // De dónde vino: utm_source de la URL al abrir /join-us/apply, o "" si
    // llegó directo. Se captura una sola vez al enviar — no se puede
    // reconstruir después si no se guardó entonces.
    source: text("source").notNull().default(""),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("application_vacancyId_idx").on(table.vacancyId),
    index("application_status_createdAt_idx").on(table.status, table.createdAt),
    index("application_email_idx").on(table.email),
  ],
);

export type Application = typeof application.$inferSelect;

/* Auditoría de cambios de estado: application.updatedAt se pisa con
   cualquier cambio (estado O notas), así que no sirve para medir cuánto
   tiempo pasó un candidato en cada etapa. Esta tabla sí lo permite —
   fromStatus null es la fila que se crea junto con la postulación misma. */
export const applicationStatusHistory = pgTable(
  "application_status_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicationId: uuid("application_id")
      .notNull()
      .references(() => application.id, { onDelete: "cascade" }),
    fromStatus: applicationStatus("from_status"),
    toStatus: applicationStatus("to_status").notNull(),
    changedBy: text("changed_by").references(() => user.id, { onDelete: "set null" }),
    changedAt: timestamp("changed_at").defaultNow().notNull(),
  },
  (table) => [
    index("application_status_history_applicationId_idx").on(table.applicationId),
    index("application_status_history_toStatus_idx").on(table.toStatus, table.changedAt),
  ],
);

export type ApplicationStatusHistoryRow = typeof applicationStatusHistory.$inferSelect;
