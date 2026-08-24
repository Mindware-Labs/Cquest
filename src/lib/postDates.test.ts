import { describe, expect, it } from "vitest";
import { fromEditorDateTime, toEditorDateTime } from "./postDates";

// La programación de artículos depende entera de estas dos funciones, y su forma de fallar es silenciosa: no lanzan nada, solo corren la hora y publican cuando no debían.

describe("fromEditorDateTime", () => {
  it("lee la hora como la de Santo Domingo, no como UTC", () => {
    // 08:30 en Santo Domingo (UTC-4) son las 12:30 UTC; si esto devolviera 08:30Z, el artículo saldría a las 4 de la madrugada.
    expect(fromEditorDateTime("2026-09-01T08:30")?.toISOString()).toBe("2026-09-01T12:30:00.000Z");
  });

  it("acepta el valor con segundos que mandan algunos navegadores", () => {
    expect(fromEditorDateTime("2026-09-01T08:30:00")?.toISOString()).toBe(
      "2026-09-01T12:30:00.000Z",
    );
  });

  it("cruza el día cuando la hora local empuja la fecha UTC hacia adelante", () => {
    // Las 21:00 del 1 de septiembre en Santo Domingo ya son el 2 en UTC: caso donde un slice(0,10) ingenuo se equivoca de día entero.
    expect(fromEditorDateTime("2026-09-01T21:00")?.toISOString()).toBe("2026-09-02T01:00:00.000Z");
  });

  it("trata el vacío como «sin fecha» y no como el epoch", () => {
    // Devolver un Date del epoch acá publicaría el artículo de inmediato en vez de dejar que la acción decida.
    expect(fromEditorDateTime("")).toBeNull();
    expect(fromEditorDateTime("   ")).toBeNull();
  });

  it("rechaza lo que no es una fecha en vez de devolver un Date inválido", () => {
    expect(fromEditorDateTime("mañana")).toBeNull();
    expect(fromEditorDateTime("2026-13-45T99:99")).toBeNull();
    expect(fromEditorDateTime("2026-09-01")).toBeNull();
  });
});

describe("toEditorDateTime", () => {
  it("devuelve la hora local de la operación, no la UTC", () => {
    expect(toEditorDateTime(new Date("2026-09-01T12:30:00.000Z"))).toBe("2026-09-01T08:30");
  });

  it("da vuelta atrás exactamente lo que fromEditorDateTime convirtió", () => {
    // La propiedad que de verdad importa: abrir el editor de un artículo programado tiene que mostrar la misma hora que se escribió.
    for (const value of ["2026-01-15T00:00", "2026-09-01T08:30", "2026-12-31T23:59"]) {
      expect(toEditorDateTime(fromEditorDateTime(value))).toBe(value);
    }
  });

  it("escribe la medianoche como 00 y no como 24", () => {
    // Algunos motores formatean la medianoche como "24" con hour12:false, y eso no es un valor válido para el input: el campo aparecería vacío y la programación se perdería.
    const midnight = fromEditorDateTime("2026-09-02T00:00");
    expect(toEditorDateTime(midnight)).toBe("2026-09-02T00:00");
  });

  it("devuelve cadena vacía sin fecha, que es lo que el input espera", () => {
    expect(toEditorDateTime(null)).toBe("");
    expect(toEditorDateTime(undefined)).toBe("");
  });
});
