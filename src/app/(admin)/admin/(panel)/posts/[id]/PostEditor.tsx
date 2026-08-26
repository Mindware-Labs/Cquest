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
  loading: () => <div className={styles.editorSkeleton}>Loading the editor…</div>,
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
      toast.error("Unsupported format", "Use JPG, PNG, WebP or AVIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image too large", "The limit is 8 MB.");
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
      toast.success("Cover uploaded");
    } catch (error) {
      toast.error("Could not upload the cover", error instanceof Error ? error.message : undefined);
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
        toast.error("Could not save", result.message);
        return;
      }
      setErrors({});
      setDirty(false);
      toast.success("Draft saved");
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
        toast.error("Something is missing to publish", reasons.join(" ") || result.message);
        return;
      }
      setErrors({});
      setDirty(false);
      setStatus("published");
      toast.success("Article published", "It is live on the blog.");
      router.refresh();
    });
  }

  function handleHide() {
    startSaving(async () => {
      const result = await setPostStatus(post.id, "hidden");
      if (!result.ok) {
        toast.error("Could not hide it", result.message);
        return;
      }
      setStatus("hidden");
      toast.success("Article hidden", "It no longer shows on the blog.");
      router.refresh();
    });
  }

  const categoryOptions = [
    { value: "", label: "No category" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const statusLabel =
    status === "published" ? "Published" : status === "hidden" ? "Hidden" : "Draft";

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
    missing.length > 0 ? `Missing ${missing.map((rule) => rule.need).join(", ")}.` : undefined;

  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <div className={styles.barLeft}>
          <Link className={styles.back} href="/admin/posts">
            <Icon name="back" size={15} />
            Articles
          </Link>
          <span
            className={styles.status}
            data-state={status}
            title={dirty ? "Unsaved changes" : undefined}
          >
            {statusLabel}
            {dirty && <span className={styles.dirty} aria-label="Unsaved changes" />}
          </span>
        </div>

        <div className={styles.barActions}>
          {status === "published" && (
            <button className={styles.ghost} type="button" onClick={handleHide} disabled={saving}>
              Hide
            </button>
          )}
          <button className={styles.ghost} type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving" : "Save draft"}
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
                  toast.error("Something is missing to publish", blocked);
                  return;
                }
                setConfirmOpen(true);
              }}
              disabled={saving}
              aria-disabled={blocked ? true : undefined}
              aria-describedby={blocked ? blockedId : undefined}
              data-blocked={blocked ? "" : undefined}
            >
              {status === "published" ? "Update publication" : "Publish"}
            </button>

            {missing.length > 0 && (
              <span className={styles.blockedPanel} id={blockedId} role="tooltip">
                <span className={styles.blockedTitle}>Missing to publish</span>
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
            Title
          </label>
          <input
            id={titleId}
            className={styles.title}
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              setDirty(true);
            }}
            placeholder="Article title"
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
              Cover <span className={styles.optional}>optional</span>
            </h2>
            <div className={styles.cover} data-empty={!cover.url}>
              {cover.url ? (
                <Image src={cover.url} alt="" fill sizes="20rem" />
              ) : (
                <span className={styles.coverEmpty}>
                  <Icon name="image" size={20} />
                  No cover
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
                {uploading ? "Uploading" : cover.url ? "Replace" : "Upload image"}
              </button>
              {cover.url && (
                <button
                  className={styles.iconGhost}
                  type="button"
                  onClick={() => {
                    setCover({ url: null, pathname: null });
                    setDirty(true);
                  }}
                  aria-label="Remove the cover"
                  title="Remove"
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
              Alt text
            </label>
            <input
              id={altId}
              className={styles.input}
              value={coverAlt}
              onChange={(event) => {
                setCoverAlt(event.target.value);
                setDirty(true);
              }}
              placeholder="What the image shows"
              aria-invalid={Boolean(errors.coverAlt)}
              aria-describedby={`${altId}-help`}
            />
            <span className={styles.help} id={`${altId}-help`}>
              Read by anyone who cannot see the image. Required when there is a cover.
            </span>
            {errors.coverAlt && (
              <span className={styles.fieldError} role="alert">
                <Icon name="alert" />
                {errors.coverAlt}
              </span>
            )}
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Publishing</h2>

            <span className={styles.label}>Category</span>
            <Select
              value={categoryId}
              options={categoryOptions}
              onChange={(next) => {
                setCategoryId(next);
                setDirty(true);
              }}
              label="Article category"
              width="100%"
            />
            {errors.categoryId && (
              <span className={styles.fieldError} role="alert">
                <Icon name="alert" />
                {errors.categoryId}
              </span>
            )}

            <label className={styles.label} htmlFor={excerptId}>
              Excerpt
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
              placeholder="Two lines summarising the article."
              aria-invalid={Boolean(errors.excerpt)}
              aria-describedby={`${excerptId}-help`}
            />
            <span className={styles.help} id={`${excerptId}-help`}>
              Shows in the listing and in search results. At least 20 characters to publish.
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
                  Search title <span className={styles.optional}>optional</span>
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
                  placeholder={title || "The article title is used"}
                />
                <label className={styles.label} htmlFor={seoDescId}>
                  Description <span className={styles.optional}>optional</span>
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
                  placeholder={excerpt || "The excerpt is used"}
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
                  Back to automatic
                </button>
              </>
            ) : (
              <>
                <p className={styles.help}>Built from the article itself. This is how they will look:</p>
                <p className={styles.seoPreview}>{seoTitleFor(title, null)}</p>
                <p className={styles.seoPreview} data-muted="">
                  {seoDescriptionFor(excerpt, null) || "Write the excerpt and it will show up here."}
                </p>
                <button className={styles.seoLink} type="button" onClick={() => setSeoOpen(true)}>
                  Write them by hand
                </button>
              </>
            )}
          </section>
        </aside>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        eyebrow="Confirm"
        title={status === "published" ? "Update the publication" : "Publish the article"}
      >
        <p className={styles.dialogText}>
          {status === "published"
            ? "The public version is rebuilt with the current changes. The URL stays the same."
            : "The article becomes visible on the blog. The URL is set now from the title and never changes again."}
        </p>
        <div className={styles.dialogFoot}>
          <button className={styles.ghost} type="button" onClick={() => setConfirmOpen(false)}>
            Cancel
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
            {status === "published" ? "Update" : "Publish"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
