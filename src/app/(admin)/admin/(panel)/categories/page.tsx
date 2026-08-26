import type { Metadata } from "next";
import PanelPlaceholder from "@/components/admin/PanelPlaceholder";

export const metadata: Metadata = {
  title: "Categorías · Panel Center Quest",
  robots: { index: false, follow: false },
};

export default function CategoriesPage() {
  return (
    <PanelPlaceholder
      eyebrow="Categorías"
      title="Categorías del blog"
      lead="Las categorías agrupan los artículos y alimentan los filtros del blog público. Arrancan vacías: las defines tú según cómo quieras ordenar el contenido."
      points={[
        {
          title: "Alta y edición",
          text: "Nombre en español e inglés, más el slug que se ve en la URL.",
        },
        {
          title: "Uso real",
          text: "Cuántos artículos cuelgan de cada una antes de renombrarla o borrarla.",
        },
        {
          title: "Orden de aparición",
          text: "El orden en que se listan los filtros en el blog público.",
        },
      ]}
    />
  );
}
