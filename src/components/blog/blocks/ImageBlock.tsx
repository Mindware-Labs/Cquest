import Image from "next/image";
import { ACCENT_RING, blockSpacing, type BlockOf } from "@/lib/blocks-style";

export default function ImageBlock({ block }: { block: BlockOf<"image"> }) {
  /* Un bloque de imagen sin subir todavía (borrador a medio escribir) no
     renderiza un <img> roto: simplemente no existe en el artículo público. */
  if (!block.src) return null;

  const accent = block.accent ? ACCENT_RING[block.accent] : "";
  const isFull = block.display === "full";

  /* La columna de lectura mide 44rem (704px); a ancho completo llega a 76rem.
     Decírselo al optimizador evita que sirva una imagen de 2000px para un
     hueco de 700 — que es la mitad del presupuesto de carga de la página. */
  const sizes = isFull ? "(max-width: 1216px) 100vw, 1216px" : "(max-width: 704px) 100vw, 704px";

  return (
    <figure
      className={`${isFull ? "-mx-5 sm:-mx-10 lg:-mx-24" : ""} ${blockSpacing(block.spacingTop, block.spacingBottom)}`}
    >
      {block.width && block.height ? (
        /* Con dimensiones reales, next/image reserva exactamente el espacio que
           va a ocupar: el texto de abajo no salta cuando la imagen llega. */
        <Image
          src={block.src}
          alt={block.alt}
          width={block.width}
          height={block.height}
          sizes={sizes}
          className={`h-auto w-full rounded-lg ${accent}`}
        />
      ) : (
        /* Bloques subidos antes de que se guardaran las dimensiones: se recorta
           a una proporción fija en vez de adivinar la real. Es una degradación
           visible pero estable, no un salto de layout. */
        <div className={`relative aspect-[3/2] w-full overflow-hidden rounded-lg ${accent}`}>
          <Image src={block.src} alt={block.alt} fill sizes={sizes} className="object-cover" />
        </div>
      )}
      {block.caption && (
        <figcaption className="mt-3 text-center text-[0.85rem] leading-relaxed text-[var(--text-tertiary)]">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
