import type { DefaultSession } from "next-auth";

/* Auth.js no trae `id` en Session.user por defecto — lo agregamos en los
   callbacks jwt/session de src/auth.ts, así que el tipo tiene que reflejarlo. */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
