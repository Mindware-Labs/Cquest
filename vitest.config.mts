import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/* Pruebas de la lógica pura del blog.
   ---------------------------------------------------------------------------

   No hay entorno de navegador ni base de datos a propósito. Lo que se prueba
   acá son las funciones donde un error NO se ve: un schema que deja pasar un
   artículo inválido, una hora corrida cuatro puestos, un token de
   previsualización que valida cuando no debería. Nada de eso lanza una
   excepción — simplemente hace lo incorrecto en silencio, que es exactamente el
   tipo de fallo que una prueba encuentra y una revisión no.

   Los componentes y las páginas no se prueban acá. Montar React en jsdom para
   verificar que un botón dice "Publicar" cuesta mucha infraestructura para
   confirmar algo que se ve mirando la pantalla. */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      /* El mismo `@/` que usa el resto del proyecto (tsconfig paths). Vite no
         lee tsconfig por su cuenta, así que hay que declararlo. */
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
