import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import { getPublishedPost, listPublishedPosts } from "@/lib/blog";
import { seoDescriptionFor, seoTitleFor } from "@/lib/seo";
import { ORG_ID, SITE_URL, graph } from "@/lib/schema";
import ArticleView from "./ArticleView";
import styles from "./Article.module.css";

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

      <ArticleView lang={lang} article={article} siblings={siblings} />
    </article>
  );
}
