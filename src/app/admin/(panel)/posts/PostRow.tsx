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
  // Estado VISIBLE: "Programado" es un publicado con fecha futura, y la columna promete decir si el artículo se ve.
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED" | "HIDDEN";
  // El de la base (tres valores): decide qué hace el interruptor de publicar/ocultar, que escribe acá y no en la fecha.
  rawStatus: "DRAFT" | "PUBLISHED" | "HIDDEN";
  publishedAt: string | null;
  locale: string;
  categoryName: string;
  updatedAt: string;
  // Misma marca sin formatear: viaja de vuelta al servidor como guarda de concurrencia, por eso tiene que ser el valor exacto.
  updatedAtIso: string;
  updatedByName: string | null;
  // Sólo para lo que todavía no es público; lo publicado ya tiene su enlace normal al blog.
  previewHref: string | null;
  // Campos que la consulta de la tabla ya trae: pedirlos de nuevo al abrir el cajón sería un viaje al servidor para datos que están en memoria.
  categoryId: number;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
};

export default function PostRow({
  post,
  setStatusAction,
  deleteAction,
  // La fila sólo avisa; el cajón lo monta la TABLA: un <dialog> es marcado inválido dentro de un <tbody>.
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

  // Se mira `rawStatus` y no el visible: un PROGRAMADO ya está publicado en la base, así que el interruptor ofrece "Ocultar" para cancelar la programación sin borrar nada.
  const isPublished = post.rawStatus === "PUBLISHED";
  const nextStatus = isPublished ? "HIDDEN" : "PUBLISHED";
  const toggleLabel = isPublished ? "Ocultar" : "Publicar";
  // Enlace al blog público sólo si de verdad se ve ahí; para lo demás está el de previsualización.
  const isLive = post.status === "PUBLISHED";
  const error = statusError ?? deleteError;

  // Sin diálogo a propósito: la tabla necesita publicar/ocultar varios seguidos rápido, así que el deshacer hace de red en vez de un modal por fila. El cambio se aplica YA porque es reversible por definición.
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

  // Mientras corre la ventana de deshacer, la fila sale de la tabla.
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
              // Título del artículo en el nombre accesible: "seleccionar fila 3" no le sirve a nadie que no esté viendo la tabla.
              aria-label={`Seleccionar «${post.title}»`}
            />
            <IconCheck size={11} className="cq-check-mark" aria-hidden="true" />
          </span>
        </td>

        <td className="cq-ledger-n align-middle" aria-hidden="true" />

        <td>
          <div className="flex items-center gap-2.5">
            {/* La miniatura acepta que NO haya portada: `next/image` con `src=""` rompe el render de la tabla entera, así que el vacío es un estado dibujado. */}
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
            {/* Sólo el título: el slug ya no va debajo, el enlace al blog público está en las acciones de la fila que es donde de verdad se necesita. */}
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
          {/* La fecha sólo cuando el estado no se explica solo: un programado sin decir para cuándo es una promesa sin plazo. */}
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
              // Enlace con token firmado que sólo levanta el filtro de ESTE artículo, vence en una semana y se sirve con `noindex`: compartirlo no lo indexa.
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

            {/* El lápiz abre el cajón de ficha en vez de navegar al editor: la mayoría de las ediciones no necesitan cargar el editor de bloques entero. */}
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
          {/* Fila propia y no un globo: queda pegado a la fila que falló y no desaparece al mover el mouse. */}
          <td colSpan={8} className="pt-0">
            <Alert>{error}</Alert>
          </td>
        </tr>
      )}

    </>
  );
}
