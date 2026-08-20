"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Inicio" },
  { href: "/admin/posts", label: "Artículos" },
  { href: "/admin/categories", label: "Categorías" },
  { href: "/admin/templates", label: "Plantillas" },
] as const;

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones del panel" className="flex gap-1 border-b border-border py-3">
      {LINKS.map((link) => {
        /* "/admin" solo es exacto; el resto marca activo también en sus
           subrutas, para que editar un artículo mantenga iluminada su sección. */
        const isActive =
          link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-[0.85rem] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo ${
              isActive
                ? "bg-petroleo text-white"
                : "text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
