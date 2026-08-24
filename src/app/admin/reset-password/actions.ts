import "server-only";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientIp } from "@/lib/adminAuth";
import { hashAdminPassword } from "@/lib/adminUsers";
import { loginKeys } from "@/lib/loginPolicy";
import { clearLoginFailures } from "@/lib/loginRateLimit";
import {
  checkResetAllowed,
  pruneStaleAttempts,
  registerResetAttempt,
  resetBlockedMessage,
  resetRequestKeys,
  resetVerifyKeys,
} from "@/lib/resetRateLimit";
import {
  consumeResetTokensStatement,
  createResetTokenForAdmin,
  resolveResetSession,
  verifyResetCodeForAdmin,
} from "@/lib/passwordResetTokens";
import { newPasswordSchema } from "@/lib/passwordPolicy";
import { sendPasswordChangedEmail, sendResetCodeEmail } from "./emails/send";

/* Los tres pasos de "olvidé mi contraseña", mismo patrón que
   src/lib/adminAuth.ts: "use server" DENTRO de cada función exportada, no al
   tope del archivo.

   El principio que atraviesa los tres: NUNCA revelar si un email tiene
   cuenta. No sólo en la respuesta —en el CONTADOR de rate limit también, que
   si sólo se incrementara para cuentas reales sería en sí mismo un oráculo de
   existencia (ver registerResetAttempt en resetRateLimit.ts), y en el
   TIEMPO de respuesta, que si el envío real de un email tardara más que la
   rama que no hace nada, delataría la diferencia sin necesitar mirar el
   cuerpo (ver el uso de `after()` abajo). */

const CODE_TTL_MINUTES = 10;

function isPlausibleEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export type RequestResetState = { error: string | null; sent?: boolean; email?: string };

export async function requestPasswordReset(
  _prevState: RequestResetState,
  formData: FormData,
): Promise<RequestResetState> {
  "use server";

  const rawEmail = formData.get("email");
  if (typeof rawEmail !== "string") return { error: "Completa tu email." };

  const email = rawEmail.trim();
  if (!isPlausibleEmail(email)) return { error: "Ingresa un email válido." };

  const ip = await clientIp();
  const keys = resetRequestKeys(ip, email);

  const gate = await checkResetAllowed(keys);
  if (!gate.allowed) return { error: resetBlockedMessage(gate.retryAfterSeconds), email };

  /* Se cuenta ACÁ, incondicionalmente — antes de saber si la cuenta existe.
     Es la mitad del arreglo al oráculo de enumeración: la otra mitad es que
     lo que sigue abajo nunca deja escapar un resultado distinto según exista
     o no la cuenta. */
  await registerResetAttempt(keys);

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (admin) {
      const { code } = await createResetTokenForAdmin(admin.id);

      /* El envío se agenda para DESPUÉS de que la respuesta ya salió. Sin
         esto, la rama real (insert + llamada de red a Resend) tarda medible
         más que la rama falsa (nada), y ese tiempo de respuesta delata la
         diferencia aunque el cuerpo sea idéntico. Con `after()`, lo único que
         el cliente puede medir es el trabajo de base de arriba — simétrico
         en las dos ramas.

         Try/catch propio: para cuando este callback corre, la respuesta ya
         se fue — un fallo sin atajar acá sería completamente invisible. */
      after(async () => {
        try {
          await sendResetCodeEmail(admin.email, code, CODE_TTL_MINUTES);
        } catch (error) {
          console.error("No se pudo enviar el correo de reset de contraseña:", error);
        }
      });
    }
  } catch (error) {
    /* Cualquier excepción de esta rama —DB, lo que sea— cae al mismo
       `return` genérico de abajo. Un throw que sólo pasara en la rama real
       sería, otra vez, un oráculo. */
    console.error("No se pudo procesar el pedido de reset de contraseña:", error);
  }

  return { error: null, sent: true, email };
}

export type VerifyCodeState = {
  error: string | null;
  verified?: boolean;
  sessionToken?: string;
  email?: string;
};

export async function verifyResetCode(
  _prevState: VerifyCodeState,
  formData: FormData,
): Promise<VerifyCodeState> {
  "use server";

  const rawEmail = formData.get("email");
  const rawCode = formData.get("code");
  if (typeof rawEmail !== "string" || typeof rawCode !== "string") {
    return { error: "Completa el código." };
  }

  const email = rawEmail.trim();
  const code = rawCode.trim();

  const ip = await clientIp();
  const keys = resetVerifyKeys(ip);

  const gate = await checkResetAllowed(keys);
  if (!gate.allowed) return { error: resetBlockedMessage(gate.retryAfterSeconds), email };

  /* Igual que en el pedido: se cuenta SIEMPRE, exista o no la cuenta/token.
     El mensaje de "demasiados intentos" sale de este contador simétrico por
     IP — nunca del tope interno por token (verifyResetCodeForAdmin), que es
     sólo el freno de fuerza bruta y no la fuente de un mensaje distinguible
     (ver el porqué completo en resetPolicy.ts). */
  await registerResetAttempt(keys);

  const GENERIC_ERROR = "Código incorrecto o expirado.";

  try {
    const admin = await prisma.adminUser.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!admin) return { error: GENERIC_ERROR, email };

    const result = await verifyResetCodeForAdmin(admin.id, code);
    if (!result.ok) return { error: GENERIC_ERROR, email };

    return { error: null, verified: true, sessionToken: result.sessionToken, email };
  } catch (error) {
    console.error("No se pudo verificar el código de reset de contraseña:", error);
    return { error: GENERIC_ERROR, email };
  }
}

export type ResetPasswordState = { error: string | null; done?: boolean };

export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  "use server";

  const sessionToken = formData.get("sessionToken");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  if (
    typeof sessionToken !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string"
  ) {
    return { error: "Faltan datos del formulario." };
  }

  /* Se revalida en servidor con el MISMO schema que usa el checklist en
     vivo del cliente (passwordPolicy.ts): el gate del cliente es comodidad,
     no seguridad. */
  const parsed = newPasswordSchema.safeParse(password);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Contraseña inválida." };
  }
  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  /* Acá ya no hace falta ser genérico: para llegar a este paso hubo que
     probar conocer el email Y el código de 6 dígitos — no queda enumeración
     que proteger, así que el mensaje puede ser específico y útil. */
  const session = await resolveResetSession(sessionToken);
  if (!session) {
    return { error: "Tu sesión de recuperación expiró. Inicia el proceso de nuevo." };
  }

  const passwordHash = await hashAdminPassword(password);

  const [admin] = await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: session.adminId },
      data: { passwordHash },
      select: { email: true },
    }),
    consumeResetTokensStatement(session.adminId),
  ]);

  /* Limpieza de mejor esfuerzo, fuera de la transacción a propósito: la
     contraseña YA cambió y el token YA se consumió en este punto, así que
     nada de acá abajo puede dejar un estado a medias — pero SÍ se espera
     (nunca "void"/fire-and-forget): sin await, el runtime serverless puede
     cortar la función apenas se arma la respuesta, y estas dos llamadas
     nunca llegarían a correr. Ya son de mejor esfuerzo por su cuenta —las
     dos tragan sus propios errores, ver resetRateLimit.ts/loginRateLimit.ts—
     así que esperarlas no vuelve el resultado dependiente de que salgan
     bien, sólo garantiza que se INTENTEN.

     Nunca invalidar sesiones JWT ya abiertas en otro dispositivo: esta app
     usa JWT sin validación server-side (src/auth.ts, strategy "jwt"), así
     que un reset NO cierra sesiones activas en otro lugar — es una
     propiedad estructural de la app, no algo que resolver acá. Por eso el
     flujo nunca loguea sola/o: siempre vuelve a pedir la contraseña nueva en
     /admin/login. */
  const ip = await clientIp();
  await clearLoginFailures(loginKeys(ip, admin.email));
  await pruneStaleAttempts();

  after(async () => {
    try {
      const changedAt = new Intl.DateTimeFormat("es-DO", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "America/Santo_Domingo",
      }).format(new Date());
      await sendPasswordChangedEmail(admin.email, changedAt);
    } catch (error) {
      console.error("No se pudo enviar el aviso de contraseña actualizada:", error);
    }
  });

  return { error: null, done: true };
}
