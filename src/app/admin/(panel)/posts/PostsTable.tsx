"use client";

import { useMemo, useState, useTransition } from "react";
import type { PostActionState } from "@/lib/posts";
import { Button } from "@/components/admin/ui/Button";
import { useToast } from "@/components/admin/ui/Toast";
import { IconCheck, IconEye, IconEyeOff, IconSpinner } from "@/components/admin/ui/icons";
import PostRow, { type PostRowData } from "./PostRow";
import PostMetaDrawer from "./PostMetaDrawer";

type Action = (state: PostActionState, formData: FormData) => Promise<PostActionState>;

// Componente de cliente porque la selección es estado compartido entre filas y la barra de acciones: publicar diez borradores es ahora una sola transacción en vez de diez viajes al servidor.
const CAPTION = "Artículos del panel";

export default function PostsTable({
  posts,
  categories,
  caption,
  setStatusAction,
  deleteAction,
  bulkStatusAction,
  updateMetaAction,
}: {
  posts: PostRowData[];
  categories: ReadonlyArray<{ id: number; name: string }>;
  caption?: string;
  setStatusAction: Action;
  deleteAction: Action;
  bulkStatusAction: Action;
  updateMetaAction: Action;
}) {
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  // Se guarda el ARTÍCULO entero y no su id, con la apertura en estado aparte: con el id, cerrar lo ponía en null y el cajón se desmontaba en el mismo fotograma sin dejar correr la animación de salida.
  const [editing, setEditing] = useState<PostRowData | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { notify } = useToast();

  // La selección se limpia sola de lo que ya no está en pantalla: si no, una acción en bloque podría tocar un artículo que la persona ya no ve.
  const visibleIds = useMemo(() => new Set(posts.map((post) => post.id)), [posts]);
  const activeSelection = useMemo(
    () => [...selected].filter((id) => visibleIds.has(id)),
    [selected, visibleIds],
  );

  const allSelected = posts.length > 0 && activeSelection.length === posts.length;
  // Indeterminado: hay algo marcado pero no todo, el único caso donde una casilla no puede decir la verdad con dos estados.
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
      {/* Aparece sólo con algo marcado: una barra permanente con botones apagados enseña a ignorarla. */}
      {activeSelection.length > 0 && (
        <div className="cq-bulkbar" role="region" aria-label="Acciones sobre la selección">
          {/* "en esta página" explícito: con paginación, "seleccionados" a secas sería ambiguo sobre un subconjunto invisible. */}
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
            {/* Sin borrado en bloque a propósito: el deshacer de cinco segundos no da para revisar diez títulos a la vez. */}
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
              Quitar selección
            </Button>
          </div>
        </div>
      )}

      {/* Sólo desplazamiento horizontal, cuando las columnas no entran: el vertical se fue, la tabla crece con la página. */}
      <div className="cq-table-scroll pb-2">
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
                      // `indeterminate` no existe como atributo de HTML: sólo se puede poner desde JavaScript.
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
                onEdit={() => {
                  setEditing(post);
                  setEditorOpen(true);
                }}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* `key` por artículo: los campos usan `defaultValue` (no controlados), así que sin el `key` abrir la fila B después de la A mostraría los datos de A. */}
      {editing && (
        <PostMetaDrawer
          key={editing.id}
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
          categories={categories}
          action={updateMetaAction}
          post={{
            id: editing.id,
            title: editing.title,
            slug: editing.slug,
            excerpt: editing.excerpt,
            categoryId: editing.categoryId,
            locale: editing.locale,
            seoTitle: editing.seoTitle,
            seoDescription: editing.seoDescription,
            status: editing.status,
            updatedAtIso: editing.updatedAtIso,
          }}
        />
      )}
    </>
  );
}
