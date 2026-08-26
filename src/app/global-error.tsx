"use client";

import { useEffect } from "react";
import "./globals.css";

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
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="max-w-md text-muted">
          An unexpected error occurred. Try again or reload the page.
        </p>
        <button
          type="button"
          onClick={unstable_retry}
          className="mt-2 inline-flex items-center rounded-[2px] bg-petroleo px-6 py-3 text-sm font-medium text-white"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
