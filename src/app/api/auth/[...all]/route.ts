import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

/* Primer route handler del proyecto: el resto del sitio va por server actions,
   pero Better Auth necesita endpoints HTTP reales para su cliente. */
export const { GET, POST } = toNextJsHandler(auth);
