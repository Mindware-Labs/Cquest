"use client";

import Link from "next/link";
import { useState, useTransition, type CSSProperties } from "react";
import type { CategoryActionState } from "@/lib/categories";
import { Button, IconButton } from "@/components/admin/ui/Button";
import { DeleteAction } from "@/components/admin/ui/DeleteAction";
import { IconClose, IconPencil } from "@/components/admin/ui/icons";
import { Alert } from "@/components/admin/ui/Surface";
import { useToast } from "@/components/admin/ui/Toast";

type Action = (state: CategoryActionState, formData: FormData) => Promise<CategoryActionState>;

export type CategoryCardData = {
  id: number;
  name: string;
  // Vacío significa "sin traducir": el blog en inglés cae al nombre de arriba (ver categoryName() en lib/categoryName.ts).
  nameEn: string;
  slug: string;
  postCount: number;
};

// Tarjetas y no tabla: con tres o cinco categorías una tabla sólo desperdicia ancho; la tarjeta usa ese espacio para destacar la cifra de artículos, el dato que importa para decidir si se puede borrar.
export default function CategoryCard({
  category,
  renameAction,
  deleteAction,
  index = 0,
}: {
  category: CategoryCardData;
  renameAction: Action;
  deleteAction: Action;
  index?: number;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [renaming, startRename] = useTransition();
  const [removed, setRemoved] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { notify } = useToast();

  // useTransition + acción directa (como DeleteAction), no useActionState + efecto: el resultado se necesita como valor para decidir si cerrar, ahí mismo, sin encadenar un render extra.
  function submitRename(formData: FormData) {
    startRename(async () => {
      const result = await renameAction({ error: null }, formData);
      if (result.error) {
        setRenameError(result.error);
        return;
      }
      setRenameError(null);
      setIsEditing(false);
      notify({ message: "Categoría renombrada.", tone: "success" });
    });
  }

  // Una categoría con artículos no se puede borrar (AD-4); se deshabilita el botón para avisar antes del clic, no después del error.
  const hasPosts = category.postCount > 0;

  if (removed) return null;

  if (isEditing) {
    return (
      <li className="cq-card cq-enter" style={{ "--cq-i": index } as CSSProperties}>
        <form
          action={submitRename}
          className="grid gap-2"
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsEditing(false);
          }}
        >
          <input name="id" type="hidden" value={category.id} />
          <label htmlFor={`rename-${category.id}`} className="cq-label">
            Nuevo nombre
          </label>
          <input
            id={`rename-${category.id}`}
            name="name"
            type="text"
            defaultValue={category.name}
            required
            autoFocus
            maxLength={60}
            className="cq-input"
          />
          {/* Se edita junto al español, no en otra pantalla, para que no queden desincronizados. Sin required: vacío es válido, significa "usá el de arriba". */}
          <label htmlFor={`rename-en-${category.id}`} className="cq-label">
            Nombre en inglés <span className="cq-meta">(opcional)</span>
          </label>
          <input
            id={`rename-en-${category.id}`}
            name="nameEn"
            type="text"
            defaultValue={category.nameEn}
            maxLength={60}
            className="cq-input"
          />
          <div className="flex items-center gap-2">
            <Button type="submit" variant="solid" size="sm" disabled={renaming}>
              {renaming ? "Guardando…" : "Guardar"}
            </Button>
            <IconButton
              label="Cancelar el cambio de nombre"
              size="sm"
              icon={<IconClose size={14} />}
              disabled={renaming}
              onClick={() => setIsEditing(false)}
            />
          </div>
          {renameError && <Alert>{renameError}</Alert>}
        </form>
      </li>
    );
  }

  return (
    <li className="cq-card cq-enter relative" style={{ "--cq-i": index } as CSSProperties}>
      <Link
        // categoria=<slug> y no q=<nombre>: la búsqueda por texto sobre título/slug/nombre daba falsos positivos y negativos; el slug compara contra la relación real.
        href={`/admin/posts?categoria=${encodeURIComponent(category.slug)}`}
        // Enlace estirado con pseudo-elemento: el área de clic cubre la tarjeta entera sin que el nombre accesible incluya slug, cifra y botones.
        className="after:absolute after:inset-0 after:content-['']"
      >
        <p className="cq-title truncate">{category.name}</p>
      </Link>

      {/* Único lugar donde se ve de un vistazo qué categorías quedaron sin traducir (y por lo tanto salen en español en el blog en inglés). */}
      {category.nameEn && (
        <p className="cq-meta truncate">
          <span className="cq-ident">EN</span> {category.nameEn}
        </p>
      )}

      {/* El slug se sacó de acá: era el mismo nombre repetido dos veces ("Casos de éxito" / "casos-de-exito"). */}
      <p className="mt-4 flex items-baseline gap-2">
        <span className="cq-display leading-none">{category.postCount}</span>
        <span className="cq-meta">
          {category.postCount === 1 ? "artículo" : "artículos"}
        </span>
      </p>

      {/* relative z-10: sin esto el clic en Renombrar navegaría al listado por el enlace estirado. Siempre visibles, no sólo al hover, para no esconder que se puede renombrar. */}
      <div className="relative z-10 mt-3 flex items-center gap-1 border-t border-[var(--p-line)] pt-2">
        <IconButton
          label={`Renombrar «${category.name}»`}
          size="sm"
          icon={<IconPencil size={14} />}
          onClick={() => setIsEditing(true)}
        />
        <DeleteAction
          compact
          name={category.name}
          noun="la categoría"
          disabled={hasPosts}
          disabledReason="No se puede eliminar: tiene artículos asociados"
          onOptimisticRemove={(isRemoved) => {
            setRemoved(isRemoved);
            if (isRemoved) setDeleteError(null);
          }}
          action={async () => {
            const formData = new FormData();
            formData.set("id", String(category.id));
            const result = await deleteAction({ error: null }, formData);
            setDeleteError(result.error);
            return result;
          }}
        />
      </div>

      {deleteError && (
        <div className="relative z-10 mt-2">
          <Alert>{deleteError}</Alert>
        </div>
      )}
    </li>
  );
}
