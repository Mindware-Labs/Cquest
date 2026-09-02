"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link, { useLinkStatus } from "next/link";
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

type Props = { identity: React.ReactNode };

/* Agrupado por área, no una lista plana: Blog y Vacantes son los dos módulos
   de contenido del panel, y separarlos evita que uno se pierda entre las filas
   del otro apenas se agreguen más pantallas (aplicaciones, etc.) a cada uno. */
const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: "chart" }],
  },
  {
    label: "Blog",
    items: [
      { href: "/admin/posts", label: "Articles", icon: "doc" },
      { href: "/admin/categories", label: "Categories", icon: "tag" },
    ],
  },
  {
    label: "Vacancies",
    items: [
      { href: "/admin/vacancies", label: "Vacancies", icon: "briefcase" },
      { href: "/admin/applications", label: "Applications", icon: "inbox" },
      { href: "/admin/talent-pool", label: "Talent pool", icon: "star" },
      { href: "/admin/departments", label: "Departments", icon: "building" },
    ],
  },
  {
    label: "Accounts",
    items: [{ href: "/admin/users", label: "Users", icon: "people" }],
  },
] as const;

type NavIconName = (typeof NAV_GROUPS)[number]["items"][number]["icon"];

function NavIcon({ name }: { name: NavIconName }) {
  const common = { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.3 };
  if (name === "chart")
    return (
      <svg {...common} aria-hidden="true">
        <path d="M2.6 13.4V2.6M2.6 13.4h10.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 13.4V9M8 13.4V6M11 13.4V7.6" strokeLinecap="round" />
      </svg>
    );
  if (name === "star")
    return (
      <svg {...common} aria-hidden="true">
        <path d="M8 2.4l1.7 3.6 3.9.5-2.9 2.7.7 3.9L8 11.2l-3.4 1.9.7-3.9-2.9-2.7 3.9-.5L8 2.4Z" strokeLinejoin="round" />
      </svg>
    );
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
  if (name === "briefcase")
    return (
      <svg {...common} aria-hidden="true">
        <rect x="2.2" y="5.2" width="11.6" height="8" strokeLinejoin="round" />
        <path d="M5.6 5.2V3.6h4.8v1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.2 9h11.6" strokeLinecap="round" />
      </svg>
    );
  if (name === "inbox")
    return (
      <svg {...common} aria-hidden="true">
        <path d="M2.4 9.2 4.2 3.4h7.6l1.8 5.8v3.4H2.4V9.2Z" strokeLinejoin="round" />
        <path d="M2.4 9.2h3.4l.9 1.6h2.6l.9-1.6h3.4" strokeLinejoin="round" />
      </svg>
    );
  if (name === "building")
    return (
      <svg {...common} aria-hidden="true">
        <rect x="3.4" y="2.2" width="9.2" height="11.6" strokeLinejoin="round" />
        <path d="M5.8 4.8h.01M8 4.8h.01M10.2 4.8h.01M5.8 7.4h.01M8 7.4h.01M10.2 7.4h.01M5.8 10h.01M10.2 10h.01" strokeLinecap="round" />
        <path d="M6.8 13.8v-2.4h2.4v2.4" strokeLinecap="round" strokeLinejoin="round" />
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

/* Solo se ve si la ruta aún no está precargada: un pulso junto al rótulo
   mientras llega la respuesta. */
function NavPending() {
  const { pending } = useLinkStatus();
  return <span className={styles.pending} data-pending={pending || undefined} aria-hidden="true" />;
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

export default function PanelRail({ identity }: Props) {
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
          aria-label={open ? "Close menu" : "Open menu"}
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
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            <FoldIcon />
          </button>
        </div>

        {/* En compacto el rail tapa el contenido: navegar tiene que cerrarlo. */}
        <nav className={styles.nav} aria-label="Panel sections">
          {NAV_GROUPS.map((group, groupIndex) => (
            <div key={group.label} className={styles.navGroup} data-first={groupIndex === 0 || undefined}>
              <span className={styles.navLabel}>{group.label}</span>
              <ul className={styles.list}>
                {group.items.map((entry) => {
                  // "/admin" es prefijo de toda otra ruta del panel: sin el
                  // caso especial, "Dashboard" quedaría marcado activo en
                  // cualquier pantalla, no solo en la suya.
                  const active = entry.href === "/admin" ? pathname === "/admin" : pathname.startsWith(entry.href);
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
                        <NavPending />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className={styles.user}>
          {identity}
          <button
            className={styles.signOut}
            type="button"
            onClick={handleSignOut}
            disabled={leaving}
            aria-label="Sign out"
            title="Sign out"
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
