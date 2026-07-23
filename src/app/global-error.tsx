"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import "./globals.css";

// Catches errors thrown above [lang]/error.tsx's boundary — i.e. from
// [lang]/layout.tsx itself (locale resolution, dictionary loading). Since the
// layout that mounts I18nProvider is exactly what may have failed, this can't
// assume any locale context is available — copy is static, both languages at
// once, rather than picked via useI18n.
export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        <h1 className="text-2xl font-bold">Algo salió mal / Something went wrong</h1>
        <p className="max-w-md text-muted">
          Ocurrió un error inesperado. Intenta de nuevo o recarga la página.
          <br />
          An unexpected error occurred. Try again or reload the page.
        </p>
        <button
          type="button"
          onClick={unstable_retry}
          className="mt-2 inline-flex items-center rounded-[2px] bg-petroleo px-6 py-3 text-sm font-medium text-white"
        >
          Reintentar / Try again
        </button>
      </body>
    </html>
  );
}
