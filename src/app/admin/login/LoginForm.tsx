"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import gsap from "gsap";
import type { LoginActionState } from "@/lib/adminAuth";
import SuccessMark, { SUCCESS_FRAME_HEIGHT } from "../SuccessMark";
import {
  IconCapsLock,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconSpinner,
  IconWarning,
} from "@/components/admin/ui/icons";

function SubmitButton({ succeeded }: { succeeded: boolean }) {
  // useFormStatus sólo lee pending del <form> padre; dentro de LoginForm siempre daría false.
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      // Sigue deshabilitado tras el éxito: la navegación tarda unos ms y en esa ventana aún acepta clics.
      disabled={pending || succeeded}
      data-variant="solid"
      data-size="lg"
      className="cq-btn cq-login-submit mt-6 w-full"
    >
      {/* z-index propio: el brillo diagonal de .cq-login-submit::after tiene que barrer detrás del texto. */}
      <span className="relative z-10 inline-flex items-center gap-2">
        {pending && <IconSpinner size={16} />}
        {pending ? "Entrando…" : "Entrar"}
      </span>
    </button>
  );
}

export default function LoginForm({
  action,
  header,
}: {
  action: (state: LoginActionState, formData: FormData) => Promise<LoginActionState>;
  // Entra como prop (no JSX suelto) para que el efecto de éxito lo desvanezca junto con los campos vía contentRef.
  header: ReactNode;
}) {
  const [state, formAction] = useActionState(action, { error: null });
  const [revealed, setRevealed] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const checkRef = useRef<SVGPathElement>(null);
  const router = useRouter();

  // Se lee directo del estado del servidor: copiarlo a estado local obligaría a un efecto de sincronización.
  const succeeded = Boolean(state.ok);

  // Se descarta guardando QUÉ resultado se descartó (no un booleano), así un intento nuevo lo revive solo.
  const [dismissedFor, setDismissedFor] = useState<LoginActionState | null>(null);
  const dismiss = () => setDismissedFor(state);
  const showError = Boolean(state.error) && dismissedFor !== state;

  // Tras un intento fallido, el foco vuelve a la contraseña, el único campo que hay que reescribir.
  useEffect(() => {
    if (state.error) passwordRef.current?.focus();
  }, [state]);

  // Con redirect:false en el servidor, la navegación es responsabilidad de acá: el push va en onComplete y en la rama de movimiento reducido, nunca en un timeout suelto, para garantizar que siempre navegue.
  useEffect(() => {
    if (!succeeded) return;

    const go = () => {
      router.push("/admin");
      router.refresh();
    };

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
      // Primero se retira el contenido, después se dibuja la marca: solaparlos haría que ninguna se lea.
      .to(contentRef.current!.querySelectorAll("[data-enter]"), {
        opacity: 0,
        y: -10,
        scale: 0.97,
        duration: 0.26,
        stagger: 0.03,
        ease: "power2.in",
      })
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
      // El check arranca antes de que el círculo termine: pisarse un poco se lee como un gesto, no dos pasos.
      .to(checkRef.current, { strokeDashoffset: 0, duration: 0.18, ease: "power2.out" }, "-=0.1")
      // Único rebote del formulario: pasa de largo su tamaño final a propósito.
      .to(iconRef.current, { scale: 1.08, duration: 0.11, ease: "power2.out" })
      .to(iconRef.current, { scale: 1, duration: 0.2, ease: "back.out(2.5)" })
      .fromTo(
        textRef.current,
        { opacity: 0, y: 5 },
        { opacity: 1, y: 0, duration: 0.26, ease: "power2.out" },
        "-=0.05",
      )
      // Retiro corto antes de navegar: se ve el resultado un instante, no sólo el trabajo de dibujarlo.
      .to(markRef.current, { opacity: 0, y: -8, duration: 0.18, ease: "power2.in" }, "+=0.16");

    return () => {
      timeline.kill();
    };
  }, [succeeded, router]);

  // CapsLock sólo se puede leer desde un evento de teclado (no hay API para consultarlo en frío); se apaga al salir del campo.
  const readCapsLock = (event: KeyboardEvent<HTMLInputElement>) => {
    setCapsOn(event.getModifierState("CapsLock"));
  };

  // Stagger de 80ms entre campos: más que eso se siente lento al que entra todos los días.
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(formRef.current!.querySelectorAll("[data-enter]"), {
        opacity: 0,
        y: 12,
        duration: 0.55,
        stagger: 0.08,
        delay: 0.15,
        ease: "power3.out",
        clearProps: "opacity,transform",
      });
    });

    return () => media.revert();
  }, []);

  // Empuje lateral corto y firme, no un rebote elástico: sería simpático justo cuando alguien no pudo entrar.
  useEffect(() => {
    if (!showError || !errorRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap
      .timeline()
      .fromTo(
        errorRef.current,
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" },
      )
      .fromTo(
        errorRef.current,
        { x: -4 },
        { x: 0, duration: 0.32, ease: "power3.out" },
        "<",
      );
  }, [showError]);

  return (
    // El ancla de posición y el alto animable pasan a este div (antes el <form>): la marca de éxito cubre encabezado + formulario juntos con absolute inset-0.
    <div ref={frameRef} className="relative">
      <div ref={contentRef}>
        {/* data-enter propio: es el cuarto grupo del stagger de salida (ver efecto de éxito), no participa de la entrada escalonada porque el encabezado ya tiene la suya. */}
        <div data-enter>{header}</div>

        <form ref={formRef} action={formAction} noValidate className="mt-6">
          <div data-enter>
            <label htmlFor="email" className="cq-label">
              Email
            </label>
            <div className="relative mt-1.5">
              <IconMail size={17} className="cq-field-icon" />
              {/* key atado al eco del servidor: evita que un intento fallido deje el email en blanco cuando React resetea el form. */}
              <input
                key={state.email ?? ""}
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                autoFocus
                placeholder="nombre@centerquest.do"
                defaultValue={state.email ?? ""}
                onChange={dismiss}
                aria-invalid={showError || undefined}
                className="cq-input cq-field cq-login-input"
              />
            </div>
          </div>

          <div data-enter className="mt-4">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="password" className="cq-label">
                Contraseña
              </label>
              {/* tabIndex normal: entre la contraseña y el botón es donde alguien que va a pedir un reset lo busca. */}
              <Link href="/admin/reset-password" className="cq-link text-[var(--p-meta-size)]">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative mt-1.5">
              <IconLock size={17} className="cq-field-icon" />
              <input
                ref={passwordRef}
                id="password"
                name="password"
                type={revealed ? "text" : "password"}
                autoComplete="current-password"
                required
                // Sólo enmascarado: revelado, un placeholder de puntos contradice lo que el ojo acaba de prometer.
                placeholder={revealed ? undefined : "•••••"}
                onKeyDown={readCapsLock}
                onKeyUp={readCapsLock}
                onBlur={() => setCapsOn(false)}
                onChange={dismiss}
                aria-invalid={showError || undefined}
                aria-describedby={capsOn ? "password-caps" : undefined}
                className={`cq-input cq-field cq-login-input pr-11 ${revealed ? "" : "cq-input-mask"}`}
              />
              {/* Ver la contraseña no es un lujo: en un teclado de teléfono es la diferencia entre entrar y reintentar tres veces. */}
              <button
                type="button"
                onClick={() => setRevealed((current) => !current)}
                aria-label={revealed ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={revealed}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-[2px] text-[var(--p-ink-muted)] transition-colors hover:text-[var(--p-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--p-accent)]"
              >
                {revealed ? <IconEyeOff size={17} /> : <IconEye size={17} />}
              </button>
            </div>

            {/* Aviso, no error: la contraseña puede seguir siendo correcta en mayúsculas, por eso es ámbar/role="status" y no el rojo de "no entraste". */}
            {capsOn && (
              <p
                id="password-caps"
                role="status"
                className="cq-meta mt-2 flex items-center gap-2 text-[var(--p-pending)]"
              >
                <IconCapsLock size={15} className="shrink-0" />
                Bloq Mayús está activado.
              </p>
            )}
          </div>

          {/* role="alert" para que un lector de pantalla anuncie el error sin que el usuario tenga que buscarlo. */}
          {showError && (
            <p ref={errorRef} role="alert" className="cq-alert cq-login-alert mt-4">
              <IconWarning size={16} className="mt-0.5 shrink-0" />
              <span>{state.error}</span>
            </p>
          )}

          <div data-enter>
            <SubmitButton succeeded={succeeded} />
          </div>
        </form>
      </div>

      {succeeded && (
        <SuccessMark
          rootRef={markRef}
          iconRef={iconRef}
          glowRef={glowRef}
          textRef={textRef}
          circleRef={circleRef}
          checkRef={checkRef}
          title="Sesión iniciada"
          caption="Entrando al panel…"
        />
      )}
    </div>
  );
}
