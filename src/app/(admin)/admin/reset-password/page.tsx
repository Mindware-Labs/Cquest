import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "@/components/admin/AuthShell";
import { getSession } from "@/lib/auth-guard";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "Recuperar acceso · Panel Center Quest",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; paso?: string }>;
}) {
  if (await getSession()) redirect("/admin");
  const { email, paso } = await searchParams;

  return (
    <AuthShell
      thesis="Only you open your account."
      lead="The code arrives in your inbox and you type it right here. Passwords are stored encrypted: nobody at Center Quest can read them or recover them."
    >
      <ResetPasswordForm initialEmail={email} startAtCode={Boolean(email) && paso === "codigo"} />
    </AuthShell>
  );
}
