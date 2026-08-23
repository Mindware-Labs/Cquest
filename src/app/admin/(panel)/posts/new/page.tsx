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

  /* «Usar» desde la pantalla de Plantillas llega acá con la plantilla elegida en
     la URL, y el editor abre YA con esos bloques puestos en vez de mostrar el
     selector. Antes ese botón no podía existir: la única forma de aplicar una
     plantilla era entrar al editor en blanco y elegirla de nuevo adentro, así
     que la pantalla de Plantillas listaba cosas que no se podían usar desde ahí.

     Los ids se renuevan ACÁ, en el servidor, y no dentro del editor. Es la parte
     que no es obvia: `withFreshIds` usa `crypto.randomUUID()`, y llamarlo en el
     estado inicial de un componente de cliente da un id en el render del
     servidor y otro en la hidratación — o sea, un desajuste de hidratación en la
     pantalla más pesada del panel. Resuelto acá, `PostEditor` no se entera de
     que existe el parámetro: recibe bloques iniciales como en cualquier otro
     caso, y su propia regla («el selector sólo aparece si el artículo está
     vacío») hace sola lo correcto.

     Una clave que no existe —plantilla borrada, URL vieja, algo mal tipeado— no
     es un error: se cae al editor en blanco, que es exactamente donde el
     selector aparece y ofrece las que sí están. */
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
