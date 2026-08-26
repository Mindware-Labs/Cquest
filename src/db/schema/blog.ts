import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

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

/* "Programado" no se guarda: es published con publishedAt en el futuro. Así no
   hace falta un cron que voltee estados a media noche. */
export const postStatus = pgEnum("post_status", ["draft", "published", "hidden"]);

export const post = pgTable(
  "post",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),

    // Si se borra la categoría el artículo sobrevive sin ella.
    categoryId: uuid("category_id").references(() => category.id, { onDelete: "set null" }),

    coverUrl: text("cover_url"),
    coverAlt: text("cover_alt"),
    // Ruta en Vercel Blob: hace falta para borrar el archivo con el artículo.
    coverPathname: text("cover_pathname"),

    // Bloques de BlockNote: la fuente de verdad del contenido.
    content: jsonb("content").notNull().default([]),
    // Snapshot renderizado al publicar: el sitio público no carga el editor.
    contentHtml: text("content_html"),

    status: postStatus("status").notNull().default("draft"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    readingMinutes: integer("reading_minutes").notNull().default(0),

    authorId: text("author_id").references(() => user.id, { onDelete: "set null" }),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("post_status_publishedAt_idx").on(table.status, table.publishedAt),
    index("post_categoryId_idx").on(table.categoryId),
  ],
);

export const postRelations = relations(post, ({ one }) => ({
  category: one(category, { fields: [post.categoryId], references: [category.id] }),
  author: one(user, { fields: [post.authorId], references: [user.id] }),
}));

export type Category = typeof category.$inferSelect;
export type Post = typeof post.$inferSelect;
