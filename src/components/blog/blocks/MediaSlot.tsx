// Hueco de un medio sin subir: sólo para vistas previas del admin (en el blog publicado el bloque simplemente no existe). Sin texto adentro porque a la escala de una miniatura de plantilla una etiqueta sería ilegible.

export default function MediaSlot({ aspect = "3 / 2" }: { aspect?: string }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-lg"
      style={{
        aspectRatio: aspect,
        // Neutro y no el hundido del blog (crema tibio): a ancho completo esa banda cálida se llevaba el ojo antes que el título.
        background: "color-mix(in srgb, var(--text-tertiary) 6%, transparent)",
        border: "1px dashed color-mix(in srgb, var(--text-tertiary) 30%, transparent)",
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {/* Sin `non-scaling-stroke`: con él, el trazo no se reducía en la miniatura de plantilla y las diagonales quedaban más gritonas que el contenido real. */}
        <g stroke="color-mix(in srgb, var(--text-tertiary) 28%, transparent)" strokeWidth="0.4">
          <line x1="0" y1="0" x2="100" y2="100" />
          <line x1="100" y1="0" x2="0" y2="100" />
        </g>
      </svg>
    </div>
  );
}
