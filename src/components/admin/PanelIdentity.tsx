import { requireAdmin } from "@/lib/auth-guard";
import styles from "./PanelRail.module.css";

function initials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?").concat(parts[1]?.[0] ?? "").toUpperCase();
}

/* Lo único del rail que necesita la sesión: va en su propio Suspense para que
   el resto del panel no espere a la cookie. */
export default async function PanelIdentity() {
  const session = await requireAdmin();
  const name = session.user.name ?? "";
  const email = session.user.email;

  return (
    <>
      <span className={styles.avatar} aria-hidden="true">
        {initials(name, email)}
      </span>
      <span className={styles.identity}>
        <span className={styles.name}>{name || "No name"}</span>
        <span className={styles.email}>{email}</span>
      </span>
    </>
  );
}

export function PanelIdentityFallback() {
  return (
    <>
      <span className={styles.avatar} aria-hidden="true" />
      <span className={styles.identity} aria-hidden="true">
        <span className={styles.identityBone} />
        <span className={styles.identityBone} />
      </span>
    </>
  );
}
