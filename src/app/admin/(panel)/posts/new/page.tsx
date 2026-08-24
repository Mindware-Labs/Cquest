import { getCategories } from "@/lib/categories";
import { createPost } from "@/lib/posts";
import { createTemplateFromBlocks } from "@/lib/templates";
import { getTemplateChoices } from "@/lib/templateChoices";
import { withFreshIds } from "@/components/admin/editor/TemplatePicker";
import { withThumbs } from "@/components/admin/ui/TemplateThumb";
import PostEditor from "@/components/admin/PostEditor";
import { LinkButton } from "@/components/admin/ui/Button";
import { IconPlus } from "@/components/admin/ui/icons";
import { EmptyState } from "@/components/admin/ui/Surface";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ plantilla?: string }>;
}) {
  const { plantilla } = await searchParams;
  const [categories, templates] = await Promise.all([getCategories(), getTemplateChoices()]);

  // Sin categorías no hay artículo posible (categoryId es obligatorio en el schema); mejor decirlo acá que dejar fallar el guardado.
  if (categories.length === 0) {
    return (
      <div>
        <h1 className="sr-only">Nuevo artículo</h1>
        {/* No es un error, es un requisito previo: se dibuja como un vacío con salida a un clic, no como un cartel rojo. */}
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

  // Los ids se renuevan ACÁ, en el servidor: withFreshIds usa crypto.randomUUID(), y llamarlo en el estado inicial de un componente de cliente daría un id distinto en servidor e hidratación. Una clave inexistente cae al editor en blanco sin error.
  const picked = plantilla ? templates.find((template) => template.key === plantilla) : undefined;

  return (
    <PostEditor
      action={createPost}
      categories={categories}
      templates={withThumbs(templates)}
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
        blocks: picked ? withFreshIds(picked.blocks) : [],
      }}
    />
  );
}
