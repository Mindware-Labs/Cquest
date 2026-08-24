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

  // Si el contenido no valida contra el schema actual, abrir el editor vacío borraría el artículo al guardar; mejor avisar y no tocar nada.
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
        {/* Detalle técnico en mono y aparte: sirve para reportar el caso, no para quien sólo quería editar. */}
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
        // El editor lo necesita para saber si "Publicar" es una primera publicación (pide confirmación) o el guardado de uno ya publicado.
        status: post.status,
        // Conversión a la zona de la operación hecha en el servidor: en el cliente daría la zona del navegador de quien edita.
        publishedAt: toEditorDateTime(post.publishedAt),
        isScheduled: displayStatus(post) === "SCHEDULED",
        // Guarda de concurrencia: el servidor la compara antes de escribir y rechaza el submit si otra pestaña guardó en el medio.
        updatedAt: post.updatedAt.toISOString(),
        blocks: parsed.data,
      }}
    />
  );
}
