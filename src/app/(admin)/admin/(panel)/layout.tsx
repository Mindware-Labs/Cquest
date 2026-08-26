import PanelRail from "@/components/admin/PanelRail";
import ToastProvider from "@/components/admin/Toaster";
import { RAIL_BOOT_SCRIPT } from "@/components/admin/railState";
import { requireAdmin } from "@/lib/auth-guard";
import styles from "./layout.module.css";

// Verificación real de sesión: el guard del proxy solo mira que la cookie exista.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <>
      {/* Antes del rail: restaura el rail colapsado sin que parpadee abierto. */}
      <script dangerouslySetInnerHTML={{ __html: RAIL_BOOT_SCRIPT }} />
      <ToastProvider>
        <div className={styles.shell}>
          <PanelRail name={session.user.name ?? ""} email={session.user.email} />
          <main className={styles.content}>{children}</main>
        </div>
      </ToastProvider>
    </>
  );
}
