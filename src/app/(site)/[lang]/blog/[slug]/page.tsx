import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import { getPublishedPost, listPublishedPosts } from "@/lib/blog";
import { seoDescriptionFor, seoTitleFor } from "@/lib/seo";
import { withHeadingIds } from "@/lib/toc";
import { ORG_ID, SITE_URL, graph } from "@/lib/schema";
import ArticleToc from "./ArticleToc";
import styles from "./Article.module.css";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Santo_Domingo",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const lang = await resolveLang(params);
  const { slug } = await params;
  const article = await getPublishedPost(slug);
  if (!article) return { title: "Not found | Center Quest", robots: { index: false } };

  const title = seoTitleFor(article.title, article.seoTitle);
  const description = seoDescriptionFor(article.excerpt, article.seoDescription);

  return {
    title,
    description,
    alternates: localeAlternates(lang, `/blog/${slug}`),
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: article.publishedAt,
      images: article.coverUrl ? [{ url: article.coverUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: article.coverUrl ? [article.coverUrl] : undefined,
    },
  };
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase();
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const lang = await resolveLang(params);
  const { slug } = await params;

  const article = await getPublishedPost(slug);
  if (!article) notFound();

  const siblings = (await listPublishedPosts(article.categorySlug ?? undefined))
    .filter((entry) => entry.slug !== slug)
    .slice(0, 3);

  const url = `${SITE_URL}/${lang}/blog/${slug}`;

  // Un índice de una sola entrada no orienta: ocupa columna sin decir nada.
  const { html, toc } = withHeadingIds(article.contentHtml ?? "");
  const showToc = toc.length > 1;

  return (
    <article className={styles.page}>
      <JsonLd
        data={graph({
          "@type": "BlogPosting",
          "@id": `${url}#article`,
          headline: article.title,
          description: seoDescriptionFor(article.excerpt, article.seoDescription),
          datePublished: article.publishedAt,
          image: article.coverUrl ?? undefined,
          author: article.authorName
            ? { "@type": "Person", name: article.authorName }
            : { "@id": ORG_ID },
          publisher: { "@id": ORG_ID },
          mainEntityOfPage: url,
          articleSection: article.categoryName ?? undefined,
        })}
      />

      <div className={styles.shell}>
        <header className={styles.header}>
          <Link className={styles.back} href={`/${lang}/blog`}>
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

          {article.authorName && (
            <div className={styles.byline}>
              <span className={styles.avatar} aria-hidden="true">
                {initials(article.authorName)}
              </span>
              <span>By {article.authorName}</span>
            </div>
          )}
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
              <Link className={styles.footCta} href={`/${lang}/quote`}>
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
                        <Link className={styles.moreItem} href={`/${lang}/blog/${entry.slug}`}>
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
    </article>
  );
}
