import Link from "next/link";
import { blockArraySchema } from "@/lib/blocks";
import { STARTER_TEMPLATES, deleteTemplate, getTemplates } from "@/lib/templates";
import { IconPlus } from "@/components/admin/ui/icons";
import { EmptyState, PageHeader, Panel, PanelHead } from "@/components/admin/ui/Surface";
import { TemplateShape } from "@/components/admin/ui/TemplateShape";
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
    <div>
      <PageHeader
        title="Plantillas"
        description="Una plantilla guarda una combinación de bloques como punto de partida. Las guardadas por el equipo están disponibles para todos."
        actions={
          <Link href="/admin/posts/new" className="cq-btn" data-variant="ghost">
            <IconPlus size={16} />
            Usar una plantilla
          </Link>
        }
      />

      <div className="grid gap-5">
        <Panel>
          {/* Viven en código (src/lib/templates.ts), no en la base: por eso se
              listan pero no se pueden borrar desde acá. */}
          <PanelHead title="Plantillas base" count={STARTER_TEMPLATES.length} />
          <ul className="grid gap-4 px-5 py-5 sm:grid-cols-2 xl:grid-cols-4">
            {STARTER_TEMPLATES.map((template) => (
              <li key={template.id} className="cq-panel p-3">
                <TemplateShape types={template.blocks.map((block) => block.type)} />
                <p className="mt-3 text-[0.9rem] leading-snug font-semibold text-foreground">
                  {template.name.es}
                </p>
                <p className="mt-0.5 text-[0.76rem] text-[var(--text-tertiary)]">
                  {template.blocks.length}{" "}
                  {template.blocks.length === 1 ? "bloque" : "bloques"} · del sistema
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHead title="Guardadas por el equipo" count={templates.length} />
          {templates.length === 0 ? (
            <EmptyState
              title="Todavía no hay plantillas del equipo"
              hint="Se crean desde el editor: armá un artículo con la estructura que repetís y usá «Guardar como plantilla». Queda disponible para todo el equipo."
              action={
                <Link href="/admin/posts/new" className="cq-btn" data-variant="ghost">
                  Ir al editor
                </Link>
              }
            />
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
                      types: parsed.success ? parsed.data.map((block) => block.type) : [],
                      blockCount: parsed.success ? parsed.data.length : 0,
                      isBroken: !parsed.success,
                      authorName: template.author.name,
                      createdAt: CREATED_AT.format(template.createdAt),
                    }}
                    deleteAction={deleteTemplate}
                  />
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
