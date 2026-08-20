import Link from "next/link";
import { getCategories } from "@/lib/categories";
import { createPost } from "@/lib/posts";
import { createTemplateFromBlocks } from "@/lib/templates";
import { getTemplateChoices } from "@/lib/templateChoices";
import PostEditor from "@/components/admin/PostEditor";

export default async function NewPostPage() {
  const [categories, templates] = await Promise.all([getCategories(), getTemplateChoices()]);

  /* Sin categorías no hay artículo posible: categoryId es obligatorio en el
     schema. Mejor decirlo acá que dejar que el formulario falle al guardar. */
  if (categories.length === 0) {
    return (
      <div className="pt-10">
        <h1 className="font-heading text-[1.6rem] font-semibold tracking-[-0.02em] text-foreground">
          Nuevo artículo
        </h1>
        <p className="mt-3 text-[0.92rem] leading-relaxed text-[var(--text-secondary)]">
          Primero creá al menos una{" "}
          <Link
            href="/admin/categories"
            className="font-semibold text-petroleo underline underline-offset-2"
          >
            categoría
          </Link>
          .
        </p>
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
