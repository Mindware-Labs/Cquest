"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import styles from "./page.module.css";

export default function SignOutButton() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  async function handleSignOut() {
    if (leaving) return;
    setLeaving(true);
    await authClient.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button className={styles.signOut} type="button" onClick={handleSignOut} disabled={leaving}>
      {leaving ? "Cerrando" : "Cerrar sesión"}
    </button>
  );
}
