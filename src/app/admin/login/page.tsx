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
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 py-16">
      <LoginReveal>
        {/* Radio de 16px y sombra larga y muy abierta: así se lee como altura
            sobre la página y no como un contorno gris. El borde de 1px la
            sostiene en pantallas donde la sombra casi no se ve. */}
        <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-raised)] px-7 py-9 shadow-[0_1px_2px_rgb(13_30_41_/_0.04),0_20px_44px_-16px_rgb(13_30_41_/_0.16)] sm:px-9 sm:py-10">
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
              className="text-[1.4rem] leading-none font-semibold tracking-[-0.02em] text-[var(--foreground)]"
            >
              Entrar al panel
            </h1>
            <p
              data-reveal
              className="text-center text-[0.85rem] leading-relaxed text-[var(--text-secondary)]"
            >
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
        <p className="mt-5 text-center text-[0.8rem] leading-relaxed text-[var(--text-tertiary)]">
          Las cuentas se crean internamente. No hay registro abierto.
        </p>
      </LoginReveal>
    </div>
  );
}
