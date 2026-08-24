import { blockSpacing, type BlockOf } from "@/lib/blocks-style";
import MediaSlot from "./MediaSlot";

// El admin guarda proveedor + id, nunca un <iframe> pegado; el id ya fue validado por el schema contra /^[a-zA-Z0-9_-]+$/, así no hay forma de inyectar markup desde el editor.
const EMBED: Record<BlockOf<"video">["provider"], (id: string) => string> = {
  youtube: (id) => `https://www.youtube-nocookie.com/embed/${id}`,
  vimeo: (id) => `https://player.vimeo.com/video/${id}`,
};

export default function VideoBlock({
  block,
  preview = false,
}: {
  block: BlockOf<"video">;
  preview?: boolean;
}) {
  // En preview se dibuja el hueco y no el iframe: por costo, no por falta de contenido — veinte tarjetas de Plantillas cargando veinte iframes de YouTube sería media pantalla de red gastada en rectángulos de 40px.
  if (preview) {
    return (
      <figure className={blockSpacing(block.spacingTop, block.spacingBottom)}>
        <MediaSlot aspect="16 / 9" />
      </figure>
    );
  }

  return (
    <figure className={blockSpacing(block.spacingTop, block.spacingBottom)}>
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-[var(--surface-sunken)]">
        <iframe
          src={EMBED[block.provider](block.videoId)}
          title={block.caption ?? "Video"}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
      {block.caption && (
        <figcaption className="mt-3 text-center text-[0.85rem] leading-relaxed text-[var(--text-tertiary)]">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}
