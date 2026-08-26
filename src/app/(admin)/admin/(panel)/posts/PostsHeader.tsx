"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import InfoHint from "@/components/admin/InfoHint";
import { useToast } from "@/components/admin/Toaster";
import { createPost } from "@/server/posts";
import styles from "./page.module.css";

/* Crear abre el editor directo: pedir un título en un modal antes de escribir
   es un paso que no aporta nada, el borrador ya nace con uno provisional. */
export default function PostsHeader() {
  const router = useRouter();
  const toast = useToast();
  const [creating, start] = useTransition();

  function handleCreate() {
    start(async () => {
      const result = await createPost();
      if (!result.ok) {
        toast.error("No se pudo crear el artículo", result.message);
        return;
      }
      router.push(`/admin/posts/${result.data!.id}`);
    });
  }

  return (
    <div className={styles.head}>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>Artículos</h1>
        <InfoHint label="Cómo funciona la publicación">
          El borrador se guarda sin exigir nada. Para publicar hacen falta portada con texto
          alternativo, extracto y categoría, porque la página pública los necesita para no salir
          rota. La URL se fija al publicar y ya no cambia.
        </InfoHint>
      </div>

      <button className={styles.primary} type="button" onClick={handleCreate} disabled={creating}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
          <path d="M8 3.4v9.2M3.4 8h9.2" strokeLinecap="round" />
        </svg>
        {creating ? "Creando" : "Nuevo artículo"}
      </button>
    </div>
  );
}
