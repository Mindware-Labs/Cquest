import type { CSSProperties } from "react";
import clsx from "clsx";

/* La miniatura de una plantilla: su página, en chiquito.

   Esto ya existió una vez y se sacó, así que vale decir por qué vuelve y qué
   cambió. La versión vieja dibujaba cada bloque como una barra de acento sobre
   `--p-surface-sunken` — que es EXACTAMENTE de lo que está hecho `.cq-skeleton`.
   Mismo material para "todavía no cargó" y para "este es el dato": el contenido
   real se leía como un placeholder eterno.

   El problema nunca fue la idea de mostrar la forma. Fue el material. Así que
   la miniatura vuelve, pero hecha de PAPEL:

     - Fondo `--p-surface` con filete y una sombra mínima. Un esqueleto no tiene
       borde ni sombra: la caja sola ya dice "documento", no "hueco".
     - El texto va en TINTA a distintas opacidades, como un documento real
       —oscuro sobre claro—, no en color de acento.
     - El acento queda reservado para los bloques de MEDIA y llamada (imagen,
       galería, video, CTA), que es donde el ojo se ancla al hojear. Acento con
       intención: marca los hitos, no rellena el dibujo.
     - No se anima. El esqueleto barre; esto está quieto. A un metro de
       distancia esa es la diferencia que se nota primero.

   Y la geometría sale del dato real: cada franja es un bloque de la plantilla,
   en el orden en que se publica. Si sobra, se recorta con un desvanecido abajo
   — la página sigue, y decirlo es más honesto que fingir que entra justa. */

/* Tinta a dos pesos. Los títulos pesan; el cuerpo se retira. Es la misma
   jerarquía que hace el ojo hojeando el artículo publicado. */
const INK_STRONG = "color-mix(in srgb, var(--p-ink) 58%, transparent)";
const INK_SOFT = "color-mix(in srgb, var(--p-ink) 18%, transparent)";
const MEDIA_FILL = "color-mix(in srgb, var(--p-accent) 12%, var(--p-surface))";
const MEDIA_LINE = "color-mix(in srgb, var(--p-accent) 38%, transparent)";

function Bar({
  width,
  height = 3,
  color = INK_SOFT,
  className,
}: {
  width: number | string;
  height?: number;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={clsx("block shrink-0 rounded-[1px]", className)}
      style={{
        width: typeof width === "number" ? `${width}%` : width,
        height: `${height}px`,
        background: color,
      }}
    />
  );
}

function Media({ height, className }: { height: number; className?: string }) {
  return (
    <span
      className={clsx("block w-full shrink-0 rounded-[2px]", className)}
      style={{ height: `${height}px`, background: MEDIA_FILL, border: `1px solid ${MEDIA_LINE}` }}
    />
  );
}

/* Cada tipo de bloque dibuja su propia silueta. Un `<div>` por bloque, así el
   `gap` del contenedor separa bloques y el `gap` interno separa las líneas de
   un mismo bloque — que es la diferencia entre "un párrafo" y "tres párrafos". */
function BlockShape({ type }: { type: string }) {
  switch (type) {
    case "heading":
      return <Bar width={62} height={6} color={INK_STRONG} />;

    case "paragraph":
      return (
        <div className="flex flex-col gap-[3px]">
          <Bar width={100} />
          <Bar width={96} />
          <Bar width={71} />
        </div>
      );

    case "image":
      return <Media height={26} />;

    case "video":
      return <Media height={24} />;

    case "gallery":
      return (
        <div className="flex gap-[4px]">
          <Media height={16} />
          <Media height={16} />
          <Media height={16} />
        </div>
      );

    /* La cita se reconoce por su filete lateral, que es exactamente como se
       reconoce en el artículo publicado. */
    case "quote":
      return (
        <div
          className="flex flex-col gap-[3px] pl-[5px]"
          style={{ borderLeft: `2px solid ${MEDIA_LINE}` }}
        >
          <Bar width={84} />
          <Bar width={52} />
        </div>
      );

    case "list":
      return (
        <div className="flex flex-col gap-[4px]">
          {[70, 64, 58].map((width, index) => (
            <span key={index} className="flex items-center gap-[4px]">
              <span
                className="size-[3px] shrink-0 rounded-[1px]"
                style={{ background: INK_STRONG }}
              />
              <Bar width={width} />
            </span>
          ))}
        </div>
      );

    /* La tabla se dibuja como tabla —encabezado más oscuro y dos filas con
       divisiones verticales—, no como dos barras. Es el bloque más difícil de
       reconocer si se simplifica de más. */
    case "table":
      return (
        <div
          className="flex w-full flex-col overflow-hidden rounded-[2px]"
          style={{ border: `1px solid ${INK_SOFT}` }}
        >
          <span className="flex h-[6px] w-full" style={{ background: INK_SOFT }}>
            <span className="flex-1" />
            <span className="w-px" style={{ background: "var(--p-surface)" }} />
            <span className="flex-1" />
          </span>
          {[0, 1].map((row) => (
            <span
              key={row}
              className="flex h-[5px] w-full"
              style={{ borderTop: `1px solid ${INK_SOFT}` }}
            >
              <span className="flex-1" />
              <span className="w-px" style={{ background: INK_SOFT }} />
              <span className="flex-1" />
            </span>
          ))}
        </div>
      );

    case "columns":
      return (
        <div className="flex gap-[6px]">
          {[0, 1].map((column) => (
            <span key={column} className="flex flex-1 flex-col gap-[3px]">
              <Bar width={72} height={4} color={INK_STRONG} />
              <Bar width={100} />
              <Bar width={88} />
            </span>
          ))}
        </div>
      );

    /* El CTA es el único relleno sólido de acento de toda la miniatura. Tiene
       que serlo: en el artículo publicado también es lo único que grita. */
    case "cta":
      return (
        <span
          className="block h-[9px] rounded-[2px]"
          style={{ width: "42%", background: "var(--p-accent)", opacity: 0.75 }}
        />
      );

    case "divider":
      return <Bar width={100} height={1} />;

    default:
      return <Bar width={100} />;
  }
}

/* Diez bloques alcanzan y sobran para llenar la caja. Dibujar los cuarenta de
   una plantilla larga es pintar píxeles debajo del recorte. */
const MAX_BLOCKS = 10;

export function TemplateThumb({
  types,
  className,
}: {
  types: readonly string[];
  className?: string;
}) {
  return (
    /* `aria-hidden` porque es geometría: la estructura ya se anuncia en texto
       desde la tarjeta, y un lector de pantalla no gana nada recorriendo
       treinta barras vacías. */
    <div aria-hidden="true" className={clsx("cq-thumb", className)}>
      {types.length === 0 ? (
        <span className="cq-thumb-blank">Sin bloques</span>
      ) : (
        <div
          className="cq-thumb-page"
          /* El desvanecido de abajo aparece SÓLO cuando hay bloques recortados.
             Un degradado permanente sobre una página que entra completa dice
             que hay más y no hay más. */
          style={
            types.length > MAX_BLOCKS
              ? ({
                  maskImage: "linear-gradient(to bottom, #000 72%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, #000 72%, transparent 100%)",
                } as CSSProperties)
              : undefined
          }
        >
          {types.slice(0, MAX_BLOCKS).map((type, index) => (
            <BlockShape key={`${type}-${index}`} type={type} />
          ))}
        </div>
      )}
    </div>
  );
}
