"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import type { Block } from "@/lib/blocks";
import BlockRenderer from "@/components/blog/BlockRenderer";
import type { PostActionState } from "@/lib/posts";
import type { TemplateActionState } from "@/lib/templates";
import ImageUploadField from "./ImageUploadField";
import BlockCanvas from "./editor/BlockCanvas";
import BlockPalette from "./editor/BlockPalette";
import BlockProperties from "./editor/BlockProperties";
import TemplatePicker, { type TemplateChoice } from "./editor/TemplatePicker";
import SaveAsTemplate from "./editor/SaveAsTemplate";
import { createBlock, createColumnBlock, type ColumnType } from "./editor/blockFactory";
import {
  appendToColumn,
  findBlock,
  insertBlock,
  moveBlock,
  moveWithinColumn,
  removeBlock,
  setColumnCount,
  updateBlock,
} from "./editor/blockTree";
import { INPUT_CLASS, TextAreaField, TextField } from "./editor/fields";

type Action = (state: PostActionState, formData: FormData) => Promise<PostActionState>;

export type PostEditorInitial = {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  coverImageAlt: string;
  categoryId: number | null;
  locale: string;
  seoTitle: string;
  seoDescription: string;
  blocks: Block[];
};

function SaveButtons() {
  const { pending } = useFormStatus();

  /* Los dos botones mandan `intent` distinto en el mismo submit (AD-12): el
     backend decide estado y fecha con ese campo, sin una segunda llamada. */
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="submit"
        name="intent"
        value="draft"
        disabled={pending}
        className="rounded-md border border-border bg-white px-4 py-2.5 text-[0.85rem] font-semibold text-[var(--text-secondary)] transition-colors hover:border-petroleo hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-petroleo disabled:opacity-60"
      >
        Guardar borrador
      </button>
      <button
        type="submit"
        name="intent"
        value="publish"
        disabled={pending}
        className="rounded-md bg-verde px-4 py-2.5 text-[0.85rem] font-semibold text-white transition-colors hover:bg-verde/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde disabled:opacity-60"
      >
        Publicar
      </button>
    </div>
  );
}

export default function PostEditor({
  action,
  initial,
  categories,
  templates,
  saveTemplateAction,
}: {
  action: Action;
  initial: PostEditorInitial;
  categories: ReadonlyArray<{ id: number; name: string }>;
  templates: TemplateChoice[];
  saveTemplateAction: (
    state: TemplateActionState,
    formData: FormData,
  ) => Promise<TemplateActionState>;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(action, { error: null });

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [coverImageUrl, setCoverImageUrl] = useState(initial.coverImageUrl);
  const [coverImageAlt, setCoverImageAlt] = useState(initial.coverImageAlt);
  const [categoryId, setCategoryId] = useState(initial.categoryId ?? categories[0]?.id ?? 0);
  const [locale, setLocale] = useState(initial.locale);
  const [seoTitle, setSeoTitle] = useState(initial.seoTitle);
  const [seoDescription, setSeoDescription] = useState(initial.seoDescription);

  const [blocks, setBlocks] = useState<Block[]>(initial.blocks);
  const [selectedId, setSelectedId] = useState<string | null>(initial.blocks[0]?.id ?? null);

  /* El selector de plantillas solo aparece al crear un artículo vacío (AD-14).
     En un artículo existente sería una forma de borrar todo por accidente. */
  const [showTemplates, setShowTemplates] = useState(!initial.id && initial.blocks.length === 0);

  /* Región viva: el arrastre y los botones ↑↓ cambian el orden sin mover el
     foco, así que sin esto un lector de pantalla no anuncia nada (RNF-5). */
  const [announcement, setAnnouncement] = useState("");

  const selected = selectedId ? findBlock(blocks, selectedId) : null;

  /* Al crear, la action devuelve el id nuevo: se pasa a la pantalla de edición
     para que un segundo "Guardar" actualice en vez de crear un duplicado. */
  useEffect(() => {
    if (!initial.id && state.id) {
      router.replace(`/admin/posts/${state.id}/edit`);
    }
  }, [state.id, initial.id, router]);

  function addBlock(type: Block["type"]) {
    const block = createBlock(type);
    setBlocks((current) => [...current, block]);
    setSelectedId(block.id);
  }

  function insertNew(type: Block["type"], at: number) {
    const block = createBlock(type);
    setBlocks((current) => insertBlock(current, block, at));
    setSelectedId(block.id);
  }

  return (
    <form action={formAction} className="pt-10">
      {/* El contenido viaja serializado en un input oculto: es lo que espera
          contentSchema en posts.ts, y lo que hace que el mismo schema valide
          en el cliente y en el servidor. */}
      <input type="hidden" name="content" value={JSON.stringify(blocks)} />
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="coverImageUrl" value={coverImageUrl} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-[1.6rem] font-semibold tracking-[-0.02em] text-foreground">
          {initial.id ? "Editar artículo" : "Nuevo artículo"}
        </h1>
        <SaveButtons />
      </div>

      {state.error && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-[0.88rem] text-red-700"
        >
          {state.error}
        </p>
      )}

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {showTemplates && (
        <div className="mt-7">
          <TemplatePicker
            templates={templates}
            onPick={(picked) => {
              setBlocks(picked);
              setSelectedId(picked[0]?.id ?? null);
              setShowTemplates(false);
            }}
            onSkip={() => setShowTemplates(false)}
          />
        </div>
      )}

      <section className="mt-7 grid grid-cols-1 gap-5 rounded-xl border border-border bg-[var(--surface-raised)] p-6 lg:grid-cols-2">
        <TextField label="Título" value={title} onChange={setTitle} maxLength={120} />
        <TextField
          label="Slug (opcional — se genera del título)"
          value={slug}
          onChange={setSlug}
          placeholder="mi-articulo"
        />
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="slug" value={slug} />

        <div className="lg:col-span-2">
          <TextAreaField label="Extracto" value={excerpt} onChange={setExcerpt} rows={3} />
          <input type="hidden" name="excerpt" value={excerpt} />
        </div>

        {/* La portada se recorta a 16/9 por diseño, así que sus dimensiones
            reales no cambian nada: solo se guarda la URL. */}
        <ImageUploadField
          label="Portada"
          value={coverImageUrl}
          onChange={({ url }) => setCoverImageUrl(url)}
          required
        />
        <TextField
          label="Texto alternativo de la portada"
          value={coverImageAlt}
          onChange={setCoverImageAlt}
          maxLength={200}
        />
        <input type="hidden" name="coverImageAlt" value={coverImageAlt} />

        <label className="block">
          <span className="text-[0.78rem] font-semibold text-foreground">Categoría</span>
          <select
            name="categoryId"
            value={categoryId}
            onChange={(event) => setCategoryId(Number(event.target.value))}
            className={INPUT_CLASS}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[0.78rem] font-semibold text-foreground">Idioma</span>
          {/* Un artículo vive en un idioma; el listado público filtra por acá.
              No es una traducción de otro artículo. */}
          <select
            name="locale"
            value={locale}
            onChange={(event) => setLocale(event.target.value)}
            className={INPUT_CLASS}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </label>

        <TextField label="Título SEO (opcional)" value={seoTitle} onChange={setSeoTitle} maxLength={70} />
        <TextField
          label="Descripción SEO (opcional)"
          value={seoDescription}
          onChange={setSeoDescription}
          maxLength={160}
        />
        <input type="hidden" name="seoTitle" value={seoTitle} />
        <input type="hidden" name="seoDescription" value={seoDescription} />
      </section>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <section className="rounded-xl border border-border bg-[var(--surface-raised)] p-6">
          <BlockPalette onAdd={addBlock} />

          <BlockCanvas
            blocks={blocks}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onMove={(from, to) => setBlocks((current) => moveBlock(current, from, to))}
            onRemove={(id) => {
              setBlocks((current) => removeBlock(current, id));
              setSelectedId((current) => (current === id ? null : current));
            }}
            onInsertNew={insertNew}
            onAddToColumn={(columnsBlockId, columnIndex, type: ColumnType) => {
              const child = createColumnBlock(type);
              setBlocks((current) => appendToColumn(current, columnsBlockId, columnIndex, child));
              setSelectedId(child.id);
            }}
            onMoveInColumn={(columnsBlockId, columnIndex, from, to) =>
              setBlocks((current) => moveWithinColumn(current, columnsBlockId, columnIndex, from, to))
            }
            onAnnounce={setAnnouncement}
          />
        </section>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-border bg-[var(--surface-raised)] p-6">
            {selected ? (
              <BlockProperties
                block={selected}
                onChange={(next) => setBlocks((current) => updateBlock(current, next))}
                onColumnCountChange={(count) =>
                  setBlocks((current) => setColumnCount(current, selected.id, count))
                }
              />
            ) : (
              <p className="text-[0.85rem] leading-relaxed text-[var(--text-tertiary)]">
                Seleccioná un bloque para ver sus opciones.
              </p>
            )}
          </div>

          <div className="mt-4">
            <SaveAsTemplate action={saveTemplateAction} blocks={blocks} />
          </div>
        </aside>
      </div>

      {/* Vista previa con el MISMO renderer del blog público (PERS-5): lo que
          se ve acá es literalmente lo que se va a publicar, no una maqueta. */}
      <section className="mt-6 rounded-xl border border-border bg-[var(--surface-raised)] p-6">
        <p className="border-b border-border pb-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-petroleo">
          Vista previa
        </p>
        <div className="mx-auto mt-6 max-w-[44rem]">
          {blocks.length > 0 ? (
            <BlockRenderer blocks={blocks} />
          ) : (
            <p className="py-8 text-center text-[0.85rem] text-[var(--text-tertiary)]">
              Agregá un bloque para ver la vista previa.
            </p>
          )}
        </div>
      </section>
    </form>
  );
}
