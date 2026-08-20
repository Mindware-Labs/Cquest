import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { loginAdmin } from "@/lib/adminAuth";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage() {
  /* Con sesión activa el login no tiene sentido: manda al panel en vez de
     pedir credenciales que ya se dieron. */
  const session = await auth();
  if (session?.user?.id) redirect("/admin");

  return (
    /* Entrada en tinta: el panel empieza acá y se anuncia con la misma
       superficie oscura del riel, no con una pantalla blanca cualquiera. */
    <div className="cq-rail flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-[23rem]">
        <h1 className="font-heading text-[1.9rem] leading-[1.05] font-semibold tracking-[-0.025em] text-[var(--panel-rail-text-strong)]">
          Panel editorial
          <span className="mt-1.5 block text-[0.95rem] font-normal tracking-normal text-[var(--panel-rail-text)]">
            Center Quest
          </span>
        </h1>

        <div className="mt-7 rounded-[4px] border border-[var(--panel-rail-border)] bg-[var(--panel-rail-raised)] p-6">
          <LoginForm action={loginAdmin} />
        </div>

        {/* No hay registro público (AD-1): las cuentas se crean por consola con
            prisma/create-admin.ts. Decirlo evita que alguien busque el enlace. */}
        <p className="mt-5 text-center text-[0.8rem] leading-relaxed text-[var(--panel-rail-text)]">
          El acceso se otorga internamente. No hay registro abierto.
        </p>
      </div>
    </div>
  );
}
