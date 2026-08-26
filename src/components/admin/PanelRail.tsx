"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import BrandLockup from "./BrandLockup";
import {
  railServerSnapshot,
  railSnapshot,
  subscribeRail,
  toggleRail,
} from "./railState";
import styles from "./PanelRail.module.css";

type Props = { name: string; email: string };

const NAV = [
  { href: "/admin/posts", label: "Artículos", icon: "doc" },
  { href: "/admin/categories", label: "Categorías", icon: "tag" },
  { href: "/admin/users", label: "Usuarios", icon: "people" },
] as const;

function NavIcon({ name }: { name: (typeof NAV)[number]["icon"] }) {
  const common = { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.3 };
  if (name === "doc")
    return (
      <svg {...common} aria-hidden="true">
        <path d="M3.6 2h5.1L12.4 5.7V14H3.6V2Z" strokeLinejoin="round" />
        <path d="M8.6 2v3.8h3.8M5.8 9h4.4M5.8 11.4h3" strokeLinecap="round" />
      </svg>
    );
  if (name === "tag")
    return (
      <svg {...common} aria-hidden="true">
        <path d="M2.4 7.3V2.4h4.9l6.3 6.3-4.9 4.9L2.4 7.3Z" strokeLinejoin="round" />
        <circle cx="5.1" cy="5.1" r="1" />
      </svg>
    );
  return (
    <svg {...common} aria-hidden="true">
      <circle cx="6.2" cy="5.6" r="2.3" />
      <path d="M1.9 13.4c0-2.4 1.9-4 4.3-4s4.3 1.6 4.3 4" strokeLinecap="round" />
      <path d="M10.9 3.7a2.1 2.1 0 0 1 0 4M12 9.8c1.4.5 2.3 1.8 2.3 3.6" strokeLinecap="round" />
    </svg>
  );
}

function FoldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M2.6 2.8v10.4" strokeLinecap="round" />
      <path d="M12.6 5.2 9.4 8l3.2 2.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.4 8h3.6" strokeLinecap="round" />
    </svg>
  );
}

function initials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase();
}

export default function PanelRail({ name, email }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const rail = useSyncExternalStore(subscribeRail, railSnapshot, railServerSnapshot);
  const collapsed = rail === "collapsed";

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleSignOut() {
    if (leaving) return;
    setLeaving(true);
    await authClient.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <div className={styles.topbar}>
        <BrandLockup compact />
        <button
          className={styles.burger}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="panel-rail"
          aria-label={open ? "Cerrar el menú" : "Abrir el menú"}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={styles.scrim} data-open={open} onClick={() => setOpen(false)} aria-hidden="true" />

      <aside id="panel-rail" className={styles.rail} data-open={open}>
        <div className={styles.head}>
          <BrandLockup compact />
          <button
            className={styles.fold}
            type="button"
            onClick={toggleRail}
            aria-expanded={!collapsed}
            aria-controls="panel-rail"
            aria-label={collapsed ? "Expandir el panel lateral" : "Plegar el panel lateral"}
            title={collapsed ? "Expandir" : "Plegar"}
          >
            <FoldIcon />
          </button>
        </div>

        {/* En compacto el rail tapa el contenido: navegar tiene que cerrarlo. */}
        <nav className={styles.nav} aria-label="Secciones del panel">
          <span className={styles.navLabel}>Panel</span>
          <ul className={styles.list}>
            {NAV.map((entry) => {
              const active = pathname.startsWith(entry.href);
              return (
                <li key={entry.href}>
                  <Link
                    className={styles.item}
                    href={entry.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    title={collapsed ? entry.label : undefined}
                  >
                    <NavIcon name={entry.icon} />
                    <span className={styles.itemLabel}>{entry.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.user}>
          <span className={styles.avatar} aria-hidden="true">
            {initials(name, email)}
          </span>
          <span className={styles.identity}>
            <span className={styles.name}>{name || "Sin nombre"}</span>
            <span className={styles.email}>{email}</span>
          </span>
          <button
            className={styles.signOut}
            type="button"
            onClick={handleSignOut}
            disabled={leaving}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
              <path d="M6.2 2.4H3.1v11.2h3.1" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9.6 5.2 12.4 8l-2.8 2.8M12.4 8H6.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}
