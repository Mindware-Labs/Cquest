import { blockArraySchema } from "@/lib/blocks";
import { STARTER_TEMPLATES, deleteTemplate, getTemplates } from "@/lib/templates";
import TemplateRow from "./TemplateRow";

const CREATED_AT = new Intl.DateTimeFormat("es-DO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Santo_Domingo",
});

export default async function AdminTemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="pt-10">
      <h1 className="font-heading text-[1.6rem] font-semibold tracking-[-0.02em] text-foreground">
        Plantillas
      </h1>
      <p className="mt-2 max-w-[42rem] text-[0.92rem] leading-relaxed text-[var(--text-secondary)]">
        Una plantilla guarda una combinación de bloques como punto de partida.
        Las guardadas por el equipo están disponibles para todos.
      </p>

      <h2 className="mt-8 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-petroleo">
        Plantillas base
      </h2>
      {/* Viven en código (src/lib/templates.ts), no en la base: por eso se
          listan pero no se pueden borrar desde acá. */}
      <ul className="mt-3 rounded-xl border border-border bg-[var(--surface-raised)] px-6">
        {STARTER_TEMPLATES.map((template) => (
          <li
            key={template.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4 last:border-b-0"
          >
            <div>
              <p className="text-[0.95rem] font-semibold text-foreground">{template.name.es}</p>
              <p className="mt-0.5 text-[0.78rem] text-[var(--text-tertiary)]">
                {template.blocks.length} bloques · incluida en el sistema
              </p>
            </div>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-petroleo">
        Guardadas por el equipo
      </h2>
      <div className="mt-3 rounded-xl border border-border bg-[var(--surface-raised)] px-6">
        {templates.length === 0 ? (
          <p className="py-10 text-center text-[0.9rem] leading-relaxed text-[var(--text-tertiary)]">
            Todavía no hay plantillas guardadas. Se crean desde el editor, con
            &ldquo;Guardar como plantilla&rdquo;.
          </p>
        ) : (
          <ul>
            {templates.map((template) => {
              /* El contador de bloques sale del contenido validado: una
                 plantilla vieja que ya no encaja se muestra con 0 en vez de
                 romper la pantalla entera. */
              const parsed = blockArraySchema.safeParse(template.blocks);
              return (
                <TemplateRow
                  key={template.id}
                  template={{
                    id: template.id,
                    name: template.name,
                    blockCount: parsed.success ? parsed.data.length : 0,
                    authorName: template.author.name,
                    createdAt: CREATED_AT.format(template.createdAt),
                  }}
                  deleteAction={deleteTemplate}
                />
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
