import { Suspense } from "react";
import PanelIdentity, { PanelIdentityFallback } from "@/components/admin/PanelIdentity";
import PanelRail from "@/components/admin/PanelRail";
import ToastProvider from "@/components/admin/Toaster";
import { RAIL_BOOT_SCRIPT } from "@/components/admin/railState";
import styles from "./layout.module.css";

/* El layout no espera la sesión: la lee PanelIdentity dentro de su propio
   Suspense y cada página la vuelve a exigir en sus consultas (requireAdmin).
   Si el layout la esperara, loading.tsx no podría mostrarse al entrar. */
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const identity = (
    <Suspense fallback={<PanelIdentityFallback />}>
      <PanelIdentity />
    </Suspense>
  );

  return (
    <>
      {/* Antes del rail: restaura el rail colapsado sin que parpadee abierto. */}
      <script dangerouslySetInnerHTML={{ __html: RAIL_BOOT_SCRIPT }} />
      <ToastProvider>
        <div className={styles.shell}>
          <PanelRail identity={identity} />
          <main className={styles.content}>{children}</main>
        </div>
      </ToastProvider>
    </>
  );
}
