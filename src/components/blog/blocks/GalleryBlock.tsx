import Image from "next/image";
import { blockSpacing, type BlockOf } from "@/lib/blocks-style";
import MediaSlot from "./MediaSlot";

const LAYOUT = {
  "grid-2": "sm:grid-cols-2",
  "grid-3": "sm:grid-cols-2 lg:grid-cols-3",
} as const;

export default function GalleryBlock({
  block,
  preview = false,
}: {
  block: BlockOf<"gallery">;
  preview?: boolean;
}) {
  /* Las imágenes sin subir se descartan; si no queda ninguna, la galería
     entera desaparece en vez de dejar una grilla vacía. */
  const images = block.images.filter((image) => image.src);

  /* En previa, una galería vacía dibuja sus huecos en la grilla que le
     corresponde. Es el dato que importa de este bloque: cuántas columnas ocupa
     y qué ritmo le da a la página. */
  if (images.length === 0) {
    if (!preview) return null;
    const slots = Math.max(block.images.length, block.layout === "grid-3" ? 3 : 2);
    return (
      <div className={blockSpacing(block.spacingTop, block.spacingBottom)}>
        <div className={`grid grid-cols-1 gap-4 ${LAYOUT[block.layout]}`}>
          {Array.from({ length: slots }, (_, index) => (
            <MediaSlot key={index} aspect="4 / 3" />
          ))}
        </div>
      </div>
    );
  }

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
