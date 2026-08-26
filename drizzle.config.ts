import type { Config } from "drizzle-kit";

// drizzle-kit corre fuera de Next; en CI las variables ya vienen del entorno.
try {
  process.loadEnvFile();
} catch {}

export default {
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config;
