"use client";

import { useMemo, useState, useTransition } from "react";
import type { PostActionState } from "@/lib/posts";
import { Button } from "@/components/admin/ui/Button";
import { useToast } from "@/components/admin/ui/Toast";
import { IconCheck, IconEye, IconEyeOff, IconSpinner } from "@/components/admin/ui/icons";
import PostRow, { type PostRowData } from "./PostRow";

type Action = (state: PostActionState, formData: FormData) => Promise<PostActionState>;

/* La tabla de artículos con selección múltiple.

   Existe como componente de cliente porque la selección es estado compartido
   entre las filas y la barra de acciones: si viviera en cada fila, la barra no
   podría saber cuántas hay marcadas.

   El problema que resuelve: publicar diez borradores eran diez clics en diez
   filas, cada uno con su viaje al servidor y su revalidación. Ahora es marcar,
   elegir la acción, y una sola transacción. */

const CAPTION = "Artículos del panel";

export default function PostsTable({
  posts,
  caption,
  setStatusAction,
  deleteAction,
  bulkStatusAction,
}: {
  posts: PostRowData[];
  caption?: string;
  setStatusAction: Action;
  deleteAction: Action;
  bulkStatusAction: Action;
}) {
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [isPending, startTransition] = useTransition();
  const { notify } = useToast();

  /* La selección se limpia sola de lo que ya no está en pantalla. Sin esto,
     filtrar por "Borradores" después de marcar un publicado dejaría ese id
     marcado en la sombra, y la acción en bloque tocaría un artículo que la
     persona ya no está viendo. */
  const visibleIds = useMemo(() => new Set(posts.map((post) => post.id)), [posts]);
  const activeSelection = useMemo(
    () => [...selected].filter((id) => visibleIds.has(id)),
    [selected, visibleIds],
  );

  const allSelected = posts.length > 0 && activeSelection.length === posts.length;
  /* Estado indeterminado: hay algo marcado pero no todo. Es el único caso donde
     una casilla no puede decir la verdad con dos estados. */
  const someSelected = activeSelection.length > 0 && !allSelected;

  function toggle(id: number, on: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAll(on: boolean) {
    setSelected(on ? new Set(posts.map((post) => post.id)) : new Set());
  }

  function applyStatus(status: "PUBLISHED" | "HIDDEN" | "DRAFT", verb: string) {
    const ids = activeSelection;
    if (ids.length === 0) return;

    const formData = new FormData();
    for (const id of ids) formData.append("id", String(id));
    formData.set("status", status);

    startTransition(async () => {
      const result = await bulkStatusAction({ error: null }, formData);

      if (result.error) {
        notify({ message: result.error, tone: "danger", durationMs: 8000 });
        return;
      }

      setSelected(new Set());
      notify({
        message: `${ids.length} ${ids.length === 1 ? "artículo" : "artículos"} ${verb}.`,
        tone: "success",
      });
    });
  }

  return (
    <>
      {/* La barra de selección aparece SOLO con algo marcado, y ocupa el lugar
          de nada: no empuja la tabla porque vive pegada arriba de ella. Una
          barra permanente con los botones apagados enseña a ignorarla. */}
      {activeSelection.length > 0 && (
        <div className="cq-bulkbar" role="region" aria-label="Acciones sobre la selección">
          {/* "en esta página", explícito. La selección nunca cruzó la
              paginación —la casilla del encabezado marca las filas montadas— y
              mientras la tabla mostraba todo, "3 seleccionados" y "3 de los que
              hay" eran lo mismo. Con páginas dejaron de serlo, y una acción
              masiva que dice "seleccionados" sobre un subconjunto invisible es
              exactamente el tipo de ambigüedad que hace que alguien publique de
              menos y no se entere. */}
          <span className="cq-body font-semibold text-[var(--p-ink)]">
            {activeSelection.length}{" "}
            {activeSelection.length === 1 ? "seleccionado" : "seleccionados"}{" "}
            <span className="cq-meta font-normal">en esta página</span>
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              icon={isPending ? <IconSpinner size={13} /> : <IconEye size={13} />}
              onClick={() => applyStatus("PUBLISHED", "publicados")}
            >
              Publicar
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              icon={<IconEyeOff size={13} />}
              onClick={() => applyStatus("HIDDEN", "ocultados")}
            >
              Ocultar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => applyStatus("DRAFT", "pasados a borrador")}
            >
              Pasar a borrador
            </Button>
            {/* Sin acción de borrado en bloque a propósito: eliminar diez
                artículos de un clic es la operación más destructiva posible del
                panel, y el deshacer de cinco segundos que protege al borrado de
                a uno no da para revisar diez títulos. Se borra de a uno. */}
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Quitar selección
            </Button>
          </div>
        </div>
      )}

      <div className="cq-table-scroll cq-scroll pb-2">
        <table className="cq-table cq-ledger">
          <caption className="sr-only">{caption ?? CAPTION}</caption>
          <thead>
            <tr>
              <th scope="col" className="w-9">
                <span className="relative inline-flex size-4 items-center justify-center">
                  <input
                    type="checkbox"
                    className="cq-check"
                    checked={allSelected}
                    ref={(node) => {
                      /* `indeterminate` no existe como atributo de HTML: sólo
                         se puede poner desde JavaScript sobre el elemento. */
                      if (node) node.indeterminate = someSelected;
                    }}
                    onChange={(event) => toggleAll(event.target.checked)}
                    aria-label={
                      allSelected ? "Quitar la selección de todos" : "Seleccionar todos los artículos"
                    }
                  />
                  <IconCheck size={11} className="cq-check-mark" aria-hidden="true" />
                </span>
              </th>
              <th scope="col" className="w-8">
                <span className="sr-only">Número de fila</span>
              </th>
              <th scope="col">Artículo</th>
              <th scope="col">Categoría</th>
              <th scope="col">Idioma</th>
              <th scope="col">Estado</th>
              <th scope="col">Editado</th>
              <th scope="col" className="text-right">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <PostRow
                key={post.id}
                index={Math.min(index, 8)}
                post={post}
                selected={selected.has(post.id)}
                onSelectedChange={(on) => toggle(post.id, on)}
                setStatusAction={setStatusAction}
                deleteAction={deleteAction}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
