import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const category = pgTable(
  "category",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Se deriva del nombre al crear y no vuelve a cambiar: va en URLs publicadas.
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("category_name_idx").on(table.name)],
);

export type Category = typeof category.$inferSelect;
