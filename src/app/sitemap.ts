import { execFileSync } from "node:child_process";
import type { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/i18n/config";
import { getAllPublishedPosts } from "@/lib/posts";
// Careers fuera de alcance: la carpeta es privada (_careers, no enrutable). Descomentar este import y las rutas /careers de abajo al republicar.
// import { ACTIVE_POSITIONS } from "./[lang]/_careers/data/positions";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://centerquest.example").replace(/\/$/, "");

// "sources" alimenta el lastmod (última fecha de commit de esos paths); si un componente no se declara, su fecha queda congelada en la última vez que se tocó page.tsx. /services y el catch-all quedan fuera a propósito.
const ROUTES: ReadonlyArray<{ path: string; sources: readonly string[] }> = [
  {
    path: "",
    sources: [
      "src/app/[lang]/page.tsx",
      "src/components/hero",
      "src/components/HeroImage.tsx",
      "src/components/about",
      "src/components/services-carousel",
    ],
  },
  { path: "/services/call-center", sources: ["src/app/[lang]/services/call-center"] },
  { path: "/services/operations", sources: ["src/app/[lang]/services/operations"] },
  { path: "/services/systems", sources: ["src/app/[lang]/services/systems"] },
  { path: "/services/systems/work", sources: ["src/app/[lang]/services/systems/work"] },
  { path: "/team", sources: ["src/app/[lang]/team"] },
  // { path: "/careers", sources: ["src/app/[lang]/_careers"] },
  // { path: "/careers/apply", sources: ["src/app/[lang]/_careers/apply"] },
  // Cada vacante es su propia página con datos estructurados JobPosting, derivada del mismo array que el listado: una requisición retirada (active: false) sale del sitemap con ella.
  // ...ACTIVE_POSITIONS.map((position) => ({
  //   path: `/careers/${position.slug}`,
  //   sources: ["src/app/[lang]/_careers/data/positions.ts"],
  // })),
  // El listado del blog existe en los dos idiomas y mantiene su clúster hreflang; los artículos individuales no.
  { path: "/blog", sources: ["src/app/[lang]/blog", "src/components/blog"] },
  { path: "/quote", sources: ["src/app/[lang]/quote"] },
  {
    path: "/location",
    sources: ["src/app/[lang]/location", "src/components/about/locationData.ts"],
  },
  // Es indexable (robots: index) y no estaba listada; Google solo podía llegar por enlace interno.
  { path: "/partnerships/mindware-labs", sources: ["src/app/[lang]/partnerships"] },
  { path: "/legal/terms", sources: ["src/app/[lang]/legal/terms"] },
  { path: "/legal/privacy", sources: ["src/app/[lang]/legal/privacy"] },
];

// Google ignora lastmod en cuanto lo pilla mintiendo, así que la alternativa a un dato real es omitirlo, no new Date(). Sin git en el build, devuelve undefined y la etiqueta no se emite.
function lastCommit(paths: readonly string[]): Date | undefined {
  try {
    const stdout = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", ...paths],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    if (!stdout) return undefined;
    const date = new Date(stdout);
    return Number.isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
}

// Se recalcula cada hora y no en cada request: publicar un artículo no justifica una consulta por cada visita del rastreador.
export const revalidate = 3600;

// force-dynamic: sin esto Next prerenderiza en build y el deploy entero falla si la base no está disponible (ya pasó). El sitemap es contenido, no código.
export const dynamic = "force-dynamic";

// Los artículos se leen de la base y no del historial de git (SEO-1): son contenido editorial, no código versionado.
async function postEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const byLocale = await Promise.all(
      locales.map(async (locale) => {
        // Sin recorte: el listado del blog pagina pero el sitemap no, para no esconderle a Google justo lo que existe para mostrarle.
        const posts = await getAllPublishedPosts(locale);
        return posts.map((post) => ({
          url: `${SITE_URL}/${locale}/blog/${post.slug}`,
          lastModified: post.updatedAt,
          // Sin alternates: un artículo vive en un solo idioma; declarar hreflang hacia una URL con otro contenido es peor que no declarar ninguno.
        }));
      }),
    );
    return byLocale.flat();
  } catch (error) {
    // Si la base falla, se sirve el sitemap con solo las rutas estáticas en vez de un 500: incompleto se corrige en la próxima revalidación, pero un 500 le enseña a Google que la URL está rota.
    console.error("No se pudieron leer los artículos para el sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = ROUTES.map(({ path, sources }) => ({
    url: `${SITE_URL}/${defaultLocale}${path}`,
    lastModified: lastCommit(sources),
    alternates: {
      languages: {
        ...Object.fromEntries(locales.map((locale) => [locale, `${SITE_URL}/${locale}${path}`])),
        // Debe estar en sincronía con el x-default de src/i18n/alternates.ts: si el hreflang del sitemap no cuadra con el HTML, Google lo descarta.
        "x-default": `${SITE_URL}/${defaultLocale}${path}`,
      },
    },
  }));

  return [...staticEntries, ...(await postEntries())];
}

// Sin priority ni changefreq: Google confirmó que los ignora por completo; emitirlos solo añade ruido que mantener.
