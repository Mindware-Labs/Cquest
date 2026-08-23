import type { Block } from "@/lib/blocks";
import BlockRenderer from "@/components/blog/BlockRenderer";
import type { TemplateChoice } from "@/components/admin/editor/TemplatePicker";

/* La miniatura de una plantilla: el artículo de verdad, en chiquito.

   Van dos versiones de esto dibujadas con barras —una con acento sobre fondo
   hundido, otra con tinta sobre papel— y las dos se leyeron como esqueleto de
   carga. A esta altura eso no es una opinión sobre la paleta: cualquier dibujo
   ABSTRACTO de "contenido que todavía no es contenido" se lee como un
   placeholder, porque es exactamente el mismo lenguaje que usa un placeholder.
   La única forma de que una vista previa no parezca un hueco es que no sea un
   dibujo: que sea el contenido.

   Así que acá no hay geometría inventada. Entra el mismo `BlockRenderer` que
   publica el blog y que ya sirve de vista previa dentro del editor, con los
   bloques reales de la plantilla, y se reduce a escala. Se leen los títulos
   reales, el párrafo real, la lista real. Nadie confunde texto con un esqueleto.

   Y sale gratis en mantenimiento, que es la otra mitad del argumento: cuando se
   agregue un tipo de bloque nuevo, la miniatura ya lo sabe dibujar. Las dos
   versiones anteriores tenían su propio mapa de siluetas que había que ampliar
   a mano, y que se desincronizaba en silencio del artículo real.

   LÍMITE CONOCIDO: `ImageBlock` devuelve `null` cuando el bloque no tiene `src`,
   y las cuatro plantillas base traen sus imágenes vacías a propósito (no hay
   ninguna imagen real que darles hasta que alguien suba una). O sea que en esas
   cuatro la miniatura muestra el texto pero no el hueco de la imagen. Es fiel a
   lo que hoy produce aplicar la plantilla, pero sub-representa la estructura. */

/* El ancho de composición. Es el de la columna de lectura del blog —44rem, el
   mismo que usa la vista previa del editor—, así que los saltos de línea de la
   miniatura son los del artículo publicado y no los de una caja angosta que
   parte los títulos en cualquier lado. */
const COMPOSE_WIDTH = 704;
/* Un poco más grande que el 0.38 inicial. A esa escala el texto quedaba al
   borde de lo ilegible y la tarjeta era mayormente aire: el espaciado del
   artículo está calibrado para una columna de 704px, y reducido a un tercio
   deja huecos que en la miniatura se leen como que falta contenido. */
const SCALE = 0.44;

export function TemplateThumb({ blocks }: { blocks: Block[] }) {
  return (
    <div className="cq-thumb">
      {blocks.length === 0 ? (
        <span className="cq-thumb-blank">Sin bloques</span>
      ) : (
        <div className="cq-thumb-page" style={{ width: COMPOSE_WIDTH * SCALE }}>
          {/* `inert` es obligatorio, no una prolijidad: los bloques reales traen
              enlaces y botones —el CTA de tres de las cuatro plantillas base—, y
              sin esto cada tarjeta metía dos o tres paradas de tabulación
              invisibles entre "Usar" y la tarjeta siguiente. Con `inert` el
              subárbol sale del foco, del puntero y del árbol de accesibilidad de
              una sola vez; la estructura se anuncia desde la tarjeta, en texto. */}
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

/* Adjunta la miniatura ya renderizada a cada opción del selector del editor.

   Vive acá y no en `lib/templateChoices.ts` porque devuelve JSX, y ese archivo
   es el que arma los DATOS de las opciones — mezclarle render lo convertiría en
   media capa de vista.

   Se usa SÓLO en la pantalla de artículo nuevo. En la de edición el selector no
   aparece nunca (`showTemplates` exige un artículo vacío y sin id), así que
   renderizarle las miniaturas sería serializar el HTML de veinte previas al
   cliente para un componente que no se monta. */
export function withThumbs(choices: TemplateChoice[]): TemplateChoice[] {
  return choices.map((choice) => ({
    ...choice,
    thumb: <TemplateThumb blocks={choice.blocks} />,
  }));
}
