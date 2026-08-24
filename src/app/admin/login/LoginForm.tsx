"use client";

import type { KeyboardEvent } from "react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import type { LoginActionState } from "@/lib/adminAuth";
import LoginSuccessMark from "./LoginSuccessMark";
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
  /* useFormStatus lee el estado del <form> padre — por eso es un componente
     aparte y no un hook dentro de LoginForm: adentro del mismo componente que
     renderiza el form, siempre devolvería pending: false. */
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      /* Sigue deshabilitado después del éxito: la navegación tarda unos
         milisegundos y en esa ventana el botón todavía acepta clics. */
      disabled={pending || succeeded}
      /* El sistema, no un botón a mano — `data-variant`/`data-size` siguen
         gobernando color, alto y estados. `cq-login-submit` (login.css) sólo
         le corrige la esquina y le suma el lenguaje del CTA público. */
      data-variant="solid"
      data-size="lg"
      className="cq-btn cq-login-submit mt-6 w-full"
    >
      {/* z-index propio: el brillo diagonal de `.cq-login-submit::after` tiene
          que barrer DETRÁS del texto, no encima. */}
      <span className="relative z-10 inline-flex items-center gap-2">
        {pending && <IconSpinner size={16} />}
        {pending ? "Entrando…" : "Entrar"}
      </span>
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
  const [capsOn, setCapsOn] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const checkRef = useRef<SVGPathElement>(null);
  const router = useRouter();

  /* El éxito se lee directo del estado del servidor, sin copiarlo a un estado
     local: copiarlo obligaría a un efecto que sincroniza, y eso encadena
     renders sin comprar nada. */
  const succeeded = Boolean(state.ok);

  /* El error se descarta guardando CUÁL resultado se descartó, no un booleano.
     Así un intento nuevo lo revive solo —es otro objeto de estado— y no hace
     falta ningún efecto que resetee la bandera. */
  const [dismissedFor, setDismissedFor] = useState<LoginActionState | null>(null);
  const dismiss = () => setDismissedFor(state);
  const showError = Boolean(state.error) && dismissedFor !== state;

  /* Tras un intento fallido el foco cae en la contraseña, el único campo que hay
     que reescribir. Sin esto, el que se equivoca tiene que volver a elegir a
     mano dónde escribir. */
  useEffect(() => {
    if (state.error) passwordRef.current?.focus();
  }, [state]);

  /* El momento de éxito. Con `redirect: false` en el servidor, navegar es
     responsabilidad de acá — y por eso hay que garantizar que se navegue SIEMPRE:
     si la animación no corriera, el usuario quedaría con sesión abierta mirando
     el formulario. Por eso el push vive en `onComplete` y también en la rama de
     movimiento reducido, nunca colgado de un timeout suelto.

     El check entra con un `back.out` corto —el único rebote que se permite este
     formulario, porque acá sí pasó algo bueno— y el resto se retira hacia arriba,
     en la dirección en la que la página va a cambiar. */
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

    const timeline = gsap.timeline({ onComplete: go });
    timeline
      /* Primero se retira el formulario, después se dibuja la marca. Solaparlos
         haría que las dos cosas compitan y ninguna se lea. */
      .to(contentRef.current, { opacity: 0, duration: 0.22, ease: "power2.in" })
      .to(markRef.current, { opacity: 1, duration: 0.18 }, "-=0.08")
      .to(circleRef.current, { strokeDashoffset: 0, duration: 0.5, ease: "power2.inOut" })
      /* El check arranca antes de que el círculo termine: pisarse un poco es lo
         que hace que se lea como un gesto y no como dos pasos. */
      .to(checkRef.current, { strokeDashoffset: 0, duration: 0.26, ease: "power2.out" }, "-=0.14")
      /* Una pausa corta antes de navegar. Sin ella la marca se termina de dibujar
         y la página ya cambió: se ve el trabajo, no el resultado. */
      .to({}, { duration: 0.42 });

    return () => {
      timeline.kill();
    };
  }, [succeeded, router]);

  /* CapsLock sólo se puede leer desde un evento de teclado — no hay API para
     consultarlo en frío. Por eso se mira en cada tecla y se apaga al salir del
     campo: un aviso que sobrevive al foco es un aviso que miente. */
  const readCapsLock = (event: KeyboardEvent<HTMLInputElement>) => {
    setCapsOn(event.getModifierState("CapsLock"));
  };

  /* Entrada escalonada, de abajo hacia arriba y desde un estado ya visible: los
     campos no aparecen de la nada, se asientan. Un solo momento, 80 ms entre uno
     y otro — más que eso se siente lento al que entra todos los días. */
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

  /* El error entra con un empuje lateral corto y firme —no un rebote elástico,
     que sería simpático justo cuando alguien no pudo entrar—. Es el lenguaje de
     "esto no pasó", distinto del asentamiento de los campos. */
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
    <form ref={formRef} action={formAction} noValidate className="relative">
      {/* La marca dibujada no la anuncia ningún lector de pantalla, así que el
          éxito se dice acá aparte. Sin esto, para quien no ve la pantalla el
          formulario simplemente deja de responder. */}
      <p role="status" className="sr-only">
        {succeeded ? "Sesión iniciada. Entrando al panel." : ""}
      </p>

      <div ref={contentRef}>
      <div data-enter>
        <label htmlFor="email" className="cq-label">
          Email
        </label>
        <div className="relative mt-1.5">
          <IconMail size={17} className="cq-field-icon" />
          {/* `key` atado al eco: cuando el servidor devuelve el email, el campo
              se vuelve a montar con ese valor. Es lo que evita que un intento
              fallido deje el email en blanco cuando React resetea el form. */}
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
        <label htmlFor="password" className="cq-label">
          Contraseña
        </label>
        <div className="relative mt-1.5">
          <IconLock size={17} className="cq-field-icon" />
          <input
            ref={passwordRef}
            id="password"
            name="password"
            type={revealed ? "text" : "password"}
            autoComplete="current-password"
            required
            /* Sólo enmascarado: revelado, un placeholder de puntos contradice
               justo lo que el ojo acaba de prometer. */
            placeholder={revealed ? undefined : "•••••"}
            onKeyDown={readCapsLock}
            onKeyUp={readCapsLock}
            onBlur={() => setCapsOn(false)}
            onChange={dismiss}
            aria-invalid={showError || undefined}
            aria-describedby={capsOn ? "password-caps" : undefined}
            className={`cq-input cq-field cq-login-input pr-11 ${revealed ? "" : "cq-input-mask"}`}
          />
          {/* Ver la contraseña que uno escribió no es un lujo: en un teclado de
              teléfono es la diferencia entre entrar y reintentar tres veces. */}
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

        {/* Aviso, no error: la contraseña todavía puede ser correcta en mayúsculas.
            Por eso es ámbar y `role="status"` — se anuncia sin interrumpir, y no
            usa el rojo que este formulario reserva para "no entraste". */}
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

      {/* role="alert" para que un lector de pantalla anuncie el error sin que
          el usuario tenga que volver a recorrer el formulario buscándolo. */}
      {showError && (
        <p
          ref={errorRef}
          role="alert"
          className="cq-alert mt-4"
        >
          <IconWarning size={16} className="mt-0.5 shrink-0" />
          <span>{state.error}</span>
        </p>
      )}

        <div data-enter>
          <SubmitButton succeeded={succeeded} />
        </div>
      </div>

      {succeeded && (
        <LoginSuccessMark rootRef={markRef} circleRef={circleRef} checkRef={checkRef} />
      )}
    </form>
  );
}
