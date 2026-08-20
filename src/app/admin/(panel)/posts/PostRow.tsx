"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { PostActionState } from "@/lib/posts";

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

const STATUS_LABEL: Record<PostRowData["status"], string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  HIDDEN: "Oculto",
};

const STATUS_BADGE: Record<PostRowData["status"], string> = {
  DRAFT: "bg-[var(--surface-sunken)] text-[var(--text-tertiary)]",
  PUBLISHED: "bg-verde/12 text-verde",
  HIDDEN: "bg-gris/40 text-[var(--text-secondary)]",
};

const GHOST_BUTTON =
  "rounded-md border border-border px-3 py-1.5 text-[0.8rem] font-semibold text-[var(--text-secondary)] transition-colors hover:border-petroleo hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo disabled:cursor-not-allowed disabled:opacity-40";

function PendingButton({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : label}
    </button>
  );
}

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
  const nextStatus = post.status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED";
  const toggleLabel = post.status === "PUBLISHED" ? "Ocultar" : "Publicar";

  return (
    <li className="flex flex-wrap items-center gap-4 border-b border-border py-4 last:border-b-0">
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-[var(--surface-sunken)]">
        <Image
          src={post.coverImageUrl}
          alt={post.coverImageAlt}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      <div className="min-w-[12rem] flex-1">
        <p className="text-[0.95rem] font-semibold leading-snug text-foreground">{post.title}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.76rem] text-[var(--text-tertiary)]">
          <span
            className={`rounded-full px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] ${STATUS_BADGE[post.status]}`}
          >
            {STATUS_LABEL[post.status]}
          </span>
          <span>{post.categoryName}</span>
          <span className="uppercase">{post.locale}</span>
          <span>Editado {post.updatedAt}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/admin/posts/${post.id}/edit`} className={GHOST_BUTTON}>
          Editar
        </Link>

        <form action={statusFormAction}>
          <input type="hidden" name="id" value={post.id} />
          <input type="hidden" name="status" value={nextStatus} />
          <PendingButton label={toggleLabel} pendingLabel="Guardando…" className={GHOST_BUTTON} />
        </form>

        <form
          action={deleteFormAction}
          onSubmit={(event) => {
            if (!confirm(`¿Eliminar "${post.title}"? Esta acción no se puede deshacer.`)) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={post.id} />
          <PendingButton
            label="Eliminar"
            pendingLabel="Eliminando…"
            className="rounded-md border border-border px-3 py-1.5 text-[0.8rem] font-semibold text-red-700 transition-colors hover:border-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-40"
          />
        </form>
      </div>

      {(statusState.error || deleteState.error) && (
        <p role="alert" className="w-full text-[0.82rem] text-red-700">
          {statusState.error ?? deleteState.error}
        </p>
      )}
    </li>
  );
}
