"use client";

import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import Modal from "@/components/admin/Modal";
import Select from "@/components/admin/Select";
import { useToast } from "@/components/admin/Toaster";
import { missingToPublish } from "@/lib/publishRules";
import { seoDescriptionFor, seoTitleFor } from "@/lib/seo";
import { publishPost, savePost, setPostStatus, type PostDetail } from "@/server/posts";
import type { CategoryRow } from "@/server/categories";
import styles from "./PostEditor.module.css";

// El editor pesa y solo existe en cliente: fuera del bundle de servidor.
const BlockEditor = dynamic(() => import("@/components/admin/BlockEditor"), {
  ssr: false,
  loading: () => <div className={styles.editorSkeleton}>Cargando el editor…</div>,
});

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 8 * 1024 * 1024;

function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const c = { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.3 };
  switch (name) {
    case "back":
      return (
        <svg {...c} width={size} height={size} aria-hidden="true">
          <path d="M9.8 3.6 5.4 8l4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "image":
      return (
        <svg {...c} width={size} height={size} aria-hidden="true">
          <rect x="2.2" y="3.2" width="11.6" height="9.6" />
          <path d="m2.2 10.6 3-2.6 3.2 2.8 2.4-2 3 2.4" strokeLinejoin="round" />
          <circle cx="5.8" cy="6.2" r="0.9" />
        </svg>
      );
    case "trash":
      return (
        <svg {...c} width={14} height={14} aria-hidden="true">
          <path d="M2.8 4.4h10.4M6.4 4.4V2.8h3.2v1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m4.2 4.4.7 8.4h6.2l.7-8.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg {...c} width={14} height={14} aria-hidden="true">
          <path d="M8 2 14.6 13.4H1.4L8 2Z" strokeLinejoin="round" />
          <path d="M8 6.4v3.2M8 11.6v.6" strokeLinecap="round" />
        </svg>
      );
  }
}

export default function PostEditor({
  post,
  categories,
}: {
  post: PostDetail;
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const toast = useToast();
  const titleId = useId();
  const excerptId = useId();
  const altId = useId();
  const seoTitleId = useId();
  const seoDescId = useId();
  const blockedId = useId();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(post.title === "Untitled" ? "" : post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [categoryId, setCategoryId] = useState(post.categoryId ?? "");
  const [cover, setCover] = useState({ url: post.coverUrl, pathname: post.coverPathname });
  const [coverAlt, setCoverAlt] = useState(post.coverAlt ?? "");
  const [seoTitle, setSeoTitle] = useState(post.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(post.seoDescription ?? "");

  /* Vacíos, estos dos campos no aportan nada al formulario: la página ya cae
     en el título y el extracto. Solo se abren si el artículo trae textos
     propios, o si el autor los pide. */
  const [seoOpen, setSeoOpen] = useState(Boolean(post.seoTitle || post.seoDescription));
  const [content, setContent] = useState<unknown>(post.content);
  const [status, setStatus] = useState(post.status);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, startSaving] = useTransition();

  // Avisa al cerrar la pestaña con cambios sin guardar.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const payload = useCallback(
    () => ({
      title,
      excerpt,
      categoryId: categoryId || null,
      coverUrl: cover.url,
      coverAlt: coverAlt || null,
      coverPathname: cover.pathname,
      content: (Array.isArray(content) ? content : []) as unknown[],
      seoTitle: seoTitle || null,
      seoDescription: seoDescription || null,
    }),
    [title, excerpt, categoryId, cover, coverAlt, content, seoTitle, seoDescription],
  );

  async function uploadCover(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      toast.error("Formato no admitido", "Usa JPG, PNG, WebP o AVIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("La imagen pesa demasiado", "El máximo son 8 MB.");
      return;
    }

    setUploading(true);
    try {
      const blob = await upload(`blog/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
      });
      setCover({ url: blob.url, pathname: blob.pathname });
      setDirty(true);
      toast.success("Portada subida");
    } catch (error) {
      toast.error("No se pudo subir la portada", error instanceof Error ? error.message : undefined);
    } finally {
      setUploading(false);
    }
  }

  const uploadInline = useCallback(async (file: File) => {
    const blob = await upload(`blog/${file.name}`, file, {
      access: "public",
      handleUploadUrl: "/api/blob/upload",
    });
    return blob.url;
  }, []);

  function handleSave() {
    startSaving(async () => {
      const result = await savePost(post.id, payload());
      if (!result.ok) {
        setErrors(result.fields ?? {});
        toast.error("No se pudo guardar", result.message);
        return;
      }
      setErrors({});
      setDirty(false);
      toast.success("Borrador guardado");
      router.refresh();
    });
  }

  function handlePublish() {
    startSaving(async () => {
      const result = await publishPost(post.id, payload());
      if (!result.ok) {
        setErrors(result.fields ?? {});
        /* El toast tapa el mensaje del campo: si no dice qué falta, no dice nada. */
        const reasons = Object.values(result.fields ?? {});
        toast.error("Falta algo para publicar", reasons.join(" ") || result.message);
        return;
      }
      setErrors({});
      setDirty(false);
      setStatus("published");
      toast.success("Artículo publicado", "Ya se ve en el blog.");
      router.refresh();
    });
  }

  function handleHide() {
    startSaving(async () => {
      const result = await setPostStatus(post.id, "hidden");
      if (!result.ok) {
        toast.error("No se pudo ocultar", result.message);
        return;
      }
      setStatus("hidden");
      toast.success("Artículo oculto", "Ya no se ve en el blog.");
      router.refresh();
    });
  }

  const categoryOptions = [
    { value: "", label: "Sin categoría" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const statusLabel =
    status === "published" ? "Publicado" : status === "hidden" ? "Oculto" : "Borrador";

  /* Las mismas reglas que aplica el servidor: el botón no promete algo que
     luego se rechaza, ni bloquea algo que sí pasaría. */
  const missing = missingToPublish({
    title,
    excerpt,
    categoryId: categoryId || null,
    coverUrl: cover.url,
    coverAlt: coverAlt || null,
  });
  const blocked =
    missing.length > 0 ? `Falta ${missing.map((rule) => rule.need).join(", ")}.` : undefined;

  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <div className={styles.barLeft}>
          <Link className={styles.back} href="/admin/posts">
            <Icon name="back" size={15} />
            Artículos
          </Link>
          <span
            className={styles.status}
            data-state={status}
            title={dirty ? "Hay cambios sin guardar" : undefined}
          >
            {statusLabel}
            {dirty && <span className={styles.dirty} aria-label="Cambios sin guardar" />}
          </span>
        </div>

        <div className={styles.barActions}>
          {status === "published" && (
            <button className={styles.ghost} type="button" onClick={handleHide} disabled={saving}>
              Ocultar
            </button>
          )}
          <button className={styles.ghost} type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Guardando" : "Guardar borrador"}
          </button>
          {/* El panel cuelga del botón en vez de usar `title`: una lista se lee
              de un vistazo y el tooltip del navegador ni se estila ni llega al
              teclado. aria-disabled y no disabled, porque un botón
              deshabilitado no recibe foco ni hover en varios navegadores. */}
          <span className={styles.publishWrap}>
            <button
              className={styles.primary}
              type="button"
              onClick={() => {
                if (blocked) {
                  toast.error("Falta algo para publicar", blocked);
                  return;
                }
                setConfirmOpen(true);
              }}
              disabled={saving}
              aria-disabled={blocked ? true : undefined}
              aria-describedby={blocked ? blockedId : undefined}
              data-blocked={blocked ? "" : undefined}
            >
              {status === "published" ? "Actualizar publicación" : "Publicar"}
            </button>

            {missing.length > 0 && (
              <span className={styles.blockedPanel} id={blockedId} role="tooltip">
                <span className={styles.blockedTitle}>Falta para publicar</span>
                <ul className={styles.blockedList}>
                  {missing.map((rule) => (
                    <li key={rule.field}>{rule.need}</li>
                  ))}
                </ul>
              </span>
            )}
          </span>
        </div>
      </header>

      <div className={styles.columns}>
        <div className={styles.main}>
          <label className={styles.srOnly} htmlFor={titleId}>
            Título
          </label>
          <input
            id={titleId}
            className={styles.title}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setDirty(true);
            }}
            placeholder="Título del artículo"
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && (
            <span className={styles.fieldError} role="alert">
              <Icon name="alert" />
              {errors.title}
            </span>
          )}

          <BlockEditor
            initialContent={post.content}
            onChange={(blocks) => {
              setContent(blocks);
              setDirty(true);
            }}
            onUpload={uploadInline}
          />
        </div>

        <aside className={styles.side}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>
              Portada <span className={styles.optional}>opcional</span>
            </h2>
            <div className={styles.cover} data-empty={!cover.url}>
              {cover.url ? (
                <Image src={cover.url} alt="" fill sizes="20rem" />
              ) : (
                <span className={styles.coverEmpty}>
                  <Icon name="image" size={20} />
                  Sin portada
                </span>
              )}
            </div>
            <input
              ref={fileRef}
              className={styles.srOnly}
              type="file"
              accept={ACCEPTED.join(",")}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadCover(file);
                event.target.value = "";
              }}
            />
            <div className={styles.coverActions}>
              <button
                className={styles.ghost}
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Subiendo" : cover.url ? "Cambiar" : "Subir imagen"}
              </button>
              {cover.url && (
                <button
                  className={styles.iconGhost}
                  type="button"
                  onClick={() => {
                    setCover({ url: null, pathname: null });
                    setDirty(true);
                  }}
                  aria-label="Quitar la portada"
                  title="Quitar"
                >
                  <Icon name="trash" />
                </button>
              )}
            </div>
            {errors.coverUrl && (
              <span className={styles.fieldError} role="alert">
                <Icon name="alert" />
                {errors.coverUrl}
              </span>
            )}

            <label className={styles.label} htmlFor={altId}>
              Texto alternativo
            </label>
            <input
              id={altId}
              className={styles.input}
              value={coverAlt}
              onChange={(event) => {
                setCoverAlt(event.target.value);
                setDirty(true);
              }}
              placeholder="Qué muestra la imagen"
              aria-invalid={Boolean(errors.coverAlt)}
              aria-describedby={`${altId}-help`}
            />
            <span className={styles.help} id={`${altId}-help`}>
              Lo lee quien no ve la imagen. Obligatorio si hay portada.
            </span>
            {errors.coverAlt && (
              <span className={styles.fieldError} role="alert">
                <Icon name="alert" />
                {errors.coverAlt}
              </span>
            )}
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Publicación</h2>

            <span className={styles.label}>Categoría</span>
            <Select
              value={categoryId}
              options={categoryOptions}
              onChange={(next) => {
                setCategoryId(next);
                setDirty(true);
              }}
              label="Categoría del artículo"
              width="100%"
            />
            {errors.categoryId && (
              <span className={styles.fieldError} role="alert">
                <Icon name="alert" />
                {errors.categoryId}
              </span>
            )}

            <label className={styles.label} htmlFor={excerptId}>
              Extracto
            </label>
            <textarea
              id={excerptId}
              className={styles.textarea}
              value={excerpt}
              onChange={(event) => {
                setExcerpt(event.target.value);
                setDirty(true);
              }}
              rows={3}
              maxLength={300}
              placeholder="Dos líneas que resuman el artículo."
              aria-invalid={Boolean(errors.excerpt)}
              aria-describedby={`${excerptId}-help`}
            />
            <span className={styles.help} id={`${excerptId}-help`}>
              Sale en el listado y en buscadores. Mínimo 20 caracteres para publicar.
            </span>
            {errors.excerpt && (
              <span className={styles.fieldError} role="alert">
                <Icon name="alert" />
                {errors.excerpt}
              </span>
            )}
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>SEO</h2>

            {seoOpen ? (
              <>
                <label className={styles.label} htmlFor={seoTitleId}>
                  Título en buscadores <span className={styles.optional}>opcional</span>
                </label>
                <input
                  id={seoTitleId}
                  className={styles.input}
                  value={seoTitle}
                  onChange={(event) => {
                    setSeoTitle(event.target.value);
                    setDirty(true);
                  }}
                  maxLength={70}
                  placeholder={title || "Se usa el título del artículo"}
                />
                <label className={styles.label} htmlFor={seoDescId}>
                  Descripción <span className={styles.optional}>opcional</span>
                </label>
                <textarea
                  id={seoDescId}
                  className={styles.textarea}
                  value={seoDescription}
                  onChange={(event) => {
                    setSeoDescription(event.target.value);
                    setDirty(true);
                  }}
                  rows={3}
                  maxLength={180}
                  placeholder={excerpt || "Se usa el extracto"}
                />
                <button
                  className={styles.seoLink}
                  type="button"
                  onClick={() => {
                    setSeoTitle("");
                    setSeoDescription("");
                    setSeoOpen(false);
                    setDirty(true);
                  }}
                >
                  Volver a los automáticos
                </button>
              </>
            ) : (
              <>
                <p className={styles.help}>Se arman solos con el artículo. Así se verán:</p>
                <p className={styles.seoPreview}>{seoTitleFor(title, null)}</p>
                <p className={styles.seoPreview} data-muted="">
                  {seoDescriptionFor(excerpt, null) || "Escribe el extracto y aparecerá aquí."}
                </p>
                <button className={styles.seoLink} type="button" onClick={() => setSeoOpen(true)}>
                  Escribirlos a mano
                </button>
              </>
            )}
          </section>
        </aside>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        eyebrow="Confirmar"
        title={status === "published" ? "Actualizar la publicación" : "Publicar el artículo"}
      >
        <p className={styles.dialogText}>
          {status === "published"
            ? "Se regenera la versión pública con los cambios actuales. La URL no cambia."
            : "El artículo pasa a verse en el blog. La URL se fija ahora a partir del título y no vuelve a cambiar."}
        </p>
        <div className={styles.dialogFoot}>
          <button className={styles.ghost} type="button" onClick={() => setConfirmOpen(false)}>
            Cancelar
          </button>
          <button
            className={styles.primary}
            type="button"
            onClick={() => {
              setConfirmOpen(false);
              handlePublish();
            }}
            disabled={saving}
          >
            {status === "published" ? "Actualizar" : "Publicar"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
