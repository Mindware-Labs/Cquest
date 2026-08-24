import Image from "next/image";
import { ACCENT_RING, blockSpacing, type BlockOf } from "@/lib/blocks-style";
import MediaSlot from "./MediaSlot";

export default function ImageBlock({
  block,
  preview = false,
}: {
  block: BlockOf<"image">;
  // Solo lo activan las vistas previas del admin; el artículo público nunca lo pasa.
  preview?: boolean;
}) {
  const accent = block.accent ? ACCENT_RING[block.accent] : "";
  const isFull = block.display === "full";

  // Un bloque de imagen sin subir no renderiza nada en el artículo público (evita un <img> roto); en preview dibuja un marco vacío para poder juzgar el ritmo antes de subir el archivo.
  if (!block.src) {
    if (!preview) return null;
    return (
      <figure
        className={`${isFull ? "-mx-5 sm:-mx-10 lg:-mx-24" : ""} ${blockSpacing(block.spacingTop, block.spacingBottom)}`}
      >
        <MediaSlot />
      </figure>
    );
  }

  // La columna de lectura mide 44rem (704px), a ancho completo 76rem; decírselo al optimizador evita servir una imagen de 2000px para un hueco de 700.
  const sizes = isFull ? "(max-width: 1216px) 100vw, 1216px" : "(max-width: 704px) 100vw, 704px";

  return (
    <figure
      className={`${isFull ? "-mx-5 sm:-mx-10 lg:-mx-24" : ""} ${blockSpacing(block.spacingTop, block.spacingBottom)}`}
    >
      {block.width && block.height ? (
        // Con dimensiones reales, next/image reserva el espacio exacto: el texto de abajo no salta cuando la imagen llega.
        <Image
          src={block.src}
          alt={block.alt}
          width={block.width}
          height={block.height}
          sizes={sizes}
          className={`h-auto w-full rounded-lg ${accent}`}
        />
      ) : (
        // Bloques subidos antes de que se guardaran las dimensiones: se recorta a proporción fija en vez de adivinar la real (degradación estable, no salto de layout).
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
