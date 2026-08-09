module.exports = {
  presets: ["next/babel"],
  overrides: [
    {
      /* locator inyecta data-locatorjs-id en cada elemento JSX. En los archivos
         de react-three-fiber los elementos no son DOM sino objetos three.js, y
         al aplicarles el atributo lanzan:
         "R3F: Cannot set data-locatorjs-id. Ensure it is an object before
         setting locatorjs-id". Por eso el plugin vive en un override que los
         excluye: en Babel los plugins se concatenan, no se pueden quitar desde
         un override anidado. */
      exclude: [/BrainCanvas\.tsx$/, /BrainModel\.tsx$/],
      env: {
        development: {
          plugins: [["@locator/babel-jsx/dist", { env: "development" }]],
        },
      },
    },
  ],
};
