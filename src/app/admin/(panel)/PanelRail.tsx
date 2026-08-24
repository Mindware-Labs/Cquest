"use client";

import Link from "next/link";
import Image from "next/image";
import { SidebarBody, SidebarLabel, useSidebar } from "@/components/ui/sidebar";
import AdminNav from "./AdminNav";

// El botón de plegar vive en la barra superior (no acá): tenerlo en los dos lados sería dos controles para una sola cosa.
function RailHeader() {
  const { open } = useSidebar();

  return (
    <Link
      href="/admin"
      aria-label="Center Quest — inicio del panel"
      // Colapsado, gap-0: si no, el gap seguía separando el logo de la etiqueta (que mide cero) y quedaba descentrado.
      className={`flex min-w-0 items-center rounded-[var(--p-radius-sm)] py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--p-accent)] ${
        open ? "gap-2.5 px-1.5" : "w-full justify-center gap-0 px-0"
      }`}
    >
      <Image
        src="/logo.png"
        alt=""
        width={692}
        height={512}
        sizes="64px"
        priority
        className="h-7 w-auto shrink-0"
      />
      {/* Se quitó "panel/editorial" en mono: se leía como una ruta real sin serlo (el mono+barra significa "identificador" en este panel). */}
      <SidebarLabel>
        <span className="cq-title block leading-none">Center Quest</span>
      </SidebarLabel>
    </Link>
  );
}

// Riel = marca + navegación, sin dato de sesión (se mudó a la barra superior). Cliente porque el colapso es estado; el proveedor <Sidebar> vive en el layout porque la barra superior también lo necesita.
export default function PanelRail() {
  return (
    <SidebarBody>
      <RailHeader />
      <AdminNav />
    </SidebarBody>
  );
}
