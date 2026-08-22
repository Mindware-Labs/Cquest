"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Alert } from "./ui/Surface";
import { Button } from "./ui/Button";

/* Sube por /api/admin/upload y devuelve la ruta /api/images/... que espera el
   schema. Es un endpoint y no una Server Action a propósito: el archivo va
   como multipart y el límite de body de las actions (6mb) es para el CV de
   empleos, no para cada imagen del blog. */
export type UploadResult = { url: string; width?: number; height?: number };

/* Tope del lado del cliente. El servidor tiene el suyo —y es el que manda—,
   pero rechazar acá evita subir ocho megas por una conexión de oficina para
   recibir un error al final. El aviso llega en el momento en que se elige el
   archivo, no dos minutos después. */
const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED = "image/jpeg,image/png,image/webp,image/avif";

function formatSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
  /* `null` = no hay subida en curso. Un número = porcentaje. Se distingue de 0
     a propósito: 0 es "empezó y todavía no viajó nada", que es información. */
  const [progress, setProgress] = useState<number | null>(null);
  const request = useRef<XMLHttpRequest | null>(null);

  /* XMLHttpRequest y no fetch. No es nostalgia: `fetch` no expone el progreso
     de SUBIDA en ningún navegador —`ReadableStream` en el body es de bajada—,
     así que con fetch lo único que se puede mostrar es "Subiendo…" y esperar.
     XHR tiene `upload.onprogress` desde siempre. */
  function upload(file: File) {
    setError(null);

    if (file.size > MAX_BYTES) {
      setError(
        `La imagen pesa ${formatSize(file.size)} y el máximo es ${formatSize(MAX_BYTES)}. Probá exportarla más chica o en WebP.`,
      );
      return;
    }

    const body = new FormData();
    body.append("file", file);

    const xhr = new XMLHttpRequest();
    request.current = xhr;
    setProgress(0);

    xhr.upload.addEventListener("progress", (event) => {
      /* `lengthComputable` es false cuando el servidor no informa el tamaño.
         En ese caso el porcentaje sería inventado, así que se deja en 0 y la
         barra queda indeterminada en vez de mentir. */
      if (!event.lengthComputable) return;
      setProgress(Math.round((event.loaded / event.total) * 100));
    });

    xhr.addEventListener("load", () => {
      request.current = null;
      setProgress(null);

      try {
        const data = JSON.parse(xhr.responseText) as UploadResult & { error?: string };
        if (xhr.status < 200 || xhr.status >= 300 || !data.url) {
          setError(data.error ?? "No se pudo subir la imagen.");
          return;
        }
        onChange({ url: data.url, width: data.width, height: data.height });
      } catch {
        setError("El servidor respondió algo que no se pudo leer.");
      }
    });

    xhr.addEventListener("error", () => {
      request.current = null;
      setProgress(null);
      setError("No se pudo subir la imagen. Revisá la conexión.");
    });

    /* Cancelar no es un error: no se muestra ningún aviso rojo por algo que la
       persona pidió a propósito. */
    xhr.addEventListener("abort", () => {
      request.current = null;
      setProgress(null);
    });

    xhr.open("POST", "/api/admin/upload");
    xhr.send(body);
  }

  const isUploading = progress !== null;

  return (
    <div>
      <span className="cq-label">
        {label}
        {required && (
          <span className="text-[var(--p-danger)]" aria-hidden="true">
            {" "}
            *
          </span>
        )}
        {required && <span className="sr-only"> (obligatorio)</span>}
      </span>

      {value && !isUploading && (
        <div className="mt-2 flex items-center gap-3">
          <div className="relative h-14 w-20 overflow-hidden rounded-[var(--p-radius-sm)] bg-[var(--p-surface-sunken)]">
            <Image src={value} alt="" fill sizes="80px" className="object-cover" />
          </div>
          <button
            type="button"
            onClick={() => onChange({ url: "" })}
            className="cq-btn"
            data-variant="danger"
            data-size="sm"
          >
            Quitar
          </button>
        </div>
      )}

      {isUploading ? (
        /* Mientras sube, el selector de archivo desaparece: dejarlo disponible
           invita a elegir una segunda imagen encima de una subida en curso, y
           entonces cuál gana depende de cuál termine antes. */
        <div className="mt-2">
          <div className="flex items-center justify-between gap-3">
            <span role="status" className="cq-meta">
              Subiendo… {progress}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => request.current?.abort()}
            >
              Cancelar
            </Button>
          </div>

          {/* La barra se anima por `transform`, no por `width`: animar el ancho
              obliga a recalcular la maquetación en cada evento de progreso. */}
          <div className="cq-meter mt-2" role="progressbar" aria-label="Progreso de la subida" aria-valuenow={progress ?? 0} aria-valuemin={0} aria-valuemax={100}>
            <span
              style={{
                transform: `scaleX(${(progress ?? 0) / 100})`,
                animation: "none",
              }}
            />
          </div>
        </div>
      ) : (
        <input
          type="file"
          accept={ACCEPTED}
          onChange={(event) => {
            const file = event.target.files?.[0];
            /* El input se limpia siempre: si no, subir la misma imagen dos
               veces seguidas no dispara onChange la segunda vez. */
            event.target.value = "";
            if (file) upload(file);
          }}
          /* El botón interno del selector de archivo se dibuja con el mismo
             vocabulario que el resto: es el único control del panel que el
             navegador pinta por su cuenta si no se lo pisa. */
          className="cq-meta mt-2 block w-full file:mr-3 file:cursor-pointer file:rounded-[var(--p-radius-sm)] file:border file:border-[var(--p-line-strong)] file:bg-[var(--p-surface)] file:px-3 file:py-1.5 file:text-[0.75rem] file:font-semibold file:text-[var(--p-ink)]"
        />
      )}

      {!isUploading && (
        <p className="cq-meta mt-1">
          JPG, PNG, WebP o AVIF. Hasta {formatSize(MAX_BYTES)}.
        </p>
      )}

      {error && (
        <div className="mt-1.5">
          <Alert>{error}</Alert>
        </div>
      )}
    </div>
  );
}
