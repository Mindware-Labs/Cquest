import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostForPreview, listPublishedPosts } from "@/lib/blog";
import { renderBlocks } from "@/lib/renderBlocks";
import ArticleView from "../ArticleView";
import styles from "../Article.module.css";
import banner from "./preview.module.css";

/* Nunca indexable: enseña borradores. Aun así el acceso lo corta el guard de
   admin en la consulta, no esta etiqueta. */
export const metadata: Metadata = {
  title: "Vista previa · Panel Center Quest",
  robots: { index: false, follow: false },
};

const STATUS: Record<string, string> = {
  draft: "Borrador sin publicar",
  hidden: "Oculto en el blog",
  published: "Publicado",
};

export default async function ArticlePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await getPostForPreview(slug);
  if (!article) notFound();

  /* Los relacionados salen del blog real, no del borrador: es lo que vería el
     lector, y el artículo en previa todavía no está entre ellos. */
  const siblings = (await listPublishedPosts(article.categorySlug ?? undefined))
    .filter((entry) => entry.slug !== slug)
    .slice(0, 3);

  // El snapshot HTML solo existe tras publicar: en previa se arma al vuelo.
  const rendered = { ...article, contentHtml: await renderBlocks(article.content ?? []) };

  return (
    <article className={styles.page}>
      <ArticleView
        article={rendered}
        siblings={siblings}
        banner={
          <div className={banner.bar} role="status">
            <div className={banner.inner}>
              <span className={banner.tag}>Vista previa</span>
              <p className={banner.text}>
                {article.scheduled ? "Programado, aún no visible" : STATUS[article.status]}. Así se verá el
                artículo. Nadie más puede abrir esta página.
              </p>
              <Link className={banner.action} href="/admin/posts">
                Volver al panel
              </Link>
            </div>
          </div>
        }
      />
    </article>
  );
}
