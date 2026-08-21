"use client";

import Link from "next/link";
import { Sidebar, SidebarBody, SidebarLabel, useSidebar } from "@/components/ui/sidebar";
import { IconPanelLeft } from "@/components/admin/ui/icons";
import AdminNav from "./AdminNav";
import PanelUserMenu from "./PanelUserMenu";

/* El botón que pliega el riel. Vive acá adentro y no en sidebar.tsx porque
   necesita el contexto, y el contexto sólo existe debajo de <Sidebar>. */
function CollapseToggle({ className }: { className?: string }) {
  const { open, toggle, panelId } = useSidebar();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={open ? "Plegar el menú" : "Desplegar el menú"}
      title={open ? "Plegar el menú" : "Desplegar el menú"}
      className={`cq-rail-link shrink-0 ${className ?? ""}`}
    >
      <IconPanelLeft size={18} />
    </button>
  );
}

/* Encabezado del riel: marca a la izquierda, plegado a la derecha. Colapsado los
   dos no entran en 4.5rem sin apretarse, así que el botón baja a su propia fila
   debajo del cuadrado de marca. Es una decisión de layout y por eso se resuelve
   con el estado —no con CSS condicional—: son dos composiciones distintas, no la
   misma con piezas apagadas. */
function RailHeader() {
  const { open } = useSidebar();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-1">
        <Link
          href="/admin"
          aria-label="Center Quest — inicio del panel"
          className={`flex min-w-0 items-center gap-3 rounded-[var(--panel-radius-control)] py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste ${
            open ? "px-2" : "w-full justify-center"
          }`}
        >
          <span
            aria-hidden="true"
            className="flex size-[26px] shrink-0 items-center justify-center rounded-[6px] bg-celeste text-[0.62rem] leading-none font-bold text-[#0a1116]"
          >
            CQ
          </span>
          <SidebarLabel>
            <span className="font-heading block text-[0.98rem] leading-none font-semibold tracking-[-0.02em] text-[var(--panel-rail-text-strong)]">
              Center Quest
            </span>
            <span className="mt-1 block text-[0.64rem] font-bold tracking-[0.16em] text-celeste uppercase">
              Panel editorial
            </span>
          </SidebarLabel>
        </Link>

        {open && <CollapseToggle className="px-2" />}
      </div>

      {!open && <CollapseToggle className="justify-center" />}
    </div>
  );
}

/* El riel completo del panel. Vive en cliente porque el colapso es estado, pero
   los datos de sesión llegan resueltos desde el layout: nada de sesión se
   consulta acá. */
export default function PanelRail({
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
  return (
    <Sidebar>
      <SidebarBody>
        <RailHeader />

        <AdminNav />

        <div className="mt-auto border-t border-[var(--panel-rail-border)] pt-3">
          <PanelUserMenu
            name={name}
            email={email}
            initials={initials}
            logoutAction={logoutAction}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
