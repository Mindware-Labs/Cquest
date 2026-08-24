"use client";

import { PASSWORD_RULES, passwordRuleStatus } from "@/lib/passwordPolicy";
import { IconCheck } from "@/components/admin/ui/icons";

/* El checklist en vivo de la contraseña nueva. Mismo color que ya usa la
   marca de éxito del login para decir "correcto" (--brand-petroleo, ver el
   porqué en SuccessMark.tsx) — llegar acá con la vista ya entrenada en
   ese color no hace falta explicarlo dos veces.

   Se recalcula en cada tecla con una función pura (passwordPolicy.ts) — sin
   useMemo: son tres expresiones regulares sobre una cadena corta, más caro
   sería memoizarlo que correrlo. */
export default function PasswordChecklist({
  password,
  confirmPassword,
  id,
}: {
  password: string;
  confirmPassword: string;
  id?: string;
}) {
  const status = passwordRuleStatus(password);
  const showMatch = confirmPassword.length > 0;
  const matches = password.length > 0 && password === confirmPassword;

  return (
    <ul id={id} className="cq-checklist">
      {PASSWORD_RULES.map((rule) => (
        <li key={rule.id} className="cq-checklist-row" data-met={status[rule.id] ? "true" : undefined}>
          <span className="cq-checklist-dot" aria-hidden="true">
            <IconCheck size={11} />
          </span>
          {rule.label}
        </li>
      ))}
      {showMatch && (
        <li className="cq-checklist-row" data-met={matches ? "true" : undefined}>
          <span className="cq-checklist-dot" aria-hidden="true">
            <IconCheck size={11} />
          </span>
          Las contraseñas coinciden
        </li>
      )}
    </ul>
  );
}
