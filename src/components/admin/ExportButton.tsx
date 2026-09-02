"use client";

import { useState } from "react";
import { useToast } from "./Toaster";
import fields from "./fields.module.css";

function filenameFrom(response: Response, fallback: string): string {
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  return match?.[1] ?? fallback;
}

/* Botón propio (no un <a> plano): así se puede mostrar el spinner mientras
   el .xlsx se arma en el servidor y avisar si algo falla, en vez de que el
   único aviso de un error silencioso sea "nunca bajó el archivo". */
export default function ExportButton({
  href,
  fallbackFilename,
  className,
  idleLabel = "Export Excel",
  busyLabel = "Preparing…",
}: {
  href: string;
  fallbackFilename: string;
  className: string;
  idleLabel?: string;
  busyLabel?: string;
}) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const response = await fetch(href);
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filenameFrom(response, fallbackFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Could not export", "Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <a className={className} href={href} onClick={handleClick} aria-busy={loading} data-busy={loading || undefined}>
      {loading ? (
        <span className={fields.spinner} aria-hidden="true" />
      ) : (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
          <path d="M8 2.6v7.2M5.2 7l2.8 2.8L10.8 7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 11v2.4h10V11" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {loading ? busyLabel : idleLabel}
    </a>
  );
}
