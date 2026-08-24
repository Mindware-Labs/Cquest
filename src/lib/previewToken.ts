import { createHmac, timingSafeEqual } from "node:crypto";

/* Enlaces de previsualización para artículos que todavía no son públicos.
   ---------------------------------------------------------------------------

   El panel ya tenía una previa DENTRO del editor, pero no había forma de que un
   cliente o un jefe viera el artículo terminado sin publicarlo. La alternativa
   real que quedaba era publicar, mandar el enlace, y esconderlo después — o sea
   sacar a la web algo que nadie revisó todavía.

   El token es un HMAC del id del artículo más su vencimiento, firmado con el
   mismo secreto de sesión de Auth.js. Es autocontenido a propósito: no hay
   tabla de tokens que mantener ni limpiar, y revocar todos los enlaces vivos es
   rotar el secreto. No da acceso al panel ni a ningún otro artículo — sólo
   levanta el filtro de visibilidad del artículo que nombra. */

const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function secret(): string {
  const value = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!value) {
    /* Falla ruidosamente en vez de firmar con una cadena vacía: un token
       firmado con un secreto vacío lo puede fabricar cualquiera. */
    throw new Error("Falta AUTH_SECRET — no se pueden firmar enlaces de previsualización.");
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Token de previsualización para un artículo, válido una semana. */
export function createPreviewToken(postId: number, now = Date.now()): string {
  const expiresAt = now + TTL_MS;
  const payload = `${postId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

/** ¿Este token autoriza a ver ESTE artículo, y sigue vigente?
 *
 *  Nunca lanza: un token roto, vencido o de otro artículo es simplemente un
 *  visitante sin permiso, y la página responde 404 como con cualquier otro. */
export function verifyPreviewToken(token: string | undefined, postId: number, now = Date.now()): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [rawId, rawExpiry, signature] = parts;

  if (Number(rawId) !== postId) return false;

  const expiresAt = Number(rawExpiry);
  if (!Number.isFinite(expiresAt) || expiresAt < now) return false;

  let expected: Buffer;
  try {
    expected = Buffer.from(sign(`${rawId}.${rawExpiry}`), "base64url");
  } catch {
    return false;
  }
  const received = Buffer.from(signature, "base64url");

  /* Comparación en tiempo constante. Con `===`, el tiempo que tarda en fallar
     depende de cuántos bytes coinciden, y eso deja adivinar la firma byte a
     byte. `timingSafeEqual` exige el mismo largo, de ahí el chequeo previo. */
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export const PREVIEW_PARAM = "preview";
