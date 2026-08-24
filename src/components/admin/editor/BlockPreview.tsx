"use client";

import { useEffect, useRef, useState } from "react";
import BlockRenderer from "@/components/blog/BlockRenderer";
import type { Block } from "@/lib/blocks";

/* El bloque seleccionado, tal como se va a publicar, dentro del panel de
   propiedades.
   ---------------------------------------------------------------------------

   PERS-5 pide que el panel de propiedades refleje el cambio EN TIEMPO REAL con
   los mismos componentes visuales del sitio público, "no una aproximación". Se
   cumplía a medias: la previa fiel existía, pero abajo de todo, a dos o tres
   pantallas de scroll de los controles que la modifican. Cambiar la alineación
   de un título y tener que bajar para ver qué pasó rompe justo el lazo que ese
   requisito pide — el control y su efecto tienen que estar a la vista a la vez.

   Acá entra el MISMO `BlockRenderer` que publica el blog, con el bloque real, y
   se reduce a escala. Es el mismo argumento que ya sostiene TemplateThumb: un
   dibujo abstracto de "así va a quedar" se lee como un esqueleto de carga, y
   además hay que mantenerlo sincronizado a mano. Un render reducido no es una
   aproximación — es lo mismo, más chico.

   Qué se ve a esta escala: la forma. Alineación, peso, variante, espaciado
   antes y después, acento de color, estilo del CTA. Que es exactamente lo que
   los controles de al lado cambian. Para leer el texto está la previa completa
   del final, que se queda donde estaba. */

/* El ancho de composición es el de la columna de lectura del blog (44rem), el
   mismo que usan la previa del editor y las miniaturas de plantilla. Si se
   compusiera al ancho real del panel, los títulos se partirían en lugares donde
   el artículo publicado no los parte, y la previa mentiría sobre el ritmo. */
const COMPOSE_WIDTH = 704;

/* El panel mide 19rem y descuenta su propio relleno: quedan ~248px útiles.
   248/704 ≈ 0.35. Se redondea a 0.34 para dejar aire a los lados. */
const SCALE = 0.34;

/* Un bloque muy alto (una tabla de cincuenta filas) no puede empujar los
   controles fuera de la pantalla. */
const MAX_HEIGHT = 256;

export default function BlockPreview({ block }: { block: Block }) {
  /* `transform: scale` NO cambia el alto que el bloque ocupa en el layout: la
     caja sigue midiendo lo que medía sin reducir. Sin corregirlo, la previa de
     un párrafo de dos líneas dejaría debajo el hueco de un párrafo a tamaño
     completo — o sea un recuadro casi vacío que se lee como que falta algo.

     Se mide el contenido real y se le da al contenedor el alto reducido. Un
     ResizeObserver y no una medición única: el bloque cambia de alto mientras
     se escribe en él, que es precisamente cuando esta previa está mirándose. */
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      /* El alto sin reducir, por la escala. `borderBoxSize` incluye el relleno
         del propio bloque, que es parte de lo que hay que mostrar. */
      const raw = entry.borderBoxSize?.[0]?.blockSize ?? node.getBoundingClientRect().height / SCALE;
      setHeight(Math.min(Math.ceil(raw * SCALE), MAX_HEIGHT));
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <p className="cq-label mb-1.5">Cómo se va a ver</p>
      <div className="cq-blockpreview">
        <div
          className="cq-blockpreview-page"
          style={{ width: COMPOSE_WIDTH * SCALE, height: height ?? undefined }}
        >
          {/* `inert` no es prolijidad: un CTA trae un enlace real y una tabla
              trae encabezados, y sin esto el panel de propiedades metería
              paradas de tabulación invisibles entre un control y el siguiente.
              Con `inert` el subárbol sale del foco, del puntero y del árbol de
              accesibilidad de una sola vez. Lo que hay que anunciar de este
              bloque ya lo anuncian sus propios controles, en texto. */}
          <div
            ref={contentRef}
            inert
            className="cq-blockpreview-scale"
            style={{ width: COMPOSE_WIDTH, transform: `scale(${SCALE})` }}
          >
            {/* Un arreglo de UN bloque. `preview` hace que una imagen sin subir
                dibuje su marco en vez de desaparecer — sin eso, elegir el ancho
                o el acento de una imagen que todavía no tiene archivo no
                mostraría nada y el control parecería roto. */}
            <BlockRenderer blocks={[block]} preview />
          </div>
        </div>
      </div>
    </div>
  );
}
