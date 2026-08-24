"use client";

import { useState } from "react";
import type { PostActionState } from "@/lib/posts";
import { IconButton } from "@/components/admin/ui/Button";
import { IconPencil } from "@/components/admin/ui/icons";
import PostMetaDrawer, { type PostMeta } from "./PostMetaDrawer";

// El cajón vive junto al botón acá (y no en PostsTable) porque un <dialog> dentro de un <tbody> es marcado inválido; dentro de un <li> es válido y evita que cada lista lleve su propio estado de "qué fila está abierta".
export default function PostQuickEdit({
  post,
  categories,
  action,
  label,
}: {
  post: PostMeta;
  categories: ReadonlyArray<{ id: number; name: string }>;
  action: (state: PostActionState, formData: FormData) => Promise<PostActionState>;
  // El nombre accesible lo pone quien llama: un aria-label genérico repetido en diez filas son diez botones indistinguibles.
  label: string;
}) {
  // No se desmonta al cerrar: si se desmontara en el mismo fotograma, la animación de salida no llegaría a correr. Solo se apaga `open`.
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);

  return (
    <>
      <IconButton
        label={label}
        size="sm"
        icon={<IconPencil size={14} />}
        onClick={() => {
          setTouched(true);
          setOpen(true);
        }}
      />

      {/* No se monta hasta el primer clic: un tablero con veinte pendientes no tiene por qué construir veinte formularios completos para que se abra uno. */}
      {touched && (
        <PostMetaDrawer
          open={open}
          onClose={() => setOpen(false)}
          post={post}
          categories={categories}
          action={action}
        />
      )}
    </>
  );
}
