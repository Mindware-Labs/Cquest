// Política de freno de fuerza bruta del login. Vive aparte de loginRateLimit.ts (sin Prisma) para poder probarse sin base de datos.
// Bloqueo progresivo por dos claves (IP y email) a la vez; el límite por email es más blando porque bloquear por email deja a cualquiera tumbar a un admin real tipeando mal su dirección a propósito.

// Cinco por IP, diez por email: los primeros intentos son gratis, tráfico normal de un login equivocado.
export const FREE_ATTEMPTS = { ip: 5, email: 10 } as const;

// Escalera de espera en segundos tras pasar el umbral; el último valor es el techo y se repite indefinidamente.
export const BACKOFF_SECONDS = [60, 120, 300, 900, 1800, 3600] as const;

// Tope por espacio de nombres: IP hasta una hora, email hasta quince minutos (riesgo de bloqueo malicioso).
export const MAX_BLOCK_SECONDS = { ip: 3600, email: 900 } as const;

// Sin fallos nuevos durante este tiempo el contador se olvida, para no acumular equivocaciones sueltas de meses.
export const WINDOW_SECONDS = 15 * 60;

// Filas más viejas que esto ya no significan nada: se barren para que la tabla no crezca sin fin.
export const PRUNE_AFTER_SECONDS = 24 * 60 * 60;

export type Scope = keyof typeof FREE_ATTEMPTS;

export type LoginKey = { scope: Scope; key: string };

export type LoginGate = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/** Las dos claves que se evalúan en un intento de login. */
export function loginKeys(ip: string, email: string): LoginKey[] {
  return [
    { scope: "ip", key: `ip:${ip}` },
    // Minúsculas: sin normalizar, "Admin@x.com" y "admin@x.com" serían dos contadores distintos.
    { scope: "email", key: `email:${email.trim().toLowerCase()}` },
  ];
}

/** Segundos a esperar tras `failures` fallos, o null si no se llegó al umbral. */
export function blockSeconds(scope: Scope, failures: number): number | null {
  const over = failures - FREE_ATTEMPTS[scope];
  if (over <= 0) return null;
  const step = BACKOFF_SECONDS[Math.min(over - 1, BACKOFF_SECONDS.length - 1)];
  return Math.min(step, MAX_BLOCK_SECONDS[scope]);
}

// Compara contra el último fallo, no el primero: interesa la racha en curso.
export function isStale(lastFailureAt: Date, now: Date): boolean {
  return now.getTime() - lastFailureAt.getTime() > WINDOW_SECONDS * 1000;
}

// Dice cuánto falta (no ayuda al atacante, que mide el tiempo igual) pero nunca por qué: distinguir IP de email confirmaría que la dirección existe.
export function blockedMessage(retryAfterSeconds: number): string {
  if (retryAfterSeconds <= 90) {
    return "Demasiados intentos fallidos. Espera un minuto y prueba de nuevo.";
  }
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return `Demasiados intentos fallidos. Prueba de nuevo en ${minutes} minutos.`;
}
