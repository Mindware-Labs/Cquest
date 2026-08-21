import { logoutAdmin, requireAdminSession } from "@/lib/adminAuth";
import PanelRail from "./PanelRail";

/* Grupo de rutas `(panel)`: agrupa todo lo que exige sesión sin aparecer en la
   URL. El login queda deliberadamente afuera — si estuviera adentro, el guard
   lo redirigiría a sí mismo en bucle.

   El cromo es un riel en tinta a la izquierda y el trabajo sobre marfil. Esa
   segunda capa neutra es lo que hace que la navegación no compita con el
   contenido: se ve dónde estás sin leer una palabra. El riel además colapsa,
   así que en reposo devuelve ancho al trabajo. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();
  const displayName = session.user?.name ?? session.user?.email ?? "Sesión activa";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <a
        href="#panel-contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-110 focus:rounded-[2px] focus:bg-surface-raised focus:px-4 focus:py-2 focus:text-[0.85rem] focus:font-semibold focus:text-foreground focus:outline-2 focus:outline-petroleo"
      >
        Saltar al contenido
      </a>

      <PanelRail
        name={session.user?.name ?? "Administración"}
        email={session.user?.email ?? ""}
        initials={initials}
        logoutAction={logoutAdmin}
      />

      <div className="min-w-0 flex-1 bg-background">
        <main id="panel-contenido" className="mx-auto w-full max-w-[76rem] px-5 py-9 pb-20 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
