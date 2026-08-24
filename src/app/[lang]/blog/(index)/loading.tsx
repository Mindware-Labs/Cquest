/* Esqueleto del listado mientras la consulta viaja a la base. Reproduce la
   maqueta real —cabecera, barra de categorías, portada y grilla— para que el
   contenido no salte al llegar. `animate-pulse` de Tailwind ya respeta
   prefers-reduced-motion vía la media query global del proyecto, así que no
   necesita una excepción propia. */

const CONTAINER = "mx-auto w-full max-w-[70rem] px-5 sm:px-8";

/* Vive en el grupo `(index)` y ya no en `blog/`, y el motivo es un 404 que no
   era 404.
   ---------------------------------------------------------------------------

   Un `loading.tsx` es un límite de Suspense, y desde `blog/` ese límite envolvía
   también a `blog/[slug]`. Con streaming, la cabecera HTTP sale ANTES de que la
   página termine de renderizarse: para cuando `notFound()` se disparaba sobre un
   slug inexistente, el 200 ya estaba enviado y no había forma de corregirlo. El
   visitante veía la pantalla de 404 correcta, pero el servidor le decía a Google
   "esta página existe" — un soft 404, que es como se llenan los informes de
   Search Console de URLs fantasma indexadas.

   El grupo `(index)` no aparece en la URL (`/blog` sigue siendo `/blog`), pero
   acota el límite a esta pantalla. El artículo queda fuera y vuelve a responder
   404 de verdad. */
export default function BlogLoading() {
  return (
    /* aria-busy en vez de un texto "Cargando…": loading.tsx no recibe `params`,
       así que no puede saber el idioma de la ruta, y una cadena en español
       fija sería la única parte del blog que ignora el idioma del visitante.
       El estado se comunica por atributo, que no necesita traducción. */
    <div aria-busy="true">
      {/* La barra de categorías va PRIMERA, igual que en la pantalla real. */}
      <div className="cq-blog-filters mt-28 sm:mt-32">
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

      {/* Titular a la izquierda y bajada a la derecha, apoyados en la base. */}
      <div
        className={`${CONTAINER} grid items-end gap-x-12 gap-y-5 pb-8 pt-10 sm:pb-10 sm:pt-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]`}
      >
        <div aria-hidden className="animate-pulse">
          <div className="h-10 w-full max-w-[30rem] rounded-[6px] bg-[var(--surface-sunken)]" />
          <div className="mt-3 h-10 w-4/5 max-w-[22rem] rounded-[6px] bg-[var(--surface-sunken)]" />
        </div>
        <div aria-hidden className="animate-pulse lg:pb-2">
          <div className="h-4 w-full max-w-[26rem] rounded-[4px] bg-[var(--surface-sunken)]" />
          <div className="mt-2.5 h-4 w-4/5 max-w-[20rem] rounded-[4px] bg-[var(--surface-sunken)]" />
        </div>
      </div>

      <div className={`${CONTAINER} pb-32`}>
        {/* La franja de portada: dos columnas verticales flanqueando la grande. */}
        <div
          aria-hidden
          className="grid animate-pulse gap-x-7 gap-y-12 pt-9 sm:pt-11 lg:grid-cols-[minmax(0,0.74fr)_minmax(0,1.62fr)_minmax(0,0.74fr)] lg:items-start"
        >
          <div className="order-2 lg:order-1">
            <div className="aspect-[16/10] w-full rounded-[12px] bg-[var(--surface-sunken)] lg:aspect-[3/4]" />
            <div className="mt-5 h-3 w-20 rounded-[4px] bg-[var(--surface-sunken)]" />
            <div className="mt-3 h-5 w-4/5 rounded-[4px] bg-[var(--surface-sunken)]" />
          </div>

          <div className="order-1 lg:order-2">
            <div className="aspect-[16/10] w-full rounded-[12px] bg-[var(--surface-sunken)] sm:aspect-[2/1]" />
            <div className="mt-8 h-3 w-24 rounded-[4px] bg-[var(--surface-sunken)]" />
            <div className="mt-4 h-8 w-full max-w-[26rem] rounded-[6px] bg-[var(--surface-sunken)]" />
            <div className="mt-3 h-8 w-4/5 max-w-[20rem] rounded-[6px] bg-[var(--surface-sunken)]" />
            <div className="mt-5 h-4 w-full max-w-[30rem] rounded-[4px] bg-[var(--surface-sunken)]" />
          </div>

          <div className="order-3">
            <div className="aspect-[16/10] w-full rounded-[12px] bg-[var(--surface-sunken)] lg:aspect-[3/4]" />
            <div className="mt-5 h-3 w-20 rounded-[4px] bg-[var(--surface-sunken)]" />
            <div className="mt-3 h-5 w-4/5 rounded-[4px] bg-[var(--surface-sunken)]" />
          </div>
        </div>

        <div aria-hidden className="mt-16 sm:mt-20">
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
