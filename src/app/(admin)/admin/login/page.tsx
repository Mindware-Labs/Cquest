import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "@/components/admin/AuthShell";
import { getSession } from "@/lib/auth-guard";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión · Panel Center Quest",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  /* Con sesión viva, el login no tiene nada que hacer. */
  if (await getSession()) redirect("/admin");

  return (
    <AuthShell
      thesis="La operación no se detiene."
      lead="Panel interno de Center Quest. Las cuentas se crean desde dentro: si no tienes acceso, pídeselo a un administrador."
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
