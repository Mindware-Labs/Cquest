import { redirect } from "next/navigation";

/* El resumen todavía no existe, pero /admin sí es el destino del login y de
   varios redirects: en vez de borrar la ruta, entra por la primera sección
   real. Cuando el resumen esté listo, esta redirección se cae y vuelve la
   pantalla. */
export default function PanelHomePage() {
  redirect("/admin/posts");
}
