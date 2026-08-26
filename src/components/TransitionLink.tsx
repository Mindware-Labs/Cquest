"use client";

import Link from "next/link";
import { forwardRef, type ComponentProps } from "react";
import { useRouteTransition } from "@/components/RouteTransition";

/* Un <Link> que pasa por el telón de RouteTransition en las navegaciones
   internas con click primario; todo lo demás se comporta como Link normal. */
export const TransitionLink = forwardRef<HTMLAnchorElement, ComponentProps<typeof Link>>(
  function TransitionLink({ href, onClick, ...props }, ref) {
    const transitionTo = useRouteTransition();

    return (
      <Link
        ref={ref}
        href={href}
        onClick={(event) => {
          onClick?.(event);
          if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            props.target === "_blank" ||
            props.download ||
            !transitionTo
          ) {
            return;
          }

          const target = new URL(event.currentTarget.href);
          const current = new URL(window.location.href);
          const isSamePath = target.pathname === current.pathname;

          if (target.origin !== current.origin || isSamePath) return;

          event.preventDefault();
          transitionTo(target.href);
        }}
        {...props}
      />
    );
  },
);
