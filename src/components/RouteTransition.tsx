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
// Lives in about/motion.ts because that is where the pattern first came up;
// it is a plain React helper with no About-specific behaviour, so it is
// borrowed here rather than redeclared.
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
  /* True between a back/forward press and the reveal that answers it. */
  const traversing = useRef(false);
  const curtainRef = useRef<HTMLDivElement>(null);

  const clearSafetyTimer = useCallback(() => {
    if (safetyTimer.current !== null) {
      window.clearTimeout(safetyTimer.current);
      safetyTimer.current = null;
    }
  }, []);

  const beginCover = useCallback(() => {
    // Freeze the outgoing page for the whole handoff. Lenis's own
    // `stopInertiaOnNavigate` only hooks Next's <Link>, and LocalizedLink
    // preventDefaults and pushes programmatically — so without this the
    // click's momentum survives the route change and drags the new page away
    // from the top right after the scroll reset.
    window.__lenis?.stop();
    setPhase("covering");

    clearSafetyTimer();
    safetyTimer.current = window.setTimeout(() => {
      pendingHref.current = null;
      setPhase("revealing");
    }, 8000);
  }, [clearSafetyTimer]);

  /* ── Back/forward ─────────────────────────────────────────────────────
     A traversal cannot have the curtain's entry leg, and no amount of
     cleverness changes that: by the time `popstate` fires the browser has
     already committed the history entry and the router is rendering the
     destination. Sweeping a blade in over the next 520ms would sweep it in
     over the page that has ALREADY arrived — the reader would watch the new
     route get covered up and then uncovered, which is worse than the hard
     cut it was meant to replace.

     So the ink lands instantly and the pass keeps the half it can honour:
     the reveal. Instant here means instant — written straight to the DOM
     rather than only through state, because `popstate` runs its handlers
     before the next paint and a React update can land a frame later. One
     frame is exactly long enough to see the destination flash. */
  const coverForTraversal = useCallback(() => {
    curtainRef.current?.setAttribute("data-phase", "covered");
    setPhase("covered");

    clearSafetyTimer();
    // Far shorter than the 8s click backstop: a traversal is served out of
    // the router cache, so the commit is normally the very next frame and
    // this never fires. It exists for the one case the pathname effect
    // cannot catch — a traversal between two history entries of the same
    // route — where without it the screen would simply stay covered.
    safetyTimer.current = window.setTimeout(() => {
      traversing.current = false;
      setPhase("revealing");
    }, 1000);
  }, [clearSafetyTimer]);

  useEffect(() => {
    const onPopState = () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // Hash movement and same-route state belong to Lenis and to Next, not
      // to a full route curtain. `location` is already updated by the time
      // popstate fires, so this compares the destination, not the origin.
      if (window.location.pathname === previousPathname.current) return;

      // A traversal supersedes anything a click had queued: the browser has
      // decided where we are going and it is not that.
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

      // A click that lands mid-handoff is honoured rather than swallowed — the
      // newest destination always wins — but it never turns the blade around.
      // Mid-cover it is already travelling the right way and the covered phase
      // will push whatever is pending by then; mid-reveal it finishes leaving
      // and the queue below re-enters it from the left.
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

  const resetScroll = useCallback((href: string) => {
    const target = new URL(href, window.location.href);
    const hash = decodeURIComponent(target.hash.slice(1));
    const destination = hash ? document.getElementById(hash) : null;

    if (destination) {
      // Lenis derives its scrollable height from a ResizeObserver, which
      // hasn't necessarily run yet at this point — scrolling against a
      // stale/undersized height (still the OUTGOING page's, or the
      // incoming one measured before its full content settled) clamps the
      // target short on a hash deep down a tall page. Forcing a synchronous
      // remeasure first is what `resize()` is for.
      window.__lenis?.resize();
      window.__lenis?.scrollTo(destination, { immediate: true, force: true });
      if (!window.__lenis) destination.scrollIntoView();
      return;
    }

    if (window.__lenis) {
      // `force` because Lenis is stopped at this point and would otherwise
      // ignore the instruction outright.
      window.__lenis.scrollTo(0, { immediate: true, force: true });
      return;
    }

    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    root.style.scrollBehavior = previousBehavior;
  }, []);

  // Before paint, not after: the back/forward fade has to be committed in
  // the same frame the new route first renders, or there is a visible frame
  // at full opacity. The scroll reset queues from here too but doesn't fire
  // until a couple of frames later — see the comment further down.
  useIsomorphicLayoutEffect(() => {
    if (previousPathname.current === pathname) return;
    const drivenByClick = phase === "covered" && pendingHref.current !== null;
    const drivenByTraversal = phase === "covered" && traversing.current;
    previousPathname.current = pathname;

    if (!drivenByClick && !drivenByTraversal) {
      // Anything that reached the router without going through a link or the
      // history buttons — a redirect, a programmatic push from outside this
      // provider. The browser has already committed, so there is no chance to
      // cover first. A short fade beats a hard cut. Reduced motion also lands
      // here, which is the point: no blade, just the fade.
      const root = document.documentElement;
      root.removeAttribute("data-route-arrive");
      void root.offsetWidth; // restart the animation on repeated back presses
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
      // A traversal keeps whatever offset the browser restored for that
      // history entry — landing a back press at the top of the page would
      // lose the reader's place, which is the one thing back is for.
      traversing.current = false;
    }

    // Let the new route finish layout behind the opaque curtain before it is
    // revealed. Two frames avoid exposing an intermediate streamed layout —
    // and the scroll reset now rides along on the SECOND one rather than
    // firing synchronously up front, for the same reason: give the new
    // route's content (and Lenis's own remeasure) a couple of frames to
    // exist before anything tries to scroll to a spot inside it.
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

  // Belt and braces for the traversal path: whatever route the reveal was
  // started by, the flag must not survive into the next navigation.
  useEffect(() => {
    if (phase === "idle") traversing.current = false;
  }, [phase]);

  useEffect(() => {
    if (phase !== "covered" || !pendingHref.current) return;
    router.push(pendingHref.current, { scroll: false });
  }, [phase, router]);

  // A destination queued by a click that arrived mid-reveal. The blade has now
  // finished leaving and is parked back on the left, so the next pass can
  // start. Two frames: the parked transform has to be committed on its own
  // before the covering transition begins, or the blade animates from wherever
  // it happened to be rather than from the left.
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

  // Scroll is handed back the moment the reveal starts, not when it ends: the
  // new page is committed and sitting at the top by then, so a wheel event
  // during the wipe is intentional rather than leftover momentum.
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

  // The blade is the only thing that transitions; its transitionend bubbles up
  // here and drives both legs of the pass. `covering` ending with nothing
  // pending (the safety timeout fired) skips straight to sweeping back out.
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
