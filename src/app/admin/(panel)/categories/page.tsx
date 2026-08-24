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

   El azulejo punteado "Nueva categoría" quedó SÓLO para la grilla vacía, que es
   donde de verdad trabaja: con cero categorías es el estado vacío y dice qué
   hacer sin necesitar un componente aparte. Como última casilla permanente
   dejaba de funcionar apenas la lista crecía —con veinte categorías la acción
   de crear se iba abajo de todo— y además era el cuarto lugar distinto donde
   este panel ponía su acción principal. Ahora está en el encabezado, como en
   los otros tres módulos. */
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
