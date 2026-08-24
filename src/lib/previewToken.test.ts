import { beforeAll, describe, expect, it } from "vitest";
import { createPreviewToken, verifyPreviewToken } from "./previewToken";

// Si este token valida cuando no debería, un borrador queda público para cualquiera que adivine la URL, y falla en silencio.

beforeAll(() => {
  process.env.AUTH_SECRET = "secreto-de-prueba-que-no-se-usa-en-ningun-lado";
});

describe("verifyPreviewToken", () => {
  it("acepta un token recién firmado para su propio artículo", () => {
    expect(verifyPreviewToken(createPreviewToken(42), 42)).toBe(true);
  });

  it("rechaza el token de OTRO artículo", () => {
    // Un enlace de previsualización no es una llave maestra del blog: autoriza un artículo y nada más.
    expect(verifyPreviewToken(createPreviewToken(42), 43)).toBe(false);
  });

  it("rechaza un token vencido", () => {
    const issued = Date.parse("2026-01-01T00:00:00Z");
    const token = createPreviewToken(42, issued);
    // Un mes después de emitido; la ventana son siete días.
    expect(verifyPreviewToken(token, 42, issued + 30 * 24 * 60 * 60 * 1000)).toBe(false);
    // Sigue valiendo dentro de la ventana.
    expect(verifyPreviewToken(token, 42, issued + 24 * 60 * 60 * 1000)).toBe(true);
  });

  it("rechaza un token al que se le estiró el vencimiento", () => {
    // El payload va en claro y se puede editar la fecha; la firma es lo que lo impide.
    const token = createPreviewToken(42);
    const [id, , signature] = token.split(".");
    const forged = `${id}.${Date.now() + 10 ** 10}.${signature}`;
    expect(verifyPreviewToken(forged, 42)).toBe(false);
  });

  it("rechaza un token al que se le cambió el id del artículo", () => {
    const token = createPreviewToken(42);
    const [, expiry, signature] = token.split(".");
    expect(verifyPreviewToken(`43.${expiry}.${signature}`, 43)).toBe(false);
  });

  it("rechaza basura sin lanzar", () => {
    // Se llama con lo que venga en la query string; una excepción acá sería un 500 público provocable por cualquiera.
    for (const value of [undefined, "", "a", "a.b", "a.b.c.d", "....", "42.abc.xyz"]) {
      expect(() => verifyPreviewToken(value, 42)).not.toThrow();
      expect(verifyPreviewToken(value, 42)).toBe(false);
    }
  });
});
