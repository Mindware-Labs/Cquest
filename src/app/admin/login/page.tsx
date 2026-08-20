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
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-[24rem]">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-petroleo">
          Center Quest
        </p>
        <h1 className="mt-2 font-heading text-[1.7rem] font-semibold leading-tight tracking-[-0.02em] text-foreground">
          Panel
        </h1>

        <div className="mt-7 rounded-xl border border-border bg-[var(--surface-raised)] p-7">
          <LoginForm action={loginAdmin} />
        </div>

        {/* No hay registro público (AD-1): las cuentas se crean por consola con
            prisma/create-admin.ts. Decirlo evita que alguien busque el enlace. */}
        <p className="mt-5 text-center text-[0.8rem] leading-relaxed text-[var(--text-tertiary)]">
          El acceso al panel se otorga internamente. No hay registro abierto.
        </p>
      </div>
    </div>
  );
}
