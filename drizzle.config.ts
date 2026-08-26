import type { Config } from "drizzle-kit";

/* drizzle-kit corre fuera de Next, que es quien normalmente carga .env.
   En CI/producción las variables ya vienen del entorno y no hay archivo. */
try {
  process.loadEnvFile();
} catch {}

export default {
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config;
