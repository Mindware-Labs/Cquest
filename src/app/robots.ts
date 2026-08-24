import type { MetadataRoute } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://centerquest.example").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    // No es seguridad (eso lo hace el guard de sesión): sólo evita gastar presupuesto de rastreo en /admin y en previas que ya llevan noindex pero podrían filtrarse por un enlace suelto.
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/*/blog/*/preview"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
