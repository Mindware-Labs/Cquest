import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const department = pgTable(
  "department",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Se deriva del nombre corto al crear y no vuelve a cambiar: la vacante y
    // el organigrama de /team lo usan como referencia estable.
    slug: text("slug").notNull().unique(),
    icon: text("icon").notNull().default("workflow"), // ServiceIconName (src/components/services/data.ts)
    label: text("label").notNull(),
    shortLabel: text("short_label").notNull(),
    responsibilities: jsonb("responsibilities").notNull().default([]),
    // Orden de aparición en el organigrama público y en los selects del admin.
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("department_sortOrder_idx").on(table.sortOrder)],
);

export type Department = typeof department.$inferSelect;
