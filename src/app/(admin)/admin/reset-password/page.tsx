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
      thesis="Solo tú abres tu cuenta."
      lead="El código llega a tu correo y se escribe aquí mismo. Las contraseñas se guardan cifradas: nadie en Center Quest puede verlas ni recuperarlas."
    >
      <ResetPasswordForm initialEmail={email} startAtCode={Boolean(email) && paso === "codigo"} />
    </AuthShell>
  );
}
