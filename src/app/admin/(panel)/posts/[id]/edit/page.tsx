import { notFound } from "next/navigation";
import { getCategories } from "@/lib/categories";
import { getPostById, updatePost } from "@/lib/posts";
import { createTemplateFromBlocks } from "@/lib/templates";
import { getTemplateChoices } from "@/lib/templateChoices";
import { blockArraySchema } from "@/lib/blocks";
import PostEditor from "@/components/admin/PostEditor";

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
      <div className="pt-10">
        <h1 className="font-heading text-[1.6rem] font-semibold tracking-[-0.02em] text-foreground">
          Editar artículo
        </h1>
        <p className="mt-3 max-w-[42rem] rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[0.88rem] leading-relaxed text-red-700">
          El contenido de este artículo no coincide con el formato de bloques
          actual, así que el editor no lo abre para no sobrescribirlo. Detalle:{" "}
          {parsed.error.issues[0]?.message}
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
        blocks: parsed.data,
      }}
    />
  );
}
