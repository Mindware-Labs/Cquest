import "server-only";
import { prisma } from "@/lib/prisma";
import {
  codeMatches,
  createSessionToken,
  generateResetCode,
  hashCode,
  parseSessionToken,
} from "@/lib/resetTokenCrypto";

/* La capa que toca Prisma para el ciclo de vida del token de reset. La
   política de seguridad —por qué HMAC, por qué atómico, por qué
   autocontenido— vive documentada en el modelo (prisma/schema.prisma) y en
   resetTokenCrypto.ts; acá sólo las operaciones sobre la fila. */

const CODE_TTL_MS = 10 * 60 * 1000;

/** Al llegar acá el token queda inservible aunque no haya expirado. Un
 *  código de 6 dígitos son sólo 1.000.000 de combinaciones — sin este tope,
 *  10 minutos de vida es una ventana de fuerza bruta viable. */
export const MAX_CODE_ATTEMPTS = 5;

export type CreatedResetToken = { code: string; expiresAt: Date };

/** Crea un código nuevo para este admin e invalida cualquier otro que
 *  siguiera vivo, en la misma transacción: sólo el más reciente tiene que
 *  funcionar — dos códigos válidos a la vez confunde a quien pidió dos veces
 *  y amplía la superficie de ataque sin necesidad. */
export async function createResetTokenForAdmin(
  adminId: number,
  now = new Date(),
): Promise<CreatedResetToken> {
  const code = generateResetCode();
  const expiresAt = new Date(now.getTime() + CODE_TTL_MS);

  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: { adminId, consumedAt: null },
      data: { consumedAt: now },
    }),
    prisma.passwordResetToken.create({
      data: { adminId, codeHash: hashCode(code), expiresAt },
    }),
  ]);

  return { code, expiresAt };
}

export type VerifyCodeResult = { ok: true; sessionToken: string } | { ok: false };

/** Verifica el código contra el token más reciente y vivo del admin.
 *
 *  Idempotente si el código es correcto: `verifiedAt` se fija UNA vez, y
 *  reenviar el mismo código correcto después (doble clic, reintento de red)
 *  recalcula la misma firma en vez de emitir un handle nuevo que deja
 *  huérfano al primero — ver el porqué completo en
 *  PasswordResetToken.verifiedAt.
 *
 *  El tope de intentos se aplica con un `updateMany` condicionado
 *  (`attempts: { lt: MAX_CODE_ATTEMPTS }`), nunca leer-el-valor-y-escribir
 *  el siguiente: eso es una carrera bajo pedidos concurrentes, y dos
 *  intentos en paralelo podrían empujar el contador más allá del tope. */
export async function verifyResetCodeForAdmin(
  adminId: number,
  code: string,
  now = new Date(),
): Promise<VerifyCodeResult> {
  const token = await prisma.passwordResetToken.findFirst({
    where: { adminId, consumedAt: null, expiresAt: { gt: now } },
    orderBy: { createdAt: "desc" },
  });
  if (!token || token.attempts >= MAX_CODE_ATTEMPTS) return { ok: false };

  if (!codeMatches(code, token.codeHash)) {
    await prisma.passwordResetToken.updateMany({
      where: { id: token.id, attempts: { lt: MAX_CODE_ATTEMPTS } },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false };
  }

  const verifiedAt = token.verifiedAt ?? now;
  if (!token.verifiedAt) {
    await prisma.passwordResetToken.update({ where: { id: token.id }, data: { verifiedAt } });
  }

  return { ok: true, sessionToken: createSessionToken(token.id, verifiedAt.getTime()) };
}

export type ResolvedResetSession = { tokenId: number; adminId: number };

/** Resuelve el token del paso final a la fila que autoriza — o null si la
 *  firma no cierra, el token no existe, ya se consumió, expiró, o (algo que
 *  no debería pasar nunca en el uso normal) el `verifiedAt` no coincide con
 *  el que se firmó. */
export async function resolveResetSession(
  sessionToken: string,
  now = new Date(),
): Promise<ResolvedResetSession | null> {
  const parsed = parseSessionToken(sessionToken);
  if (!parsed) return null;

  const token = await prisma.passwordResetToken.findUnique({ where: { id: parsed.tokenId } });
  if (!token) return null;
  if (token.consumedAt) return null;
  if (token.expiresAt <= now) return null;
  if (!token.verifiedAt || token.verifiedAt.getTime() !== parsed.verifiedAtMs) return null;

  return { tokenId: token.id, adminId: token.adminId };
}

/** Sentencia (SIN await) para cerrar todos los tokens vivos de un admin — la
 *  suya y cualquier hermano. Se pasa sin ejecutar a `prisma.$transaction([...])`
 *  desde actions.ts, junto con el update de la contraseña: las dos tienen que
 *  quedar juntas o ninguna, y por eso esta función no ejecuta nada por su
 *  cuenta. */
export function consumeResetTokensStatement(adminId: number, now = new Date()) {
  return prisma.passwordResetToken.updateMany({
    where: { adminId, consumedAt: null },
    data: { consumedAt: now },
  });
}
