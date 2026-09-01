import { execFileSync } from "node:child_process";
import type { MetadataRoute } from "next";
import { listPublishedSlugs } from "@/lib/blog";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://centerquest.example").replace(/\/$/, "");

/* Cada ruta canónica indexable, con los archivos que REALMENTE la componen.
   La segunda mitad no es decorativa: el `lastmod` sale de la última fecha de
   commit de esos paths, así que una home cuyo copy vive en components/about
   tiene que declararlo o su fecha se quedaría congelada en el día que se tocó
   page.tsx por última vez.

   Fuera del sitemap a propósito: /services (redirige a /#services) y el
   catch-all (404). Un sitemap solo lleva URLs canónicas e indexables. */
const ROUTES: ReadonlyArray<{ path: string; sources: readonly string[] }> = [
  {
    path: "",
    sources: [
      "src/app/(site)/page.tsx",
      "src/components/hero",
      "src/components/HeroImage.tsx",
      "src/components/about",
      "src/components/services-carousel",
    ],
  },
  { path: "/services/call-center", sources: ["src/app/(site)/services/call-center"] },
  { path: "/services/operations", sources: ["src/app/(site)/services/operations"] },
  { path: "/services/systems", sources: ["src/app/(site)/services/systems"] },
  { path: "/services/systems/work", sources: ["src/app/(site)/services/systems/work"] },
  { path: "/team", sources: ["src/app/(site)/team"] },
  { path: "/join-us", sources: ["src/app/(site)/join-us", "src/lib/vacancies.ts"] },
  { path: "/join-us/apply", sources: ["src/app/(site)/join-us/apply"] },
  { path: "/quote", sources: ["src/app/(site)/quote"] },
  {
    path: "/location",
    sources: ["src/app/(site)/location", "src/components/about/locationData.ts"],
  },
  /* Es indexable (robots: index en su generateMetadata) y hasta ahora no
     estaba listada: Google solo podía llegar por enlace interno. */
  { path: "/partnerships/mindware-labs", sources: ["src/app/(site)/partnerships"] },
  { path: "/blog", sources: ["src/app/(site)/blog"] },
  { path: "/legal/terms", sources: ["src/app/(site)/legal/terms"] },
  { path: "/legal/privacy", sources: ["src/app/(site)/legal/privacy"] },
];

/* Fecha real del último commit que tocó esos paths. Google ignora `lastmod`
   en cuanto lo pilla mintiendo, así que la alternativa a un dato de verdad no
   es `new Date()` — es omitirlo. Si no hay git en el build (checkout sin .git,
   tarball), esto devuelve undefined y la etiqueta simplemente no se emite. */
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

function entry(path: string, lastModified: Date | undefined): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${path === "" ? "/" : path}`,
    lastModified,
  };
}

/* Los artículos vienen de la base: estático dejaría fuera todo lo publicado
   después del build, hasta el siguiente despliegue. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics = ROUTES.map(({ path, sources }) => entry(path, lastCommit(sources)));

  /* Los artículos no salen de git sino de la base, así que su lastmod es el
     updatedAt real de la fila y no la fecha del commit que tocó la plantilla. */
  const articles = (await listPublishedSlugs()).map((row) =>
    entry(`/blog/${row.slug}`, row.updatedAt),
  );

  return [...statics, ...articles];
}

/* Sin `priority` ni `changefreq`: Google confirmó hace años que los ignora por
   completo. Emitirlos solo añade ruido que hay que mantener sincronizado. */
