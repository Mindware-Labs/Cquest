import AboutSection from "@/components/about/AboutSection";
import type { BlogTeaser } from "@/components/about/BlogSection";
import HeroImage from "@/components/HeroImage";
import ServicesCarousel from "@/components/services-carousel/ServicesCarousel";
import { listCategoriesInUse, listPublishedPosts } from "@/lib/blog";

/* La portada del blog sale de la base: totalmente estático la dejaría congelada
   en el build hasta el siguiente despliegue. */
export const revalidate = 3600;

export default async function Home() {
  const [posts, categories] = await Promise.all([listPublishedPosts(), listCategoriesInUse()]);
  const first = posts[0];

  const teaser: BlogTeaser = {
    latest: first
      ? {
          slug: first.slug,
          title: first.title,
          coverUrl: first.coverUrl,
          coverAlt: first.coverAlt,
          categoryName: first.categoryName,
          publishedAt: first.publishedAt,
          readingMinutes: first.readingMinutes,
        }
      : null,
    postCount: posts.length,
    categoryCount: categories.length,
  };

  return (
    <>
      <HeroImage />
      <ServicesCarousel />
      <AboutSection teaser={teaser} />
    </>
  );
}
