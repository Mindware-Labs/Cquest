/* Esqueleto del listado mientras la consulta viaja a la base. Reproduce la
   grilla real para que el contenido no salte al llegar. `animate-pulse` de
   Tailwind ya respeta prefers-reduced-motion vía la media query global del
   proyecto, así que no necesita una excepción propia. */
export default function BlogLoading() {
  return (
    /* aria-busy en vez de un texto "Cargando…": loading.tsx no recibe `params`,
       así que no puede saber el idioma de la ruta, y una cadena en español
       fija sería la única parte del blog que ignora el idioma del visitante.
       El estado se comunica por atributo, que no necesita traducción. */
    <div
      aria-busy="true"
      className="mx-auto w-full max-w-[72rem] px-5 pb-28 pt-32 sm:px-8 sm:pt-36"
    >
      <div className="border-b border-border pb-10">
        <div className="h-3 w-28 rounded bg-[var(--surface-sunken)]" />
        <div className="mt-4 h-10 w-40 rounded bg-[var(--surface-sunken)]" />
        <div className="mt-5 h-4 w-full max-w-[38rem] rounded bg-[var(--surface-sunken)]" />
      </div>

      <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} aria-hidden className="animate-pulse">
            <div className="aspect-[16/10] w-full rounded-lg bg-[var(--surface-sunken)]" />
            <div className="mt-5 h-3 w-20 rounded bg-[var(--surface-sunken)]" />
            <div className="mt-3 h-5 w-3/4 rounded bg-[var(--surface-sunken)]" />
            <div className="mt-3 h-3 w-full rounded bg-[var(--surface-sunken)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
