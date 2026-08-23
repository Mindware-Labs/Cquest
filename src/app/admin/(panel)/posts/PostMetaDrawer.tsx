"use client";

import Link from "next/link";
import { useRef, useState, useTransition, type FormEvent } from "react";
import type { PostActionState } from "@/lib/posts";
import { Button } from "@/components/admin/ui/Button";
import { Drawer, DrawerSection } from "@/components/admin/ui/Drawer";
import { Input, Select, Textarea } from "@/components/admin/ui/Field";
import { StatusBadge } from "@/components/admin/ui/Surface";
import { IconArrowRight } from "@/components/admin/ui/icons";
import { useToast } from "@/components/admin/ui/Toast";

/* Edición rápida de la FICHA de un artículo, desde la tabla.

   Corregir una tilde del título obligaba a abrir el editor de bloques entero
   —lienzo, paleta, propiedades y previa— esperar a que cargue, cambiar una
   letra, guardar y volver. Para el trabajo diario de una redacción eso es el
   noventa por ciento de las ediciones pasando por el diez por ciento de la
   herramienta.

   Lo que este cajón NO hace, y es lo que lo mantiene seguro:

   - No toca los bloques. Ni los lee ni los reenvía. Por eso `updatePostMeta`
     tiene su propio esquema en vez de reusar el del editor: si el formulario
     mandara `content`, dos pestañas abiertas terminarían con la que guarda
     segunda pisando el trabajo de la primera.
   - No toca el estado. Publicar, ocultar y volver a borrador ya viven en la
     propia fila con `setPostStatus`, y tener dos caminos de escritura para el
     mismo campo es como se desincronizan. Acá el estado se MUESTRA, para saber
     qué se está editando, y se cambia donde siempre.
   - No toca la portada. Subir una imagen necesita el editor.

   Para todo lo demás está el enlace al editor, dentro del propio cajón. */

type Action = (state: PostActionState, formData: FormData) => Promise<PostActionState>;

export type PostMeta = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  categoryId: number;
  locale: string;
  seoTitle: string;
  seoDescription: string;
  status: string;
};

export default function PostMetaDrawer({
  post,
  categories,
  action,
  open,
  onClose,
}: {
  post: PostMeta;
  categories: ReadonlyArray<{ id: number; name: string }>;
  action: Action;
  open: boolean;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { notify } = useToast();

  /* El envío se maneja a mano en vez de con `useActionState` + un efecto que
     mire el resultado: así el cajón se cierra únicamente cuando el guardado
     funcionó, y si falla se queda abierto con lo escrito. Cerrar y perder lo
     tipeado es la forma más rápida de que alguien abandone el formulario. Es la
     misma decisión que toma el cajón de categorías. */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await action({ error: null }, formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      setError(null);
      onClose();
      notify({ message: "Ficha actualizada.", tone: "success" });
    });
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Editar ficha"
      description="Los bloques del artículo se editan en el editor."
      /* `lg`: son ocho campos, y dos de ellos son áreas de texto de varias
         líneas. A 26rem el extracto entra en una caja de tres renglones y no se
         puede juzgar lo que se escribió. */
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          {/* El botón vive en el pie pero envía el formulario del cuerpo: los
              une el atributo `form`, que es lo que permite tener el control de
              guardar siempre a la vista aunque haya que desplazarse. */}
          <Button type="submit" form="post-meta" variant="solid" disabled={isPending}>
            {isPending ? "Guardando…" : "Guardar cambios"}
          </Button>
        </>
      }
    >
      <form id="post-meta" ref={formRef} onSubmit={handleSubmit}>
        <input type="hidden" name="id" value={post.id} />

        {/* El estado, de sólo lectura y arriba de todo: es el contexto de lo que
            se está por editar —no es lo mismo corregir el título de un borrador
            que el de algo que ya está publicado y cacheado— pero se cambia desde
            la fila, que es donde esa acción ya vivía. */}
        <p className="mb-4 flex items-center gap-2">
          <StatusBadge status={post.status} />
        </p>

        <DrawerSection title="Identificación" divided={false}>
          <div className="grid gap-4">
            <Input
              id="meta-title"
              name="title"
              label="Título"
              required
              maxLength={120}
              defaultValue={post.title}
              /* El primer campo toma el foco al abrir. Sin esto el foco arranca
                 en el cajón y hay que tabular hasta acá. */
              autoFocus
              error={error ?? undefined}
            />
            <Input
              id="meta-slug"
              name="slug"
              label="Identificador de URL"
              defaultValue={post.slug}
              hint="Cambiarlo rompe los enlaces que ya apunten al artículo publicado."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                id="meta-category"
                name="categoryId"
                label="Categoría"
                defaultValue={String(post.categoryId)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <Select id="meta-locale" name="locale" label="Idioma" defaultValue={post.locale}>
                <option value="es">Español</option>
                <option value="en">Inglés</option>
              </Select>
            </div>
          </div>
        </DrawerSection>

        <DrawerSection
          title="Buscadores y listado"
          description="Con los campos de buscador vacíos se usan el título y el extracto."
        >
          <div className="grid gap-4">
            <Textarea
              id="meta-excerpt"
              name="excerpt"
              label="Extracto"
              required
              rows={3}
              maxLength={300}
              defaultValue={post.excerpt}
              hint="Es el resumen que se ve en el listado del blog."
            />
            <Input
              id="meta-seo-title"
              name="seoTitle"
              label="Título para buscadores"
              maxLength={70}
              defaultValue={post.seoTitle}
            />
            <Textarea
              id="meta-seo-description"
              name="seoDescription"
              label="Descripción para buscadores"
              rows={2}
              maxLength={160}
              defaultValue={post.seoDescription}
            />
          </div>
        </DrawerSection>

        <DrawerSection title="Contenido">
          <p className="cq-meta">
            Los bloques, la portada y el estado de publicación se editan en el editor completo.
          </p>
          {/* Enlace y no botón: lleva a otra pantalla, así que se puede abrir en
              una pestaña nueva y el botón de atrás hace lo que se espera. */}
          <Link
            href={`/admin/posts/${post.id}/edit`}
            className="cq-link cq-body mt-2 inline-flex items-center gap-2"
          >
            Editar contenido
            <IconArrowRight size={14} aria-hidden="true" />
          </Link>
        </DrawerSection>
      </form>
    </Drawer>
  );
}
