import type { Metadata } from "next";
import BrandLockup from "@/components/admin/BrandLockup";
import { requireAdmin } from "@/lib/auth-guard";
import SignOutButton from "./SignOutButton";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Panel · Center Quest",
  robots: { index: false, follow: false },
};

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2 6.3 4.6 9 10 3.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

export default async function AdminHomePage() {
  const session = await requireAdmin();
  const firstName = session.user.name?.split(" ")[0] ?? "de nuevo";

  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <BrandLockup />
        <div className={styles.session}>
          <span className={styles.email}>{session.user.email}</span>
          <SignOutButton />
        </div>
      </header>

      <main className={styles.body}>
        <div className={styles.card}>
          <span className={styles.eyebrow}>
            <CheckIcon />
            Sesión iniciada
          </span>
          <h1 className={styles.heading}>Bienvenido, {firstName}</h1>
          <div className={styles.rule} />
          <p className={styles.lead}>
            El acceso quedó verificado. Aquí van a vivir los artículos, las categorías y los
            usuarios del panel; por ahora esta pantalla solo confirma que la sesión está activa.
          </p>
        </div>
      </main>
    </div>
  );
}
