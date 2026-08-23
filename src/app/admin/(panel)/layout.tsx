import { logoutAdmin, requireAdminSession } from "@/lib/adminAuth";
import { Sidebar } from "@/components/ui/sidebar";
import { ToastProvider } from "@/components/admin/ui/Toast";
import PanelRail from "./PanelRail";
import PanelTopbar from "./PanelTopbar";

/* Grupo de rutas `(panel)`: agrupa todo lo que exige sesión sin aparecer en la
   URL. El login queda deliberadamente afuera — si estuviera adentro, el guard
   lo redirigiría a sí mismo en bucle.

   El cromo es un riel en tinta a la izquierda, una barra superior en blanco y el
   trabajo sobre marfil. Esa segunda capa neutra es lo que hace que la navegación
   no compita con el contenido: se ve dónde estás sin leer una palabra.

   El proveedor <Sidebar> envuelve a los DOS, riel y barra, porque el botón de
   plegar vive arriba y el ancho que maneja está a la izquierda: si cada uno
   tuviera su propio estado, el botón movería un riel imaginario. */
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
      {/* El proveedor de avisos envuelve al panel entero y no a cada vista: un
          borrado hecho en la tabla de artículos tiene que poder avisar aunque la
          navegación haya cambiado de sección mientras corría el plazo. */}
      <ToastProvider>
      <div className="flex min-h-screen flex-col lg:flex-row">
        <a
          href="#panel-contenido"
          /* Los tokens del PANEL, no los del sitio público. Traía
             `bg-surface-raised`, `text-foreground` y `outline-petroleo`, que
             son del otro sistema, más un radio y un tamaño de fuente escritos
             a mano. El primer control que ve alguien que navega con teclado no
             puede ser el único que no pertenece al panel. */
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

          {/* El tope subió de 76rem a 110rem. Un panel de operación no es una
              columna de lectura: acá no hay párrafos largos que acotar, hay
              tablas de siete columnas. En una pantalla de 1920 el tope viejo
              dejaba 700px de margen vacío a cada lado y obligaba a la tabla a
              desplazarse en horizontal teniendo espacio de sobra al costado. */}
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
