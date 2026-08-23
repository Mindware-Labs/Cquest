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
  description,
  actions,
  stats,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  stats?: ModuleStat[];
  children: ReactNode;
}) {
  return (
    <div>
      {/* La franja de encabezado se queda; el título VISIBLE no.

          El nombre del módulo se decía tres veces en la misma pantalla: el
          ítem marcado del riel, el último tramo de la miga en la barra superior
          —en negrita y en color de tinta plena— y este `<h1>`. Tres es dos de
          más. La miga es la que gana: está siempre, sobrevive al riel plegado,
          y es la única de las tres que además dice de dónde venís.

          Pero la franja NO se borra, y esa es la parte que no es obvia. Su otro
          trabajo es ser la ranura de la acción principal, y ese trabajo es
          real: antes de que existiera, cada módulo puso su botón donde pudo
          —el tablero arriba a la derecha, artículos dentro de la barra de la
          tabla, categorías como último azulejo de la grilla—. Cuatro módulos,
          tres lugares. Sacar la franja con el título devolvería ese problema.

          Así que queda la franja con la acción sola contra el margen derecho, y
          el `<h1>` se va a `sr-only`: el documento sigue teniendo su
          encabezado de primer nivel —un lector de pantalla y el esquema del
          documento lo necesitan— y la pantalla gana la línea.

          La bajada sigue sin dibujarse: describe el módulo a quien todavía no
          lo conoce, y quien opera esto lo hace todos los días. */}
      <h1 className="sr-only">{title}</h1>
      {description && <p className="sr-only">{description}</p>}

      {/* La franja sólo existe si hay algo que poner en ella. Con el título ya
          en `sr-only`, un `<header>` sin acciones era 16px de relleno vacío
          empujando el trabajo hacia abajo en cada módulo que no tuviera botón.

          Un módulo puede además anclar su acción DENTRO de su propia barra de
          herramientas y no pasar `actions` —es lo que hace Plantillas—: ahí el
          botón pertenece a la barra que filtra y busca, en vez de flotar solo
          sobre el contenido. */}
      {actions && (
        <header className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 pb-4">
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        </header>
      )}

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
