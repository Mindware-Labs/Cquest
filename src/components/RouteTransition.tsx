"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { useIsomorphicLayoutEffect } from "@/components/about/motion";

type Phase = "idle" | "covering" | "covered" | "revealing";

const RouteTransitionContext = createContext<
  ((href: string) => void) | null
>(null);

export function useRouteTransition() {
  return useContext(RouteTransitionContext);
}

export default function RouteTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const pendingHref = useRef<string | null>(null);
  const previousPathname = useRef(pathname);
  const safetyTimer = useRef<number | null>(null);
  const arriveTimer = useRef<number | null>(null);

  const traversing = useRef(false);
  const curtainRef = useRef<HTMLDivElement>(null);

  const clearSafetyTimer = useCallback(() => {
    if (safetyTimer.current !== null) {
      window.clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }
  }, []);

  /* Congela la página saliente durante todo el traspaso: el stopInertiaOnNavigate
     de Lenis solo engancha <Link> de Next, y LocalizedLink empuja a mano. */
  const beginCover = useCallback(() => {
    window.__lenis?.stop();
    setPhase("covering");

    clearSafetyTimer();
    safetyTimer.current = window.setTimeout(() => {
      pendingHref.current = null;
      setPhase("revealing");
    }, 8000);
  }, [clearSafetyTimer]);

  /* Atrás/adelante no puede tener pata de entrada. La tinta cae al instante y
     escrita directo al DOM: una actualización de React llega un frame tarde. */
  const coverForTraversal = useCallback(() => {
    curtainRef.current?.setAttribute("data-phase", "covered");
    setPhase("covered");

    clearSafetyTimer();

    safetyTimer.current = window.setTimeout(() => {
      traversing.current = false;
      setPhase("revealing");
    }, 1000);
  }, [clearSafetyTimer]);

  useEffect(() => {
    const onPopState = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      if (window.location.pathname === previousPathname.current) return;

      pendingHref.current = null;
      traversing.current = true;
      coverForTraversal();
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [coverForTraversal]);

  const navigate = useCallback(
    (href: string) => {
      const target = new URL(href, window.location.href);
      const relativeHref = `${target.pathname}${target.search}${target.hash}`;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(relativeHref);
        return;
      }

      pendingHref.current = relativeHref;
      if (phase === "covered") {
        router.push(relativeHref, { scroll: false });
        return;
      }
      if (phase !== "idle") return;

      beginCover();
    },
    [beginCover, phase, router],
  );

  /* Lenis saca la altura de un ResizeObserver que quizá no corrió todavía;
     por eso el resize() forzado antes de saltar a un ancla. */
  const resetScroll = useCallback((href: string) => {
    const target = new URL(href, window.location.href);
    const hash = decodeURIComponent(target.hash.slice(1));
    const destination = hash ? document.getElementById(hash) : null;

    if (destination) {
      window.__lenis?.resize();
      window.__lenis?.scrollTo(destination, { immediate: true, force: true });
      if (!window.__lenis) destination.scrollIntoView();
      return;
    }

    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true, force: true });
      return;
    }

    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previousBehavior;
  }, []);

  /* Antes del paint, no después: el fundido de atrás/adelante tiene que estar
     comprometido en el mismo frame en que la ruta nueva se renderiza. */
  useIsomorphicLayoutEffect(() => {
    if (previousPathname.current === pathname) return;
    const drivenByClick = phase === "covered" && pendingHref.current !== null;
    const drivenByTraversal = phase === "covered" && traversing.current;
    previousPathname.current = pathname;

    if (!drivenByClick && !drivenByTraversal) {
      const root = document.documentElement;
      root.removeAttribute("data-route-arrive");
      void root.offsetWidth;
      root.setAttribute("data-route-arrive", "");
      if (arriveTimer.current !== null) window.clearTimeout(arriveTimer.current);
      arriveTimer.current = window.setTimeout(() => {
        root.removeAttribute("data-route-arrive");
        arriveTimer.current = null;
      }, 420);
      return;
    }

    clearSafetyTimer();

    const scrollHref = drivenByClick ? pendingHref.current : null;
    if (drivenByClick) {
      pendingHref.current = null;
    } else {
      traversing.current = false;
    }

    /* Dos frames: dejan que la ruta nueva termine su layout detrás del telón
       opaco antes de destaparla y antes de intentar hacer scroll dentro. */
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (scrollHref) resetScroll(scrollHref);
        setPhase("revealing");
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [clearSafetyTimer, pathname, phase, resetScroll]);

  useEffect(() => {
    if (phase === "idle") traversing.current = false;
  }, [phase]);

  useEffect(() => {
    if (phase !== "covered" || !pendingHref.current) return;
    router.push(pendingHref.current, { scroll: false });
  }, [phase, router]);

  useEffect(() => {
    if (phase !== "idle" || !pendingHref.current) return;
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(beginCover);
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [beginCover, phase]);

  useEffect(() => {
    if (phase === "revealing" || phase === "idle") window.__lenis?.start();
  }, [phase]);

  useEffect(
    () => () => {
      clearSafetyTimer();
      if (arriveTimer.current !== null) window.clearTimeout(arriveTimer.current);
      document.documentElement.removeAttribute("data-route-arrive");
      window.__lenis?.start();
    },
    [clearSafetyTimer],
  );

  const onCurtainTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "transform") return;
    if (!(event.target as HTMLElement).classList.contains("cq-route-curtain-panel")) return;

    if (phase === "covering") {
      setPhase(pendingHref.current ? "covered" : "revealing");
      return;
    }

    if (phase === "revealing") setPhase("idle");
  };

  return (
    <RouteTransitionContext.Provider value={navigate}>
      {children}
      <div
        ref={curtainRef}
        aria-hidden
        className="cq-route-curtain"
        data-phase={phase}
        onTransitionEnd={onCurtainTransitionEnd}
      >
        <span className="cq-route-curtain-panel" />
        <span className="cq-route-curtain-mark" />
      </div>
    </RouteTransitionContext.Provider>
  );
}
