/* El hueco de un medio que todavía no está.

   Existe para las VISTAS PREVIAS del admin, nunca para el artículo publicado.
   En el blog, un bloque de imagen sin subir simplemente no existe —esa decisión
   no cambia—, pero en una vista previa desaparecer es lo peor que puede hacer:
   la previa está justamente para mostrar cómo va a quedar la página, y una
   página a la que le faltan sus tres imágenes no muestra cómo va a quedar.

   Se dibuja como un marco de maqueta —filete punteado y las dos diagonales—,
   que es la convención de cualquier herramienta de diagramación para "acá va una
   imagen". Sin texto adentro a propósito: la miniatura de una plantilla se
   reduce a poco más de un tercio, y a esa escala una etiqueta es una mancha
   ilegible. Dos diagonales se leen igual de bien a 40px que a 400px. */

export default function MediaSlot({ aspect = "3 / 2" }: { aspect?: string }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-lg"
      style={{
        aspectRatio: aspect,
        /* Neutro, no el hundido del blog: ese token es un crema tibio, y a
           ancho completo pintaba una banda cálida que se llevaba el ojo antes
           que el título. Un hueco no compite. */
        background: "color-mix(in srgb, var(--text-tertiary) 6%, transparent)",
        border: "1px dashed color-mix(in srgb, var(--text-tertiary) 30%, transparent)",
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {/* SIN `non-scaling-stroke`, y es una corrección de la primera versión.

            Lo puse para que el trazo no se deformara con el estirado del
            lienzo, y el efecto real fue el contrario del buscado: dentro de la
            miniatura de una plantilla —que se dibuja a poco más de un tercio de
            escala— el trazo se negaba a reducirse con todo lo demás. El texto
            del artículo quedaba en 4px y estas dos diagonales seguían pesando
            1px entero, así que el hueco de la imagen se volvía lo más oscuro y
            lo más gritón de toda la tarjeta: dos aspas enormes sobre el
            contenido que en realidad había que leer.

            Un marco de maqueta tiene que ser lo más callado del dibujo. Ahora el
            trazo escala con la caja como el resto: en el editor se ve nítido y
            en la miniatura se retira al fondo, que es donde va. */}
        <g stroke="color-mix(in srgb, var(--text-tertiary) 28%, transparent)" strokeWidth="0.4">
          <line x1="0" y1="0" x2="100" y2="100" />
          <line x1="100" y1="0" x2="0" y2="100" />
        </g>
      </svg>
    </div>
  );
}
