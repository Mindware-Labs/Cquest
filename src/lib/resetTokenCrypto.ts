import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

/* El HMAC que respalda todo lo secreto de "olvidé mi contraseña": el código
   de 6 dígitos y el token de sesión del paso 3. Mismo patrón que
   src/lib/previewToken.ts — firmar con el secreto de sesión de Auth.js en vez
   de guardar un hash sin clave o un valor al azar que hay que persistir. */

function secret(): string {
  const value = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!value) {
    /* Falla ruidosamente en vez de firmar con una cadena vacía: un hash
       firmado con un secreto vacío lo reproduce cualquiera. */
    throw new Error("Falta AUTH_SECRET — no se puede firmar el reset de contraseña.");
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function signHex(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/* Comparación en tiempo constante. Con `===` el tiempo que tarda en fallar
   depende de cuántos bytes coinciden, y eso deja adivinar la firma byte a
   byte — igual que documenta previewToken.ts. */
function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

const CODE_LENGTH = 6;
const CODE_MAX = 10 ** CODE_LENGTH;

/** Código numérico de 6 dígitos, con ceros a la izquierda. `randomInt` y no
 *  `Math.random`: éste último no es criptográficamente seguro, y un código
 *  que autoriza cambiar una contraseña no puede depender de un PRNG
 *  predecible. */
export function generateResetCode(): string {
  return randomInt(0, CODE_MAX).toString().padStart(CODE_LENGTH, "0");
}

export function hashCode(code: string): string {
  return signHex(`code.${code}`);
}

export function codeMatches(code: string, storedHash: string): boolean {
  return timingSafeStringEqual(signHex(`code.${code}`), storedHash);
}

/** El token del paso 3, AUTOCONTENIDO — mismo formato que
 *  createPreviewToken: "{id}.{verifiedAtMs}.{firma}". No hay nada que
 *  guardar aparte del propio `verifiedAt` de la fila (ver schema.prisma):
 *  reconstruir el mismo token dos veces para el mismo id+verifiedAt es lo
 *  que vuelve la verificación idempotente sin lógica extra. */
export function createSessionToken(tokenId: number, verifiedAtMs: number): string {
  const payload = `${tokenId}.${verifiedAtMs}`;
  return `${payload}.${sign(payload)}`;
}

export type ParsedSessionToken = { tokenId: number; verifiedAtMs: number };

/** Parsea y verifica la firma. Nunca lanza: un token roto o de otra fila es
 *  simplemente "no autoriza nada", no una excepción que haya que atajar en
 *  cada llamador. */
export function parseSessionToken(raw: string): ParsedSessionToken | null {
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [rawId, rawVerifiedAt, signature] = parts;

  const tokenId = Number(rawId);
  const verifiedAtMs = Number(rawVerifiedAt);
  if (!Number.isInteger(tokenId) || !Number.isFinite(verifiedAtMs)) return null;

  const expected = sign(`${rawId}.${rawVerifiedAt}`);
  if (!timingSafeStringEqual(expected, signature)) return null;

  return { tokenId, verifiedAtMs };
}
