import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loginAdmin } from "@/lib/adminAuth";
import LoginForm from "./LoginForm";
import LoginReveal from "./LoginReveal";
import "./login.css";

export default async function AdminLoginPage() {
  /* Con sesión activa el login no tiene sentido: manda al panel en vez de
     pedir credenciales que ya se dieron. */
  const session = await auth();
  if (session?.user?.id) redirect("/admin");

  return (
    /* Tokens del PANEL, con una cita puntual al sitio público (ver login.css):
       esta pantalla es la puerta de entrada y no lleva nada del cromo del
       panel alrededor, así que tiene que anunciar la marca antes que la
       herramienta interna. El resplandor de fondo es decorativo — `aria-hidden`
       y detrás de la tarjeta por `z-index`, nunca compite con el formulario. */
    <div className="cq-login-page flex min-h-screen items-center justify-center bg-[var(--p-surface-sunken)] px-6 py-16">
      <div aria-hidden className="cq-login-glow" />
      <LoginReveal>
        {/* Sin filete: lo que separa la tarjeta del fondo es la sombra con
            color de marca y el halo de luz posado arriba, no una línea de 1px.
            Ver login.css para el porqué de cada valor. */}
        <div className="cq-login-card px-7 py-9 sm:px-9 sm:py-10">
          {/* El encabezado se separa del formulario con espacio, sin regla: con
              sólo dos campos debajo, una línea divide algo que no necesitaba
              dividirse y agrega un elemento más que descartar. */}
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
            <h1
              data-reveal
              /* El paso de display del panel, no un tamaño intermedio inventado
                 para esta pantalla. Es el único titular de la vista y no
                 compite con nada: es exactamente para lo que existe el paso. */
              className="cq-display"
            >
              Entrar al panel
            </h1>
            <p data-reveal className="cq-body text-center text-[var(--p-ink-muted)]">
              Administra tus artículos, categorías y plantillas del blog.
            </p>
          </div>

          <div className="pt-6">
            <LoginForm action={loginAdmin} />
          </div>
        </div>

        {/* No hay registro público (AD-1): las cuentas se crean por consola con
            prisma/create-admin.ts. Decirlo evita que alguien busque el enlace.
            Va FUERA de la tarjeta: es una nota sobre el sistema, no un paso del
            formulario, y afuera no le compite jerarquía a los campos. Ya no
            lleva la línea fina de arriba — ese trabajo lo hace el canto de la
            tarjeta. */}
        <p className="cq-meta mt-5 text-center">
          Las cuentas se crean internamente. No hay registro abierto.
        </p>
      </LoginReveal>
    </div>
  );
}
