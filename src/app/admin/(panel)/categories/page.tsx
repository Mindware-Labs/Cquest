import { createCategory, deleteCategory, getCategories, renameCategory } from "@/lib/categories";
import { EmptyState, PageHeader, Panel, PanelHead } from "@/components/admin/ui/Surface";
import CategoryCreateForm from "./CategoryCreateForm";
import CategoryRow from "./CategoryRow";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  const totalPosts = categories.reduce((total, category) => total + category._count.posts, 0);

  return (
    <div>
      <PageHeader
        title="Categorías"
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <Panel>
          <PanelHead title="Categorías" count={categories.length} />
          {categories.length === 0 ? (
            <EmptyState
              title="Todavía no hay categorías"
              hint="Sin al menos una categoría no se puede crear un artículo. Empezá por las líneas de negocio: Call Center, BPO, Sistemas."
            />
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
        </Panel>

        {/* El alta vive al costado y no arriba de la lista: crear es la acción
            menos frecuente de esta pantalla, y empujaba la lista fuera de vista. */}
        <Panel className="lg:sticky lg:top-6">
          <PanelHead title="Agregar" />
          <CategoryCreateForm action={createCategory} />
          <p className="border-t border-border px-5 py-3 text-[0.8rem] leading-relaxed text-[var(--text-tertiary)]">
            El identificador de URL se genera solo a partir del nombre.
            {totalPosts > 0 && ` Hoy hay ${totalPosts} artículos repartidos entre estas categorías.`}
          </p>
        </Panel>
      </div>
    </div>
  );
}
