"use client";

import Image from "next/image";
import { useState, useTransition } from "react";

/* Sube por /api/admin/upload y devuelve la ruta /api/images/... que espera el
   schema. Es un endpoint y no una Server Action a propósito: el archivo va
   como multipart y el límite de body de las actions (6mb) es para el CV de
   empleos, no para cada imagen del blog. */
export type UploadResult = { url: string; width?: number; height?: number };

export default function ImageUploadField({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  /* Devuelve las dimensiones junto con la URL: quien las necesite (el bloque
     de imagen del cuerpo) las guarda, y quien recorta a proporción fija (la
     portada) las ignora. */
  onChange: (result: UploadResult) => void;
  required?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function upload(file: File) {
    setError(null);
    const body = new FormData();
    body.append("file", file);

    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await response.json()) as UploadResult & { error?: string };
      if (!response.ok || !data.url) {
        setError(data.error ?? "No se pudo subir la imagen.");
        return;
      }
      onChange({ url: data.url, width: data.width, height: data.height });
    } catch {
      setError("No se pudo subir la imagen. Revisá la conexión.");
    }
  }

  return (
    <div>
      <span className="text-[0.82rem] font-semibold text-foreground">
        {label}
        {required && <span className="text-red-700"> *</span>}
      </span>

      {value && (
        <div className="mt-2 flex items-center gap-3">
          <div className="relative h-16 w-24 overflow-hidden rounded-md bg-[var(--surface-sunken)]">
            <Image src={value} alt="" fill sizes="96px" className="object-cover" />
          </div>
          <button
            type="button"
            onClick={() => onChange({ url: "" })}
            className="text-[0.8rem] font-semibold text-red-700 underline underline-offset-2"
          >
            Quitar
          </button>
        </div>
      )}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        disabled={isPending}
        onChange={(event) => {
          const file = event.target.files?.[0];
          /* El input se limpia siempre: si no, subir la misma imagen dos veces
             seguidas no dispara onChange la segunda vez. */
          event.target.value = "";
          if (file) startTransition(() => void upload(file));
        }}
        className="mt-2 block w-full text-[0.85rem] text-[var(--text-secondary)] file:mr-3 file:rounded-md file:border file:border-border file:bg-white file:px-3 file:py-1.5 file:text-[0.8rem] file:font-semibold file:text-foreground"
      />

      {isPending && <p className="mt-1 text-[0.8rem] text-[var(--text-tertiary)]">Subiendo…</p>}
      {error && (
        <p role="alert" className="mt-1 text-[0.8rem] text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
