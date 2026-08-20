"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import type { LoginActionState } from "@/lib/adminAuth";
import { IconEye, IconEyeOff, IconSpinner, IconWarning } from "@/components/admin/ui/icons";

function SubmitButton() {
  /* useFormStatus lee el estado del <form> padre — por eso es un componente
     aparte y no un hook dentro de LoginForm: adentro del mismo componente que
     renderiza el form, siempre devolvería pending: false. */
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      data-variant="primary"
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
  const [revealed, setRevealed] = useState(false);
  const reduced = useReducedMotion();

  /* Entrada escalonada, de abajo hacia arriba y desde un estado ya visible:
     los campos no aparecen de la nada, se asientan. Un solo momento, 90 ms de
     diferencia entre uno y otro — más que eso se siente lento al que entra
     todos los días. */
  const enter = (index: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.45,
            delay: 0.08 + index * 0.09,
            ease: [0.16, 1, 0.3, 1] as const,
          },
        };

  return (
    <form action={formAction} noValidate className="mt-6">
      <motion.div {...enter(0)}>
        <label htmlFor="email" className="cq-label cq-label-dark">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          placeholder="nombre@centerquest.do"
          className="cq-input cq-input-dark mt-1.5"
        />
      </motion.div>

      <motion.div {...enter(1)} className="mt-4">
        <label htmlFor="password" className="cq-label cq-label-dark">
          Contraseña
        </label>
        <div className="relative mt-1.5">
          <input
            id="password"
            name="password"
            type={revealed ? "text" : "password"}
            autoComplete="current-password"
            required
            className="cq-input cq-input-dark pr-11"
          />
          {/* Ver la contraseña que uno escribió no es un lujo: en un teclado de
              teléfono es la diferencia entre entrar y reintentar tres veces. */}
          <button
            type="button"
            onClick={() => setRevealed((current) => !current)}
            aria-label={revealed ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={revealed}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-[2px] text-[var(--panel-rail-text)] transition-colors hover:text-[var(--panel-rail-text-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-celeste"
          >
            {revealed ? <IconEyeOff size={17} /> : <IconEye size={17} />}
          </button>
        </div>
      </motion.div>

      {/* role="alert" para que un lector de pantalla anuncie el error sin que
          el usuario tenga que volver a recorrer el formulario buscándolo. */}
      {state.error && (
        <motion.p
          role="alert"
          initial={reduced ? undefined : { opacity: 0, y: -4 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 flex items-start gap-2 rounded-[2px] border border-[#7a2a2a] bg-[#2a1414] px-3 py-2 text-[0.84rem] text-[#f2c2c2]"
        >
          <IconWarning size={16} className="mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </motion.p>
      )}

      <motion.div {...enter(2)}>
        <SubmitButton />
      </motion.div>
    </form>
  );
}
