import { describe, expect, it } from "vitest";
import { blockArraySchema, collectImageUrls, extractText, type Block } from "./blocks";

/* `blockArraySchema` es donde converge todo el módulo: el editor, el renderer
   público y el guardado validan contra él. Si afloja, se rompen los tres a la
   vez y de formas distintas. */

function paragraph(text: string, id = "p1"): Block {
  return { id, type: "paragraph", text, variant: "body", align: "left", spacingTop: "md", spacingBottom: "md" };
}

function image(overrides: Partial<Extract<Block, { type: "image" }>> = {}): Block {
  return {
    id: "img1",
    type: "image",
    src: "/api/images/posts/foto.jpg",
    alt: "Una descripción",
    display: "inset",
    spacingTop: "md",
    spacingBottom: "md",
    ...overrides,
  } as Block;
}

describe("blockArraySchema", () => {
  it("rechaza un artículo sin bloques", () => {
    expect(blockArraySchema.safeParse([]).success).toBe(false);
  });

  it("rellena los valores por defecto que el editor no manda", () => {
    const result = blockArraySchema.safeParse([
      { id: "h1", type: "heading", text: "Título" },
    ]);
    expect(result.success).toBe(true);
    /* Sin esto, un bloque guardado por una versión anterior del editor —o por
       una plantilla escrita a mano— llegaría al renderer sin `level` y sin
       `spacing`, y el renderer no tiene de dónde sacarlos. */
    expect(result.data?.[0]).toMatchObject({ level: "h2", spacingTop: "md", spacingBottom: "md" });
  });

  it("rechaza una imagen SUBIDA sin texto alternativo", () => {
    /* RNF-5. El panel promete que sin texto alternativo el artículo no se
       guarda, y esta regla es lo único que sostiene esa promesa. */
    const result = blockArraySchema.safeParse([image({ alt: "" })]);
    expect(result.success).toBe(false);
  });

  it("acepta una imagen todavía SIN subir, para no romper el borrador", () => {
    /* Una imagen recién agregada no tiene archivo ni descripción. Exigirle alt
       ahí haría imposible guardar un borrador a medio escribir. */
    const result = blockArraySchema.safeParse([image({ src: "", alt: "" })]);
    expect(result.success).toBe(true);
  });

  it("exige texto alternativo también dentro de una columna", () => {
    /* El caso que un `.refine()` sobre el bloque suelto no cubriría: la
       validación tiene que recorrer el árbol, no la lista de primer nivel. */
    const result = blockArraySchema.safeParse([
      {
        id: "cols",
        type: "columns",
        columnCount: 2,
        columns: [[image({ alt: "" })], [paragraph("Texto")]],
      },
    ]);
    expect(result.success).toBe(false);
  });

  it("rechaza una imagen que no salió de nuestra propia subida", () => {
    /* Una URL externa en un bloque de imagen es contenido de terceros servido
       bajo nuestro dominio, y next/image ni siquiera la optimizaría. */
    const result = blockArraySchema.safeParse([image({ src: "https://ejemplo.com/foto.jpg" })]);
    expect(result.success).toBe(false);
  });

  it("rechaza un id de video con caracteres que romperían el iframe", () => {
    const result = blockArraySchema.safeParse([
      { id: "v1", type: "video", provider: "youtube", videoId: '"><script>' },
    ]);
    expect(result.success).toBe(false);
  });
});

describe("collectImageUrls", () => {
  it("junta las imágenes sueltas, las de galería y las anidadas en columnas", () => {
    /* Si esto se olvida de una rama, esa imagen se borra del store creyendo que
       nadie la referencia — y queda rota en un artículo publicado. */
    const blocks = blockArraySchema.parse([
      image({ id: "a", src: "/api/images/posts/a.jpg" }),
      {
        id: "g",
        type: "gallery",
        images: [
          { src: "/api/images/posts/b.jpg", alt: "b" },
          { src: "/api/images/posts/c.jpg", alt: "c" },
        ],
      },
      {
        id: "cols",
        type: "columns",
        columnCount: 2,
        columns: [[image({ id: "d", src: "/api/images/posts/d.jpg" })], [paragraph("x")]],
      },
    ]);

    expect([...collectImageUrls(blocks)].sort()).toEqual([
      "/api/images/posts/a.jpg",
      "/api/images/posts/b.jpg",
      "/api/images/posts/c.jpg",
      "/api/images/posts/d.jpg",
    ]);
  });

  it("ignora las imágenes sin subir", () => {
    const blocks = blockArraySchema.parse([image({ src: "", alt: "" })]);
    expect(collectImageUrls(blocks).size).toBe(0);
  });
});

describe("extractText", () => {
  it("recoge el texto anidado en columnas", () => {
    const blocks = blockArraySchema.parse([
      paragraph("uno", "p1"),
      {
        id: "cols",
        type: "columns",
        columnCount: 2,
        columns: [[paragraph("dos", "p2")], [paragraph("tres", "p3")]],
      },
    ]);
    expect(extractText(blocks)).toBe("uno dos tres");
  });

  it("deja fuera lo que no se lee corrido", () => {
    /* El texto de un botón no es prosa: contarlo infla el tiempo de lectura y
       ensucia la descripción del feed. */
    const blocks = blockArraySchema.parse([
      paragraph("El cuerpo"),
      { id: "c", type: "cta", heading: "Titular", buttonLabel: "Solicitar cotización", href: "/quote" },
    ]);
    expect(extractText(blocks)).toBe("El cuerpo");
  });
});
