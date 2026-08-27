import Image from "next/image";
import Link from "next/link";
import type { PublicArticle, PublicPost } from "@/lib/blog";
import { withHeadingIds } from "@/lib/toc";
import ArticleToc from "./ArticleToc";
import styles from "./Article.module.css";

/* El cuerpo del artículo, compartido por la página pública y la vista previa
   del panel: si cada una lo pintara por su cuenta, la previa dejaría de
   parecerse a lo que se publica en cuanto una de las dos cambiara. */

const dateFormat = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Santo_Domingo",
});

export default function ArticleView({
  article,
  siblings,
  banner,
}: {
  article: PublicArticle;
  siblings: PublicPost[];
  banner?: React.ReactNode;
}) {
  // Un índice de una sola entrada no orienta: ocupa columna sin decir nada.
  const { html, toc } = withHeadingIds(article.contentHtml ?? "");
  const showToc = toc.length > 1;

  return (
    <>
      {banner}

      <div className={styles.shell}>
        <header className={styles.header}>
          <Link className={styles.back} href="/blog">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M9.8 3.6 5.4 8l4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Blog
          </Link>

          <div className={styles.meta}>
            {article.categoryName && (
              <>
                <span className={styles.metaCategory}>{article.categoryName}</span>
                <span className={styles.metaDot} aria-hidden="true" />
              </>
            )}
            <time dateTime={article.publishedAt}>{dateFormat.format(new Date(article.publishedAt))}</time>
            <span className={styles.metaDot} aria-hidden="true" />
            <span>{article.readingMinutes} min read</span>
          </div>

          <h1 className={styles.title}>{article.title}</h1>
          {article.excerpt && <p className={styles.excerpt}>{article.excerpt}</p>}
        </header>

        {article.coverUrl && (
          <div className={styles.cover}>
            <Image
              src={article.coverUrl}
              alt={article.coverAlt ?? ""}
              fill
              sizes="(max-width: 72rem) 100vw, 72rem"
              priority
            />
          </div>
        )}

        <div className={styles.layout}>
          <div className={styles.main}>
            {/* Saneado en el servidor al publicar, no aquí: el HTML guardado ya es seguro. */}
            <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />

            <div className={styles.foot}>
              <p className={styles.footNote}>
                Running an operation that needs this kind of work? We can help.
              </p>
              <Link className={styles.footCta} href="/quote">
                Request a quote
              </Link>
            </div>
          </div>

          {(showToc || siblings.length > 0) && (
            <aside className={styles.aside}>
              {showToc && <ArticleToc entries={toc} label="In this article" />}

              {siblings.length > 0 && (
                <section>
                  <h2 className={styles.asideTitle}>
                    {article.categoryName ? `More in ${article.categoryName}` : "Keep reading"}
                  </h2>
                  <ul className={styles.moreList}>
                    {siblings.map((entry) => (
                      <li key={entry.slug}>
                        <Link className={styles.moreItem} href={`/blog/${entry.slug}`}>
                          <span className={styles.moreItemMeta}>
                            <time dateTime={entry.publishedAt}>
                              {dateFormat.format(new Date(entry.publishedAt))}
                            </time>
                            <span className={styles.metaDot} aria-hidden="true" />
                            <span>{entry.readingMinutes} min</span>
                          </span>
                          <span className={styles.moreItemTitle}>{entry.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </aside>
          )}
        </div>
      </div>
    </>
  );
}
