import type { LegalDoc } from "./content";

/* Documento legal, no página de marketing: una sola columna de medida legible,
   centrada en la página, con el índice fijo al costado en desktop. Antes el
   texto se alineaba al borde izquierdo del contenedor de 84rem y dejaba medio
   ancho vacío, que es lo que hacía que se leyera como un borrador. */
export default function LegalPage({ doc }: { doc: LegalDoc }) {
  const t = { updated: "Last updated", contents: "Contents", top: "Back to top" };

  return (
    <div className="mx-auto w-full max-w-[66rem] px-5 pb-28 pt-32 sm:px-8 sm:pt-36">
      <header className="mx-auto max-w-[44rem] border-b border-border pb-10 lg:mx-0 lg:ml-[calc(15rem+2.5rem)]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-petroleo">
          Center Quest
        </p>
        <h1 className="mt-3 font-heading text-[clamp(2.1rem,4.5vw,3.1rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-foreground">
          {doc.title}
        </h1>
        <p className="mt-4 text-sm text-[var(--text-tertiary)]">
          {t.updated}: {doc.updated}
        </p>
        <p className="mt-7 text-pretty text-[1.02rem] leading-[1.75] text-[var(--text-secondary)]">
          {doc.intro}
        </p>
      </header>

      <div className="mt-12 lg:grid lg:grid-cols-[15rem_minmax(0,44rem)] lg:gap-10">
        {/* El índice se queda a la vista mientras se lee: un documento legal se
            consulta por secciones, no se lee de corrido. */}
        <nav aria-label={t.contents} className="mb-12 lg:sticky lg:top-28 lg:mb-0 lg:self-start">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
            {t.contents}
          </p>
          <ol className="mt-4 space-y-1 border-l border-border">
            {doc.sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="-ml-px block border-l border-transparent py-1.5 pl-4 text-[0.9rem] leading-snug text-[var(--text-tertiary)] transition-colors hover:border-petroleo hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
                >
                  <span className="mr-2 tabular-nums text-[0.78rem] text-petroleo/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mx-auto max-w-[44rem] lg:mx-0">
          {doc.sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-28 border-t border-border py-10 first:border-t-0 first:pt-0"
            >
              <h2 className="font-heading text-xl font-semibold leading-snug tracking-[-0.015em] text-foreground sm:text-[1.4rem]">
                <span className="mr-3 align-middle text-[0.85rem] font-semibold tabular-nums text-petroleo">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {section.heading}
              </h2>
              <div className="mt-5 space-y-4">
                {section.blocks.map((block, blockIndex) =>
                  block.type === "p" ? (
                    <p
                      key={blockIndex}
                      className="text-pretty text-[0.98rem] leading-[1.75] text-[var(--text-secondary)]"
                    >
                      {block.text}
                    </p>
                  ) : (
                    <ul
                      key={blockIndex}
                      className="space-y-2.5 text-[0.98rem] leading-[1.7] text-[var(--text-secondary)]"
                    >
                      {block.items.map((item) => (
                        <li key={item} className="relative pl-5">
                          <span
                            aria-hidden
                            className="absolute left-0 top-[0.7em] h-1.5 w-1.5 rounded-full bg-celeste"
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}

          <div className="border-t border-border pt-8">
            <a
              href="#main-content"
              className="text-[0.7rem] font-bold uppercase tracking-[0.13em] text-petroleo hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
            >
              {t.top}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
