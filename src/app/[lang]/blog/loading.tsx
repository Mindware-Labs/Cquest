/* Esqueleto del listado mientras la consulta viaja a la base. Reproduce la
   maqueta real —cabecera, barra de categorías, portada y grilla— para que el
   contenido no salte al llegar. `animate-pulse` de Tailwind ya respeta
   prefers-reduced-motion vía la media query global del proyecto, así que no
   necesita una excepción propia. */

const CONTAINER = "mx-auto w-full max-w-[70rem] px-5 sm:px-8";

export default function BlogLoading() {
  return (
    /* aria-busy en vez de un texto "Cargando…": loading.tsx no recibe `params`,
       así que no puede saber el idioma de la ruta, y una cadena en español
       fija sería la única parte del blog que ignora el idioma del visitante.
       El estado se comunica por atributo, que no necesita traducción. */
    <div aria-busy="true">
      <div className={`${CONTAINER} pb-9 pt-32 sm:pb-11 sm:pt-40`}>
        <div aria-hidden className="animate-pulse">
          <div className="h-11 w-full max-w-[34rem] rounded-[6px] bg-[var(--surface-sunken)]" />
          <div className="mt-3 h-11 w-full max-w-[24rem] rounded-[6px] bg-[var(--surface-sunken)]" />
          <div className="mt-7 h-4 w-full max-w-[38rem] rounded-[4px] bg-[var(--surface-sunken)]" />
        </div>
      </div>

      <div className="cq-blog-filters">
        <div className={`${CONTAINER} flex gap-7 py-4`} aria-hidden>
          {[4, 6, 5, 7].map((width, index) => (
            <div
              key={index}
              className="h-3.5 animate-pulse rounded-[4px] bg-[var(--surface-sunken)]"
              style={{ width: `${width}rem` }}
            />
          ))}
        </div>
      </div>

      <div className={`${CONTAINER} pb-32`}>
        {/* La portada: imagen 2:1 y el texto debajo. */}
        <div aria-hidden className="animate-pulse pt-11 sm:pt-14">
          <div className="aspect-[16/10] w-full rounded-[12px] bg-[var(--surface-sunken)] sm:aspect-[2/1]" />
          <div className="mt-8 h-3 w-24 rounded-[4px] bg-[var(--surface-sunken)]" />
          <div className="mt-4 h-8 w-full max-w-[32rem] rounded-[6px] bg-[var(--surface-sunken)]" />
          <div className="mt-3 h-8 w-4/5 max-w-[24rem] rounded-[6px] bg-[var(--surface-sunken)]" />
          <div className="mt-5 h-4 w-full max-w-[36rem] rounded-[4px] bg-[var(--surface-sunken)]" />
        </div>

        <div aria-hidden className="mt-24 sm:mt-28">
          <div className="border-t border-border pt-8">
            <div className="h-3.5 w-28 animate-pulse rounded-[4px] bg-[var(--surface-sunken)]" />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 sm:gap-y-16 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[16/10] w-full rounded-[12px] bg-[var(--surface-sunken)]" />
                <div className="mt-5 h-3 w-20 rounded-[4px] bg-[var(--surface-sunken)]" />
                <div className="mt-3 h-5 w-4/5 rounded-[4px] bg-[var(--surface-sunken)]" />
                <div className="mt-3.5 h-3 w-24 rounded-[4px] bg-[var(--surface-sunken)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
