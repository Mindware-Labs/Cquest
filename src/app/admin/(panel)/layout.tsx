import Link from "next/link";
import { logoutAdmin, requireAdminSession } from "@/lib/adminAuth";
import AdminNav from "./AdminNav";

/* Grupo de rutas `(panel)`: agrupa todo lo que exige sesión sin aparecer en la
   URL. El login queda deliberadamente afuera — si estuviera adentro, el guard
   lo redirigiría a sí mismo en bucle. */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[80rem] flex-col px-5 py-8 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <Link
            href="/admin"
            className="font-heading text-[1.15rem] font-semibold tracking-[-0.02em] text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
          >
            Center Quest · Panel
          </Link>
          <p className="mt-0.5 text-[0.8rem] text-[var(--text-tertiary)]">
            {session.user?.name ?? session.user?.email}
          </p>
        </div>

        <form action={logoutAdmin}>
          <button
            type="submit"
            className="rounded-md border border-border px-3.5 py-2 text-[0.82rem] font-semibold text-[var(--text-secondary)] transition-colors hover:border-petroleo hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo"
          >
            Cerrar sesión
          </button>
        </form>
      </header>

      <AdminNav />

      <main className="flex-1 pb-16">{children}</main>
    </div>
  );
}
