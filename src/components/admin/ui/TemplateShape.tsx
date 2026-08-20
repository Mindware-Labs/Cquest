/* La forma de una plantilla ES su secuencia de bloques. Mostrar "6 bloques" no
   dice nada; mostrar la silueta deja elegir de un vistazo entre un estudio de
   caso y un anuncio corto. Es geometría derivada del dato real, no un adorno:
   cada franja corresponde a un bloque, en el orden en que se publica. */

type Shape = {
  /* Anchos en porcentaje. `stack` los apila (un párrafo son varias líneas);
     `row` los pone lado a lado (una galería, dos columnas). */
  widths: number[];
  layout: "stack" | "row";
  tone: "solid" | "line";
};

const SHAPE: Record<string, Shape> = {
  heading: { widths: [58], layout: "stack", tone: "solid" },
  paragraph: { widths: [100, 96, 72], layout: "stack", tone: "line" },
  image: { widths: [100], layout: "stack", tone: "solid" },
  gallery: { widths: [32, 32, 32], layout: "row", tone: "solid" },
  video: { widths: [100], layout: "stack", tone: "solid" },
  quote: { widths: [84, 52], layout: "stack", tone: "line" },
  list: { widths: [70, 64, 58], layout: "stack", tone: "line" },
  table: { widths: [100, 100], layout: "stack", tone: "line" },
  cta: { widths: [38], layout: "stack", tone: "solid" },
  columns: { widths: [48, 48], layout: "row", tone: "solid" },
  divider: { widths: [100], layout: "stack", tone: "line" },
};

const FALLBACK: Shape = { widths: [100], layout: "stack", tone: "line" };

export function TemplateShape({ types }: { types: readonly string[] }) {
  if (types.length === 0) {
    return (
      <div className="flex h-[4.75rem] items-center justify-center rounded-[2px] bg-[var(--surface-sunken)] text-[0.74rem] text-[var(--text-tertiary)]">
        Sin bloques
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="flex h-[4.75rem] flex-col gap-[4px] overflow-hidden rounded-[2px] bg-[var(--surface-sunken)] px-2.5 py-2"
    >
      {types.slice(0, 6).map((type, index) => {
        const shape = SHAPE[type] ?? FALLBACK;
        const bar =
          shape.tone === "solid"
            ? "h-[7px] rounded-[1px] bg-petroleo/60"
            : "h-[3px] rounded-[1px] bg-[var(--brand-gris)]";

        return (
          <div
            key={`${type}-${index}`}
            className={shape.layout === "row" ? "flex gap-[4px]" : "flex flex-col gap-[3px]"}
          >
            {shape.widths.map((width, barIndex) => (
              <span key={barIndex} style={{ width: `${width}%` }} className={bar} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
