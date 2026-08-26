import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "@/components/admin/AuthShell";
import { getSession } from "@/lib/auth-guard";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in · Center Quest Admin",
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
      thesis="The operation never stops."
      lead="Center Quest internal panel. Accounts are created from the inside: if you do not have access, ask an administrator for it."
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
