import type { Block } from "@/lib/blocks";
import BlockRenderer from "@/components/blog/BlockRenderer";
import type { TemplateChoice } from "@/components/admin/editor/TemplatePicker";

// Miniatura de plantilla: usa el mismo `BlockRenderer` del blog reducido a escala (no geometría abstracta dibujada aparte), porque cualquier silueta abstracta se lee como placeholder de carga, y así se mantiene gratis cuando se agregue un tipo de bloque nuevo.
// Límite conocido: `ImageBlock` devuelve null sin `src`, y las plantillas base traen imágenes vacías a propósito, así que la miniatura no muestra el hueco de imagen.

// Ancho de la columna de lectura del blog (44rem, igual que la vista previa del editor), para que los saltos de línea coincidan con el artículo publicado.
const COMPOSE_WIDTH = 704;
// 0.44 y no 0.38: a esa escala el texto quedaba ilegible y la tarjeta mayormente aire.
const SCALE = 0.44;

export function TemplateThumb({ blocks }: { blocks: Block[] }) {
  return (
    <div className="cq-thumb">
      {blocks.length === 0 ? (
        <span className="cq-thumb-blank">Sin bloques</span>
      ) : (
        <div className="cq-thumb-page" style={{ width: COMPOSE_WIDTH * SCALE }}>
          {/* `inert` obligatorio: sin él, los CTA reales de la plantilla meten paradas de tabulación invisibles entre tarjetas. */}
          <div
            inert
            className="cq-thumb-scale"
            style={{ width: COMPOSE_WIDTH, transform: `scale(${SCALE})` }}
          >
            <BlockRenderer blocks={blocks} preview />
          </div>
        </div>
      )}
    </div>
  );
}

// Vive acá y no en lib/templateChoices.ts porque devuelve JSX (ese archivo sólo arma datos). Se usa sólo en artículo nuevo: en edición el selector nunca se monta.
export function withThumbs(choices: TemplateChoice[]): TemplateChoice[] {
  return choices.map((choice) => ({
    ...choice,
    thumb: <TemplateThumb blocks={choice.blocks} />,
  }));
}
