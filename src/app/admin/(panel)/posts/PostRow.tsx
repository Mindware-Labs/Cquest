"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState, type CSSProperties } from "react";
import type { PostActionState } from "@/lib/posts";
import { SubmitButton } from "@/components/admin/ui/Buttons";
import { IconLinkButton } from "@/components/admin/ui/Button";
import { DeleteAction } from "@/components/admin/ui/DeleteAction";
import {
  IconCheck,
  IconExternal,
  IconEye,
  IconEyeOff,
  IconPencil,
} from "@/components/admin/ui/icons";
import { Alert, Ident, StatusBadge } from "@/components/admin/ui/Surface";

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
  index = 0,
  selected = false,
  onSelectedChange,
}: {
  post: PostRowData;
  setStatusAction: Action;
  deleteAction: Action;
  index?: number;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
}) {
  const [statusState, statusFormAction] = useActionState(setStatusAction, { error: null });
  const [removed, setRemoved] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /* Publicado ↔ oculto es el interruptor de visibilidad. Un borrador que nunca
     se publicó no se "oculta": se publica. */
  const isPublished = post.status === "PUBLISHED";
  const nextStatus = isPublished ? "HIDDEN" : "PUBLISHED";
  const toggleLabel = isPublished ? "Ocultar" : "Publicar";
  const error = statusState.error ?? deleteError;

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
            <div className="min-w-0">
              {/* El título completo, no truncado a mitad de palabra: en una
                  lista de artículos el título ES el identificador humano. */}
              <Link
                href={`/admin/posts/${post.id}/edit`}
                className="cq-title block hover:underline"
              >
                {post.title}
              </Link>
              {/* Y este es el identificador de máquina. En mono, con la barra
                  adelante: es la URL pública real, la que se copia y se pega. */}
              <Ident path className="mt-0.5 block truncate">
                {post.slug}
              </Ident>
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

            <IconLinkButton
              href={`/admin/posts/${post.id}/edit`}
              label={`Editar «${post.title}»`}
              size="sm"
              icon={<IconPencil size={14} />}
            />

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
