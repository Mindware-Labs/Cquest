import { createHmac, timingSafeEqual } from "node:crypto";

// Token HMAC del id del artículo + vencimiento, firmado con el secreto de sesión de Auth.js: autocontenido (sin tabla que mantener), revocable rotando el secreto, y sólo levanta la visibilidad de ESE artículo.

const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function secret(): string {
  const value = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!value) {
    // Falla ruidosamente: un token firmado con secreto vacío lo puede fabricar cualquiera.
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

/** ¿Este token autoriza a ver este artículo y sigue vigente? Nunca lanza: un token roto/vencido/de otro artículo es sólo un visitante sin permiso (404). */
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

  // Comparación en tiempo constante: con === el tiempo de fallo filtra cuántos bytes coinciden y permite adivinar la firma byte a byte.
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export const PREVIEW_PARAM = "preview";
