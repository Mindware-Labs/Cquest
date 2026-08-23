"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition, type CSSProperties } from "react";
import type { PostActionState } from "@/lib/posts";
import { Button, IconButton, IconLinkButton } from "@/components/admin/ui/Button";
import { DeleteAction } from "@/components/admin/ui/DeleteAction";
import {
  IconCheck,
  IconExternal,
  IconEye,
  IconEyeOff,
  IconPencil,
  IconSpinner,
} from "@/components/admin/ui/icons";
import { Alert, Ident, StatusBadge } from "@/components/admin/ui/Surface";
import { useToast } from "@/components/admin/ui/Toast";

type Action = (state: PostActionState, formData: FormData) => Promise<PostActionState>;

export type PostRowData = {
  id: number;
  title: string;
  slug: string;
  coverImageUrl: string;
  coverImageAlt: string;
  status: "DRAFT" | "PUBLISHED" | "HIDDEN";
  locale: string;
  categoryName: string;
  updatedAt: string;
  /* La ficha que edita el cajón. Viaja con la fila y no se pide aparte al
     abrirlo: son campos que la consulta de la tabla ya trae, así que buscarlos
     de nuevo sería un viaje al servidor para datos que están en memoria. */
  categoryId: number;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
};

export default function PostRow({
  post,
  setStatusAction,
  deleteAction,
  /* Abrir el cajón de ficha. La fila avisa; el cajón lo monta la TABLA.

     Un <dialog> es marcado inválido dentro de un <tbody>, así que no puede
     vivir acá aunque el estado de "qué fila se está editando" parezca de la
     fila. Y de paso hay UNA instancia del formulario para toda la tabla en vez
     de una por fila. */
  onEdit,
  index = 0,
  selected = false,
  onSelectedChange,
}: {
  post: PostRowData;
  setStatusAction: Action;
  deleteAction: Action;
  onEdit?: () => void;
  index?: number;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
}) {
  const [removed, setRemoved] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [switching, startSwitch] = useTransition();
  const { notify } = useToast();

  /* Publicado ↔ oculto es el interruptor de visibilidad. Un borrador que nunca
     se publicó no se "oculta": se publica. */
  const isPublished = post.status === "PUBLISHED";
  const nextStatus = isPublished ? "HIDDEN" : "PUBLISHED";
  const toggleLabel = isPublished ? "Ocultar" : "Publicar";
  const error = statusError ?? deleteError;

  /* Publicar desde la fila sigue siendo UN clic, pero ahora deja deshacerlo.

     El panel protegía lo reversible —borrar pedía diálogo y daba cinco
     segundos— y dejaba abierto lo que sale a producción: este botón mandaba un
     artículo a la web sin confirmación ni vuelta atrás.

     Acá no va un diálogo, y es a propósito. Este control existe para operar la
     tabla rápido: sí o sí publicar y esconder de a varios seguidos, y un modal
     por fila convierte eso en un trámite. El diálogo se reserva para el editor,
     donde publicar cierra un trabajo largo. En la tabla, la red es el deshacer,
     que es exactamente el idioma que el panel ya usa para borrar.

     Y a diferencia del borrado, el cambio se aplica YA: publicar es reversible
     por definición —el botón que lo revierte es el mismo—, así que no hay razón
     para retener la llamada cinco segundos. */
  function toggleStatus() {
    startSwitch(async () => {
      const formData = new FormData();
      formData.set("id", String(post.id));
      formData.set("status", nextStatus);
      const result = await setStatusAction({ error: null }, formData);
      setStatusError(result.error);
      if (result.error) return;

      notify({
        message: isPublished
          ? `«${post.title}» ya no se ve en el blog.`
          : `«${post.title}» está publicado.`,
        tone: "success",
        action: {
          label: "Deshacer",
          onClick: () => {
            startSwitch(async () => {
              const undo = new FormData();
              undo.set("id", String(post.id));
              undo.set("status", post.status);
              const back = await setStatusAction({ error: null }, undo);
              setStatusError(back.error);
            });
          },
        },
      });
    });
  }

  /* Mientras corre la ventana de deshacer, la fila sale de la tabla. */
  if (removed) return null;

  return (
    <>
      <tr
        className="cq-row cq-enter"
        data-selected={selected ? "true" : undefined}
        style={{ "--cq-i": index } as CSSProperties}
      >
        <td>
          <span className="relative inline-flex size-4 items-center justify-center">
            <input
              type="checkbox"
              className="cq-check"
              checked={selected}
              onChange={(event) => onSelectedChange?.(event.target.checked)}
              /* El título del artículo en el nombre accesible: "seleccionar
                 fila 3" no le sirve a nadie que no esté viendo la tabla. */
              aria-label={`Seleccionar «${post.title}»`}
            />
            <IconCheck size={11} className="cq-check-mark" aria-hidden="true" />
          </span>
        </td>

        <td className="cq-ledger-n align-middle" aria-hidden="true" />

        <td>
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-11 shrink-0 overflow-hidden rounded-[var(--p-radius-xs)] bg-[var(--p-surface-sunken)]">
              <Image
                src={post.coverImageUrl}
                alt={post.coverImageAlt}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
            {/* Sólo el título. Debajo iba el slug en mono con barra adelante,
                como identificador de máquina — pero en una tabla de artículos
                el título ya identifica la fila, y la segunda línea gris de
                texto técnico agregaba altura y ruido a cada una de las
                veinticinco. El artículo publicado tiene su enlace al blog
                público en las acciones de la fila, que es donde de verdad se
                necesita la URL. */}
            <div className="min-w-0">
              <Link
                href={`/admin/posts/${post.id}/edit`}
                className="cq-title block hover:underline"
              >
                {post.title}
              </Link>
            </div>
          </div>
        </td>

        <td>
          <span className="cq-body whitespace-nowrap text-[var(--p-ink)]">{post.categoryName}</span>
        </td>

        <td>
          <Ident chip>{post.locale.toUpperCase()}</Ident>
        </td>

        <td>
          <StatusBadge status={post.status} />
        </td>

        <td className="whitespace-nowrap">
          <Ident>{post.updatedAt}</Ident>
        </td>

        <td>
          <div className="cq-row-actions flex items-center justify-end gap-1">
            {isPublished && (
              <IconLinkButton
                href={`/${post.locale}/blog/${post.slug}`}
                target="_blank"
                rel="noreferrer"
                label={`Abrir «${post.title}» en el blog público`}
                size="sm"
                icon={<IconExternal size={14} />}
              />
            )}

            {/* El lápiz abre el cajón de ficha en vez de navegar al editor.

                El noventa por ciento de las ediciones de una redacción son una
                tilde del título, un extracto que quedó largo o una categoría
                mal puesta, y todas ellas obligaban a cargar el editor de
                bloques entero y volver. El editor sigue estando a un clic —
                desde adentro del cajón— para lo que de verdad lo necesita. */}
            <IconButton
              label={`Editar la ficha de «${post.title}»`}
              size="sm"
              icon={<IconPencil size={14} />}
              onClick={onEdit}
            />

            <Button
              variant="ghost"
              size="sm"
              disabled={switching}
              onClick={toggleStatus}
              icon={
                switching ? (
                  <IconSpinner size={14} />
                ) : isPublished ? (
                  <IconEyeOff size={14} />
                ) : (
                  <IconEye size={14} />
                )
              }
            >
              {switching ? "Guardando…" : toggleLabel}
            </Button>

            <DeleteAction
              compact
              name={post.title}
              noun="el artículo"
              onOptimisticRemove={(isRemoved) => {
                setRemoved(isRemoved);
                if (isRemoved) setDeleteError(null);
              }}
              action={async () => {
                const formData = new FormData();
                formData.set("id", String(post.id));
                const result = await deleteAction({ error: null }, formData);
                setDeleteError(result.error);
                return result;
              }}
            />
          </div>
        </td>
      </tr>

      {error && (
        <tr>
          {/* El error va en su propia fila y no en un globo: queda pegado a la
              fila que falló y no desaparece al mover el mouse. */}
          <td colSpan={8} className="pt-0">
            <Alert>{error}</Alert>
          </td>
        </tr>
      )}

    </>
  );
}
