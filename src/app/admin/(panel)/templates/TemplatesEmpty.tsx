import { LinkButton } from "@/components/admin/ui/Button";
import { Ident } from "@/components/admin/ui/Surface";

/* El vacío de «Guardadas por el equipo».

   Antes era una línea de texto centrada en gris. Un texto centrado no dice qué
   tendría que haber ahí ni cómo se consigue: dice que no hay nada, que es
   justamente lo único que la persona ya sabe.

   Acá se dibuja la ESTRUCTURA a medio armar —tres bloques puestos, dos por
   poner— porque una plantilla ES una estructura de bloques. La forma explica el
   concepto sin una línea de manual, y la acción principal está a un clic.

   La ruta real va abajo en mono: quien opera este panel todos los días navega
   por URL, y decirle a dónde lleva el botón cuesta una línea. */

const PLACED = [100, 62, 88];
const PENDING = [74, 46];

export default function TemplatesEmpty() {
  return (
    <div className="cq-empty">
      <div className="cq-ghost flex flex-col items-center gap-5 px-5 py-8 sm:flex-row sm:justify-center sm:gap-8">
        {/* La silueta. `aria-hidden`: no aporta nada que el texto de al lado no
            diga, y un lector de pantalla no necesita recorrer cinco barras. */}
        <div
          aria-hidden="true"
          className="flex h-[6.5rem] w-[9rem] shrink-0 flex-col gap-2 rounded-[var(--p-radius-md)] bg-[var(--p-surface-sunken)] px-3 py-3"
        >
          {PLACED.map((width, index) => (
            <span
              key={`placed-${index}`}
              style={{ width: `${width}%` }}
              className="h-[7px] rounded-[1px] bg-[var(--p-accent)]"
            />
          ))}
          {PENDING.map((width, index) => (
            <span
              key={`pending-${index}`}
              style={{ width: `${width}%` }}
              className="h-[7px] rounded-[1px] border border-dashed border-[var(--p-line-strong)]"
            />
          ))}
        </div>

        <div className="max-w-[38ch] text-center sm:text-left">
          <p className="cq-title">Armá la primera plantilla del equipo</p>
          <p className="cq-meta mt-2">
            Una plantilla es la estructura de bloques que repetís. Se guarda desde el editor con
            «Guardar como plantilla» y queda disponible para todos.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <LinkButton href="/admin/posts/new" variant="solid">
              Abrir el editor
            </LinkButton>
            <Ident path>admin/posts/new</Ident>
          </div>
        </div>
      </div>
    </div>
  );
}
