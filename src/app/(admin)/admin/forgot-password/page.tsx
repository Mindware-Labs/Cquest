import { redirect } from "next/navigation";

// El flujo entero vive en /admin/reset-password; esta ruta solo sostiene enlaces viejos.
export default function ForgotPasswordPage() {
  redirect("/admin/reset-password");
}
