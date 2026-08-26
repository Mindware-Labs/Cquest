import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { requireEnv } from "@/lib/env";
import * as schema from "./schema";

// El HMR reevalúa el módulo: sin esto cada recarga abre conexiones nuevas.
const globalForDb = globalThis as unknown as { cqPool?: Pool };

const pool =
  globalForDb.cqPool ??
  new Pool({ connectionString: requireEnv("DATABASE_URL"), max: 10 });

if (process.env.NODE_ENV !== "production") globalForDb.cqPool = pool;
 // te
export const db = drizzle(pool, { schema });
