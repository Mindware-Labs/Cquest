"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

// Wrapper de cliente sobre una página de servidor: la sesión se sigue resolviendo en el servidor, acá sólo vive la animación.
export default function LoginReveal({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      timeline
        .from(rootRef.current, {
          opacity: 0,
          y: 14,
          duration: 0.6,
          clearProps: "opacity,transform",
        })
        .from(
          rootRef.current!.querySelectorAll("[data-reveal]"),
          { opacity: 0, y: 8, duration: 0.45, stagger: 0.06, clearProps: "opacity,transform" },
          0.18,
        );

      return () => timeline.kill();
    });

    return () => media.revert();
  }, []);

  return (
    <div ref={rootRef} className="w-full max-w-[25.5rem]">
      {children}
    </div>
  );
}
