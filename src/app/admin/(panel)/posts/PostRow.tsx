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
  IconImage,
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
  /* El estado VISIBLE: cuatro valores, porque "Programado" es un publicado con
     fecha futura y la columna de estado promete decir si el artículo se ve. */
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "HIDDEN";
  /* El de la base, que sigue teniendo tres. Es el que decide qué hace el
     interruptor de publicar/ocultar: ese escribe en `status`, no en la fecha. */
  rawStatus: "DRAFT" | "PUBLISHED" | "HIDDEN";
  publishedAt: string | null;
  locale: string;
  categoryName: string;
  updatedAt: string;
  /* La misma marca sin formatear. La de arriba es para leer; ésta viaja de
     vuelta al servidor como guarda de concurrencia, y para eso tiene que ser el
     valor exacto y no "23/08/2026, 14:05". */
  updatedAtIso: string;
  updatedByName: string | null;
  /* Sólo para lo que todavía no es público. Un artículo publicado ya tiene su
     enlace normal al blog. */
  previewHref: string | null;
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
     se publicó no se "oculta": se publica.

     Se mira `rawStatus` y no el estado visible: un artículo PROGRAMADO está
     publicado en la base, así que su interruptor tiene que ofrecer "Ocultar" —
     que es exactamente cómo se cancela una programación sin borrar nada. Con el
     estado visible, el botón habría dicho "Publicar" sobre algo ya publicado. */
  const isPublished = post.rawStatus === "PUBLISHED";
  const nextStatus = isPublished ? "HIDDEN" : "PUBLISHED";
  const toggleLabel = isPublished ? "Ocultar" : "Publicar";
  /* Enlace al blog público sólo si de verdad se ve ahí. Para lo demás está el
     de previsualización. */
  const isLive = post.status === "PUBLISHED";
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
              undo.set("status", post.rawStatus);
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
            {/* La miniatura acepta que NO haya portada. Un artículo creado
                desde el cajón de alta nace sin ella —se sube en el editor— y
                `next/image` con `src=""` no dibuja un hueco: rompe el render de
                la tabla entera. Acá el vacío es un estado dibujado, y de paso
                se lee de un vistazo a qué borrador le falta la portada. */}
            <div className="relative h-8 w-11 shrink-0 overflow-hidden rounded-[var(--p-radius-xs)] bg-[var(--p-surface-sunken)]">
              {post.coverImageUrl ? (
                <Image
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt}
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <span
                  className="grid h-full w-full place-items-center text-[var(--p-line-strong)]"
                  title="Sin portada"
                >
                  <IconImage size={14} aria-hidden="true" />
                  <span className="sr-only">Sin portada</span>
                </span>
              )}
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

        <td className="whitespace-nowrap">
          <StatusBadge status={post.status} />
          {/* La fecha, sólo cuando el estado NO se explica solo. Un programado
              sin decir para cuándo es una promesa sin plazo, y ese es justo el
              dato que se viene a mirar. En un publicado la fecha ya está en el
              blog; repetirla acá sería una columna más de ruido. */}
          {post.status === "SCHEDULED" && post.publishedAt && (
            <span className="cq-meta mt-0.5 block">{post.publishedAt}</span>
          )}
        </td>

        <td className="whitespace-nowrap">
          <Ident>{post.updatedAt}</Ident>
          {post.updatedByName && <span className="cq-meta mt-0.5 block">{post.updatedByName}</span>}
        </td>

        <td>
          <div className="cq-row-actions flex items-center justify-end gap-1">
            {isLive ? (
              <IconLinkButton
                href={`/${post.locale}/blog/${post.slug}`}
                target="_blank"
                rel="noreferrer"
                label={`Abrir «${post.title}» en el blog público`}
                size="sm"
                icon={<IconExternal size={14} />}
              />
            ) : (
              /* Previsualización de lo que todavía no es público.
                 -----------------------------------------------------------
                 Faltaba, y la alternativa real que quedaba era publicar,
                 mandar el enlace y esconderlo después — o sea sacar a la web
                 algo que nadie revisó. El enlace lleva un token firmado que
                 sólo levanta el filtro de ESTE artículo, vence en una semana y
                 se sirve con `noindex`, así que compartirlo no lo indexa.
                 Se abre en otra pestaña para no perder el lugar en la tabla. */
              post.previewHref && (
                <IconLinkButton
                  href={post.previewHref}
                  target="_blank"
                  rel="noreferrer"
                  label={`Previsualizar «${post.title}» sin publicarlo`}
                  size="sm"
                  icon={<IconEye size={14} />}
                />
              )
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
