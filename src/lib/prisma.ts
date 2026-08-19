import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/* Un solo pool de conexiones por proceso. En dev, Next.js recarga este módulo
   en cada cambio (HMR) — sin guardarlo en globalThis, cada recarga abriría un
   pool nuevo contra Postgres hasta agotar las conexiones disponibles. */
declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}
