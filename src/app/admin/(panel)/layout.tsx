import Link from "next/link";
import { logoutAdmin, requireAdminSession } from "@/lib/adminAuth";
import { IconExternal, IconLogout } from "@/components/admin/ui/icons";
import AdminNav from "./AdminNav";

/* Grupo de rutas `(panel)`: agrupa todo lo que exige sesión sin aparecer en la
   URL. El login queda deliberadamente afuera — si estuviera adentro, el guard
   lo redirigiría a sí mismo en bucle.

   El cromo es un riel en tinta a la izquierda y el trabajo sobre marfil. Esa
   segunda capa neutra es lo que hace que la navegación no compita con el
   contenido: se ve dónde estás sin leer una palabra. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();
  const displayName = session.user?.name ?? session.user?.email ?? "Sesión activa";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      <a
        href="#panel-contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-[2px] focus:bg-surface-raised focus:px-4 focus:py-2 focus:text-[0.85rem] focus:font-semibold focus:text-foreground focus:outline-2 focus:outline-petroleo"
      >
        Saltar al contenido
      </a>

      <aside className="cq-rail flex flex-col gap-5 px-4 py-5 lg:sticky lg:top-0 lg:h-screen lg:gap-0 lg:px-5 lg:py-7">
        <div className="flex items-center justify-between gap-4 lg:block">
          <Link
            href="/admin"
            className="block rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste"
          >
            <span className="font-heading block text-[1.05rem] leading-none font-semibold tracking-[-0.02em] text-[var(--panel-rail-text-strong)]">
              Center Quest
            </span>
            <span className="mt-1 block text-[0.68rem] font-bold tracking-[0.16em] text-celeste uppercase">
              Panel editorial
            </span>
          </Link>

          {/* En móvil la identidad y la sesión comparten fila; en el riel la
              sesión baja al pie, que es donde se la busca. */}
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-[2px] bg-[var(--panel-rail-raised)] text-[0.72rem] font-bold text-[var(--panel-rail-text-strong)] lg:hidden"
          >
            {initials}
          </span>
        </div>

        <div className="lg:mt-8">
          <AdminNav />
        </div>

        <div className="mt-auto hidden lg:block">
          <Link
            href="/es/blog"
            target="_blank"
            rel="noreferrer"
            className="cq-rail-link"
          >
            <IconExternal size={17} className="shrink-0 opacity-90" />
            Ver el blog
          </Link>

          <div className="mt-4 border-t border-[var(--panel-rail-border)] pt-4">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center rounded-[2px] bg-[var(--panel-rail-raised)] text-[0.72rem] font-bold text-[var(--panel-rail-text-strong)]"
              >
                {initials}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[0.82rem] text-[var(--panel-rail-text-strong)]">
                  {session.user?.name ?? "Administración"}
                </span>
                <span className="block truncate text-[0.74rem] text-[var(--panel-rail-text)]">
                  {session.user?.email}
                </span>
              </span>
            </div>

            <form action={logoutAdmin} className="mt-3">
              <button
                type="submit"
                className="cq-rail-link w-full justify-start text-[0.82rem]"
              >
                <IconLogout size={17} className="shrink-0 opacity-90" />
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>

        {/* La misma salida, disponible sin desplegar nada, en pantallas donde el
            pie del riel no existe. */}
        <form action={logoutAdmin} className="lg:hidden">
          <button type="submit" className="cq-rail-link w-full justify-start text-[0.82rem]">
            <IconLogout size={17} className="shrink-0 opacity-90" />
            Cerrar sesión
          </button>
        </form>
      </aside>

      <div className="min-w-0 bg-background">
        <main id="panel-contenido" className="mx-auto w-full max-w-[76rem] px-5 py-9 pb-20 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
