module.exports = {
  presets: ["next/babel"],
  overrides: [
    {
      /* locator inyecta data-locatorjs-id en cada elemento JSX. En los
         elementos de react-three-fiber (group, primitive, luces, y el
         <Center> de drei que reenvía sus props a un <group>) el "receptor"
         no es un nodo DOM sino un objeto three.js: al aplicarles el atributo
         lanzan "R3F: Cannot set data-locatorjs-id. Ensure it is an object
         before setting locatorjs-id", porque R3F interpreta el guion como
         una ruta anidada (data -> locatorjs -> id).
         Un exclude por archivo (BrainCanvas.tsx/BrainModel.tsx) no basta:
         bajo Turbopack, next 16 aplica su babel-loader automático a todo el
         proyecto y no respeta el exclude anidado. Por eso el bloqueo va por
         nombre de componente, que el propio plugin evalúa por JSX sin
         depender de qué archivo lo contiene. */
      env: {
        development: {
          plugins: [
            [
              "@locator/babel-jsx/dist",
              {
                env: "development",
                ignoreComponentNames: [
                  "Canvas",
                  "ambientLight",
                  "directionalLight",
                  "group",
                  "primitive",
                  "Center",
                ],
              },
            ],
          ],
        },
      },
    },
  ],
};
