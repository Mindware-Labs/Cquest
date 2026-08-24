import { z } from "zod";

/* Las reglas de la contraseña nueva de "olvidé mi contraseña" — EXACTAMENTE
   las tres pedidas, ninguna de más: 8+ caracteres, una mayúscula, un número.
   Un solo lugar para las tres, porque el checklist en vivo de
   PasswordChecklist.tsx (cliente) y el server action resetPassword (server)
   tienen que evaluar exactamente lo mismo — si divergen, la UI puede mostrar
   "todo en verde" con una contraseña que el servidor va a rechazar igual, o
   viceversa. Sin imports de Prisma ni de servidor a propósito: este archivo
   lo importa un componente cliente. */

export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRuleId = "length" | "uppercase" | "number";

type Rule = { id: PasswordRuleId; label: string; test: (password: string) => boolean };

const RULES: Rule[] = [
  {
    id: "length",
    label: `Al menos ${PASSWORD_MIN_LENGTH} caracteres`,
    test: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: "uppercase",
    label: "Al menos una mayúscula",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "number",
    label: "Al menos un número",
    test: (password) => /[0-9]/.test(password),
  },
];

/** Id + etiqueta de cada regla, en el orden en que se muestran — para que el
 *  checklist las renderice sin repetir el texto acá y allá. */
export const PASSWORD_RULES: { id: PasswordRuleId; label: string }[] = RULES.map(({ id, label }) => ({
  id,
  label,
}));

export type PasswordRuleStatus = Record<PasswordRuleId, boolean>;

/** Qué reglas cumple ESTA contraseña, una por una — lo que alimenta el
 *  checklist en vivo. */
export function passwordRuleStatus(password: string): PasswordRuleStatus {
  const status = {} as PasswordRuleStatus;
  for (const rule of RULES) status[rule.id] = rule.test(password);
  return status;
}

/** ¿Las cumple todas? Atajo para el botón y para el schema de abajo. */
export function passwordMeetsPolicy(password: string): boolean {
  return RULES.every((rule) => rule.test(password));
}

/** Schema del server action: mismas tres reglas, con el mensaje de la regla
 *  que falta primero — no un "contraseña inválida" genérico, que obligaría a
 *  adivinar cuál de las tres faltó. */
export const newPasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`)
  .refine((password) => /[A-Z]/.test(password), {
    message: "La contraseña debe tener al menos una mayúscula.",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "La contraseña debe tener al menos un número.",
  });
