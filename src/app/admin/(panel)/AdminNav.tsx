"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconArticles,
  IconCategories,
  IconHome,
  IconTemplates,
} from "@/components/admin/ui/icons";

const LINKS = [
  { href: "/admin", label: "Inicio", Icon: IconHome },
  { href: "/admin/posts", label: "Artículos", Icon: IconArticles },
  { href: "/admin/categories", label: "Categorías", Icon: IconCategories },
  { href: "/admin/templates", label: "Plantillas", Icon: IconTemplates },
] as const;

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones del panel"
      /* En el riel es una columna; en pantallas chicas se acuesta y envuelve.
         Nada de desplazamiento horizontal: una sección que queda fuera del
         borde no existe para quien no adivina que hay que arrastrar. */
      className="flex flex-wrap gap-1 lg:flex-col lg:flex-nowrap"
    >
      {LINKS.map(({ href, label, Icon }) => {
        /* "/admin" solo es exacto; el resto marca activo también en sus
           subrutas, para que editar un artículo mantenga iluminada su sección. */
        const isActive = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className="cq-rail-link shrink-0"
          >
            <Icon size={17} className="shrink-0 opacity-90" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
