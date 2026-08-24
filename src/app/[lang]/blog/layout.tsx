import Navbar from "@/components/Navbar";

// Antes el blog no tenía layout propio ni navegación para volver al sitio. La superficie blanca vive acá (no en cada página) y flex-1 la estira hasta el footer para que no quede franja del crema del sitio.
export default function BlogLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <div className="cq-blog-surface flex flex-1 flex-col">{children}</div>
    </>
  );
}
