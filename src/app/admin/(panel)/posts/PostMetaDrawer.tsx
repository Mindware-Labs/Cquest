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

// Edición rápida de la FICHA desde la tabla, sin abrir el editor de bloques. NO toca bloques, estado ni portada — `updatePostMeta` tiene su propio esquema para no pisar el contenido de otra pestaña abierta.

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
  // Guarda de concurrencia: si no coincide con la base al guardar, alguien editó mientras el cajón estaba abierto y el envío se rechaza.
  updatedAtIso: string;
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

  // Envío manual (no `useActionState`) para que el cajón se cierre sólo si el guardado funcionó; si falla, queda abierto con lo escrito.
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
      // `lg`: ocho campos incluyendo dos textareas; a 26rem el extracto no se alcanza a leer en su caja.
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          {/* Botón en el pie, unido al form del cuerpo por el atributo `form`: así queda siempre a la vista aunque haya que desplazarse. */}
          <Button type="submit" form="post-meta" variant="solid" disabled={isPending}>
            {isPending ? "Guardando…" : "Guardar cambios"}
          </Button>
        </>
      }
    >
      <form id="post-meta" ref={formRef} onSubmit={handleSubmit}>
        <input type="hidden" name="id" value={post.id} />
        <input type="hidden" name="expectedUpdatedAt" value={post.updatedAtIso} />

        {/* De sólo lectura: da contexto de lo que se edita, pero el estado se cambia desde la fila, donde esa acción ya vivía. */}
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
              // El primer campo toma el foco al abrir; sin esto hay que tabular hasta acá.
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
          {/* Enlace y no botón: lleva a otra pantalla, así se puede abrir en pestaña nueva y el botón de atrás funciona como se espera. */}
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
