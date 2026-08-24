import { prisma } from "@/lib/prisma";
import {
  blockSeconds,
  isStale,
  PRUNE_AFTER_SECONDS,
  type LoginGate,
  type LoginKey,
} from "@/lib/loginPolicy";

/* La mitad del freno de fuerza bruta que habla con la base. La política
   —umbrales, escalera de espera, mensajes— vive en lib/loginPolicy.ts, sin
   Prisma, para poder probarla sin levantar un pool de conexiones.

   El contador vive en Postgres y no en memoria del proceso a propósito. En un
   despliegue serverless cada instancia tiene su propia memoria: un contador
   local se reparte entre instancias —así que el atacante obtiene N veces los
   intentos permitidos— y se borra entero en cada despliegue o cada vez que la
   función se enfría. Un contador que se reinicia solo no es un límite. */

export { loginKeys, blockedMessage } from "@/lib/loginPolicy";
export type { LoginGate } from "@/lib/loginPolicy";

/** ¿Se puede intentar el login ahora?
 *
 *  Falla ABIERTO si la base no responde: un Postgres caído no puede convertirse
 *  en "nadie entra al panel". El riesgo aceptado es que durante una caída no
 *  haya freno; la alternativa es que una caída sea también un bloqueo total del
 *  panel, justo cuando probablemente haga falta entrar. */
export async function checkLoginAllowed(keys: LoginKey[], now = new Date()): Promise<LoginGate> {
  try {
    const rows = await prisma.loginAttempt.findMany({
      where: { key: { in: keys.map((entry) => entry.key) } },
      select: { blockedUntil: true },
    });

    /* Gana el bloqueo más largo de los que estén vigentes: si la IP está
       frenada una hora y el email un minuto, la respuesta es una hora. */
    let longest = 0;
    for (const row of rows) {
      if (!row.blockedUntil) continue;
      const remaining = Math.ceil((row.blockedUntil.getTime() - now.getTime()) / 1000);
      if (remaining > longest) longest = remaining;
    }

    return longest > 0 ? { allowed: false, retryAfterSeconds: longest } : { allowed: true };
  } catch (error) {
    console.error("No se pudo consultar el límite de intentos de login:", error);
    return { allowed: true };
  }
}

/** Registra un intento fallido y devuelve el bloqueo que queda vigente, si hay. */
export async function registerLoginFailure(
  keys: LoginKey[],
  now = new Date(),
): Promise<LoginGate> {
  try {
    let longest = 0;

    for (const { scope, key } of keys) {
      const existing = await prisma.loginAttempt.findUnique({ where: { key } });

      const failures = existing && !isStale(existing.lastFailureAt, now) ? existing.failures + 1 : 1;
      const seconds = blockSeconds(scope, failures);
      const blockedUntil = seconds ? new Date(now.getTime() + seconds * 1000) : null;

      await prisma.loginAttempt.upsert({
        where: { key },
        create: { key, failures, lastFailureAt: now, blockedUntil },
        update: { failures, lastFailureAt: now, blockedUntil },
      });

      if (seconds && seconds > longest) longest = seconds;
    }

    return longest > 0 ? { allowed: false, retryAfterSeconds: longest } : { allowed: true };
  } catch (error) {
    /* Si no se pudo contar, el login ya falló igual por credenciales. No se
       convierte un problema de base en un error visible del formulario. */
    console.error("No se pudo registrar el intento fallido de login:", error);
    return { allowed: true };
  }
}

/** Un login correcto borra el rastro: quien entró bien no arrastra su racha.
 *
 *  Aprovecha el viaje para barrer filas viejas. Va acá y no en cada intento
 *  fallido porque los logins correctos son raros y los fallidos son justamente
 *  lo que un ataque produce en masa — limpiar ahí sería regalarle trabajo extra
 *  a la base en el peor momento. */
export async function clearLoginFailures(keys: LoginKey[], now = new Date()): Promise<void> {
  try {
    await prisma.loginAttempt.deleteMany({ where: { key: { in: keys.map((e) => e.key) } } });
    await prisma.loginAttempt.deleteMany({
      where: { lastFailureAt: { lt: new Date(now.getTime() - PRUNE_AFTER_SECONDS * 1000) } },
    });
  } catch (error) {
    console.error("No se pudo limpiar el registro de intentos de login:", error);
  }
}
