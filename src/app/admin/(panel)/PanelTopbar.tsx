"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { IconExternal, IconPanelLeft } from "@/components/admin/ui/icons";
import PanelUserMenu from "./PanelUserMenu";

/* El nombre legible de cada segmento de ruta. Un mapa y no una transformación
   automática del slug: "posts" no se convierte solo en "Artículos", y mostrar el
   slug crudo en una miga sería filtrar la URL a la interfaz. */
const SEGMENTS: Record<string, string> = {
  admin: "Inicio",
  posts: "Artículos",
  categories: "Categorías",
  templates: "Plantillas",
  new: "Nuevo",
  edit: "Editar",
};

type Crumb = { label: string; href: string };

function buildCrumbs(pathname: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];
  let href = "";

  for (const part of parts) {
    href += `/${part}`;
    /* Los identificadores no son navegación: en /admin/posts/<id>/edit, el id no
       tiene nombre que mostrar ni pantalla propia a la que ir. Se saltea y la
       miga queda "Inicio / Artículos / Editar", que es lo que el que opera
       necesita saber. */
    const label = SEGMENTS[part];
    if (!label) continue;
    crumbs.push({ label, href });
  }

  return crumbs;
}

/* La barra superior del panel. Tiene dos trabajos y nada más: manejar el ancho
   del riel y decir dónde estás. Es el lugar del cromo — por eso el botón de
   plegar vive acá y no duplicado adentro del riel. */
export default function PanelTopbar({
  name,
  email,
  initials,
  logoutAction,
}: {
  name: string;
  email: string;
  initials: string;
  logoutAction: () => void | Promise<void>;
}) {
  const { open, toggle, panelId } = useSidebar();
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);
  const current = crumbs[crumbs.length - 1];

  return (
    <header className="cq-topbar">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Plegar el menú" : "Desplegar el menú"}
        title={open ? "Plegar el menú" : "Desplegar el menú"}
        /* Sólo en escritorio: en móvil el riel no se angosta, se abre encima, y
           ese control ya está en la cabecera del propio riel. */
        className="cq-topbar-btn hidden lg:inline-flex"
      >
        <IconPanelLeft size={18} />
      </button>

      <nav aria-label="Ruta" className="min-w-0 flex-1">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[0.85rem]">
          {crumbs.map((crumb, index) => {
            const isLast = crumb === current;
            return (
              <Fragment key={crumb.href}>
                {index > 0 && (
                  <li aria-hidden="true" className="text-[var(--text-tertiary)]">
                    /
                  </li>
                )}
                <li className="min-w-0">
                  {isLast ? (
                    /* El último no es un enlace: llevaría a la página en la que
                       ya estás. `aria-current` lo dice para el lector. */
                    <span
                      aria-current="page"
                      className="block truncate font-semibold text-foreground"
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="block truncate text-[var(--text-secondary)] transition-colors hover:text-foreground"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              </Fragment>
            );
          })}
        </ol>
      </nav>

      <Link
        href="/es/blog"
        target="_blank"
        rel="noreferrer"
        title="Ver el blog público"
        className="cq-topbar-btn"
      >
        <IconExternal size={17} />
        <span className="sr-only">Ver el blog público</span>
      </Link>

      <PanelUserMenu
        name={name}
        email={email}
        initials={initials}
        logoutAction={logoutAction}
      />
    </header>
  );
}
