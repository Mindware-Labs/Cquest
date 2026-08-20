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

  return (
    <li className="cq-row flex flex-wrap items-center gap-x-4 gap-y-3 border-b border-border px-5 py-4 last:border-b-0">
      <div className="relative h-14 w-[5.25rem] shrink-0 overflow-hidden rounded-[2px] bg-[var(--surface-sunken)] ring-1 ring-border">
        <Image
          src={post.coverImageUrl}
          alt={post.coverImageAlt}
          fill
          sizes="84px"
          className="object-cover"
        />
      </div>

      <div className="min-w-[13rem] flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={post.status} />
          <p className="text-[0.98rem] leading-snug font-semibold text-foreground">{post.title}</p>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.78rem] text-[var(--text-tertiary)]">
          <span>{post.categoryName}</span>
          <span aria-hidden="true">·</span>
          <span className="uppercase">{post.locale}</span>
          <span aria-hidden="true">·</span>
          <span>Editado {post.updatedAt}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {isPublished && (
          <Link
            href={`/${post.locale}/blog/${post.slug}`}
            target="_blank"
            rel="noreferrer"
            className="cq-btn"
            data-variant="quiet"
            data-size="sm"
            title="Abrir en el blog público"
          >
            <IconExternal size={14} />
            Ver
          </Link>
        )}

        <Link
          href={`/admin/posts/${post.id}/edit`}
          className="cq-btn"
          data-variant="ghost"
          data-size="sm"
        >
          <IconPencil size={14} />
          Editar
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
          <ConfirmSubmit confirmLabel="Confirmar" pendingLabel="Eliminando…">
            Eliminar
          </ConfirmSubmit>
        </form>
      </div>

      {(statusState.error || deleteState.error) && (
        <div className="w-full">
          <Alert>{statusState.error ?? deleteState.error}</Alert>
        </div>
      )}
    </li>
  );
}
