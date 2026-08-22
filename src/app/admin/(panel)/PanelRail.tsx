"use client";

import Link from "next/link";
import Image from "next/image";
import { SidebarBody, SidebarLabel, useSidebar } from "@/components/ui/sidebar";
import AdminNav from "./AdminNav";

/* Encabezado del riel: la marca, y nada más. El botón de plegar se mudó a la
   barra superior, que es de donde se maneja el cromo entero — tenerlo en los dos
   lados sería dos controles para una sola cosa.

   Con el riel blanco el logo ya no necesita la placa que lo hacía legible sobre
   tinta: va suelto sobre el papel, que es como está dibujado. */
function RailHeader() {
  const { open } = useSidebar();

  return (
    <Link
      href="/admin"
      aria-label="Center Quest — inicio del panel"
      /* Colapsado el gap se va junto con la etiqueta. La etiqueta mide cero,
         pero el gap NO: seguía separando al logo de una caja vacía y lo dejaba
         corrido medio gap a la izquierda. Es exactamente lo que se veía
         descentrado. */
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
      <SidebarLabel>
        <span className="cq-title block leading-none">Center Quest</span>
        {/* El descriptor va en mono, no en versalitas de la tipografía de
            interfaz: es una etiqueta de sistema —qué instancia del panel es
            esto— y en el vocabulario de acá eso se escribe en mono. */}
        <span className="cq-ident mt-1 block text-[var(--p-accent)]">panel/editorial</span>
      </SidebarLabel>
    </Link>
  );
}

/* El riel completo del panel: marca y secciones, nada más. La cuenta se mudó a
   la barra superior, así que acá ya no entra ningún dato de sesión — el riel
   quedó siendo pura navegación, que es lo único que cambia de página a página.

   Vive en cliente porque el colapso es estado. El proveedor <Sidebar> ya no está
   acá sino en el layout, porque la barra superior también necesita ese estado. */
export default function PanelRail() {
  return (
    <SidebarBody>
      <RailHeader />
      <AdminNav />
    </SidebarBody>
  );
}
