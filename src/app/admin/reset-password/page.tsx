import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { authFont } from "../authFont";
/* Reusado tal cual desde login/: es un wrapper de entrada genérico —logo y
   tarjeta suben en fundido, sin nada específico del login— y esta pantalla
   necesita exactamente el mismo gesto de llegada. No se movió a una carpeta
   compartida junto con auth.css/authFont.ts porque el plan de este feature
   sólo alcanzaba a esos dos archivos; mover un tercero es un paso más de
   churn sin necesidad real todavía. */
import LoginReveal from "../login/LoginReveal";
import ResetPasswordWizard from "./ResetPasswordWizard";
import { requestPasswordReset, resetPassword, verifyResetCode } from "./actions";
import "../auth.css";

export const metadata: Metadata = {
  title: "Recuperar contraseña | Center Quest",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    /* Mismo shell que login/page.tsx —fondo, halo, tarjeta— porque son la
       misma familia de pantallas (ver el comentario en auth.css). El
       encabezado NO es fijo acá: cambia por paso (título, subtítulo, campos),
       así que vive dentro de ResetPasswordWizard en vez de declararse acá
       como prop, a diferencia de LoginForm — ahí el encabezado es siempre el
       mismo texto. */
    <div
      className={`cq-login-page ${authFont.variable} flex min-h-screen items-center justify-center bg-[var(--p-surface-sunken)] px-6 py-16`}
    >
      <div aria-hidden className="cq-login-glow" />
      <LoginReveal>
        <div className="cq-login-card px-7 py-9 sm:px-9 sm:py-10">
          <div data-reveal className="flex justify-center">
            <Link href="/" aria-label="Ir al sitio de Center Quest">
              <Image
                src="/logo.png"
                alt="Center Quest"
                width={692}
                height={512}
                sizes="160px"
                priority
                className="h-16 w-auto"
              />
            </Link>
          </div>

          <div data-reveal className="mt-6">
            {/* Las tres acciones se pasan como PROPS, no se importan desde
                ResetPasswordWizard (componente cliente): actions.ts toca
                Prisma/bcrypt/Resend directo, y un cliente que importe ese
                archivo arrastra todo ese grafo al bundle del navegador —
                pg intenta resolver módulos de Node ("net", "tls") que no
                existen ahí. Mismo patrón que ya usa LoginForm, que recibe
                `action={loginAdmin}` en vez de importar adminAuth.ts. */}
            <ResetPasswordWizard
              requestAction={requestPasswordReset}
              verifyAction={verifyResetCode}
              resetAction={resetPassword}
            />
          </div>
        </div>

        <p className="cq-meta mt-5 text-center">
          <Link href="/admin/login" className="cq-link">
            Volver a iniciar sesión
          </Link>
        </p>
      </LoginReveal>
    </div>
  );
}
