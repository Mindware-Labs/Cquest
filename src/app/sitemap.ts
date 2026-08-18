import { execFileSync } from "node:child_process";
import type { MetadataRoute } from "next";
import { locales, defaultLocale } from "@/i18n/config";
// Careers está fuera del alcance de esta entrega: la sección vive en
// src/app/[lang]/_careers (carpeta privada, no enrutable). Descomentar este
// import y las rutas /careers de abajo cuando se vuelva a publicar.
// import { ACTIVE_POSITIONS } from "./[lang]/_careers/data/positions";

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
  /* Cada vacante abierta es su propia página indexable con datos estructurados
     JobPosting — derivada del mismo array que renderiza el listado, así que
     una requisición retirada (active: false) sale del sitemap con ella. */
  // ...ACTIVE_POSITIONS.map((position) => ({
  //   path: `/careers/${position.slug}`,
  //   sources: ["src/app/[lang]/_careers/data/positions.ts"],
  // })),
  { path: "/quote", sources: ["src/app/[lang]/quote"] },
  {
    path: "/location",
    sources: ["src/app/[lang]/location", "src/components/about/locationData.ts"],
  },
  /* Es indexable (robots: index en su generateMetadata) y hasta ahora no
     estaba listada: Google solo podía llegar por enlace interno. */
  { path: "/partnerships/mindware-labs", sources: ["src/app/[lang]/partnerships"] },
  { path: "/legal/terms", sources: ["src/app/[lang]/legal/terms"] },
  { path: "/legal/privacy", sources: ["src/app/[lang]/legal/privacy"] },
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

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(({ path, sources }) => ({
    url: `${SITE_URL}/${defaultLocale}${path}`,
    lastModified: lastCommit(sources),
    alternates: {
      languages: {
        ...Object.fromEntries(locales.map((locale) => [locale, `${SITE_URL}/${locale}${path}`])),
        /* En sincronía con el x-default de src/i18n/alternates.ts: si el clúster
           hreflang del sitemap no cuadra con los <link> del HTML, Google lo descarta. */
        "x-default": `${SITE_URL}/${defaultLocale}${path}`,
      },
    },
  }));
}

/* Sin `priority` ni `changefreq`: Google confirmó hace años que los ignora por
   completo. Emitirlos solo añade ruido que hay que mantener sincronizado. */
