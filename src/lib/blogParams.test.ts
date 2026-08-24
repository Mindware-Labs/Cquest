import { describe, expect, it } from "vitest";
import { blogHref, readCategory, readPage } from "./blogParams";

describe("blogHref", () => {
  it("traduce el nombre del parámetro al idioma de la página", () => {
    expect(blogHref("es", { category: "operaciones" })).toBe("/blog?categoria=operaciones");
    expect(blogHref("en", { category: "operaciones" })).toBe("/blog?category=operaciones");
  });

  it("omite la página 1", () => {
    // ?pagina=1 es la misma pantalla bajo otra URL: dos direcciones para un solo contenido es lo que Google llama duplicado.
    expect(blogHref("es", { page: 1 })).toBe("/blog");
    expect(blogHref("es", { page: 2 })).toBe("/blog?pagina=2");
  });

  it("combina categoría y página", () => {
    expect(blogHref("en", { category: "bpo", page: 3 })).toBe("/blog?category=bpo&page=3");
  });
});

describe("readCategory", () => {
  it("lee el parámetro del idioma de la página", () => {
    expect(readCategory({ category: "bpo" }, "en")).toBe("bpo");
    expect(readCategory({ categoria: "bpo" }, "es")).toBe("bpo");
  });

  it("acepta también el del otro idioma", () => {
    // Los enlaces en español ya publicados y compartidos tienen que seguir funcionando: un filtro que se cae con la URL vieja se ve igual que un artículo borrado.
    expect(readCategory({ categoria: "bpo" }, "en")).toBe("bpo");
  });

  it("trata el vacío como ausencia", () => {
    expect(readCategory({ categoria: "   " }, "es")).toBeUndefined();
    expect(readCategory({}, "es")).toBeUndefined();
  });
});

describe("readPage", () => {
  it("cae a la página 1 ante cualquier cosa que no sea un número positivo", () => {
    // Esto viene de la barra de direcciones, así que llega cualquier cosa; un NaN o un negativo propagados al skip de Postgres son un error 500.
    for (const raw of ["0", "-3", "abc", "", undefined]) {
      expect(readPage({ pagina: raw }, "es")).toBe(1);
    }
  });

  it("lee un número válido", () => {
    expect(readPage({ pagina: "4" }, "es")).toBe(4);
    expect(readPage({ page: "4" }, "en")).toBe(4);
  });
});
