import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyAdminPassword } from "@/lib/adminUsers";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  // Un password equivocado es tráfico normal de login, no un error del sistema; sin esto Auth.js lo registraría con stack trace, ahogando los errores que sí importan.
  logger: {
    error(error) {
      if (error instanceof CredentialsSignin) return;
      console.error(error);
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email : null;
        const password = typeof credentials?.password === "string" ? credentials.password : null;
        if (!email || !password) return null;

        const admin = await verifyAdminPassword(email, password);
        if (!admin) return null;

        return { id: String(admin.id), email: admin.email, name: admin.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id as string;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = (token.id as string | undefined) ?? "";
      return session;
    },
  },
});
