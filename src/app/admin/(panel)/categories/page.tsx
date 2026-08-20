import { createCategory, deleteCategory, getCategories, renameCategory } from "@/lib/categories";
import CategoryCreateForm from "./CategoryCreateForm";
import CategoryRow from "./CategoryRow";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="pt-10">
      <h1 className="font-heading text-[1.6rem] font-semibold tracking-[-0.02em] text-foreground">
        Categorías
      </h1>
      <p className="mt-2 max-w-[42rem] text-[0.92rem] leading-relaxed text-[var(--text-secondary)]">
        Cada artículo pertenece a una categoría. Una categoría con artículos
        asociados no se puede eliminar.
      </p>

      <div className="mt-7 rounded-xl border border-border bg-[var(--surface-raised)] p-6">
        <CategoryCreateForm action={createCategory} />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-[var(--surface-raised)] px-6">
        {categories.length === 0 ? (
          <p className="py-10 text-center text-[0.9rem] text-[var(--text-tertiary)]">
            Todavía no hay categorías.
          </p>
        ) : (
          <ul>
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={{
                  id: category.id,
                  name: category.name,
                  slug: category.slug,
                  postCount: category._count.posts,
                }}
                renameAction={renameCategory}
                deleteAction={deleteCategory}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
