import { notFound } from "next/navigation";
import { getCategories } from "@/lib/categories";
import { displayStatus, getPostById, toEditorDateTime, updatePost } from "@/lib/posts";
import { createTemplateFromBlocks } from "@/lib/templates";
import { getTemplateChoices } from "@/lib/templateChoices";
import { blockArraySchema } from "@/lib/blocks";
import PostEditor from "@/components/admin/PostEditor";
import { LinkButton } from "@/components/admin/ui/Button";
import { ErrorState, Ident } from "@/components/admin/ui/Surface";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();

  const [post, categories, templates] = await Promise.all([
    getPostById(postId),
    getCategories(),
    getTemplateChoices(),
  ]);
  if (!post) notFound();

  /* Si el contenido guardado no valida contra el schema actual, el editor
     arranca vacío en vez de reventar — pero eso BORRARÍA el artículo al
     guardar. Por eso no se abre: se avisa y no se toca nada. */
  const parsed = blockArraySchema.safeParse(post.content);
  if (!parsed.success) {
    return (
      <div>
        <h1 className="sr-only">Editar artículo</h1>
        <ErrorState
          title="Este artículo no se puede abrir en el editor"
          hint="Su contenido no coincide con el formato de bloques actual. El editor no lo abre para no sobrescribirlo: el artículo publicado sigue intacto."
          action={<LinkButton href="/admin/posts">Volver a los artículos</LinkButton>}
        />
        {/* El detalle técnico va en mono y aparte del mensaje: sirve para
            reportar el caso, no para que lo lea quien sólo quería editar. */}
        <p className="mt-3 text-center">
          <Ident chip>{parsed.error.issues[0]?.message}</Ident>
        </p>
      </div>
    );
  }

  return (
    <PostEditor
      action={updatePost}
      categories={categories}
      templates={templates}
      saveTemplateAction={createTemplateFromBlocks}
      initial={{
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImageUrl: post.coverImageUrl,
        coverImageAlt: post.coverImageAlt,
        categoryId: post.categoryId,
        locale: post.locale,
        seoTitle: post.seoTitle ?? "",
        seoDescription: post.seoDescription ?? "",
        /* El editor lo necesita para saber si "Publicar" es una PRIMERA
           publicación —que saca el artículo a la web— o el guardado de uno que
           ya está publicado, que no cambia su visibilidad. Sólo el primero pide
           confirmación. */
        status: post.status,
        /* La conversión a la zona de la operación se hace ACÁ, en el servidor.
           En el cliente daría la zona del navegador de quien edita, y entonces
           la hora que se ve al abrir no sería la que se guardó. */
        publishedAt: toEditorDateTime(post.publishedAt),
        isScheduled: displayStatus(post) === "SCHEDULED",
        /* La guarda de concurrencia. El editor la reenvía tal cual y el servidor
           la compara antes de escribir: si otra pestaña guardó en el medio, el
           submit se rechaza en vez de pisar ese trabajo. */
        updatedAt: post.updatedAt.toISOString(),
        blocks: parsed.data,
      }}
    />
  );
}
