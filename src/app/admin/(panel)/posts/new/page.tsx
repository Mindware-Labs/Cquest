import { getCategories } from "@/lib/categories";
import { createPost } from "@/lib/posts";
import { createTemplateFromBlocks } from "@/lib/templates";
import { getTemplateChoices } from "@/lib/templateChoices";
import PostEditor from "@/components/admin/PostEditor";
import { LinkButton } from "@/components/admin/ui/Button";
import { IconPlus } from "@/components/admin/ui/icons";
import { EmptyState } from "@/components/admin/ui/Surface";

export default async function NewPostPage() {
  const [categories, templates] = await Promise.all([getCategories(), getTemplateChoices()]);

  /* Sin categorías no hay artículo posible: categoryId es obligatorio en el
     schema. Mejor decirlo acá que dejar que el formulario falle al guardar. */
  if (categories.length === 0) {
    return (
      <div>
        <h1 className="sr-only">Nuevo artículo</h1>
        {/* No es un error: es un requisito previo. Por eso se dibuja como un
            vacío con su salida a un clic y no como un cartel rojo. */}
        <EmptyState
          title="Primero hace falta una categoría"
          hint="Un artículo tiene que pertenecer a una categoría, y todavía no hay ninguna creada."
          rows={2}
          action={
            <LinkButton href="/admin/categories" variant="solid" icon={<IconPlus size={15} />}>
              Crear la primera categoría
            </LinkButton>
          }
        />
      </div>
    );
  }

  return (
    <PostEditor
      action={createPost}
      categories={categories}
      templates={templates}
      saveTemplateAction={createTemplateFromBlocks}
      initial={{
        title: "",
        slug: "",
        excerpt: "",
        coverImageUrl: "",
        coverImageAlt: "",
        categoryId: null,
        locale: "es",
        seoTitle: "",
        seoDescription: "",
        blocks: [],
      }}
    />
  );
}
