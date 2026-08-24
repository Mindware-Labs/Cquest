import { Josefin_Sans } from "next/font/google";

/* Josefin Sans para login/ y reset-password/ — las dos pantallas que citan la
   tipografía del sitio público (ver auth.css). Un solo lugar para las dos en
   vez de que cada page.tsx repita la misma declaración de cinco líneas.

   Mismo corte que src/app/[lang]/layout.tsx: variable, sin lista de pesos,
   porque acá también hace falta más de un peso (400 del cuerpo, 600 del
   título y las etiquetas, 700 del botón). El panel vive en un `<html>` propio
   (ver admin/layout.tsx) que nunca comparte árbol con el sitio público, así
   que la variable de allá no llega acá — hay que pedirla de nuevo. Next
   dedupea el archivo de fuente real; lo que se duplica es sólo esta
   declaración. */
export const authFont = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
  display: "swap",
});
