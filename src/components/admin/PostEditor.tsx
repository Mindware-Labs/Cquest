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
import { IconArrowLeft, IconSpinner } from "./ui/icons";
import { IconLinkButton } from "./ui/Button";
import { Alert, Ident } from "./ui/Surface";
import { ConfirmDialog } from "./ui/Dialog";
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
  /* Ausente al crear. Sirve para distinguir la primera publicación —la que
     efectivamente saca el artículo a la web— del guardado de uno que ya está
     publicado. */
  status?: string;
  blocks: Block[];
};

function SaveButtons({
  onPublishIntent,
  publishLabel,
}: {
  /* Devuelve `true` si hay que frenar y pedir confirmación. El botón no sabe
     por qué: sólo pregunta antes de enviar. */
  onPublishIntent: () => boolean;
  publishLabel: string;
}) {
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
        onClick={(event) => {
          if (onPublishIntent()) event.preventDefault();
        }}
      >
        {pending ? <IconSpinner size={15} /> : null}
        {pending ? "Publicando…" : publishLabel}
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

  /* El error se busca solo. La validación llega como una sola alerta arriba de
     un formulario de tres pantallas de alto: al enviar desde el final, el aviso
     aparecía completamente fuera de la vista y el botón simplemente no hacía
     nada visible. Se desplaza hasta él y se le pone el foco —de ahí el
     `tabIndex={-1}`—, así el teclado también queda parado en el problema y no
     donde estaba antes. */
  const errorRef = useRef<HTMLDivElement | null>(null);

  /* Confirmación antes de la PRIMERA publicación.

     El panel protegía lo reversible y dejaba abierto lo que sale a producción:
     borrar pedía diálogo y daba cinco segundos para deshacer, mientras publicar
     era un clic sin nada, con el botón pegado a "Guardar borrador", del mismo
     tamaño y a ocho píxeles. Un error de puntería sacaba un borrador a la web.

     Sólo la PRIMERA vez. Volver a guardar un artículo que ya está publicado no
     cambia su visibilidad, y preguntar ahí sería un peaje en el trabajo normal
     de corregir un párrafo — que es como se entrena a la gente a confirmar sin
     leer. El diálogo aparece cuando el estado cambia de verdad.

     El formulario se envía por referencia y no reenviando el evento: hay que
     conservar el `intent=publish` del botón, y `requestSubmit` con el botón
     como argumento es lo único que lo incluye. */
  const formRef = useRef<HTMLFormElement | null>(null);
  const [confirmingPublish, setConfirmingPublish] = useState(false);
  const goingLive = initial.status !== "PUBLISHED";
  const publishLabel = goingLive ? "Publicar" : "Guardar y publicar";

  /* El permiso para pasar de largo va en un ref y no en el estado del diálogo:
     `confirmPublish` reenvía el formulario en el mismo tick en que baja el
     estado, así que el `onClick` que se vuelve a disparar leería el valor del
     render anterior. Un ref se lee y se escribe en el momento. */
  const publishConfirmed = useRef(false);

  const askBeforePublish = useCallback(() => {
    if (!goingLive || publishConfirmed.current) {
      publishConfirmed.current = false;
      return false;
    }
    setConfirmingPublish(true);
    return true;
  }, [goingLive]);

  const confirmPublish = useCallback(() => {
    setConfirmingPublish(false);
    publishConfirmed.current = true;
    const form = formRef.current;
    const button = form?.querySelector<HTMLButtonElement>('button[value="publish"]');
    if (form && button) form.requestSubmit(button);
    else publishConfirmed.current = false;
  }, []);

  useEffect(() => {
    if (!state.error) return;
    const node = errorRef.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    node.focus({ preventScroll: true });
  }, [state.error]);

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

  /* `beforeunload` sólo cubre cerrar la pestaña, recargar o irse a otro sitio.
     NO se dispara en una navegación de Next: un clic en "Artículos" del riel es
     un push del router, no una descarga de documento — el guard de arriba no se
     enteraba y el borrador se perdía en silencio.

     Se escucha el clic en fase de captura sobre el documento y no se envuelve
     cada enlace: los enlaces que sacan de acá están en el riel y en la miga,
     que son componentes del layout y no saben que abajo hay un editor sucio.
     Un solo oyente los cubre a todos, incluidos los que se agreguen después.

     Se dejan pasar: el clic con modificador (abre en otra pestaña, no te saca
     de esta), el destino externo o con `target`, la descarga, y el enlace que
     apunta a esta misma ruta. */
  useEffect(() => {
    if (!isDirty) return;

    const onCapture = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (anchor.origin !== window.location.origin) return;
      if (anchor.pathname === window.location.pathname) return;

      const leave = window.confirm(
        "Este artículo tiene cambios sin guardar. Si salís ahora se pierden.",
      );
      if (!leave) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("click", onCapture, true);
    return () => document.removeEventListener("click", onCapture, true);
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
      ref={formRef}
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
      {/* El desplazamiento sale del token que define el alto de la barra
          superior (`--p-space-7`), no de un `3rem` escrito a mano: eran el
          mismo número en dos archivos, y el día que la barra cambie de alto
          esta se le monta encima. */}
      <div className="sticky top-[var(--p-space-7)] z-[var(--p-z-sticky)] -mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--p-line)] bg-[var(--p-surface)] px-4 py-2.5 sm:-mx-6 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {/* La SALIDA. No existía: el editor tenía dos botones para guardar y
              ninguno para irse. La única forma de abandonar un borrador era el
              botón de atrás del navegador o un enlace del riel, o sea salir por
              donde no hay puerta. Va a la izquierda del título porque es un
              retroceso, no una acción sobre el artículo — y por eso es un
              enlace y no un botón: navega. El guard de cambios sin guardar lo
              intercepta igual que a cualquier otro enlace. */}
          <IconLinkButton
            href="/admin/posts"
            label="Volver a Artículos"
            icon={<IconArrowLeft size={16} />}
          />
          <h1 className="cq-title truncate">
            {initial.id ? "Editar artículo" : "Nuevo artículo"}
          </h1>
          {/* El identificador del artículo, si ya existe. Es lo que se pega en
              un mensaje para señalar de cuál se está hablando. */}
          {initial.id && <Ident chip>#{initial.id}</Ident>}
        </div>
        <SaveButtons onPublishIntent={askBeforePublish} publishLabel={publishLabel} />
        <ConfirmDialog
          open={confirmingPublish}
          onClose={() => setConfirmingPublish(false)}
          onConfirm={confirmPublish}
          tone="primary"
          confirmLabel="Publicar ahora"
          cancelLabel="Todavía no"
          title={`¿Publicar «${title || "este artículo"}»?`}
          description="Queda visible en el blog público apenas se guarde. Se puede volver a borrador o esconder desde la tabla de artículos."
        />
      </div>

      {state.error && (
        <div ref={errorRef} tabIndex={-1}>
          <Alert>{state.error}</Alert>
        </div>
      )}

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
          <h2 className="cq-section-title">Datos del artículo</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 pb-6 lg:grid-cols-2">
        <TextField label="Título" value={title} onChange={setTitle} maxLength={120} required />
        <TextField
          label="Slug"
          hint="Se genera del título si lo dejás vacío. Es lo que se ve en la URL pública."
          value={slug}
          onChange={setSlug}
          placeholder="mi-articulo"
        />
        <input type="hidden" name="title" value={title} />
        <input type="hidden" name="slug" value={slug} />

        <div className="lg:col-span-2">
          <TextAreaField
            label="Extracto"
            hint="El resumen que acompaña al artículo en el listado del blog."
            value={excerpt}
            onChange={setExcerpt}
            rows={3}
          />
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
          hint="Describe la imagen para quien no puede verla. Lo lee un lector de pantalla."
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

        {/* El SEO va PLEGADO y aparte.

            Estaba suelto en la misma grilla que Título, Portada y Categoría, o
            sea que dos campos opcionales que la mayoría de las veces se dejan
            vacíos pesaban lo mismo que los obligatorios. Lo único que los
            distinguía era la palabra "(opcional)" dentro del rótulo.

            `<details>` y no una pestaña ni un acordeón propio: es un control
            nativo, funciona sin JavaScript, el navegador ya lo hace accesible
            con teclado, y el buscador del navegador (Ctrl+F) encuentra lo que
            hay adentro y lo abre solo. */}
        <details className="cq-details lg:col-span-2">
          <summary className="cq-details-summary">
            <span className="cq-section-title">Metadatos para buscadores</span>
            <span className="cq-meta">Opcional — si se dejan vacíos se usa el título y el extracto</span>
          </summary>
          <div className="grid grid-cols-1 gap-4 pt-4 lg:grid-cols-2">
            <TextField
              label="Título SEO"
              hint="Hasta 70 caracteres. Es lo que se ve como titular en Google."
              value={seoTitle}
              onChange={setSeoTitle}
              maxLength={70}
            />
            <TextField
              label="Descripción SEO"
              hint="Hasta 160 caracteres. Es el párrafo debajo del titular."
              value={seoDescription}
              onChange={setSeoDescription}
              maxLength={160}
            />
          </div>
        </details>
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
              <h2 className="cq-section-title pb-1.5">Bloques del artículo</h2>
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

        {/* Barra superior + barra de guardado + aire. Se compone de los mismos
            tokens que las dos barras que tiene encima. */}
        <aside className="lg:sticky lg:top-[calc(var(--p-space-7)*2+var(--p-space-4))] lg:self-start">
          <div className="cq-section pb-5">
            <div className="cq-section-head">
              <h2 className="cq-section-title">Propiedades</h2>
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
          <h2 className="cq-section-title">Vista previa</h2>
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
