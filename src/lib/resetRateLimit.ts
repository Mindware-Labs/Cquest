import "server-only";
import { prisma } from "@/lib/prisma";
import {
  blockSeconds,
  isStale,
  PRUNE_AFTER_SECONDS,
  type ResetGate,
  type ResetKey,
} from "@/lib/resetPolicy";

export { resetRequestKeys, resetVerifyKeys, resetBlockedMessage } from "@/lib/resetPolicy";
export type { ResetGate } from "@/lib/resetPolicy";

/* La mitad del freno de "olvidé mi contraseña" que habla con la base. Misma
   separación que src/lib/loginRateLimit.ts (la política vive en
   resetPolicy.ts, sin Prisma) y reusa la MISMA tabla, `LoginAttempt` — ver el
   doc-comment del modelo en schema.prisma: ya no es sólo de login, es un
   ledger genérico por clave opaca, y las claves de este archivo llevan
   prefijo "resetreq:"/"resetverify:" para no compartir contador con nadie
   más. */

/** ¿Se puede intentar ahora? Falla ABIERTO si la base no responde — mismo
 *  motivo que checkLoginAllowed: una caída de Postgres no puede convertirse
 *  en "nadie puede pedir un reset de contraseña". */
export async function checkResetAllowed(keys: ResetKey[], now = new Date()): Promise<ResetGate> {
  try {
    const rows = await prisma.loginAttempt.findMany({
      where: { key: { in: keys.map((entry) => entry.key) } },
      select: { blockedUntil: true },
    });

    let longest = 0;
    for (const row of rows) {
      if (!row.blockedUntil) continue;
      const remaining = Math.ceil((row.blockedUntil.getTime() - now.getTime()) / 1000);
      if (remaining > longest) longest = remaining;
    }

    return longest > 0 ? { allowed: false, retryAfterSeconds: longest } : { allowed: true };
  } catch (error) {
    console.error("No se pudo consultar el límite de reset de contraseña:", error);
    return { allowed: true };
  }
}

/** Cuenta UN intento —pedido de código o verificación— sin importar si
 *  encontró una cuenta real o un token válido. Se llama SIEMPRE, en las dos
 *  ramas: si sólo contara cuando la cuenta existe, el momento en que una
 *  clave empieza a bloquearse sería en sí mismo la filtración de que esa
 *  cuenta existe — exactamente lo que el resto del flujo se cuida de no
 *  revelar (ver el comentario de seguridad en actions.ts). */
export async function registerResetAttempt(keys: ResetKey[], now = new Date()): Promise<ResetGate> {
  try {
    let longest = 0;

    for (const { scope, key } of keys) {
      const existing = await prisma.loginAttempt.findUnique({ where: { key } });

      const attempts = existing && !isStale(existing.lastFailureAt, now) ? existing.failures + 1 : 1;
      const seconds = blockSeconds(scope, attempts);
      const blockedUntil = seconds ? new Date(now.getTime() + seconds * 1000) : null;

      await prisma.loginAttempt.upsert({
        where: { key },
        create: { key, failures: attempts, lastFailureAt: now, blockedUntil },
        update: { failures: attempts, lastFailureAt: now, blockedUntil },
      });

      if (seconds && seconds > longest) longest = seconds;
    }

    return longest > 0 ? { allowed: false, retryAfterSeconds: longest } : { allowed: true };
  } catch (error) {
    console.error("No se pudo registrar el pedido de reset de contraseña:", error);
    return { allowed: true };
  }
}

/** Barrido de filas viejas. Antes sólo lo disparaba un login correcto
 *  (clearLoginFailures, en loginRateLimit.ts); completar un reset es un
 *  momento igual de bueno —el admin ya probó ser quien dice ser— así que
 *  también lo dispara desde ahí (ver actions.ts), para que la limpieza no
 *  dependa únicamente de la otra feature. */
export async function pruneStaleAttempts(now = new Date()): Promise<void> {
  try {
    await prisma.loginAttempt.deleteMany({
      where: { lastFailureAt: { lt: new Date(now.getTime() - PRUNE_AFTER_SECONDS * 1000) } },
    });
  } catch (error) {
    console.error("No se pudo limpiar el registro de intentos:", error);
  }
}
