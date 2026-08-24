"use client";

import { useEffect, useRef, useState } from "react";
import BlockRenderer from "@/components/blog/BlockRenderer";
import type { Block } from "@/lib/blocks";

// Usa el mismo BlockRenderer del blog público, reducido a escala, junto a los controles (PERS-5): antes la previa fiel existía pero al final del formulario, y cambiar una alineación obligaba a bajar dos pantallas para verlo.

// El ancho de composición es el de la columna de lectura del blog (44rem): componer al ancho real del panel partiría los títulos donde el artículo publicado no los parte.
const COMPOSE_WIDTH = 704;

// El panel mide 19rem menos su relleno (~248px útiles); 248/704 ≈ 0.35, redondeado a 0.34 para dejar aire a los lados.
const SCALE = 0.34;

// MAX_HEIGHT evita que un bloque muy alto (una tabla de cincuenta filas) empuje los controles fuera de la pantalla.
const MAX_HEIGHT = 256;

export default function BlockPreview({ block }: { block: Block }) {
  // transform: scale no cambia el alto que ocupa en el layout, así que se mide el contenido real con ResizeObserver (no una medición única, porque el bloque cambia de alto mientras se escribe) y se aplica el alto reducido al contenedor.
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => {
      // borderBoxSize incluye el relleno del propio bloque, que es parte de lo que hay que mostrar; se multiplica por SCALE para el alto final.
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
          {/* inert saca el subárbol del foco, del puntero y de accesibilidad: sin esto, un CTA o una tabla meterían paradas de tabulación invisibles entre los controles. */}
          <div
            ref={contentRef}
            inert
            className="cq-blockpreview-scale"
            style={{ width: COMPOSE_WIDTH, transform: `scale(${SCALE})` }}
          >
            {/* preview hace que una imagen sin subir dibuje su marco en vez de desaparecer, para que elegir su ancho o acento no parezca un control roto. */}
            <BlockRenderer blocks={[block]} preview />
          </div>
        </div>
      </div>
    </div>
  );
}
