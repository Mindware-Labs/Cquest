import type { Metadata } from "next";
import type { Locale } from "@/i18n/config";
import { localeAlternates } from "@/i18n/alternates";
import { resolveLang } from "@/i18n/resolveLangParam";
import { getPublishedCategories, getPublishedPosts } from "@/lib/posts";
import PostCard from "@/components/blog/PostCard";
import CategoryFilter from "@/components/blog/CategoryFilter";

const TITLE: Record<Locale, string> = {
  en: "Blog | Center Quest",
  es: "Blog | Center Quest",
};

const DESCRIPTION: Record<Locale, string> = {
  en: "Notes from the operation: call center, BPO and systems development for companies in the Dominican Republic and the United States.",
  es: "Notas desde la operación: call center, BPO y desarrollo de sistemas para empresas en República Dominicana y Estados Unidos.",
};

const COPY: Record<Locale, { eyebrow: string; heading: string; empty: string; emptyFiltered: string }> = {
  en: {
    eyebrow: "Center Quest",
    heading: "Blog",
    empty: "No articles published yet.",
    emptyFiltered: "No articles in this category yet.",
  },
  es: {
    eyebrow: "Center Quest",
    heading: "Blog",
    empty: "Todavía no hay artículos publicados.",
    emptyFiltered: "Todavía no hay artículos en esta categoría.",
  },
};

type Params = Promise<{ lang: string }>;
type Search = Promise<{ categoria?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const lang = await resolveLang(params);
  return {
    title: TITLE[lang],
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/blog"),
    openGraph: { title: TITLE[lang], description: DESCRIPTION[lang], type: "website" },
  };
}

export default async function BlogIndexPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const lang = await resolveLang(params);
  const { categoria } = await searchParams;

  const [categories, posts] = await Promise.all([
    getPublishedCategories(lang),
    getPublishedPosts(lang, categoria),
  ]);

  /* Un slug inexistente en la URL no es un error: se ignora y el filtro vuelve
     a "Todos", en vez de dejar la interfaz marcando algo que no existe. */
  const activeSlug = categories.some((category) => category.slug === categoria)
    ? (categoria ?? null)
    : null;

  const copy = COPY[lang];

  return (
    <div className="mx-auto w-full max-w-[72rem] px-5 pb-28 pt-32 sm:px-8 sm:pt-36">
      <header className="border-b border-border pb-10">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-petroleo">
          {copy.eyebrow}
        </p>
        <h1 className="mt-3 font-heading text-[clamp(2.1rem,4.5vw,3.1rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-foreground">
          {copy.heading}
        </h1>
        <p className="mt-4 max-w-[42rem] text-pretty text-[1.02rem] leading-[1.75] text-[var(--text-secondary)]">
          {DESCRIPTION[lang]}
        </p>

        <CategoryFilter categories={categories} activeSlug={activeSlug} lang={lang} />
      </header>

      {posts.length === 0 ? (
        <p className="py-20 text-center text-[0.95rem] text-[var(--text-tertiary)]">
          {activeSlug ? copy.emptyFiltered : copy.empty}
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
