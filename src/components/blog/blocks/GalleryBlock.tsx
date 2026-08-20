import Image from "next/image";
import { blockSpacing, type BlockOf } from "@/lib/blocks-style";

const LAYOUT = {
  "grid-2": "sm:grid-cols-2",
  "grid-3": "sm:grid-cols-2 lg:grid-cols-3",
} as const;

export default function GalleryBlock({ block }: { block: BlockOf<"gallery"> }) {
  /* Las imágenes sin subir se descartan; si no queda ninguna, la galería
     entera desaparece en vez de dejar una grilla vacía. */
  const images = block.images.filter((image) => image.src);
  if (images.length === 0) return null;

  return (
    <div className={blockSpacing(block.spacingTop, block.spacingBottom)}>
      <div className={`grid grid-cols-1 gap-4 ${LAYOUT[block.layout]}`}>
        {images.map((image, index) => (
          <figure key={`${image.src}-${index}`}>
            {/* La grilla recorta a una altura común para que las filas no
                queden dentadas: el encuadre lo decide el diseño, no la foto.
                Por eso `fill` — no hacen falta las dimensiones del archivo. */}
            <div className="relative h-56 w-full overflow-hidden rounded-lg">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={block.layout === "grid-3" ? "(max-width: 640px) 100vw, 33vw" : "(max-width: 640px) 100vw, 50vw"}
                className="object-cover"
              />
            </div>
            {image.caption && (
              <figcaption className="mt-2 text-[0.8rem] leading-relaxed text-[var(--text-tertiary)]">
                {image.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}
