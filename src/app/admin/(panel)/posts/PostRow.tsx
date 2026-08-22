"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import type { PostActionState } from "@/lib/posts";
import { ConfirmSubmit, SubmitButton } from "@/components/admin/ui/Buttons";
import { IconExternal, IconEye, IconEyeOff, IconPencil } from "@/components/admin/ui/icons";
import { Alert, StatusBadge } from "@/components/admin/ui/Surface";

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
};

export default function PostRow({
  post,
  setStatusAction,
  deleteAction,
}: {
  post: PostRowData;
  setStatusAction: Action;
  deleteAction: Action;
}) {
  const [statusState, statusFormAction] = useActionState(setStatusAction, { error: null });
  const [deleteState, deleteFormAction] = useActionState(deleteAction, { error: null });

  /* Publicado ↔ oculto es el interruptor de visibilidad. Un borrador que nunca
     se publicó no se "oculta": se publica. */
  const isPublished = post.status === "PUBLISHED";
  const nextStatus = isPublished ? "HIDDEN" : "PUBLISHED";
  const toggleLabel = isPublished ? "Ocultar" : "Publicar";
  const error = statusState.error ?? deleteState.error;

  return (
    <>
      <tr className="cq-row">
        <td>
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-[6px] bg-[var(--surface-sunken)] ring-1 ring-border">
              <Image
                src={post.coverImageUrl}
                alt={post.coverImageAlt}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              {/* El título completo, no truncado a mitad de palabra: en una lista
                  de artículos el título ES el identificador. */}
              <Link
                href={`/admin/posts/${post.id}/edit`}
                className="cq-row-title text-[0.9rem] leading-snug font-semibold text-foreground hover:underline"
              >
                {post.title}
              </Link>
              <p className="mt-0.5 truncate font-mono text-[0.72rem] text-[var(--text-tertiary)]">
                /{post.slug}
              </p>
              {/* En pantallas chicas las columnas de contexto no caben; en vez de
                  obligar a un scroll horizontal, bajan acá como una sola línea. */}
              <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[0.72rem] text-[var(--text-tertiary)] md:hidden">
                <span>{post.categoryName}</span>
                <span aria-hidden="true">·</span>
                <span className="uppercase">{post.locale}</span>
                <span aria-hidden="true">·</span>
                <span>Editado {post.updatedAt}</span>
              </p>
            </div>
          </div>
        </td>

        <td className="hidden md:table-cell">
          <span className="inline-flex items-center rounded-full bg-[var(--surface-sunken)] px-2.5 py-1 text-[0.75rem] whitespace-nowrap text-[var(--text-secondary)] ring-1 ring-border">
            {post.categoryName}
          </span>
        </td>

        <td className="hidden text-[0.75rem] font-semibold tracking-[0.06em] uppercase md:table-cell">
          {post.locale}
        </td>

        <td>
          <StatusBadge status={post.status} />
        </td>

        <td className="hidden whitespace-nowrap tabular-nums lg:table-cell">{post.updatedAt}</td>

        <td>
          <div className="cq-row-actions flex items-center justify-end gap-1.5">
            {isPublished && (
              <Link
                href={`/${post.locale}/blog/${post.slug}`}
                target="_blank"
                rel="noreferrer"
                className="cq-btn"
                data-variant="quiet"
                data-size="icon"
                title="Abrir en el blog público"
                aria-label={`Abrir «${post.title}» en el blog público`}
              >
                <IconExternal size={15} />
              </Link>
            )}

            <Link
              href={`/admin/posts/${post.id}/edit`}
              className="cq-btn"
              data-variant="ghost"
              data-size="icon"
              title="Editar"
              aria-label={`Editar «${post.title}»`}
            >
              <IconPencil size={15} />
            </Link>

            <form action={statusFormAction}>
              <input type="hidden" name="id" value={post.id} />
              <input type="hidden" name="status" value={nextStatus} />
              <SubmitButton
                variant="ghost"
                size="sm"
                pendingLabel="Guardando…"
                icon={isPublished ? <IconEyeOff size={14} /> : <IconEye size={14} />}
              >
                {toggleLabel}
              </SubmitButton>
            </form>

            <form action={deleteFormAction}>
              <input type="hidden" name="id" value={post.id} />
              <ConfirmSubmit
                confirmLabel="Confirmar"
                pendingLabel="Eliminando…"
                title={`Eliminar «${post.title}»`}
              >
                Eliminar
              </ConfirmSubmit>
            </form>
          </div>
        </td>
      </tr>

      {error && (
        <tr>
          {/* El error va en su propia fila y no en un tooltip: queda pegado a la
              fila que falló y no desaparece al mover el mouse. */}
          <td colSpan={6} className="pt-0">
            <Alert>{error}</Alert>
          </td>
        </tr>
      )}
    </>
  );
}
