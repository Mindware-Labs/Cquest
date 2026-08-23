"use client";

import { useState } from "react";
import type { PostActionState } from "@/lib/posts";
import { IconButton } from "@/components/admin/ui/Button";
import { IconPencil } from "@/components/admin/ui/icons";
import PostMetaDrawer, { type PostMeta } from "./PostMetaDrawer";

/* El lápiz que abre el cajón de ficha, con su cajón adentro.

   Existe para las listas que NO son la tabla de artículos —hoy el tablero de
   Inicio—, que hasta ahora mandaban al editor de bloques completo con un enlace.
   Desde el tablero eso es especialmente caro: se entra a ver qué falta hacer, se
   ve un borrador con la categoría mal puesta, y arreglarlo costaba cargar el
   editor entero y volver.

   Por qué acá el cajón vive junto al botón y en la tabla vive en `PostsTable`:
   un <dialog> dentro de un <tbody> es marcado inválido, así que ahí tiene que
   subir al nivel de la tabla. Dentro de un <li> —que es el caso del tablero— es
   perfectamente válido, y tenerlo al lado del botón evita que cada lista tenga
   que llevar su propio estado de "qué fila está abierta".

   Las dos rutas comparten `PostMetaDrawer`, así que la ficha se edita igual en
   los dos lugares. */
export default function PostQuickEdit({
  post,
  categories,
  action,
  label,
}: {
  post: PostMeta;
  categories: ReadonlyArray<{ id: number; name: string }>;
  action: (state: PostActionState, formData: FormData) => Promise<PostActionState>;
  /* El nombre accesible lo pone quien llama: en el tablero la fila ya dice
     "Continuar «X»" y en otra lista podría decir otra cosa. Un `aria-label`
     genérico repetido en diez filas son diez botones indistinguibles. */
  label: string;
}) {
  /* El artículo abierto no se borra al cerrar: si se desmontara el cajón en el
     mismo fotograma, la animación de salida no llegaría a correr. Lo único que
     se apaga es `open`. */
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

      {/* No se monta hasta el primer clic: un tablero con veinte pendientes no
          tiene por qué construir veinte formularios completos —con sus campos,
          sus valores y sus <dialog>— para que se abra uno. */}
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
