"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { TransitionLink } from "@/components/TransitionLink";

const COPY = {
  eyebrow: "Something broke",
  title: "That wasn't supposed to happen.",
  lead: "Something went wrong loading this page. You can try again, or head back home.",
  retry: "Try again",
  home: "Back to home",
};

export default function Error({
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
    <>
      <Navbar />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-32 text-center">
        <span className="font-mono text-sm uppercase tracking-[0.14em] text-petroleo">{COPY.eyebrow}</span>
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">{COPY.title}</h1>
        <p className="max-w-md text-muted">{COPY.lead}</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={unstable_retry}
            className="inline-flex items-center rounded-[2px] bg-petroleo px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {COPY.retry}
          </button>
          <TransitionLink
            href="/"
            className="inline-flex items-center rounded-[2px] border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
          >
            {COPY.home}
          </TransitionLink>
        </div>
      </div>
    </>
  );
}
