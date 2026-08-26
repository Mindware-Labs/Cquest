import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, emailOTP } from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { requireEnv } from "@/lib/env";
import { sendPasswordResetOtpEmail, sendWelcomeOtpEmail } from "@/lib/emails/auth";
import { currentOtpPurpose } from "@/lib/emails/otp-context";

export const auth = betterAuth({
  appName: "Center Quest",
  /* Sin la variable, Better Auth infiere la URL de la petición; fijarla a un
     localhost heredado rompería el auth en producción. */
  baseURL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  secret: requireEnv("AUTH_SECRET"),
  database: drizzleAdapter(db, { provider: "pg", schema }),

  /* Sin registro público: las cuentas solo nacen desde /admin/users. */
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    requireEmailVerification: false,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    /* Cachea la sesión en la cookie firmada 5 min para no golpear Postgres en
       cada render del panel; la revocación tarda como mucho ese tiempo. */
    cookieCache: { enabled: true, maxAge: 300 },
  },

  rateLimit: {
    enabled: true,
    storage: "database",
    modelName: "rateLimit",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 300, max: 5 },
      "/email-otp/request-password-reset": { window: 900, max: 3 },
      "/email-otp/send-verification-otp": { window: 900, max: 3 },
      "/email-otp/reset-password": { window: 900, max: 5 },
      "/email-otp/check-verification-otp": { window: 900, max: 10 },
    },
  },

  plugins: [
    admin({ defaultRole: "admin", adminRoles: ["admin"] }),
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      allowedAttempts: 3,
      /* Solo usamos OTP para contraseñas; los otros tipos no están habilitados. */
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "forget-password") return;
        if (currentOtpPurpose() === "welcome") {
          await sendWelcomeOtpEmail({ to: email, name: email.split("@")[0], otp });
          return;
        }
        await sendPasswordResetOtpEmail({ to: email, otp });
      },
    }),
    /* nextCookies debe ir último: envuelve al resto para poder escribir cookies
       desde server actions. */
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
