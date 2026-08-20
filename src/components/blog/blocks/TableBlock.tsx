import { blockSpacing, type BlockOf } from "@/lib/blocks-style";

export default function TableBlock({ block }: { block: BlockOf<"table"> }) {
  return (
    /* La tabla scrollea dentro de su propia caja: en móvil (más del 60% del
       tráfico) una tabla de 5 columnas no puede empujar el ancho de la página
       entera. */
    <div className={`overflow-x-auto ${blockSpacing(block.spacingTop, block.spacingBottom)}`}>
      <table className="w-full min-w-[32rem] border-collapse text-left text-[0.95rem]">
        <thead>
          <tr className="border-b border-border">
            {block.headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-petroleo"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-b border-border/60 ${block.striped && rowIndex % 2 === 1 ? "bg-[var(--surface-sunken)]" : ""}`}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-3 leading-relaxed text-[var(--text-secondary)]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
