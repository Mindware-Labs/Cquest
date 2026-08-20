import Link from "next/link";
import { getCategories } from "@/lib/categories";
import { getPosts } from "@/lib/posts";

export default async function AdminHomePage() {
  const [categories, posts] = await Promise.all([getCategories(), getPosts()]);
  const published = posts.filter((post) => post.status === "PUBLISHED").length;

  const stats = [
    { label: "Artículos", value: posts.length },
    { label: "Publicados", value: published },
    { label: "Categorías", value: categories.length },
  ];

  return (
    <div className="pt-10">
      <h1 className="font-heading text-[1.6rem] font-semibold tracking-[-0.02em] text-foreground">
        Inicio
      </h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-[var(--surface-raised)] px-5 py-6"
          >
            <p className="font-heading text-[2rem] font-semibold leading-none tabular-nums text-petroleo">
              {stat.value}
            </p>
            <p className="mt-2 text-[0.8rem] uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* El editor de bloques es el paso 5: hasta que exista, la tabla de
          artículos permite publicar, ocultar y eliminar, pero no crear. */}
      <p className="mt-8 text-[0.92rem] leading-relaxed text-[var(--text-secondary)]">
        Administrá los{" "}
        <Link
          href="/admin/posts"
          className="font-semibold text-petroleo underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
        >
          artículos
        </Link>{" "}
        y las{" "}
        <Link
          href="/admin/categories"
          className="font-semibold text-petroleo underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
        >
          categorías
        </Link>
        . La creación y edición de artículos llega con el editor de bloques.
      </p>
    </div>
  );
}
