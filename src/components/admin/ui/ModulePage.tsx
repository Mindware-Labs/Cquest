import type { CSSProperties, ReactNode } from "react";
import { StatCard } from "./Surface";

/* El modelo de página que comparten TODOS los módulos.

   Existe para responder al problema real: hoy cada vista arma su encabezado a
   mano, y por eso el tablero tiene título grande, artículos no tiene ninguno y
   categorías tiene uno distinto. Con un solo componente, agregar un módulo
   nuevo no es una decisión de diseño — es completar tres props.

   La estructura es siempre la misma, de arriba abajo:
     1. Nombre del módulo y su ruta real, con las acciones a la derecha.
     2. Tira de cifras (opcional). El resumen del módulo en números.
     3. El trabajo.

   La tira de cifras es lo que hace que un módulo se lea como un tablero y no
   como una tabla suelta. Es opcional a propósito: un módulo sin números que
   valga la pena resumir no debe inventar tres para llenar el espacio. */

export type ModuleStat = {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
  delta?: { value: number; label: string };
  /* El mismo código de color que usan las tarjetas del tablero, para que la
     cifra de arriba y el bloque que la desarrolla abajo se reconozcan como lo
     mismo. */
  accent?: "volume" | "category" | "pending" | "published";
};

export function ModulePage({
  title,
  /* La ruta del módulo, en mono. No es decoración: quien opera este panel todos
     los días navega por URL, y es el dato que se pega en un mensaje para
     señalar de qué pantalla se está hablando. */
  path,
  description,
  actions,
  stats,
  children,
}: {
  title: string;
  path: string;
  description?: string;
  actions?: ReactNode;
  stats?: ModuleStat[];
  children: ReactNode;
}) {
  return (
    <div>
      {/* El encabezado visible se fue: repetía lo que ya dicen el riel y la miga
          de la barra superior, y se comía una franja de alto en una pantalla que
          tiene que entrar entera sin desplazarse.

          El <h1> se queda en el DOM. No es un detalle: un documento sin
          encabezado de nivel uno deja a quien navega con lector de pantalla sin
          punto de entrada, y `path`/`description` siguen describiéndolo ahí. */}
      <header className="flex flex-wrap items-center justify-end gap-2 pb-4">
        <h1 className="sr-only">{title}</h1>
        <p className="sr-only">
          {path}
          {description ? ` — ${description}` : ""}
        </p>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </header>

      {stats && stats.length > 0 && (
        <div
          /* Las tarjetas ahora son cajas cerradas, así que necesitan separación
             también en vertical: antes eran columnas abiertas y el `gap-x`
             solo alcanzaba. */
          className="mb-8 grid gap-3"
          style={{
            /* La grilla se arma por cantidad real de cifras y no con una
               cascada de clases condicionales: tres cifras en una grilla de
               cuatro columnas dejan un hueco que se lee como un dato que falta. */
            gridTemplateColumns: `repeat(auto-fit, minmax(9rem, 1fr))`,
          }}
        >
          {stats.map((stat, index) => (
            /* Entrada escalonada. El envoltorio existe para no meter la
               animación dentro de StatCard: así el mismo componente sirve
               dentro y fuera de una grilla animada. */
            <div
              key={stat.label}
              className="cq-enter"
              style={{ "--cq-i": index } as CSSProperties}
            >
              <StatCard
                label={stat.label}
                value={stat.value}
                hint={stat.hint}
                href={stat.href}
                delta={stat.delta}
                accent={stat.accent}
              />
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
