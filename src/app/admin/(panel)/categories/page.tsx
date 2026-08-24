import { createCategory, deleteCategory, getCategories, renameCategory } from "@/lib/categories";
import { ModulePage } from "@/components/admin/ui/ModulePage";
import { Section } from "@/components/admin/ui/Surface";
import CategoryCard from "./CategoryCard";
import CategoryCreateDrawer from "./CategoryCreateDrawer";

// Grilla de tarjetas y no tabla: con tres/cinco categorías una tabla sólo aportaba líneas y desperdiciaba ancho.
// El azulejo "Nueva categoría" quedó sólo para la grilla vacía (estado vacío); como última casilla permanente se perdía de vista con la lista larga, así que la acción de crear se movió al encabezado.
export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <ModulePage
      title="Categorías"
      description="Cada artículo pertenece a una"
      actions={<CategoryCreateDrawer action={createCategory} />}
    >
      <Section
        title="Todas las categorías"
        count={categories.length}
        boxed
        accent="category"
        hideHead
        className="cq-enter"
      >
        <ul className="grid gap-3 py-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              index={Math.min(index, 8)}
              category={{
                id: category.id,
                name: category.name,
                nameEn: category.nameEn ?? "",
                slug: category.slug,
                postCount: category._count.posts,
              }}
              renameAction={renameCategory}
              deleteAction={deleteCategory}
            />
          ))}

          {categories.length === 0 && (
            <li>
              <CategoryCreateDrawer action={createCategory} tile />
            </li>
          )}
        </ul>
      </Section>
    </ModulePage>
  );
}
