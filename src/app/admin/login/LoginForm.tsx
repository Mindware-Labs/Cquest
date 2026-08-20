"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { LoginActionState } from "@/lib/adminAuth";

const INPUT_CLASS =
  "mt-1.5 w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-[0.95rem] text-foreground outline-none transition-colors focus:border-petroleo focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-petroleo";

function SubmitButton() {
  /* useFormStatus lee el estado del <form> padre — por eso es un componente
     aparte y no un hook dentro de LoginForm: adentro del mismo componente que
     renderiza el form, siempre devolvería pending: false. */
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full rounded-md bg-petroleo px-4 py-2.5 text-[0.9rem] font-semibold text-white transition-colors hover:bg-petroleo/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo disabled:opacity-60"
    >
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
        <label htmlFor="email" className="text-[0.82rem] font-semibold text-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={INPUT_CLASS}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="password" className="text-[0.82rem] font-semibold text-foreground">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={INPUT_CLASS}
        />
      </div>

      {/* role="alert" para que un lector de pantalla anuncie el error sin que
          el usuario tenga que volver a recorrer el formulario buscándolo. */}
      {state.error && (
        <p role="alert" className="mt-4 text-[0.85rem] text-red-700">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
