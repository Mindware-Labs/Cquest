import { logoutAdmin, requireAdminSession } from "@/lib/adminAuth";
import { Sidebar } from "@/components/ui/sidebar";
import { ToastProvider } from "@/components/admin/ui/Toast";
import PanelRail from "./PanelRail";
import PanelTopbar from "./PanelTopbar";

// Grupo `(panel)`: el login queda deliberadamente afuera del guard de sesión, si no se redirigiría a sí mismo en bucle.
// <Sidebar> envuelve riel y barra juntos: el botón de plegar vive arriba pero mueve el ancho del riel, así que necesitan el mismo estado.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();
  const displayName = session.user?.name ?? session.user?.email ?? "Sesión activa";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <Sidebar>
      {/* Envuelve al panel entero (no cada vista): un aviso de borrado tiene que sobrevivir un cambio de sección mientras corre el plazo. */}
      <ToastProvider>
      <div className="flex min-h-screen flex-col lg:flex-row">
        <a
          href="#panel-contenido"
          // Tokens del panel, no del sitio público: antes usaba clases del otro sistema (bg-surface-raised, etc).
          className="cq-btn sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[var(--p-z-skip)]"
          data-variant="solid"
        >
          Saltar al contenido
        </a>

        <PanelRail />

        <div className="flex min-w-0 flex-1 flex-col">
          <PanelTopbar
            name={session.user?.name ?? "Administración"}
            email={session.user?.email ?? ""}
            initials={initials}
            logoutAction={logoutAdmin}
          />

          {/* Tope de 110rem (no 76rem, el de una columna de lectura): un panel de operación tiene tablas anchas, no párrafos. */}
          <main
            id="panel-contenido"
            className="mx-auto w-full max-w-[110rem] flex-1 px-4 py-5 pb-16 sm:px-6"
          >
            {children}
          </main>
        </div>
      </div>
      </ToastProvider>
    </Sidebar>
  );
}
