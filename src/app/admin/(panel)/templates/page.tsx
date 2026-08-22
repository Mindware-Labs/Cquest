import type { CSSProperties } from "react";
import { blockArraySchema } from "@/lib/blocks";
import { STARTER_TEMPLATES, deleteTemplate, getTemplates } from "@/lib/templates";
import { IconPlus } from "@/components/admin/ui/icons";
import { LinkButton } from "@/components/admin/ui/Button";
import { ModulePage } from "@/components/admin/ui/ModulePage";
import { Card, Ident, Section } from "@/components/admin/ui/Surface";
import { TemplateShape } from "@/components/admin/ui/TemplateShape";
import TemplateRow from "./TemplateRow";
import TemplatesEmpty from "./TemplatesEmpty";

const CREATED_AT = new Intl.DateTimeFormat("es-DO", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Santo_Domingo",
});

export default async function AdminTemplatesPage() {
  const templates = await getTemplates();

  return (
    /* La acción principal de esta pantalla no es "crear una plantilla" —no se
       crean acá, se guardan desde el editor— sino usar una. Por eso el botón
       sólido dice lo que hace y lleva al editor. */
    <ModulePage
      title="Plantillas"
      path="admin/templates"
      description="Estructuras de bloques reutilizables"
      actions={
        <LinkButton href="/admin/posts/new" variant="solid" icon={<IconPlus size={15} />}>
          Usar una plantilla
        </LinkButton>
      }
    >
      <div className="grid gap-4">
        {/* Viven en código (src/lib/templates.ts), no en la base: por eso se
            listan pero no se pueden borrar desde acá. */}
        <Section
          title="Plantillas base"
          count={STARTER_TEMPLATES.length}
          boxed
          accent="category"
          className="cq-enter"
        >
          <ul className="grid gap-3 pb-4 sm:grid-cols-2 xl:grid-cols-4">
            {STARTER_TEMPLATES.map((template, index) => (
              <li
                key={template.id}
                className="cq-enter"
                /* El escalonado se corta en 8: a partir de ahí el último
                   elemento arranca medio segundo tarde y el que opera ya está
                   leyendo el primero. */
                style={{ "--cq-i": Math.min(index, 8) } as React.CSSProperties}
              >
                <Card href="/admin/posts/new" className="h-full">
                  <TemplateShape types={template.blocks.map((block) => block.type)} />
                  <p className="cq-title mt-3">{template.name.es}</p>
                  <p className="mt-1 flex items-center gap-1.5">
                    <Ident>
                      {template.blocks.length}{" "}
                      {template.blocks.length === 1 ? "bloque" : "bloques"}
                    </Ident>
                    <span aria-hidden="true" className="cq-meta">
                      ·
                    </span>
                    <span className="cq-meta">del sistema</span>
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Guardadas por el equipo"
          count={templates.length}
          boxed
          accent="published"
          className="cq-enter flex max-h-[26rem] flex-col"
          style={{ "--cq-i": 1 } as CSSProperties}
        >
          {templates.length === 0 ? (
            <TemplatesEmpty />
          ) : (
            <ul className="cq-ledger cq-scroll pb-2">
              {templates.map((template, index) => {
                /* El contador de bloques sale del contenido validado: una
                   plantilla vieja que ya no encaja se muestra con 0 en vez de
                   romper la pantalla entera. */
                const parsed = blockArraySchema.safeParse(template.blocks);
                return (
                  <TemplateRow
                    key={template.id}
                    index={Math.min(index, 8)}
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
        </Section>
      </div>
    </ModulePage>
  );
}
