/* La POLÍTICA del freno de fuerza bruta del login: umbrales, escalera de
   espera y mensajes.
   ---------------------------------------------------------------------------

   Vive aparte de lib/loginRateLimit.ts —que es quien habla con la base— por la
   misma razón que postDates.ts vive aparte de posts.ts: acá no hay Prisma, así
   que se puede probar sin levantar un pool de conexiones. Y es justo la parte
   que hay que probar: un error en la escalera no lanza ninguna excepción, sólo
   deja pasar más intentos de los que debería, en silencio.

   La regla es un bloqueo PROGRESIVO, no un corte seco: los primeros intentos
   son gratis —equivocarse de contraseña es tráfico normal de un login— y la
   espera crece con la insistencia. Un humano que se confundió pierde un minuto;
   un script pierde el ataque, porque a partir del sexto intento el costo por
   prueba se multiplica hasta volver inviable recorrer un diccionario.

   Se cuenta por DOS claves a la vez, y las dos tienen que dar permiso:

   - Por IP — la defensa principal. Frena el caso normal: un origen martillando
     el formulario.
   - Por email — frena el caso distribuido. Un atacante con mil IPs esquiva el
     límite anterior, pero sigue apuntando a la misma cuenta.

   El límite por email es MÁS BLANDO y con un tope de espera más corto, y eso es
   deliberado: bloquear por email le da a cualquiera la capacidad de dejar
   afuera a un admin real con sólo tipear mal su dirección a propósito. El
   equilibrio es que atacar una cuenta salga caro sin que sabotearla salga
   barato — 15 minutos molestan a un admin, pero arruinan un ataque por
   diccionario. */

/* Los primeros intentos no cuestan nada. Cinco por IP es cómodo para alguien
   que no recuerda cuál de sus contraseñas era; diez por email deja margen a que
   dos personas de la misma oficina se equivoquen sin bloquearse entre ellas. */
export const FREE_ATTEMPTS = { ip: 5, email: 10 } as const;

/* La escalera de espera, en segundos, a partir del primer intento pasado del
   umbral. Arranca corta —un minuto no ahuyenta a un humano legítimo— y se
   estira rápido. El último valor es el techo: se repite indefinidamente. */
export const BACKOFF_SECONDS = [60, 120, 300, 900, 1800, 3600] as const;

/* Tope por espacio de nombres. La IP puede llegar a una hora; el email se
   detiene en quince minutos por el riesgo de bloqueo malicioso explicado
   arriba. */
export const MAX_BLOCK_SECONDS = { ip: 3600, email: 900 } as const;

/* Sin fallos nuevos durante este tiempo, el contador se olvida. Sin esto, tres
   equivocaciones repartidas a lo largo de un año terminarían bloqueando a
   alguien que nunca hizo nada raro. */
export const WINDOW_SECONDS = 15 * 60;

/* Las filas más viejas que esto ya no significan nada: se barren de a poco para
   que la tabla no crezca sin fin. */
export const PRUNE_AFTER_SECONDS = 24 * 60 * 60;

export type Scope = keyof typeof FREE_ATTEMPTS;

export type LoginKey = { scope: Scope; key: string };

export type LoginGate = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/** Las dos claves que se evalúan en un intento de login. */
export function loginKeys(ip: string, email: string): LoginKey[] {
  return [
    { scope: "ip", key: `ip:${ip}` },
    /* En minúsculas: los emails no distinguen mayúsculas en la práctica, y sin
       normalizar, "Admin@x.com" y "admin@x.com" serían dos contadores — o sea
       el doble de intentos gratis por cada variante que se le ocurra probar. */
    { scope: "email", key: `email:${email.trim().toLowerCase()}` },
  ];
}

/** Cuántos segundos hay que esperar tras acumular `failures` fallos, o null si
 *  todavía no se llegó al umbral de ese espacio de nombres. */
export function blockSeconds(scope: Scope, failures: number): number | null {
  const over = failures - FREE_ATTEMPTS[scope];
  if (over <= 0) return null;
  const step = BACKOFF_SECONDS[Math.min(over - 1, BACKOFF_SECONDS.length - 1)];
  return Math.min(step, MAX_BLOCK_SECONDS[scope]);
}

/** ¿El último fallo quedó fuera de la ventana? Entonces la racha se olvida.
 *
 *  Se compara contra el ÚLTIMO fallo y no contra el primero: lo que interesa es
 *  la racha en curso, no cuándo esta persona empezó a equivocarse alguna vez. */
export function isStale(lastFailureAt: Date, now: Date): boolean {
  return now.getTime() - lastFailureAt.getTime() > WINDOW_SECONDS * 1000;
}

/* El mensaje que ve quien quedó frenado.
   ---------------------------------------------------------------------------

   Dice CUÁNTO falta, y eso no es un descuido de seguridad: esconderlo no le
   quita nada al atacante —que mide el tiempo igual— y en cambio deja al admin
   legítimo apretando el botón sin saber si esperar un minuto o irse a almorzar.

   Lo que sí se calla es POR QUÉ: nunca se distingue el bloqueo por IP del
   bloqueo por email. Decirlo confirmaría que esa dirección existe. */
export function blockedMessage(retryAfterSeconds: number): string {
  if (retryAfterSeconds <= 90) {
    return "Demasiados intentos fallidos. Esperá un minuto y probá de nuevo.";
  }
  const minutes = Math.ceil(retryAfterSeconds / 60);
  return `Demasiados intentos fallidos. Probá de nuevo en ${minutes} minutos.`;
}
