"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./BrainVisual.module.css";

/* ssr: false es obligatorio: WebGL no existe en el servidor y useGLTF revienta
   durante el prerender. */
const BrainCanvas = dynamic(() => import("./BrainCanvas"), {
  ssr: false,
  loading: () => null,
});

export default function BrainVisual({ reduced }: { reduced: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  /* Nada de WebGL hasta que el bloque se acerque: montar el canvas y parsear el
     GLB al cargar la página bloquea el hilo principal mientras el usuario está
     leyendo el hero, tres pantallas más arriba. */
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    /* Precargar y renderizar son cosas distintas. En cuanto el navegador queda
       ocioso se traen el chunk de three.js y —al evaluarse el módulo, que llama
       a useGLTF.preload— el propio GLB. Así, cuando el bloque entra en pantalla,
       ya está todo en caché y aparece de una. Sin esto la descarga arrancaba
       justo al llegar y se veía el hueco. */
    const warm = () => {
      void import("./BrainCanvas");
    };
    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(warm, { timeout: 2500 })
        : window.setTimeout(warm, 1500);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setMounted(true);
        setActive(entry.isIntersecting);
      },
      { rootMargin: "600px" },
    );

    observer.observe(host);

    return () => {
      observer.disconnect();
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);

  return (
    <div ref={hostRef} className={styles.visual} data-static={reduced ? "true" : undefined}>
      <span aria-hidden className={styles.halo} />
      <span aria-hidden className={styles.ringOuter} />
      <span aria-hidden className={styles.ringInner} />

      <div className={styles.canvasLayer}>
        {mounted && <BrainCanvas reduced={reduced} active={active} />}
      </div>
    </div>
  );
}
