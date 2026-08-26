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
        toast.error("Could not create the article", result.message);
        return;
      }
      router.push(`/admin/posts/${result.data!.id}`);
    });
  }

  return (
    <div className={styles.head}>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>Articles</h1>
        <InfoHint label="How publishing works">
          A draft saves with nothing filled in. Publishing needs an excerpt and a category —
          plus alt text if there is a cover — because the public page needs them to render
          properly. The URL is set when you publish and never changes after that.
        </InfoHint>
      </div>

      <button className={styles.primary} type="button" onClick={handleCreate} disabled={creating}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
          <path d="M8 3.4v9.2M3.4 8h9.2" strokeLinecap="round" />
        </svg>
        {creating ? "Creating" : "New article"}
      </button>
    </div>
  );
}
