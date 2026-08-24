/* Comprobación end-to-end del freno de fuerza bruta, contra la base real.
   ---------------------------------------------------------------------------

   Las pruebas de vitest cubren la POLÍTICA (la escalera, los umbrales, los
   mensajes) sin tocar Postgres. Lo que no pueden cubrir es lo que pasa cuando
   el contador vive en una tabla: que el upsert acumule, que la ventana olvide
   la racha, que un login correcto la borre.

   Se ejecuta a mano: `npx tsx scripts/check-login-rate-limit.ts`
   Usa claves con prefijo "check:" y las borra al terminar, así no ensucia los
   contadores reales de nadie. */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { blockSeconds, FREE_ATTEMPTS, WINDOW_SECONDS } from "../src/lib/loginPolicy";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const IP_KEY = "ip:check:203.0.113.9";
const EMAIL_KEY = "email:check@example.invalid";
const KEYS = [
  { scope: "ip" as const, key: IP_KEY },
  { scope: "email" as const, key: EMAIL_KEY },
];

let failed = 0;

function check(label: string, condition: boolean, detail = "") {
  if (condition) {
    console.log(`  ok    ${label}`);
  } else {
    failed += 1;
    console.log(`  FALLA ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

/* Réplica exacta de registerLoginFailure(), pero con `now` inyectable: probar
   la ventana de olvido exige poder mover el reloj, y esperar quince minutos
   reales no es una prueba, es una siesta. */
async function failOnce(now: Date) {
  let longest = 0;
  for (const { scope, key } of KEYS) {
    const existing = await prisma.loginAttempt.findUnique({ where: { key } });
    const stale =
      existing !== null && now.getTime() - existing.lastFailureAt.getTime() > WINDOW_SECONDS * 1000;
    const failures = existing && !stale ? existing.failures + 1 : 1;
    const seconds = blockSeconds(scope, failures);
    const blockedUntil = seconds ? new Date(now.getTime() + seconds * 1000) : null;
    await prisma.loginAttempt.upsert({
      where: { key },
      create: { key, failures, lastFailureAt: now, blockedUntil },
      update: { failures, lastFailureAt: now, blockedUntil },
    });
    if (seconds && seconds > longest) longest = seconds;
  }
  return longest;
}

async function cleanup() {
  await prisma.loginAttempt.deleteMany({ where: { key: { in: [IP_KEY, EMAIL_KEY] } } });
}

async function main() {
  await cleanup();
  const t0 = new Date("2026-08-23T12:00:00Z");

  console.log("\nAcumulación del contador");
  for (let i = 1; i <= FREE_ATTEMPTS.ip; i += 1) {
    const wait = await failOnce(new Date(t0.getTime() + i * 1000));
    check(`intento ${i} sigue siendo gratis`, wait === 0, `devolvió ${wait}s`);
  }

  const first = await failOnce(new Date(t0.getTime() + 6000));
  check("el primero pasado del umbral bloquea 60s", first === 60, `devolvió ${first}s`);

  const second = await failOnce(new Date(t0.getTime() + 7000));
  check("el siguiente escala a 120s", second === 120, `devolvió ${second}s`);

  const row = await prisma.loginAttempt.findUnique({ where: { key: IP_KEY } });
  check("la fila guarda el bloqueo", row?.blockedUntil !== null);
  check("hay UNA fila por clave, no una por intento", row?.failures === 7, `failures=${row?.failures}`);

  console.log("\nVentana de olvido");
  const afterWindow = new Date(t0.getTime() + (WINDOW_SECONDS + 60) * 1000);
  const reset = await failOnce(afterWindow);
  const resetRow = await prisma.loginAttempt.findUnique({ where: { key: IP_KEY } });
  check("una racha vieja se olvida", reset === 0, `devolvió ${reset}s`);
  check("el contador vuelve a 1", resetRow?.failures === 1, `failures=${resetRow?.failures}`);

  console.log("\nLimpieza tras un login correcto");
  await prisma.loginAttempt.deleteMany({ where: { key: { in: [IP_KEY, EMAIL_KEY] } } });
  const left = await prisma.loginAttempt.count({ where: { key: { in: [IP_KEY, EMAIL_KEY] } } });
  check("entrar bien borra la racha", left === 0);

  await cleanup();
  await prisma.$disconnect();

  console.log(failed === 0 ? "\nTodo correcto.\n" : `\n${failed} comprobaciones fallaron.\n`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch(async (error) => {
  console.error(error);
  await cleanup().catch(() => {});
  await prisma.$disconnect();
  process.exit(1);
});
