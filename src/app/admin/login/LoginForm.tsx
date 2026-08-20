"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { LoginActionState } from "@/lib/adminAuth";
import { IconSpinner, IconWarning } from "@/components/admin/ui/icons";

function SubmitButton() {
  /* useFormStatus lee el estado del <form> padre — por eso es un componente
     aparte y no un hook dentro de LoginForm: adentro del mismo componente que
     renderiza el form, siempre devolvería pending: false. */
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      data-variant="secondary"
      className="cq-btn mt-6 w-full py-2.5 text-[0.88rem]"
    >
      {pending && <IconSpinner size={16} />}
      {pending ? "Entrando…" : "Entrar"}
    </button>
  );
}

export default function LoginForm({
  action,
}: {
  action: (state: LoginActionState, formData: FormData) => Promise<LoginActionState>;
}) {
  const [state, formAction] = useActionState(action, { error: null });

  return (
    <form action={formAction} noValidate>
      <div>
        <label htmlFor="email" className="cq-label text-[var(--panel-rail-text)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          className="cq-input cq-input-dark mt-1.5"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="password" className="cq-label text-[var(--panel-rail-text)]">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="cq-input cq-input-dark mt-1.5"
        />
      </div>

      {/* role="alert" para que un lector de pantalla anuncie el error sin que
          el usuario tenga que volver a recorrer el formulario buscándolo. */}
      {state.error && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-[2px] border border-[#7a2a2a] bg-[#2a1414] px-3 py-2 text-[0.84rem] text-[#f0b8b8]"
        >
          <IconWarning size={16} className="mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
