import { createCategory, deleteCategory, getCategories, renameCategory } from "@/lib/categories";
import { ModulePage } from "@/components/admin/ui/ModulePage";
import { Section } from "@/components/admin/ui/Surface";
import CategoryCard from "./CategoryCard";
import CategoryCreateDrawer from "./CategoryCreateDrawer";

/* Categorías, en grilla de tarjetas.

   Antes era una tabla. Una tabla existe para comparar muchas filas en vertical
   por varias columnas a la vez, y acá hay tres o cinco categorías con dos datos
   cada una: lo único que aportaba eran líneas. Peor, la fila desperdiciaba el
   ancho —nombre, slug y conteo ocupaban un tercio y el resto quedaba en blanco.

   La grilla usa ese ancho para la cifra de artículos, que es el único dato con
   el que se decide algo sobre una categoría: si tiene contenido o está vacía, y
   por lo tanto si se puede borrar.

   La última casilla es "Nueva categoría", en filete punteado. Así la acción de
   crear está donde el ojo terminó de recorrer la lista, y el estado vacío no
   necesita un componente aparte: con cero categorías, la grilla es esa casilla
   sola y ya dice qué hacer. */
export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <ModulePage title="Categorías" path="admin/categories" description="Cada artículo pertenece a una">
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
                slug: category.slug,
                postCount: category._count.posts,
              }}
              renameAction={renameCategory}
              deleteAction={deleteCategory}
            />
          ))}

          <li>
            <CategoryCreateDrawer action={createCategory} tile />
          </li>
        </ul>
      </Section>
    </ModulePage>
  );
}
