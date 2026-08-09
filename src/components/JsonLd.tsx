/* Server component a propósito: el dato estructurado tiene que estar en el HTML
   que recibe el rastreador, no inyectarse al hidratar. */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      /* JSON.stringify no escapa `<`, así que un dato con "</script>" dentro
         cerraría la etiqueta antes de tiempo. Es el único vector real de
         inyección en un bloque JSON-LD. */
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
