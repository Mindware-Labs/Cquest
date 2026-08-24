/* La POLÍTICA del freno de "olvidé mi contraseña": umbrales, escalera de
   espera y mensajes — para los dos pasos públicos del flujo (pedir código y
   verificarlo).
   ---------------------------------------------------------------------------

   Mismo reparto de responsabilidades que src/lib/loginPolicy.ts (sin Prisma,
   para poder probarse sin levantar un pool de conexiones) y misma FORMA —pero
   deliberadamente SIN importar nada de ahí. `Scope`/`FREE_ATTEMPTS` de login
   tienen la forma justa para que un import cruzado compile sin quejarse y
   aplique en silencio los umbrales de login (5/10) a tráfico de reset. Dos
   archivos casi iguales es más barato que esa clase de bug.

   Dos pasos, dos formas de abuso distintas:

   - PEDIR código (requestReset*): cada acierto manda un email de verdad. El
     límite por email tiene que ser el más estricto de los dos —es la defensa
     contra "email-bombear" a una sola víctima— y el de IP acota a quien
     escanea muchas direcciones desde un mismo origen.
   - VERIFICAR código (verifyReset*): sólo hace falta por IP. El tope de 5
     intentos por fila (ver PasswordResetToken.attempts en el schema) ya hace
     inviable la fuerza bruta de un código de 6 dígitos sin importar cuántas
     IPs lo intenten —5 de 1.000.000 es 5 de 1.000.000 venga de donde venga—;
     este límite cumple OTRO trabajo, acotar cuánto puede escanear alguien
     contra el puñado de cuentas admin reales. */

/* Mismos NÚMEROS que la escalera de login, pero como constante propia — no
   importada — para que el aislamiento de arriba sea real y no sólo de
   nombre. */
export const FREE_ATTEMPTS = { ip: 8, email: 3 } as const;

export const BACKOFF_SECONDS = [60, 120, 300, 900, 1800, 3600] as const;

export const MAX_BLOCK_SECONDS = { ip: 3600, email: 900 } as const;

export const WINDOW_SECONDS = 15 * 60;

export const PRUNE_AFTER_SECONDS = 24 * 60 * 60;

export type Scope = keyof typeof FREE_ATTEMPTS;

export type ResetKey = { scope: Scope; key: string };

export type ResetGate = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/** Las dos claves de un PEDIDO de código — prefijo propio ("resetreq:") para
 *  no compartir contador con el login ni con la verificación. */
export function resetRequestKeys(ip: string, email: string): ResetKey[] {
  return [
    { scope: "ip", key: `resetreq:ip:${ip}` },
    { scope: "email", key: `resetreq:email:${email.trim().toLowerCase()}` },
  ];
}

/** La única clave de una VERIFICACIÓN de código — sólo IP (ver el porqué
 *  arriba). Se arma igual como array de un elemento para que
 *  checkResetAllowed/registerResetAttempt no necesiten dos formas distintas
 *  de recorrer sus claves. */
export function resetVerifyKeys(ip: string): ResetKey[] {
  return [{ scope: "ip", key: `resetverify:ip:${ip}` }];
}

/** Cuántos segundos hay que esperar tras acumular `attempts` pedidos en la
 *  ventana, o null si todavía no se llegó al umbral de ese espacio de
 *  nombres. Misma forma que loginPolicy.blockSeconds. */
export function blockSeconds(scope: Scope, attempts: number): number | null {
  const over = attempts - FREE_ATTEMPTS[scope];
  if (over <= 0) return null;
  const step = BACKOFF_SECONDS[Math.min(over - 1, BACKOFF_SECONDS.length - 1)];
  return Math.min(step, MAX_BLOCK_SECONDS[scope]);
}

/** ¿El último registro quedó fuera de la ventana? Entonces la racha se
 *  olvida. Misma forma que loginPolicy.isStale. */
export function isStale(lastFailureAt: Date, now: Date): boolean {
  return now.getTime() - lastFailureAt.getTime() > WINDOW_SECONDS * 1000;
}

/* El mensaje que ve quien quedó frenado. No dice "intentos fallidos" como el
   de login: acá no hay fallo posible desde afuera —cada pedido "funciona",
   la respuesta es siempre la misma exista o no la cuenta— así que lo que se
   frena es el RITMO de pedidos, no una racha de errores.

   Igual que blockedMessage en loginPolicy: dice CUÁNTO falta (esconderlo no
   le quita nada a quien ataca, que mide el tiempo igual, y sólo deja al
   admin legítimo sin saber si esperar un minuto o volver más tarde) y nunca
   POR QUÉ —nunca distingue el bloqueo por IP del bloqueo por email—, porque
   decirlo confirmaría que esa dirección existe. */
export function resetBlockedMessage(retryAfterSeconds: number): string {
  if (retryAfterSeconds <= 90) {
    return "Demasiadas solicitudes. Espera un minuto y prueba de nuevo.";
  }
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return `Demasiadas solicitudes. Prueba de nuevo en ${minutes} minutos.`;
}
