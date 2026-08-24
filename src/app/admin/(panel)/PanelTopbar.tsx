"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { IconExternal, IconPanelLeft } from "@/components/admin/ui/icons";
import PanelUserMenu from "./PanelUserMenu";

// Mapa y no transformación automática del slug: mostrar el slug crudo en la miga filtraría la URL a la interfaz.
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
    // Los ids no son navegación (no tienen pantalla propia): se saltean y la miga queda "Inicio / Artículos / Editar".
    const label = SEGMENTS[part];
    if (!label) continue;
    crumbs.push({ label, href });
  }

  return crumbs;
}

// Tiene dos trabajos: manejar el ancho del riel y decir dónde estás; por eso el botón de plegar vive acá y no duplicado en el riel.
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
        // Solo en escritorio: en móvil el riel se abre encima y ese control ya está en su propia cabecera.
        className="cq-topbar-btn hidden lg:inline-flex"
      >
        <IconPanelLeft size={18} />
      </button>

      <nav aria-label="Ruta" className="min-w-0 flex-1">
        <ol className="cq-body flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {crumbs.map((crumb, index) => {
            const isLast = crumb === current;
            return (
              <Fragment key={crumb.href}>
                {index > 0 && (
                  <li aria-hidden="true" className="text-[var(--p-line-strong)]">
                    /
                  </li>
                )}
                <li className="min-w-0">
                  {isLast ? (
                    // El último no es enlace porque llevaría a la página en la que ya estás; aria-current lo indica para el lector.
                    <span
                      aria-current="page"
                      className="block truncate font-semibold text-foreground"
                    >
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="block truncate text-[var(--p-ink-muted)] transition-colors hover:text-[var(--p-ink)]"
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
