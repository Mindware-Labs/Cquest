import type { Metadata } from "next";
import PanelPlaceholder from "@/components/admin/PanelPlaceholder";
import { getSession } from "@/lib/auth-guard";

export const metadata: Metadata = {
  title: "Resumen · Panel Center Quest",
  robots: { index: false, follow: false },
};

export default async function PanelHomePage() {
  const session = await getSession();
  const firstName = session?.user.name?.split(" ")[0] ?? "de nuevo";

  return (
    <PanelPlaceholder
      eyebrow="Resumen"
      title={`Bienvenido, ${firstName}`}
      lead="Esta pantalla va a reunir el pulso del blog: qué se publicó, qué está esperando revisión y qué traducciones quedaron a medias."
      points={[
        {
          title: "Artículos publicados y borradores",
          text: "Conteo por idioma y acceso directo a lo último que se tocó.",
        },
        {
          title: "Traducciones sin revisar",
          text: "Las versiones que generó la IA y todavía no aprobó nadie.",
        },
        {
          title: "Actividad reciente",
          text: "Quién publicó qué y cuándo, para saber en qué estado quedó la operación.",
        },
      ]}
      foot="Nada aquí es definitivo todavía: es el orden en que se va a construir."
    />
  );
}
