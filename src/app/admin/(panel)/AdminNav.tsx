"use client";

import { usePathname } from "next/navigation";
import { SidebarGroupLabel, SidebarLink } from "@/components/ui/sidebar";
import {
  IconArticles,
  IconCategories,
  IconHome,
  IconTemplates,
} from "@/components/admin/ui/icons";

/* Dos grupos y no una lista de cuatro: "Inicio" es a dónde se vuelve, y los
   otros tres son las cosas que se editan. Con cuatro enlaces la diferencia es
   chica; el día que sean ocho, ya está el lugar donde ponerlos. */
const GROUPS = [
  {
    title: "General",
    links: [{ href: "/admin", label: "Inicio", Icon: IconHome }],
  },
  {
    title: "Contenido",
    links: [
      { href: "/admin/posts", label: "Artículos", Icon: IconArticles },
      { href: "/admin/categories", label: "Categorías", Icon: IconCategories },
      { href: "/admin/templates", label: "Plantillas", Icon: IconTemplates },
    ],
  },
] as const;

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones del panel" className="flex flex-col gap-5">
      {GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-1.5">
          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>

          <div className="flex flex-col gap-1">
            {group.links.map(({ href, label, Icon }) => (
              <SidebarLink
                key={href}
                /* "/admin" solo es exacto; el resto marca activo también en sus
                   subrutas, para que editar un artículo mantenga iluminada su
                   sección. */
                active={href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)}
                link={{ href, label, icon: <Icon size={17} /> }}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
