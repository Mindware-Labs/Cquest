"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
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
  canLiveInColumn,
  findBlock,
  insertBlock,
  insertIntoColumn,
  locateBlock,
  moveBlock,
  moveIntoColumn,
  moveOutOfColumn,
  moveWithinColumn,
  removeBlock,
  setColumnCount,
  updateBlock,
} from "./editor/blockTree";
import MoveBlockControl from "./editor/MoveBlockControl";
import { TextAreaField, TextField } from "./editor/fields";
import { IconSpinner } from "./ui/icons";
import { Alert, Ident } from "./ui/Surface";
import { useToast } from "./ui/Toast";
import { TYPE_LABEL } from "./editor/blockFactory";

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
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="submit"
        name="intent"
        value="draft"
        disabled={pending}
        className="cq-btn"
        data-variant="outline"
      >
        {pending ? <IconSpinner size={15} /> : null}
        {pending ? "Guardando…" : "Guardar borrador"}
      </button>
      {/* Publicar también muestra que está corriendo. Es la acción MÁS lenta y
          la de más consecuencia, y era la única del panel que sólo se apagaba:
          sobre una conexión lenta se veía igual que un botón muerto. */}
      <button
        type="submit"
        name="intent"
        value="publish"
        disabled={pending}
        className="cq-btn"
        data-variant="solid"
      >
        {pending ? <IconSpinner size={15} /> : null}
        {pending ? "Publicando…" : "Publicar"}
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
  const { notify } = useToast();
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
     foco, así que sin esto un lector de pantalla no anuncia nada (RNF-5).

     El contador NO es decorativo. Una región viva sólo anuncia cuando su texto
     CAMBIA: subir dos veces el mismo bloque, o borrar dos párrafos seguidos,
     producía el mismo string y el segundo anuncio no existía. El número lo
     fuerza a cambiar siempre y va oculto entre paréntesis. */
  const [announcement, setAnnouncement] = useState({ text: "", nonce: 0 });

  const announce = useCallback((text: string) => {
    setAnnouncement((current) => ({ text, nonce: current.nonce + 1 }));
  }, []);

  const selected = selectedId ? findBlock(blocks, selectedId) : null;

  /* Al crear, la action devuelve el id nuevo: se pasa a la pantalla de edición
     para que un segundo "Guardar" actualice en vez de crear un duplicado. */
  useEffect(() => {
    if (!initial.id && state.id) {
      router.replace(`/admin/posts/${state.id}/edit`);
    }
  }, [state.id, initial.id, router]);

  /* Confirmación de guardado.

     Faltaba, y era el hueco más grave del panel: al guardar un artículo que ya
     existía, la acción sólo devolvía error o nada. En el caso bueno no cambiaba
     NADA en pantalla —ni aviso, ni hora, ni estado—, así que no había forma de
     distinguir "se guardó" de "el clic no hizo nada". Con Publicar, eso termina
     en alguien apretando el botón tres veces.

     Se cuenta el envío con un ref y no con estado: el contador no participa del
     render, y sumarlo como estado dispararía un render extra por cada guardado
     sin cambiar un solo píxel. */
  const submissions = useRef(0);
  const lastNotified = useRef(0);
  const intent = useRef<"draft" | "publish">("draft");

  useEffect(() => {
    if (submissions.current === 0) return;
    if (submissions.current === lastNotified.current) return;
    if (state.error) return;

    lastNotified.current = submissions.current;
    notify({
      message: intent.current === "publish" ? "Artículo publicado." : "Borrador guardado.",
      tone: "success",
    });
  }, [state, notify]);

  /* Cambios sin guardar.

     Todo el artículo vive en estado del cliente y sólo se persiste al enviar,
     así que cerrar la pestaña o recargar tiraba el trabajo entero sin una
     palabra. `beforeunload` es lo único que el navegador permite para eso.

     La comparación es contra las props `initial`, no contra una copia guardada
     a mano: cuando la acción termina bien, el Server Component vuelve a
     renderizar con los datos ya guardados y `initial` pasa a ser exactamente lo
     que hay en pantalla. O sea que el guardado limpia el estado sucio solo, sin
     que haya que acordarse de limpiarlo. */
  const isDirty =
    JSON.stringify({
      title,
      slug,
      excerpt,
      coverImageUrl,
      coverImageAlt,
      categoryId,
      locale,
      seoTitle,
      seoDescription,
      blocks,
    }) !==
    JSON.stringify({
      title: initial.title,
      slug: initial.slug,
      excerpt: initial.excerpt,
      coverImageUrl: initial.coverImageUrl,
      coverImageAlt: initial.coverImageAlt,
      categoryId: initial.categoryId ?? categories[0]?.id ?? 0,
      locale: initial.locale,
      seoTitle: initial.seoTitle,
      seoDescription: initial.seoDescription,
      blocks: initial.blocks,
    });

  useEffect(() => {
    if (!isDirty) return;

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      /* `preventDefault` es lo que dispara el diálogo del navegador. El texto lo
         escribe el navegador, no nosotros: hace años que ignoran el mensaje
         propio para que ningún sitio pueda escribir ahí lo que quiera. */
      event.preventDefault();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  /* Un bloque nuevo entra JUSTO DEBAJO del que está seleccionado, no al final.

     Antes siempre se anexaba, y esa era la razón por la que el arrastre era la
     única forma de insertar en una posición: quien trabaja con teclado tenía
     que agregar al final y después subirlo con ↑ tantas veces como bloques
     hubiera. En un artículo de veinte bloques eso son veinte pulsaciones para
     una operación que ahora no cuesta ninguna.

     Si el seleccionado vive en una columna y el tipo nuevo entra en una, el
     bloque nace ahí adentro: es lo que espera quien está armando esa columna. */
  function addBlock(type: Block["type"]) {
    const block = createBlock(type);
    const location = selectedId ? locateBlock(blocks, selectedId) : null;

    if (location?.scope === "column" && canLiveInColumn(block)) {
      setBlocks(
        insertIntoColumn(
          blocks,
          location.columnsBlockId,
          location.columnIndex,
          block,
          location.index + 1,
        ),
      );
    } else if (location?.scope === "root") {
      setBlocks(insertBlock(blocks, block, location.index + 1));
    } else {
      setBlocks([...blocks, block]);
    }

    setSelectedId(block.id);
    announce(`${TYPE_LABEL[type]} agregado.`);
  }

  function insertNew(type: Block["type"], at: number) {
    const block = createBlock(type);
    setBlocks((current) => insertBlock(current, block, at));
    setSelectedId(block.id);
  }

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        /* Qué botón se apretó. `submitter` es lo único que lo dice, y hace
           falta para que el aviso posterior diga "publicado" o "guardado" y no
           un genérico que sirva para los dos. */
        const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        intent.current = submitter?.value === "publish" ? "publish" : "draft";
        submissions.current += 1;
      }}
    >
      {/* El contenido viaja serializado en un input oculto: es lo que espera
          contentSchema en posts.ts, y lo que hace que el mismo schema valide
          en el cliente y en el servidor. */}
      <input type="hidden" name="content" value={JSON.stringify(blocks)} />
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="coverImageUrl" value={coverImageUrl} />

      {/* La barra de guardado va PEGADA arriba, debajo de la barra del panel.
          El editor mide varias pantallas de alto: con los botones sólo en el
          encabezado, guardar desde el final del formulario obliga a subir todo
          el camino. Es la corrección más útil de esta vista. */}
      <div className="sticky top-[3rem] z-30 -mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--p-line)] bg-[var(--p-surface)] px-4 py-2.5 sm:-mx-6 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="cq-title truncate">
            {initial.id ? "Editar artículo" : "Nuevo artículo"}
          </h1>
          {/* El identificador del artículo, si ya existe. Es lo que se pega en
              un mensaje para señalar de cuál se está hablando. */}
          {initial.id && <Ident chip>#{initial.id}</Ident>}
        </div>
        <SaveButtons />
      </div>

      {state.error && <Alert>{state.error}</Alert>}

      <p aria-live="polite" className="sr-only">
        {announcement.text}
        {announcement.nonce > 0 ? ` (${announcement.nonce})` : ""}
      </p>

      {showTemplates && (
        <div className="mb-8">
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

      <section className="cq-section">
        <div className="cq-section-head">
          <h2 className="cq-label">Datos del artículo</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 pb-6 lg:grid-cols-2">
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
          <span className="cq-label">Categoría</span>
          <select
            name="categoryId"
            value={categoryId}
            onChange={(event) => setCategoryId(Number(event.target.value))}
            className="cq-select mt-1.5"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="cq-label">Idioma</span>
          {/* Un artículo vive en un idioma; el listado público filtra por acá.
              No es una traducción de otro artículo. */}
          <select
            name="locale"
            value={locale}
            onChange={(event) => setLocale(event.target.value)}
            className="cq-select mt-1.5"
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
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section className="cq-section">
          <div className="cq-section-head">
            <div className="flex items-end gap-3">
              <span aria-hidden="true" className="cq-section-figure" data-zero={blocks.length === 0 ? "true" : undefined}>
                {String(blocks.length).padStart(2, "0")}
              </span>
              <h2 className="cq-label pb-1.5">Bloques del artículo</h2>
            </div>
          </div>

          <BlockPalette onAdd={addBlock} />

          <BlockCanvas
            blocks={blocks}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onMove={(from, to) => setBlocks((current) => moveBlock(current, from, to))}
            /* Borrar un bloque es reversible.

               Era la acción más destructiva del panel y la única sin ninguna
               protección: un clic en la papelera y listo. Borrar un bloque de
               COLUMNAS se llevaba además todos sus hijos, o sea dos o tres
               bloques con su contenido, en silencio.

               La protección estaba invertida: borrar una categoría —que se
               vuelve a crear en diez segundos— pedía confirmación y daba cinco
               segundos para deshacer, y borrar media hora de escritura no pedía
               nada.

               Acá el deshacer es real y no cuesta nada: el artículo todavía no
               se guardó, así que restaurar es devolver el arreglo anterior. No
               hay servidor de por medio. */
            onRemove={(id) => {
              const previous = blocks;
              const removed = findBlock(blocks, id);
              const previousSelection = selectedId;

              setBlocks(removeBlock(blocks, id));
              setSelectedId((current) => (current === id ? null : current));

              const label = removed ? TYPE_LABEL[removed.type] : "Bloque";
              /* El aviso dice CUÁNTO se llevó puesto cuando son columnas: "se
                 eliminó Columnas" esconde que adentro había cuatro bloques. */
              const children =
                removed?.type === "columns"
                  ? removed.columns.reduce((total, column) => total + column.length, 0)
                  : 0;

              announce(`${label} eliminado.`);
              notify({
                message:
                  children > 0
                    ? `${label} eliminado, con sus ${children} bloques adentro.`
                    : `${label} eliminado.`,
                tone: "danger",
                action: {
                  label: "Deshacer",
                  onClick: () => {
                    setBlocks(previous);
                    setSelectedId(previousSelection);
                    announce(`${label} restaurado.`);
                  },
                },
              });
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
            onAnnounce={announce}
          />
        </section>

        <aside className="lg:sticky lg:top-[7rem] lg:self-start">
          <div className="cq-section pb-5">
            <div className="cq-section-head">
              <h2 className="cq-label">Propiedades</h2>
            </div>
            {selected ? (
              <div className="grid gap-4">
                {/* El destino del bloque, arriba de sus opciones: mover es una
                    decisión sobre DÓNDE va, y va antes que cómo se ve. */}
                <MoveBlockControl
                  block={selected}
                  blocks={blocks}
                  onMove={(target) => {
                    const previous = blocks;
                    const label = TYPE_LABEL[selected.type];

                    setBlocks(
                      target.scope === "root"
                        ? moveOutOfColumn(blocks, selected.id)
                        : moveIntoColumn(
                            blocks,
                            selected.id,
                            target.columnsBlockId,
                            target.columnIndex,
                          ),
                    );

                    const where =
                      target.scope === "root"
                        ? "el cuerpo del artículo"
                        : `la columna ${target.columnIndex + 1}`;

                    announce(`${label} movido a ${where}.`);
                    notify({
                      message: `${label} movido a ${where}.`,
                      action: {
                        label: "Deshacer",
                        onClick: () => {
                          setBlocks(previous);
                          announce(`${label} devuelto a su lugar anterior.`);
                        },
                      },
                    });
                  }}
                />

                <BlockProperties
                block={selected}
                onChange={(next) => setBlocks((current) => updateBlock(current, next))}
                  onColumnCountChange={(count) =>
                    setBlocks((current) => setColumnCount(current, selected.id, count))
                  }
                />
              </div>
            ) : (
              /* El vacío del panel de propiedades dice qué hacer, no que no hay
                 nada: "seleccioná un bloque" es la instrucción, y el recuadro
                 punteado muestra dónde van a aparecer sus opciones. */
              <div className="cq-ghost px-4 py-8 text-center">
                <p className="cq-body text-[var(--p-ink)]">Ningún bloque seleccionado</p>
                <p className="cq-meta mt-1">Tocá un bloque del lienzo para ver sus opciones acá.</p>
              </div>
            )}
          </div>

          <SaveAsTemplate action={saveTemplateAction} blocks={blocks} />
        </aside>
      </div>

      {/* Vista previa con el MISMO renderer del blog público (PERS-5): lo que
          se ve acá es literalmente lo que se va a publicar, no una maqueta. */}
      <section className="cq-section mt-8">
        <div className="cq-section-head">
          <h2 className="cq-label">Vista previa</h2>
        </div>
        <div className="mx-auto max-w-[44rem] pb-8">
          {blocks.length > 0 ? (
            <BlockRenderer blocks={blocks} />
          ) : (
            <div className="cq-ghost px-4 py-10 text-center">
              <p className="cq-body text-[var(--p-ink)]">Todavía no hay nada que previsualizar</p>
              <p className="cq-meta mt-1">
                Agregá un bloque desde la paleta y aparece acá tal como se va a publicar.
              </p>
            </div>
          )}
        </div>
      </section>
    </form>
  );
}
