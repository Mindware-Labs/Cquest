import Navbar from "@/components/Navbar";

/* El blog no tenía layout propio y por lo tanto tampoco navegación: se entraba a
   un artículo y no había forma de volver al sitio. Usa el mismo Navbar que legal,
   services y team — no una barra distinta para esta sección.

   La superficie blanca vive acá y no en cada página: así el índice y el artículo
   comparten fondo sin repetirlo, y `flex-1` la estira hasta el footer para que no
   quede una franja del crema del sitio entre el último artículo y el pie. */
export default function BlogLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <div className="cq-blog-surface flex flex-1 flex-col">{children}</div>
    </>
  );
}
