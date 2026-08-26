import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import { listCategoriesInUse, listPublishedPosts, type PublicPost } from "@/lib/blog";
import { simplePageGraph } from "@/lib/schema";
import styles from "./BlogIndex.module.css";

const TITLE = "Blog | Center Quest";
const DESCRIPTION =
  "Notes on running contact centre, back office and systems work: what we measure, what we automate, and what we learned doing it.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: localeAlternates(lang, "/blog"),
    openGraph: { title: TITLE, description: DESCRIPTION, type: "website" },
    twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  };
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Santo_Domingo",
});

function ImageMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <rect x="2.2" y="3.2" width="11.6" height="9.6" />
      <path d="m2.2 10.6 3-2.6 3.2 2.8 2.4-2 3 2.4" strokeLinejoin="round" />
      <circle cx="5.8" cy="6.2" r="0.9" />
    </svg>
  );
}

function Entry({ post, shape, base }: { post: PublicPost; shape: "lead" | "grid"; base: string }) {
  return (
    <Link className={styles.entry} data-shape={shape} href={`${base}/${post.slug}`}>
      <div className={styles.cover}>
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt={post.coverAlt ?? ""}
            fill
            sizes={shape === "lead" ? "(max-width: 64rem) 100vw, 40vw" : "(max-width: 64rem) 100vw, 25vw"}
          />
        ) : (
          <span className={styles.coverEmpty}>
            <ImageMark />
          </span>
        )}
      </div>

      <div className={styles.body}>
        <span className={styles.meta}>
          {post.categoryName && (
            <>
              <span className={styles.metaCategory}>{post.categoryName}</span>
              <span className={styles.metaDot} aria-hidden="true" />
            </>
          )}
          <time dateTime={post.publishedAt}>{dateFormat.format(new Date(post.publishedAt))}</time>
          <span className={styles.metaDot} aria-hidden="true" />
          <span>{post.readingMinutes} min read</span>
        </span>

        <h2 className={styles.title}>{post.title}</h2>
        {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
        {post.authorName && <p className={styles.byline}>By {post.authorName}</p>}
      </div>
    </Link>
  );
}

export default async function BlogIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const lang = await resolveLang(params);
  const { category } = await searchParams;

  /* Una sola lectura: la columna lateral necesita lo último sin filtrar, y
     filtrar en memoria sale más barato que repetir la consulta. */
  const [all, categories] = await Promise.all([listPublishedPosts(), listCategoriesInUse()]);
  const posts = category ? all.filter((entry) => entry.categorySlug === category) : all;
  const latest = all.slice(0, 4);

  /* La forma cambia con el conteo: uno solo va horizontal a todo el ancho, dos
     en dos columnas, y a partir de tres uno encabeza y el resto va en rejilla. */
  const [lead, ...rest] = posts;
  const shape = posts.length === 0 ? "empty" : posts.length === 1 ? "1" : posts.length === 2 ? "2" : "many";
  const base = `/${lang}/blog`;

  return (
    <div className={styles.page}>
      <JsonLd
        data={simplePageGraph("WebPage", lang, "/blog", TITLE, DESCRIPTION, [
          { name: "Center Quest", path: "" },
          { name: "Blog", path: "/blog" },
        ])}
      />

      <div className={styles.inner}>
        <header>
          <span className={styles.eyebrow}>Blog</span>
          <h1 className={styles.headline}>Notes from the operation</h1>
          <p className={styles.lead}>{DESCRIPTION}</p>
        </header>

        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            {categories.length > 0 && (
              <nav aria-label="Filter by category">
                <span className={styles.sidebarTitle}>Topics</span>
                <ul className={styles.topicList}>
                  <li>
                    <Link
                      className={styles.topic}
                      href={base}
                      aria-current={!category ? "page" : undefined}
                    >
                      All
                      <span className={styles.topicCount}>{all.length}</span>
                    </Link>
                  </li>
                  {categories.map((entry) => (
                    <li key={entry.slug}>
                      <Link
                        className={styles.topic}
                        href={`${base}?category=${entry.slug}`}
                        aria-current={category === entry.slug ? "page" : undefined}
                      >
                        {entry.name}
                        <span className={styles.topicCount}>{entry.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {latest.length > 0 && (
              <section className={styles.latest}>
                <span className={styles.sidebarTitle}>Latest</span>
                <ul className={styles.latestList}>
                  {latest.map((entry) => (
                    <li key={entry.slug}>
                      <Link className={styles.latestItem} href={`${base}/${entry.slug}`}>
                        <span className={styles.latestMeta}>
                          <time dateTime={entry.publishedAt}>
                            {dateFormat.format(new Date(entry.publishedAt))}
                          </time>
                          <span className={styles.metaDot} aria-hidden="true" />
                          <span>{entry.readingMinutes} min</span>
                        </span>
                        <span className={styles.latestTitle}>{entry.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className={styles.pitch}>
              <p className={styles.pitchText}>
                Running an operation that needs this kind of work? Tell us what you are
                measuring and we will tell you what it takes.
              </p>
              <Link className={styles.pitchCta} href={`/${lang}/quote`}>
                Request a quote
              </Link>
            </section>
          </aside>

          <div className={styles.main}>
            {shape === "empty" ? (
              <div className={styles.empty}>
                <span className={styles.emptyMark} aria-hidden="true">
                  <ImageMark />
                </span>
                <h2 className={styles.emptyTitle}>
                  {category ? "Nothing filed under that yet" : "The first piece is on its way"}
                </h2>
                <p className={styles.emptyText}>
                  {category
                    ? "That category has no published articles right now. The rest of the blog is one click away."
                    : "We write about what we actually run: service levels, back-office throughput, and the systems we build around them. Until the first one lands, our work speaks for us."}
                </p>
                <Link className={styles.emptyCta} href={category ? base : `/${lang}/quote`}>
                  {category ? "See all articles" : "Request a quote"}
                </Link>
              </div>
            ) : (
              <>
                <div className={styles.list} data-count={shape}>
                  {shape === "many" ? (
                    <Entry post={lead} shape="lead" base={base} />
                  ) : (
                    posts.map((entry) => (
                      <Entry
                        key={entry.slug}
                        post={entry}
                        shape={posts.length === 1 ? "lead" : "grid"}
                        base={base}
                      />
                    ))
                  )}
                </div>

                {shape === "many" && (
                  <div className={styles.rest}>
                    {rest.map((entry) => (
                      <Entry key={entry.slug} post={entry} shape="grid" base={base} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
