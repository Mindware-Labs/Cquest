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
import BlockPreview from "./editor/BlockPreview";
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
import { clearNewPostDraft, useLocalDraft } from "./editor/useLocalDraft";
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
  // Ausente al crear: distingue la primera publicación (la que saca el artículo a la web) de guardar uno ya publicado.
  status?: string;
  // Formato datetime-local, ya convertido a la zona de la operación por el Server Component; convertir en el cliente usaría la zona del navegador y mostraría una hora distinta a la guardada.
  publishedAt?: string;
  // Calculado en el servidor al renderizar; derivarlo en el cliente haría que el rótulo del botón dependa de cuántas veces React re-renderizó.
  isScheduled?: boolean;
  // Guarda de concurrencia: el servidor compara esta marca y rechaza el submit si alguien guardó en el medio, en vez de pisarlo.
  updatedAt?: string;
  blocks: Block[];
};

// Definición única compartida entre el snapshot y el baseline: antes estaba duplicada y un campo olvidado en un lado no marcaba el formulario como sucio.
type Snapshot = {
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  coverImageAlt: string;
  categoryId: number;
  locale: string;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
  blocks: Block[];
};

function SaveButtons({
  onPublishIntent,
  publishLabel,
  publishPendingLabel,
}: {
  // Devuelve true si hay que frenar y pedir confirmación; el botón no sabe por qué, solo pregunta antes de enviar.
  onPublishIntent: () => boolean;
  publishLabel: string;
  publishPendingLabel: string;
}) {
  const { pending } = useFormStatus();

  // Los dos botones mandan "intent" distinto en el mismo submit (AD-12): el backend decide estado y fecha con ese campo.
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
      {/* Publicar muestra que está corriendo: era el único botón que solo se apagaba, y en conexión lenta parecía muerto. */}
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
        {pending ? publishPendingLabel : publishLabel}
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
  const [publishedAt, setPublishedAt] = useState(initial.publishedAt ?? "");

  const [blocks, setBlocks] = useState<Block[]>(initial.blocks);
  const [selectedId, setSelectedId] = useState<string | null>(initial.blocks[0]?.id ?? null);

  // El selector de plantillas solo aparece al crear un artículo vacío (AD-14); en uno existente borraría todo por accidente.
  const [showTemplates, setShowTemplates] = useState(!initial.id && initial.blocks.length === 0);

  // Región viva para lector de pantalla (RNF-5); el contador fuerza que el texto cambie siempre, porque una región viva no anuncia si el string se repite.
  const [announcement, setAnnouncement] = useState({ text: "", nonce: 0 });

  const announce = useCallback((text: string) => {
    setAnnouncement((current) => ({ text, nonce: current.nonce + 1 }));
  }, []);

  const selected = selectedId ? findBlock(blocks, selectedId) : null;

  // Al crear, la action devuelve el id nuevo; se navega a edición para que un segundo "Guardar" actualice en vez de duplicar.
  useEffect(() => {
    if (!initial.id && state.id) {
      // Limpia el draft local de "Nuevo artículo": sin esto, la próxima vez se ofrecería recuperar el artículo anterior ya guardado.
      clearNewPostDraft();
      router.replace(`/admin/posts/${state.id}/edit`);
    }
  }, [state.id, initial.id, router]);

  // Confirmación de guardado: sin esto, un guardado exitoso no cambiaba nada en pantalla y era indistinguible de que el clic no hiciera nada. El envío se cuenta con un ref, no con estado, para no forzar un render extra.
  const submissions = useRef(0);
  const lastNotified = useRef(0);
  const intent = useRef<"draft" | "publish">("draft");
  // Congela si la fecha era futura al momento del envío; comparar de nuevo cuando vuelve la action daría el resultado correcto solo por casualidad.
  const scheduledAtSubmit = useRef(false);

  useEffect(() => {
    if (submissions.current === 0) return;
    if (submissions.current === lastNotified.current) return;
    if (state.error) return;

    lastNotified.current = submissions.current;
    notify({
      message:
        intent.current !== "publish"
          ? "Borrador guardado."
          : scheduledAtSubmit.current
            ? "Artículo programado."
            : "Artículo publicado.",
      tone: "success",
    });
  }, [state, notify]);

  // Se compara contra las props "initial" y no contra una copia guardada a mano: al guardar, el Server Component re-renderiza con los datos nuevos y "initial" queda al día solo, sin limpieza manual.
  const snapshot: Snapshot = {
    title,
    slug,
    excerpt,
    coverImageUrl,
    coverImageAlt,
    categoryId,
    locale,
    seoTitle,
    seoDescription,
    publishedAt,
    blocks,
  };

  // Se serializa una sola vez y se reusa como vara para la comparación y para la red local: es la misma pregunta ("¿esto es distinto de lo guardado?").
  const baseline = JSON.stringify({
    title: initial.title,
    slug: initial.slug,
    excerpt: initial.excerpt,
    coverImageUrl: initial.coverImageUrl,
    coverImageAlt: initial.coverImageAlt,
    categoryId: initial.categoryId ?? categories[0]?.id ?? 0,
    locale: initial.locale,
    seoTitle: initial.seoTitle,
    seoDescription: initial.seoDescription,
    publishedAt: initial.publishedAt ?? "",
    blocks: initial.blocks,
  } satisfies Snapshot);

  const isDirty = JSON.stringify(snapshot) !== baseline;

  // Red de seguridad para lo que NO es decisión de la persona (crash, reinicio, el navegador matando la pestaña); beforeunload solo cubre el irse a propósito.
  const localDraft = useLocalDraft<Snapshot>({
    postId: initial.id,
    snapshot,
    isDirty,
    baseline,
  });

  const applyRecovered = useCallback((draft: Snapshot) => {
    setTitle(draft.title);
    setSlug(draft.slug);
    setExcerpt(draft.excerpt);
    setCoverImageUrl(draft.coverImageUrl);
    setCoverImageAlt(draft.coverImageAlt);
    setCategoryId(draft.categoryId);
    setLocale(draft.locale);
    setSeoTitle(draft.seoTitle);
    setSeoDescription(draft.seoDescription);
    setPublishedAt(draft.publishedAt);
    setBlocks(draft.blocks);
    setSelectedId(draft.blocks[0]?.id ?? null);
    // El selector de plantillas sobra si ya se restauró contenido: era para empezar de cero.
    setShowTemplates(false);
  }, []);

  // El error se autodesplaza y recibe foco (tabIndex={-1}): en un formulario largo, enviar desde el final dejaba la alerta fuera de la vista.
  const errorRef = useRef<HTMLDivElement | null>(null);

  // Confirma solo la PRIMERA publicación (volver a guardar uno ya publicado no cambia su visibilidad); se reenvía con requestSubmit(button) para conservar el intent=publish del botón.
  const formRef = useRef<HTMLFormElement | null>(null);
  const [confirmingPublish, setConfirmingPublish] = useState(false);
  // El rótulo del botón debe reflejar si programa o publica ya; no se deriva con Date.now() en el render (cambiaría solo entre renders), se calcula en el handler de cambio. Es solo etiqueta: la consulta pública decide de verdad comparando contra la hora de Postgres.
  const [isScheduled, setIsScheduled] = useState(initial.isScheduled ?? false);

  const changePublishedAt = useCallback((value: string) => {
    setPublishedAt(value);
    setIsScheduled(value !== "" && new Date(value).getTime() > Date.now());
  }, []);

  const goingLive = initial.status !== "PUBLISHED";
  const publishLabel = isScheduled
    ? "Programar"
    : goingLive
      ? "Publicar"
      : "Guardar y publicar";

  // El permiso va en un ref, no en estado: confirmPublish reenvía el formulario en el mismo tick, y un estado leería el valor del render anterior.
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
      // preventDefault dispara el diálogo; el texto lo pone el navegador, ignora cualquier mensaje propio.
      event.preventDefault();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  // beforeunload no cubre la navegación de Next (push del router, no descarga), así que se intercepta el clic en captura sobre document en vez de envolver cada enlace del layout; se dejan pasar clics con modificador, destinos externos/con target, descargas y la ruta actual.
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

  // Un bloque nuevo entra justo debajo del seleccionado, no al final: antes forzaba a subirlo a mano con teclado. Si el seleccionado vive en una columna, el bloque nuevo nace ahí adentro.
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
        // submitter es lo único que dice qué botón se apretó; sin esto el aviso posterior no puede distinguir "publicado" de "guardado".
        const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        intent.current = submitter?.value === "publish" ? "publish" : "draft";
        scheduledAtSubmit.current = isScheduled;
        submissions.current += 1;
      }}
    >
      {/* Serializado en un input oculto: es lo que espera contentSchema en posts.ts, y valida igual en cliente y servidor. */}
      <input type="hidden" name="content" value={JSON.stringify(blocks)} />
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="coverImageUrl" value={coverImageUrl} />
      {/* El servidor compara esta marca antes de escribir: si otra pestaña guardó en el medio, rechaza el submit en vez de pisarlo. */}
      {initial.updatedAt && (
        <input type="hidden" name="expectedUpdatedAt" value={initial.updatedAt} />
      )}

      {/* Barra de guardado pegada arriba: el editor mide varias pantallas, sin esto guardar obligaría a subir todo el camino. */}
      {/* El desplazamiento usa el token --p-space-7 y no un valor fijo, para no desincronizarse si cambia el alto de la barra superior. */}
      <div className="sticky top-[var(--p-space-7)] z-[var(--p-z-sticky)] -mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--p-line)] bg-[var(--p-surface)] px-4 py-2.5 sm:-mx-6 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {/* La salida no existía antes (solo atrás del navegador o el riel). Es enlace y no botón porque navega; el guard de cambios sin guardar lo intercepta igual que a cualquier otro enlace. */}
          <IconLinkButton
            href="/admin/posts"
            label="Volver a Artículos"
            icon={<IconArrowLeft size={16} />}
          />
          <h1 className="cq-title truncate">
            {initial.id ? "Editar artículo" : "Nuevo artículo"}
          </h1>
          {/* El id del artículo, para pegar en un mensaje al señalar de cuál se está hablando. */}
          {initial.id && <Ident chip>#{initial.id}</Ident>}
        </div>
        <SaveButtons
          onPublishIntent={askBeforePublish}
          publishLabel={publishLabel}
          publishPendingLabel={isScheduled ? "Programando…" : "Publicando…"}
        />
        {/* El diálogo distingue programar de publicar: pedir la misma confirmación para algo que no ocurre enseña a confirmar sin leer. */}
        <ConfirmDialog
          open={confirmingPublish}
          onClose={() => setConfirmingPublish(false)}
          onConfirm={confirmPublish}
          tone="primary"
          confirmLabel={isScheduled ? "Programar" : "Publicar ahora"}
          cancelLabel="Todavía no"
          title={
            isScheduled
              ? `¿Programar «${title || "este artículo"}»?`
              : `¿Publicar «${title || "este artículo"}»?`
          }
          description={
            isScheduled
              ? "No se ve en el blog hasta la fecha elegida. Hasta entonces figura como «Programado» en la tabla de artículos y se puede cambiar o cancelar."
              : "Queda visible en el blog público apenas se guarde. Se puede volver a borrador o esconder desde la tabla de artículos."
          }
        />
      </div>

      {state.error && (
        <div ref={errorRef} tabIndex={-1}>
          <Alert>{state.error}</Alert>
        </div>
      )}

      {/* El borrador recuperado se OFRECE, no se aplica solo: aplicarlo sin preguntar pisaría lo que otra persona pudo haber guardado en el medio. Restaurar es la acción principal; descartar es discreto porque es irreversible. */}
      {localDraft.recovered && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[var(--p-radius-sm)] border border-dashed border-[var(--p-line)] bg-[var(--p-surface-sunken)] px-4 py-3">
          <div className="min-w-0">
            <p className="cq-body font-semibold text-[var(--p-ink)]">
              Hay cambios sin guardar de una sesión anterior
            </p>
            <p className="cq-meta mt-0.5">
              Se quedaron en este navegador. Restaurarlos reemplaza lo que se ve ahora.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="cq-btn"
              data-variant="outline"
              data-size="sm"
              onClick={() => {
                const draft = localDraft.recovered;
                if (draft) applyRecovered(draft);
                localDraft.discard();
                notify({ message: "Borrador restaurado. Revisalo y guardá.", tone: "success" });
              }}
            >
              Restaurar
            </button>
            <button
              type="button"
              className="cq-btn"
              data-variant="ghost"
              data-size="sm"
              onClick={localDraft.discard}
            >
              Descartar
            </button>
          </div>
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

        {/* La portada se recorta a 16/9 por diseño: sus dimensiones reales no importan, solo se guarda la URL. */}
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
          {/* Un artículo vive en un idioma (el listado público filtra por acá); no es traducción de otro artículo. */}
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

        {/* Con fecha futura el artículo queda PROGRAMADO sin un cuarto estado en la base: sigue "publicado" y la fecha es lo único que lo mantiene fuera del blog, evitando un job de fondo que corrija el estado cuando pasa el reloj. */}
        <label className="block lg:col-span-2">
          <span className="cq-label">Fecha de publicación</span>
          <input
            type="datetime-local"
            name="publishedAt"
            value={publishedAt}
            onChange={(event) => changePublishedAt(event.target.value)}
            className="cq-input mt-1.5 w-full sm:w-[16rem]"
          />
          <span className="cq-meta mt-1.5 block">
            {isScheduled
              ? `Queda programado: no se ve en el blog hasta esa fecha (hora de Santo Domingo).`
              : "Vacío publica en el momento de guardar. Una fecha futura lo programa; la hora es la de Santo Domingo."}
          </span>
        </label>

        {/* El SEO va plegado en <details> (nativo, sin JS, accesible por teclado, y Ctrl+F lo abre solo) para que dos campos opcionales no pesen igual que los obligatorios. */}
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
            // Borrar un bloque es reversible sin costo (el artículo no se guardó aún, restaurar solo devuelve el array anterior); antes era la única acción destructiva sin ninguna protección, y borrar columnas se llevaba a sus hijos en silencio.
            onRemove={(id) => {
              const previous = blocks;
              const removed = findBlock(blocks, id);
              const previousSelection = selectedId;

              setBlocks(removeBlock(blocks, id));
              setSelectedId((current) => (current === id ? null : current));

              const label = removed ? TYPE_LABEL[removed.type] : "Bloque";
              // El aviso dice cuántos bloques hijos se llevó puesto una columna al borrarse; "se eliminó Columnas" a secas lo escondía.
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

        {/* Usa los mismos tokens de espaciado que las dos barras de arriba (topbar + barra de guardado). */}
        <aside className="lg:sticky lg:top-[calc(var(--p-space-7)*2+var(--p-space-4))] lg:self-start">
          <div className="cq-section pb-5">
            <div className="cq-section-head">
              <h2 className="cq-section-title">Propiedades</h2>
            </div>
            {selected ? (
              <div className="grid gap-4">
                {/* Mover va antes que las opciones de estilo: es una decisión sobre dónde, no sobre cómo se ve. */}
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

                {/* La previa va arriba de sus controles (PERS-5): antes estaba al final del formulario y cambiar una alineación obligaba a bajar dos pantallas para verlo. */}
                <BlockPreview block={selected} />

                <BlockProperties
                block={selected}
                onChange={(next) => setBlocks((current) => updateBlock(current, next))}
                  onColumnCountChange={(count) =>
                    setBlocks((current) => setColumnCount(current, selected.id, count))
                  }
                />
              </div>
            ) : (
              // El estado vacío dice qué hacer ("seleccioná un bloque"), no que no hay nada.
              <div className="cq-ghost px-4 py-8 text-center">
                <p className="cq-body text-[var(--p-ink)]">Ningún bloque seleccionado</p>
                <p className="cq-meta mt-1">Toca un bloque del lienzo para ver sus opciones acá.</p>
              </div>
            )}
          </div>

          <SaveAsTemplate action={saveTemplateAction} blocks={blocks} />
        </aside>
      </div>

      {/* Usa el mismo renderer del blog público (PERS-5): esto es literalmente lo que se va a publicar, no una maqueta. */}
      <section className="cq-section mt-8">
        <div className="cq-section-head">
          <h2 className="cq-section-title">Vista previa</h2>
        </div>
        <div className="mx-auto max-w-[44rem] pb-8">
          {blocks.length > 0 ? (
            // preview: los bloques de imagen sin subir dibujan su marco en vez de desaparecer, para poder juzgar el ritmo antes de subir el archivo.
            <BlockRenderer blocks={blocks} preview />
          ) : (
            <div className="cq-ghost px-4 py-10 text-center">
              <p className="cq-body text-[var(--p-ink)]">Todavía no hay nada que previsualizar</p>
              <p className="cq-meta mt-1">
                Agrega un bloque desde la paleta y aparece acá tal como se va a publicar.
              </p>
            </div>
          )}
        </div>
      </section>
    </form>
  );
}
