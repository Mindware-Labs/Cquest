import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loginAdmin } from "@/lib/adminAuth";
import { authFont } from "../authFont";
import LoginForm from "./LoginForm";
import LoginReveal from "./LoginReveal";
import "../auth.css";

export default async function AdminLoginPage() {
  // Con sesión activa el login no tiene sentido: manda al panel en vez de pedir credenciales que ya se dieron.
  const session = await auth();
  if (session?.user?.id) redirect("/admin");

  return (
    // Resplandor de fondo decorativo: aria-hidden y detrás de la tarjeta por z-index, nunca compite con el formulario.
    <div
      className={`cq-login-page ${authFont.variable} flex min-h-screen items-center justify-center bg-[var(--p-surface-sunken)] px-6 py-16`}
    >
      <div aria-hidden className="cq-login-glow" />
      <LoginReveal>
        {/* Sin filete: lo que separa la tarjeta del fondo es la sombra con color de marca, no una línea de 1px (ver auth.css). */}
        <div className="cq-login-card px-7 py-9 sm:px-9 sm:py-10">
          <LoginForm
            action={loginAdmin}
            header={
              // Se pasa como prop (no JSX aparte) para que LoginForm pueda desvanecerlo junto con el resto al tener éxito (ver contentRef ahí).
              <div className="flex flex-col items-center gap-y-3">
                <Link data-reveal href="/" aria-label="Ir al sitio de Center Quest">
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
                <h1 data-reveal className="cq-display">
                  Inicio de sesión
                </h1>
                <p data-reveal className="cq-body text-center text-[var(--p-ink-muted)]">
                  Administra tus artículos, categorías y plantillas del blog.
                </p>
              </div>
            }
          />
        </div>

        {/* No hay registro público (AD-1): cuentas creadas por consola con prisma/create-admin.ts. Fuera de la tarjeta para no competir jerarquía con los campos. */}
        <p className="cq-meta mt-5 text-center">
          Las cuentas se crean internamente. No hay registro abierto.
        </p>
      </LoginReveal>
    </div>
  );
}
