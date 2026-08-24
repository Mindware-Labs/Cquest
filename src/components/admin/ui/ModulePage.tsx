import type { CSSProperties, ReactNode } from "react";
import { StatCard } from "./Surface";

// Modelo de página compartido por todos los módulos: antes cada vista armaba su encabezado a mano de forma distinta; ahora agregar un módulo es completar tres props. La tira de cifras es opcional para no inventar números que no valen la pena.

export type ModuleStat = {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
  delta?: { value: number; label: string };
  // El mismo código de color que las tarjetas del tablero, para que la cifra de arriba y el bloque de abajo se reconozcan como lo mismo.
  accent?: "volume" | "category" | "pending" | "published";
  /* Qué se cuenta, en un glifo. Reemplaza al punto de acento en la tarjeta. */
  icon?: ReactNode;
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
      {/* El h1 va a sr-only (queda como encabezado del documento para lectores de pantalla) porque el nombre del módulo ya se repetía tres veces en pantalla; la miga gana. La franja se conserva porque es la ranura de la acción principal — sin ella, cada módulo volvía a poner su botón en un lugar distinto. */}
      <h1 className="sr-only">{title}</h1>
      {description && <p className="sr-only">{description}</p>}

      {/* La franja solo existe si hay acciones: con el título en sr-only, un header vacío era relleno inútil. Un módulo puede anclar su botón en su propia barra de herramientas y no pasar "actions" (como Plantillas). */}
      {actions && (
        <header className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 pb-4">
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        </header>
      )}

      {stats && stats.length > 0 && (
        <div
          // Las tarjetas son cajas cerradas y necesitan separación vertical también; antes eran columnas abiertas y gap-x solo alcanzaba.
          className="mb-8 grid gap-3"
          style={{
            // auto-fit arma la grilla por cantidad real de cifras: una grilla fija de cuatro columnas con tres cifras dejaría un hueco que se lee como un dato que falta.
            gridTemplateColumns: `repeat(auto-fit, minmax(9rem, 1fr))`,
          }}
        >
          {stats.map((stat, index) => (
            // El envoltorio de animación existe para no meterla dentro de StatCard, así el mismo componente sirve dentro y fuera de una grilla animada.
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
                icon={stat.icon}
              />
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
