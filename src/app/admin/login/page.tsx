import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loginAdmin } from "@/lib/adminAuth";
import LoginBackdrop from "./LoginBackdrop";
import LoginForm from "./LoginForm";

/* Lo que el panel administra, dicho en la puerta. No son promesas de marketing:
   son las tres secciones que existen del otro lado. */
const SECTIONS = [
  { title: "Artículos", detail: "Escritos con bloques, en borrador o publicados." },
  { title: "Categorías", detail: "La línea de negocio a la que pertenece cada uno." },
  { title: "Plantillas", detail: "Estructuras guardadas para no empezar de cero." },
];

export default async function AdminLoginPage() {
  /* Con sesión activa el login no tiene sentido: manda al panel en vez de
     pedir credenciales que ya se dieron. */
  const session = await auth();
  if (session?.user?.id) redirect("/admin");

  return (
    <div className="cq-rail relative min-h-screen overflow-hidden">
      <LoginBackdrop />

      <div className="relative mx-auto grid min-h-screen w-full max-w-[72rem] items-center gap-12 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-16 lg:px-10">
        <div className="max-w-[34rem]">
          <h1 className="font-heading text-[clamp(2.1rem,4.4vw,3.1rem)] leading-[1.04] font-semibold tracking-[-0.03em] text-[var(--panel-rail-text-strong)]">
            El blog de Center Quest
            <span className="mt-2 block text-[var(--brand-celeste)]">se edita acá.</span>
          </h1>

          <p className="mt-5 max-w-[46ch] text-[1rem] leading-relaxed text-[var(--panel-rail-text)]">
            Un panel interno, sin registro abierto. Lo que se publica desde acá sale al sitio
            público tal cual se ve en la vista previa.
          </p>

          <ul className="mt-9 grid gap-px overflow-hidden rounded-[4px] border border-[var(--panel-rail-border)] bg-[var(--panel-rail-border)] sm:grid-cols-3">
            {SECTIONS.map((section) => (
              <li key={section.title} className="bg-[var(--panel-rail-raised)] px-4 py-4">
                <p className="text-[0.88rem] font-semibold text-[var(--panel-rail-text-strong)]">
                  {section.title}
                </p>
                <p className="mt-1 text-[0.78rem] leading-relaxed text-[var(--panel-rail-text)]">
                  {section.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="rounded-[4px] border border-[var(--panel-rail-border)] bg-[color-mix(in_srgb,var(--panel-rail-raised)_88%,transparent)] p-6 shadow-[var(--panel-shadow-overlay)] backdrop-blur-[2px] sm:p-7">
            <h2 className="font-heading text-[1.25rem] leading-none font-semibold tracking-[-0.02em] text-[var(--panel-rail-text-strong)]">
              Entrar al panel
            </h2>
            <LoginForm action={loginAdmin} />
          </div>

          {/* No hay registro público (AD-1): las cuentas se crean por consola con
              prisma/create-admin.ts. Decirlo evita que alguien busque el enlace. */}
          <p className="mt-4 text-center text-[0.8rem] leading-relaxed text-[var(--panel-rail-text)]">
            Las cuentas se crean internamente. No hay registro abierto.
          </p>
        </div>
      </div>
    </div>
  );
}
