import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loginAdmin } from "@/lib/adminAuth";
import LoginForm from "./LoginForm";
import LoginReveal from "./LoginReveal";

export default async function AdminLoginPage() {
  /* Con sesión activa el login no tiene sentido: manda al panel en vez de
     pedir credenciales que ya se dieron. */
  const session = await auth();
  if (session?.user?.id) redirect("/admin");

  return (
    /* Sigue siendo una paleta clara, pero con DOS valores: la página en el
       hueso de la marca (#f8f7f4) y la tarjeta en blanco puro. Eso es lo que
       hace que flote — un blanco sobre blanco no tiene de dónde despegarse.
       Sigue sin haber capa de fondo, así que la página es HTML plano. */
    /* Tokens del PANEL. Esta pantalla vive bajo `app/admin`, hereda su hoja y
       es la primera que ve un administrador — pero pintaba con los tokens del
       sitio público (`--background`, `--surface-raised`, `--foreground`,
       `--text-secondary`), o sea con la escala de otro sistema. */
    <div className="flex min-h-screen items-center justify-center bg-[var(--p-surface-sunken)] px-6 py-16">
      <LoginReveal>
        {/* La única sombra del sistema, y acá está justificada: la tarjeta es
            lo único que flota en la pantalla. El radio sale de la escala de
            superficies en vez de un literal de 16px, y el filete de 1px la
            sostiene donde la sombra casi no se ve. */}
        <div className="cq-overlay px-7 py-9 sm:px-9 sm:py-10">
          {/* El encabezado se separa del formulario con espacio, sin regla: con
              sólo dos campos debajo, una línea divide algo que no necesitaba
              dividirse y agrega un elemento más que descartar. */}
          <div className="flex flex-col items-center gap-y-2.5">
            <Link data-reveal href="/" aria-label="Ir al sitio de Center Quest">
              <Image
                src="/logo.png"
                alt="Center Quest"
                width={692}
                height={512}
                sizes="160px"
                priority
                className="h-14 w-auto"
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
