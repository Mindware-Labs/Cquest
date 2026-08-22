"use client";

import Link from "next/link";
import { useActionState, useState, type CSSProperties } from "react";
import type { CategoryActionState } from "@/lib/categories";
import { SubmitButton } from "@/components/admin/ui/Buttons";
import { IconButton } from "@/components/admin/ui/Button";
import { DeleteAction } from "@/components/admin/ui/DeleteAction";
import { IconClose, IconPencil } from "@/components/admin/ui/icons";
import { Alert, Ident } from "@/components/admin/ui/Surface";

type Action = (state: CategoryActionState, formData: FormData) => Promise<CategoryActionState>;

export type CategoryCardData = {
  id: number;
  name: string;
  slug: string;
  postCount: number;
};

/* Una categoría, como tarjeta.

   Por qué tarjetas y no una tabla: hay tres o cinco categorías, no cuarenta.
   Una tabla existe para comparar muchas filas en vertical por varias columnas
   a la vez; con cinco filas y dos datos por fila, lo único que aporta son
   líneas. Y la fila de una tabla desperdicia el ancho: nombre, slug y conteo
   ocupaban un tercio de la pantalla y los dos tercios restantes quedaban en
   blanco.

   La tarjeta usa ese ancho para lo que sí importa acá: la CIFRA de artículos,
   grande, que es el único dato con el que se decide algo sobre una categoría
   —si tiene contenido o está vacía, y por lo tanto si se puede borrar—.

   La tarjeta entera es un enlace al listado filtrado por esa categoría. Es la
   acción más frecuente por lejos: uno entra a Categorías para ver qué hay
   adentro de una, no para renombrarla. */
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
  const [renameState, renameFormAction] = useActionState(renameAction, { error: null });
  const [removed, setRemoved] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  /* Una categoría con artículos no se puede borrar (AD-4). El backend ya lo
     impide; deshabilitar el botón acá es para que se sepa ANTES de hacer clic,
     no después de recibir un error. */
  const hasPosts = category.postCount > 0;

  if (removed) return null;

  if (isEditing) {
    return (
      <li className="cq-card cq-enter" style={{ "--cq-i": index } as CSSProperties}>
        <form
          action={renameFormAction}
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
          <div className="flex items-center gap-2">
            <SubmitButton variant="solid" size="sm" pendingLabel="Guardando…">
              Guardar
            </SubmitButton>
            <IconButton
              label="Cancelar el cambio de nombre"
              size="sm"
              icon={<IconClose size={14} />}
              onClick={() => setIsEditing(false)}
            />
          </div>
          {renameState.error && <Alert>{renameState.error}</Alert>}
        </form>
      </li>
    );
  }

  return (
    <li className="cq-card cq-enter relative" style={{ "--cq-i": index } as CSSProperties}>
      <Link
        href={`/admin/posts?q=${encodeURIComponent(category.name)}`}
        /* El enlace se estira sobre toda la tarjeta con un pseudo-elemento, así
           que el área de clic es la tarjeta completa pero el nombre accesible
           sigue siendo sólo el título — no el título más el slug más la cifra
           más los botones, que es lo que pasa al envolver todo en un <a>. */
        className="after:absolute after:inset-0 after:content-['']"
      >
        <p className="cq-title truncate">{category.name}</p>
      </Link>

      <Ident path className="mt-1 block truncate">
        {category.slug}
      </Ident>

      <p className="mt-4 flex items-baseline gap-2">
        <span className="cq-display leading-none">{category.postCount}</span>
        <span className="cq-meta">
          {category.postCount === 1 ? "artículo" : "artículos"}
        </span>
      </p>

      {/* Las acciones van por encima del enlace estirado (`relative z-10`), o
          el clic en Renombrar navegaría al listado.

          Siempre visibles: aparecer al apuntar la tarjeta obligaba a dos
          movimientos —apuntar, esperar, apuntar el botón— y escondía que la
          categoría se puede renombrar de quien nunca pasó el mouse por ahí. */}
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
