"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
/* Sólo TIPOS de actions.ts — `import type` se borra por completo al
   compilar, así que nunca arrastra el archivo real (Prisma/bcrypt/Resend) al
   bundle del cliente. Las funciones en sí llegan por prop, ver el porqué en
   page.tsx. */
import type { RequestResetState, ResetPasswordState, VerifyCodeState } from "./actions";
import OtpInput from "./OtpInput";
import PasswordChecklist from "./PasswordChecklist";
import SuccessMark, { SUCCESS_FRAME_HEIGHT } from "../SuccessMark";
import { passwordMeetsPolicy } from "@/lib/passwordPolicy";
import {
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconSpinner,
  IconWarning,
} from "@/components/admin/ui/icons";

/* Los tres pasos de "olvidé mi contraseña" en una sola pantalla, con estado
   de paso local — no tres rutas: perder el progreso al ir y volver entre
   /email, /code y /password sería peor experiencia que un wizard, y acá no
   hay nada que una URL propia por paso resuelva (no hay nada que compartir
   ni marcar de favorito a mitad de camino).

   Tres useActionState, uno por server action (actions.ts) — mismo patrón que
   LoginForm.tsx, uno por formulario real. El handle que conecta el paso 2
   con el 3 (`sessionToken`) viaja sólo en memoria de React, nunca en la URL:
   ver el porqué de que sea autocontenido y de un solo uso en
   passwordResetTokens.ts. */

type Step = "email" | "code" | "password";

type ServerAction<S> = (state: S, formData: FormData) => Promise<S>;

const RESEND_COOLDOWN_S = 30;

export default function ResetPasswordWizard({
  requestAction,
  verifyAction,
  resetAction,
}: {
  requestAction: ServerAction<RequestResetState>;
  verifyAction: ServerAction<VerifyCodeState>;
  resetAction: ServerAction<ResetPasswordState>;
}) {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeInvalid, setCodeInvalid] = useState(false);
  const [sessionToken, setSessionToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordRevealed, setPasswordRevealed] = useState(false);
  const [confirmRevealed, setConfirmRevealed] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  /* Aparte de `step` a propósito, igual que `succeeded` en LoginForm: no es
     un cuarto paso que se turna con los otros tres, es un estado que se
     SUMA — el formulario de contraseña se queda montado (fading) mientras
     la marca de éxito entra encima, en vez de que React lo desmonte y
     tenga que remontar todo el dibujo del check desde cero. */
  const [resetSucceeded, setResetSucceeded] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const checkRef = useRef<SVGPathElement>(null);
  /* Copia de `step` en un ref, para leerla dentro de handleRequestReset sin
     que ese wrapper dependa de un cierre potencialmente viejo — si el
     REENVÍO (mismo wrapper) llega mientras ya está en "code", sólo tiene que
     refrescar el eco y el cooldown, no repetir la animación de transición. */
  const stepRef = useRef<Step>(step);

  /* Transición entre pasos: fundido+deriva hacia arriba de lo que se va,
     igual lenguaje que ya usa el cierre del login (ver LoginForm.tsx). Sale
     primero, cambia el paso recién en `onComplete` —así React nunca pisa el
     contenido a mitad de la animación— y el paso nuevo entra con el efecto
     de abajo, que corre cada vez que `step` cambia. */
  function goToStep(next: Step) {
    const el = contentRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(next);
      return;
    }
    gsap.to(el, {
      opacity: 0,
      y: -8,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => setStep(next),
    });
  }

  /* Sólo sincroniza el ref y dispara la animación de entrada — nunca
     `setState`: los tres pasos de abajo (email/código/contraseña) resuelven
     su propia transición apenas la acción del servidor responde, dentro del
     wrapper que envuelven, no reaccionando acá a un cambio de estado ya
     ocurrido (ver la guía de React sobre useEffect + setState). */
  useEffect(() => {
    stepRef.current = step;

    const el = contentRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" });
  }, [step]);

  /* Cada acción de servidor va envuelta: lo que pasa cuando TERMINA vive acá,
     no en un useEffect que la vigila después del hecho. Corre en el mismo
     tick que ya dispara React al terminar la transición del form action, así
     que llamar setState acá es tan válido como hacerlo desde un manejador de
     evento — no dispara el aviso de "setState dentro de un efecto". */
  async function handleRequestReset(
    prevState: RequestResetState,
    formData: FormData,
  ): Promise<RequestResetState> {
    const result = await requestAction(prevState, formData);
    if (result.sent) {
      /* El email se toma del ECO del servidor (result.email), nunca del
         estado local: es el mismo valor normalizado (trim) que el server
         action realmente procesó, y es lo que viaja de acá en más como
         campo oculto del paso 2. */
      setEmail(result.email ?? "");
      setResendCooldown(RESEND_COOLDOWN_S);
      if (stepRef.current !== "code") goToStep("code");
    }
    return result;
  }

  async function handleVerifyCode(prevState: VerifyCodeState, formData: FormData): Promise<VerifyCodeState> {
    const result = await verifyAction(prevState, formData);
    if (result.verified && result.sessionToken) {
      setSessionToken(result.sessionToken);
      goToStep("password");
    } else if (result.error) {
      setCode("");
      setCodeInvalid(true);
      setTimeout(() => setCodeInvalid(false), 450);
    }
    return result;
  }

  async function handleResetPassword(
    prevState: ResetPasswordState,
    formData: FormData,
  ): Promise<ResetPasswordState> {
    const result = await resetAction(prevState, formData);
    /* No navega directo: dispara la marca de éxito, y es ELLA la que navega
       al terminar de dibujarse (ver el efecto de abajo) — el mensaje de
       "tu contraseña se actualizó" ya lo dice esta animación, así que
       /admin/login no necesita mostrarlo de nuevo después del redirect. */
    if (result.done) setResetSucceeded(true);
    return result;
  }

  const [requestState, requestFormAction, requestPending] = useActionState<RequestResetState, FormData>(
    handleRequestReset,
    { error: null },
  );
  const [verifyState, verifyFormAction, verifyPending] = useActionState<VerifyCodeState, FormData>(
    handleVerifyCode,
    { error: null },
  );
  const [resetState, resetFormAction, resetPending] = useActionState<ResetPasswordState, FormData>(
    handleResetPassword,
    { error: null },
  );

  /* El momento de éxito, calcado del de LoginForm.tsx (mismos refs, mismo
     componente — SuccessMark — mismo timeline): se retira el formulario de
     contraseña, el marco se encoge al alto fijo de la marca
     (SUCCESS_FRAME_HEIGHT, no el mínimo posible, para que el check no quede
     flotando solo en un hueco de sobra), se dibuja el círculo y el check, un
     pulso corto, el titular y la leyenda, y recién ahí navega — nunca antes,
     y siempre, incluso con movimiento reducido, porque si la animación no
     corriera el usuario quedaría mirando un formulario ya inútil.

     Una sola diferencia con el login: acá `contentRef` se retira COMPLETO,
     no en cascada por `[data-enter]` — el wizard ya usa un fundido único
     para cada transición de paso (goToStep), así que este cierre sigue esa
     misma gramática en vez de sumar una tercera. */
  useEffect(() => {
    if (!resetSucceeded) return;

    const go = () => router.push("/admin/login");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      go();
      return;
    }

    gsap.set(frameRef.current, {
      height: frameRef.current!.getBoundingClientRect().height,
      overflow: "hidden",
    });

    const timeline = gsap.timeline({ onComplete: go });
    timeline
      .to(contentRef.current, { opacity: 0, y: -10, scale: 0.97, duration: 0.28, ease: "power2.in" })
      .to(frameRef.current, { height: SUCCESS_FRAME_HEIGHT, duration: 0.42, ease: "power2.inOut" }, "-=0.14")
      .to(markRef.current, { opacity: 1, duration: 0.16 }, "<0.06")
      .fromTo(
        glowRef.current,
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 0.42, ease: "power2.out" },
        "<0.04",
      )
      .fromTo(iconRef.current, { scale: 0.85 }, { scale: 1, duration: 0.4, ease: "power2.out" }, "<")
      .to(circleRef.current, { strokeDashoffset: 0, duration: 0.36, ease: "power2.inOut" }, "<")
      .to(checkRef.current, { strokeDashoffset: 0, duration: 0.18, ease: "power2.out" }, "-=0.1")
      .to(iconRef.current, { scale: 1.08, duration: 0.11, ease: "power2.out" })
      .to(iconRef.current, { scale: 1, duration: 0.2, ease: "back.out(2.5)" })
      .fromTo(
        textRef.current,
        { opacity: 0, y: 5 },
        { opacity: 1, y: 0, duration: 0.26, ease: "power2.out" },
        "-=0.05",
      )
      .to(markRef.current, { opacity: 0, y: -8, duration: 0.18, ease: "power2.in" }, "+=0.16");

    return () => {
      timeline.kill();
    };
  }, [resetSucceeded, router]);

  /* Cuenta regresiva del reenvío. `setResendCooldown` corre DENTRO del
     callback del intervalo, no en el cuerpo del efecto — es exactamente el
     patrón de "suscribirse a un reloj externo" que la regla de arriba pide,
     no el de "copiar un valor ya calculado". */
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  function handleResend() {
    if (resendCooldown > 0 || requestPending || !email) return;
    const formData = new FormData();
    formData.set("email", email);
    requestFormAction(formData);
  }

  const canSubmitPassword =
    password.length > 0 && password === confirmPassword && passwordMeetsPolicy(password);

  return (
    /* Mismo rol que en LoginForm.tsx: el ancla de posición y el alto
       animable. La marca de éxito cubre esta caja entera. */
    <div ref={frameRef} className="relative">
      <div ref={contentRef}>
        {step === "email" && (
          <form action={requestFormAction}>
            <div className="text-center">
              <h1 className="cq-display">Recuperar contraseña</h1>
              <p className="cq-body mt-2 text-[var(--p-ink-muted)]">
                Ingresa tu email y te mandamos un código de 6 dígitos para elegir una contraseña nueva.
              </p>
            </div>

            <div className="mt-6">
              <label htmlFor="reset-email" className="cq-label">
                Email
              </label>
              <div className="relative mt-1.5">
                <IconMail size={17} className="cq-field-icon" />
                <input
                  id="reset-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  autoFocus
                  placeholder="nombre@centerquest.do"
                  defaultValue={email}
                  aria-invalid={Boolean(requestState.error) || undefined}
                  className="cq-input cq-field cq-login-input"
                />
              </div>
            </div>

            {requestState.error && (
              <p role="alert" className="cq-alert cq-login-alert mt-4">
                <IconWarning size={16} className="mt-0.5 shrink-0" />
                <span>{requestState.error}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={requestPending}
              data-variant="solid"
              data-size="lg"
              className="cq-btn cq-login-submit mt-6 w-full"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                {requestPending && <IconSpinner size={16} />}
                {requestPending ? "Enviando…" : "Enviar código"}
              </span>
            </button>
          </form>
        )}

        {step === "code" && (
          <form action={verifyFormAction}>
            <input type="hidden" name="email" value={email} />

            <div className="text-center">
              <h1 className="cq-display">Ingresa el código</h1>
              <p className="cq-body mt-2 text-[var(--p-ink-muted)]">
                Si existe una cuenta asociada a <strong>{email}</strong>, te enviamos un código de 6
                dígitos. Vence en 10 minutos.
              </p>
            </div>

            <div className="mt-6">
              <OtpInput
                value={code}
                onChange={setCode}
                invalid={codeInvalid}
                disabled={verifyPending}
                autoFocus
              />
              <input type="hidden" name="code" value={code} />
            </div>

            {verifyState.error && (
              <p role="alert" className="cq-alert cq-login-alert mt-4 justify-center">
                <IconWarning size={16} className="mt-0.5 shrink-0" />
                <span>{verifyState.error}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={verifyPending || code.length < 6}
              data-variant="solid"
              data-size="lg"
              className="cq-btn cq-login-submit mt-6 w-full"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                {verifyPending && <IconSpinner size={16} />}
                {verifyPending ? "Verificando…" : "Verificar código"}
              </span>
            </button>

            <div className="mt-4 flex items-center justify-between text-[var(--p-meta-size)]">
              <button
                type="button"
                onClick={() => goToStep("email")}
                className="cq-link inline-flex items-center gap-1"
              >
                <IconArrowLeft size={13} />
                Cambiar email
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || requestPending}
                className="cq-link disabled:cursor-not-allowed disabled:text-[var(--p-ink-muted)] disabled:no-underline disabled:opacity-70"
              >
                {resendCooldown > 0 ? `Reenviar código (${resendCooldown}s)` : "Reenviar código"}
              </button>
            </div>
          </form>
        )}

        {step === "password" && (
          <form action={resetFormAction}>
            <input type="hidden" name="sessionToken" value={sessionToken} />

            <div className="text-center">
              <h1 className="cq-display">Nueva contraseña</h1>
              <p className="cq-body mt-2 text-[var(--p-ink-muted)]">Tiene que cumplir estas tres condiciones.</p>
            </div>

            <div className="mt-6">
              <label htmlFor="reset-password-new" className="cq-label">
                Nueva contraseña
              </label>
              <div className="relative mt-1.5">
                <IconLock size={17} className="cq-field-icon" />
                <input
                  id="reset-password-new"
                  name="password"
                  type={passwordRevealed ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  autoFocus
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-describedby="reset-password-checklist"
                  className="cq-input cq-field cq-login-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setPasswordRevealed((current) => !current)}
                  aria-label={passwordRevealed ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={passwordRevealed}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-[2px] text-[var(--p-ink-muted)] transition-colors hover:text-[var(--p-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--p-accent)]"
                >
                  {passwordRevealed ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                </button>
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="reset-password-confirm" className="cq-label">
                Confirmar contraseña
              </label>
              <div className="relative mt-1.5">
                <IconLock size={17} className="cq-field-icon" />
                <input
                  id="reset-password-confirm"
                  name="confirmPassword"
                  type={confirmRevealed ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="cq-input cq-field cq-login-input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setConfirmRevealed((current) => !current)}
                  aria-label={confirmRevealed ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={confirmRevealed}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-[2px] text-[var(--p-ink-muted)] transition-colors hover:text-[var(--p-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--p-accent)]"
                >
                  {confirmRevealed ? <IconEyeOff size={17} /> : <IconEye size={17} />}
                </button>
              </div>
            </div>

            <div className="mt-4">
              <PasswordChecklist
                id="reset-password-checklist"
                password={password}
                confirmPassword={confirmPassword}
              />
            </div>

            {resetState.error && (
              <p role="alert" className="cq-alert cq-login-alert mt-4">
                <IconWarning size={16} className="mt-0.5 shrink-0" />
                <span>{resetState.error}</span>
              </p>
            )}

            <button
              type="submit"
              /* También deshabilitado tras el éxito: al terminar la acción
                 `resetPending` vuelve a false, y sin este chequeo el botón se
                 reactivaría un instante mientras la marca todavía se dibuja
                 encima — mismo detalle que `succeeded` en el botón de
                 LoginForm.tsx. */
              disabled={resetPending || !canSubmitPassword || resetSucceeded}
              aria-describedby="reset-password-checklist"
              data-variant="solid"
              data-size="lg"
              className="cq-btn cq-login-submit mt-6 w-full"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                {resetPending && <IconSpinner size={16} />}
                {resetPending ? "Actualizando…" : "Actualizar contraseña"}
              </span>
            </button>
          </form>
        )}
      </div>

      {resetSucceeded && (
        <SuccessMark
          rootRef={markRef}
          iconRef={iconRef}
          glowRef={glowRef}
          textRef={textRef}
          circleRef={circleRef}
          checkRef={checkRef}
          title="Contraseña restablecida"
          caption="Te llevamos a iniciar sesión…"
        />
      )}
    </div>
  );
}
