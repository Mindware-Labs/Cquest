"use client";

import {
  createRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import dynamic from "next/dynamic";
import ServiceIcon from "@/components/services/ServiceIcon";
import { useI18n } from "@/i18n/I18nProvider";
import { CQ_EASE, gsap } from "@/lib/gsap";
import AnimatedBeam from "./AnimatedBeam";
import { ABOUT_SECTORS } from "./data";
import { REVEAL_START, useIsomorphicLayoutEffect } from "./motion";
import styles from "./SectorsBeam.module.css";

const COPY = {
  en: {
    hub: "Center Quest",
    caption: (sectors: string) =>
      `Diagram: the five sectors Center Quest specializes in — ${sectors} — each running into one shared operation.`,
  },
  es: {
    hub: "Center Quest",
    caption: (sectors: string) =>
      `Diagrama: los cinco sectores en los que Center Quest se especializa — ${sectors} — cada uno confluyendo en una misma operación.`,
  },
};

/* three + @react-three/fiber are around 200KB gzipped between them — more
   than the rest of this page's JavaScript put together. Loading them from a
   separate chunk with `ssr: false` keeps them off the critical path entirely:
   the section is well below the fold, so the field arrives while the visitor
   is still reading the top of the page, and a visitor who never scrolls this
   far never pays for it at all. */
const Antigravity = dynamic(() => import("@/components/ui/Antigravity"), { ssr: false });

/* ── Ring geometry ────────────────────────────────────────
   The node positions used to be five hand-tuned percentages (7% / 88% / 89%
   / 24% / 12%), which is exactly what they looked like: a ring that was
   nearly regular and therefore read as slightly wrong.

   They are a true radial distribution now — 360° / 5 = 72° apart, starting
   at top dead centre and going clockwise — projected onto an ELLIPSE rather
   than a circle. That matters because the stage is not square: a circular
   distribution on a 16:10 box would squash the vertical spacing and put the
   two lower nodes closer together than the two upper ones. Sampling an
   ellipse whose radii are expressed as percentages of the stage's own width
   and height keeps the angular rhythm intact at any aspect ratio, which is
   what lets the mobile breakpoint simply change the radii (and the stage's
   aspect) without any of this being recomputed.

   Clockwise from the top is also the order the sequence builds in — Health,
   Banking, Retail, Telecommunications, Tourism — so the choreography reads
   as one hand sweeping the ring rather than jumping around it. */
const RING = ABOUT_SECTORS.map((_, index) => {
  const radians = ((index * 72 - 90) * Math.PI) / 180;
  return { cos: Math.cos(radians), sin: Math.sin(radians) };
});

/* ── Choreography ─────────────────────────────────────────
   The section's claim is an operations centre: five industries, one core.
   The build states that literally, in seconds from the moment the figure
   reaches the viewport:

     0.00 – 0.95   the core arrives alone, on a soft elastic. Nothing else
                   exists yet; the system is booting.
     0.50 – 2.05   five connections, 0.20s apart, each drawn OUT of the hub
                   rather than into it — the core is reaching for its
                   industries, not being assembled from them.
     (per spoke)   an energy pulse rides the line as it draws, and the sector
                   lands as the pulse arrives. The connection is what causes
                   the sector to appear, which is the whole point.

   Then it stops. What follows is an idle so small it reads as the figure
   being alive rather than the figure animating, and it is triple-gated (see
   the effect below) because this project has already paid for a bug where
   ambient motion kept running off-screen and on a hidden tab. */
const CORE_DURATION = 0.95;
const SPOKE_START = 0.5;
const SPOKE_STAGGER = 0.2;
const DRAW_DURATION = 0.55;
const NODE_DURATION = 0.5;

/**
 * Length of the travelling dash, in px. Short enough to read as a spark
 * rather than a segment of the line it is riding.
 */
const LIGHT_LENGTH = 26;

/** Hover pulse — the same energy, replayed on demand, faster. */
const PULSE_DURATION = 0.55;

export default function SectorsBeam({ reduced }: { reduced: boolean }) {
  const { lang } = useI18n();
  const t = COPY[lang];

  const containerRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const hubGlowRef = useRef<HTMLSpanElement>(null);
  const ambientRef = useRef<HTMLSpanElement>(null);
  // Created once: AnimatedBeam takes this array as an effect dependency, so a
  // fresh array per render would re-run the measurement pass on every hover.
  const spokeRefs = useMemo(() => ABOUT_SECTORS.map(() => createRef<HTMLDivElement>()), []);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [measured, setMeasured] = useState(false);
  const [fieldActive, setFieldActive] = useState(false);
  const [fieldCompact, setFieldCompact] = useState(false);

  const detailId = useId();
  const active = activeIndex === null ? null : ABOUT_SECTORS[activeIndex];

  // Idempotent, and stable across renders so it never re-triggers the
  // measurement effect it is passed to.
  const handleMeasure = useCallback(() => setMeasured(true), []);

  /**
   * Replays the energy pulse on one connection. Held in a ref rather than
   * rebuilt per render because the hover handlers below close over it, and
   * because it must be a no-op until the timeline effect has installed it.
   */
  const pulseRef = useRef<(index: number) => void>(() => {});
  const revealRef = useRef<(index: number) => void>(() => {});

  const open = useCallback((index: number) => {
    setActiveIndex(index);
    pulseRef.current(index);
  }, []);

  // Guarded against the index that is leaving no longer being the open one:
  // moving a pointer straight from one node to the next fires the incoming
  // `enter` before the outgoing `leave`, and an unguarded close would shut
  // the panel that just opened.
  const close = useCallback((index: number) => {
    setActiveIndex((current) => (current === index ? null : current));
  }, []);

  useIsomorphicLayoutEffect(() => {
    const stage = containerRef.current;
    // Reduced motion never leaves the resting state, which is also what the
    // server rendered: a finished diagram, no draw, no glow, no travelling
    // light, no idle. `measured` gates on the beam layer having published
    // real geometry — tweening a zero-length path would silently no-op and
    // the spokes would simply be present instead of drawing.
    if (reduced || !stage || !measured) return;

    let sequenceDone = false;
    let onScreen = false;

    const ctx = gsap.context(() => {
      const spokes = gsap.utils.toArray<SVGPathElement>("[data-spoke]", stage);
      const lights = gsap.utils.toArray<SVGPathElement>("[data-light]", stage);
      const nodes = gsap.utils.toArray<HTMLElement>("[data-node]", stage);
      // The card, not the anchor `hubRef` points at: the anchor carries the
      // centring translate and must stay out of GSAP's hands (see the JSX).
      const hub = stage.querySelector<HTMLElement>("[data-hub]");
      const hubGlow = hubGlowRef.current;
      if (!hub || !hubGlow || spokes.length !== ABOUT_SECTORS.length) return;

      // Measured from the DOM rather than threaded through props: these are
      // straight segments, so getTotalLength is exact, and reading it here
      // keeps the single source of truth in the element that owns the path.
      const lengths = spokes.map((spoke) => spoke.getTotalLength());

      // The `from` state is written before paint (useIsomorphicLayoutEffect),
      // so the finished diagram the server sent is never seen flashing.
      gsap.set(hub, { autoAlpha: 0, scale: 0.82 });
      gsap.set(hubGlow, { autoAlpha: 0, scale: 0.9 });
      gsap.set(nodes, { autoAlpha: 0, y: 12, scale: 0.94 });
      spokes.forEach((spoke, index) => gsap.set(spoke, { strokeDashoffset: lengths[index] }));
      lights.forEach((light, index) =>
        gsap.set(light, {
          opacity: 0,
          strokeDasharray: `${LIGHT_LENGTH} ${lengths[index]}`,
          strokeDashoffset: LIGHT_LENGTH,
        }),
      );

      const idle = gsap.timeline({ repeat: -1, yoyo: true, paused: true });
      idle
        // Transform and opacity only, on exactly two elements. Everything
        // else in the figure is genuinely static once the build lands.
        .to(hub, { y: -3, duration: 3.4, ease: "sine.inOut" }, 0)
        .to(hubGlow, { autoAlpha: 0.55, scale: 1.05, duration: 3.4, ease: "sine.inOut" }, 0);

      const drift = gsap.to(ambientRef.current, {
        xPercent: 2,
        yPercent: -2,
        duration: 26,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        paused: true,
      });

      /* Gate 1 viewport, gate 2 tab visibility, gate 3 the sequence having
         finished. All three must hold, or the idle is paused outright rather
         than left running against a hidden compositor. */
      const syncIdle = () => {
        const run = sequenceDone && onScreen && document.visibilityState === "visible";
        if (run) {
          idle.play();
          drift.play();
        } else {
          idle.pause();
          drift.pause();
        }
      };

      const tl = gsap.timeline({
        defaults: { ease: CQ_EASE },
        // One trigger for the whole figure, fired once. An arrival that
        // replays every time the section scrolls back past is a loop wearing
        // a different hat.
        scrollTrigger: { trigger: stage, start: REVEAL_START, once: true },
        onComplete: () => {
          sequenceDone = true;
          syncIdle();
        },
      });

      // Beat 1 — the core, alone. Gentle elastic: enough give to read as
      // something settling into place, nowhere near a bounce.
      tl.to(hub, { autoAlpha: 1, scale: 1, duration: CORE_DURATION, ease: "elastic.out(1, 0.85)" }, 0)
        .to(hubGlow, { autoAlpha: 1, scale: 1, duration: 0.8 }, 0.1);

      // Beats 2-6 — one connection at a time, each carrying its sector in.
      spokes.forEach((spoke, index) => {
        const at = SPOKE_START + index * SPOKE_STAGGER;
        const arrival = at + DRAW_DURATION;

        tl.to(spoke, { strokeDashoffset: 0, duration: DRAW_DURATION, ease: "power2.inOut" }, at)
          .set(lights[index], { opacity: 1, strokeDashoffset: LIGHT_LENGTH }, at)
          .to(
            lights[index],
            { strokeDashoffset: -lengths[index], duration: DRAW_DURATION, ease: "power2.inOut" },
            at,
          )
          .set(lights[index], { opacity: 0 }, arrival)
          // Overlapped by 60ms so the sector is already on its way up as the
          // pulse lands, rather than waiting a beat behind it.
          .to(
            nodes[index],
            { autoAlpha: 1, y: 0, scale: 1, duration: NODE_DURATION, ease: "power3.out" },
            arrival - 0.06,
          );
      });

      const observer = new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting;
          syncIdle();
        },
        { threshold: 0.15 },
      );
      observer.observe(stage);
      document.addEventListener("visibilitychange", syncIdle);

      /* The entry pulse runs hub → node: the core reaching out. This one runs
         the other way. Asking about a sector sends its signal INTO the
         operation, and what comes back is the panel — so the pulse is not
         decoration around the interaction, it is the thing that delivers it. */
      pulseRef.current = (index: number) => {
        const light = lights[index];
        if (!light) return;
        // Killed rather than queued: a pointer sweeping the ring would
        // otherwise stack five pulses and play them back in sequence.
        gsap.killTweensOf(light);
        gsap.set(light, { opacity: 1, strokeDashoffset: -lengths[index] });
        gsap.to(light, {
          strokeDashoffset: LIGHT_LENGTH,
          duration: PULSE_DURATION,
          // Accelerating inward — it is arriving somewhere, not drifting.
          ease: "power2.in",
          onComplete: () => gsap.set(light, { opacity: 0 }),
        });
        // The core takes the hit a beat after the signal lands on it.
        gsap.killTweensOf(hubGlow, "scale");
        gsap.fromTo(
          hubGlow,
          { scale: 1 },
          {
            scale: 1.14,
            duration: 0.22,
            delay: PULSE_DURATION * 0.62,
            ease: "power2.out",
            yoyo: true,
            repeat: 1,
          },
        );
      };

      /* The panel does not fade in — it opens as an iris struck from the side
         the signal came from, so the geometry of the reveal carries the same
         information as the pulse. Run from an effect rather than inline with
         the pulse because React has to commit the new content first; querying
         the children synchronously would animate the previous sector's. */
      revealRef.current = (index: number) => {
        const panel = stage.querySelector<HTMLElement>("[data-panel]");
        if (!panel) return;

        // Origin on the panel's own box, aimed at the node that opened it.
        const originX = 50 + RING[index].cos * 52;
        const originY = 50 + RING[index].sin * 52;
        const parts = gsap.utils.toArray<HTMLElement>(":scope > *", panel);

        gsap.killTweensOf([panel, ...parts]);
        gsap.fromTo(
          panel,
          { clipPath: `circle(0% at ${originX}% ${originY}%)`, scale: 0.96 },
          {
            clipPath: `circle(150% at ${originX}% ${originY}%)`,
            scale: 1,
            duration: 0.52,
            ease: "power3.out",
            // Held back so the iris opens as the pulse arrives, not before
            // it has left the node.
            delay: PULSE_DURATION * 0.45,
          },
        );
        gsap.fromTo(
          parts,
          { autoAlpha: 0, y: 12 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.42,
            stagger: 0.07,
            ease: "power3.out",
            delay: PULSE_DURATION * 0.45 + 0.14,
          },
        );
      };

      return () => {
        observer.disconnect();
        document.removeEventListener("visibilitychange", syncIdle);
        pulseRef.current = () => {};
        revealRef.current = () => {};
        // Tweens the pulse and the panel reveal created after the context was
        // recorded are not tracked by it, so they are killed explicitly here.
        const panel = stage.querySelector<HTMLElement>("[data-panel]");
        gsap.killTweensOf([...lights, hubGlow, ...(panel ? [panel, ...panel.children] : [])]);
      };
    }, containerRef);

    return () => ctx.revert();
  }, [reduced, measured]);

  /* The field's own gate, in React state because it has to reach the Canvas
     as a prop. Same three conditions as every other ambient layer here, and
     it matters more for this one than for any of them: parked means React
     Three Fiber's render loop is stopped outright, so an off-screen section
     is not quietly driving a WebGL context and 300 instanced meshes. */
  useEffect(() => {
    const stage = containerRef.current;
    if (reduced || !stage) return;

    const compactQuery = window.matchMedia("(max-width: 48rem)");
    let onScreen = false;

    const sync = () => {
      setFieldActive(onScreen && document.visibilityState === "visible");
      setFieldCompact(compactQuery.matches);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0.1 },
    );
    observer.observe(stage);
    document.addEventListener("visibilitychange", sync);
    compactQuery.addEventListener("change", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      compactQuery.removeEventListener("change", sync);
      setFieldActive(false);
    };
  }, [reduced]);

  /* Deliberately a passive effect, not a call inside `open`: the panel's
     content is rendered from `activeIndex`, so it only exists to be animated
     after React has committed that render. */
  useEffect(() => {
    if (activeIndex === null) return;
    revealRef.current(activeIndex);
  }, [activeIndex]);

  const sectorList = ABOUT_SECTORS.map((sector) => sector.label[lang]).join(", ");

  return (
    <figure className={styles.beamFigure}>
      <div
        ref={containerRef}
        className={styles.beamStage}
        data-detail={activeIndex === null ? undefined : ""}
        onMouseLeave={() => setActiveIndex(null)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setActiveIndex(null);
        }}
      >
        <span aria-hidden ref={ambientRef} className={styles.beamAmbient} />

        {/* Behind the spokes, in front of the ambient wash.

            `followPointer={false}` pins the formation to the centre of the
            canvas, which is the hub — so the field orbits the diagram rather
            than chasing the cursor, and hovering a sector no longer drags the
            whole ring off to one side.

            `magnetRadius` is set past the far corner of the field on purpose.
            Upstream uses it as a capture radius around the pointer, so only
            the particles near it join the ring; here every particle should be
            in the formation, and a radius larger than the seeding area is
            what guarantees none are left drifting at scale zero.

            The two radii are EQUAL, which is what makes it read as a circle:
            world units are isotropic, so any difference between them shows up
            on screen as an ellipse. The size then comes from the field box
            (see `.field` in the stylesheet), since the camera is fixed and
            the canvas always shows ~31.5 world units of height. At the
            squared-off desktop box that is ~19.3px per unit, so 12 draws a
            circle of about 232px — clear of the top and bottom nodes, and
            passing behind the wide side labels. The phone box is shorter, so
            the same job needs a larger number there.

            Half the count on a phone — 300 instanced capsules is a different
            proposition on a mid-range Android than on a laptop GPU. */}
        {!reduced && (
          <Antigravity
            className={styles.field}
            eventSource={containerRef}
            active={fieldActive}
            followPointer={false}
            count={fieldCompact ? 140 : 300}
            magnetRadius={60}
            ringRadius={fieldCompact ? 14.7 : 12}
            ringRadiusY={fieldCompact ? 14.7 : 12}
            // Over half answer the pointer now, with a wider reach and a
            // tighter orbit: the first pass was accurate but too polite to
            // notice. The rest still hold the circle.
            pullShare={0.55}
            pullStrength={0.95}
            pullRadius={15}
            pullOrbit={2.5}
            waveSpeed={0.4}
            waveAmplitude={1}
            particleSize={1.2}
            lerpSpeed={0.05}
            color="#74c3d5"
            particleVariance={1}
            // A slow turn is what keeps a fixed ring alive; without it the
            // only motion left is the wave breathing in place.
            rotationSpeed={0.05}
            depthFactor={1}
            pulseSpeed={3}
            particleShape="capsule"
            // Looser than upstream's default so the ring reads as a band with
            // thickness rather than a drawn circle.
            fieldStrength={3}
          />
        )}

        <AnimatedBeam
          containerRef={containerRef}
          hubRef={hubRef}
          spokeRefs={spokeRefs}
          activeIndex={activeIndex}
          onMeasure={handleMeasure}
        />

        {/* Two elements per sector, and the split is load-bearing. The anchor
            owns POSITION — the ring maths and the -50% centring offset — and
            GSAP never touches it. The button inside owns the ENTRY, which is
            the only thing GSAP animates.

            They cannot be one element. GSAP absorbs an element's `translate`
            property into its own transform and writes `translate: none` back,
            resolving the -50% against whatever the box measured at that
            instant. Any later size change — a web font landing, a label
            rewrapping to two lines — leaves that absorbed offset stale, and
            the node ends up mis-centred by half the difference. It also meant
            a `translate` written here for the hover lift was dead on arrival,
            outranked by GSAP's own inline declaration. */}
        {ABOUT_SECTORS.map((sector, index) => (
          <div
            key={sector.id}
            ref={spokeRefs[index]}
            className={styles.nodeAnchor}
            data-state={activeIndex === null ? undefined : activeIndex === index ? "active" : "muted"}
            style={
              {
                "--cos": RING[index].cos.toFixed(4),
                "--sin": RING[index].sin.toFixed(4),
              } as CSSProperties
            }
          >
            {/* A button, not a div with a hover handler. These nodes used to
                be inert text and were deliberately left out of the tab order;
                now that opening one reveals copy that exists nowhere else on
                the page, keyboard and assistive-tech users have to be able to
                reach it. Focus opens the same panel hover does. */}
            <button
              type="button"
              className={styles.node}
              data-node=""
              aria-expanded={activeIndex === index}
              aria-controls={detailId}
              onMouseEnter={() => open(index)}
              onFocus={() => open(index)}
              onMouseLeave={() => close(index)}
              onBlur={() => close(index)}
            >
              <span aria-hidden className={styles.nodeIcon}>
                <ServiceIcon name={sector.icon} />
              </span>
              <span className={styles.nodeLabel}>{sector.label[lang]}</span>
            </button>
          </div>
        ))}

        {/* One panel, centred, rather than five anchored to their nodes. A
            panel glued to its node has to flip sides per quadrant and still
            overflows the stage at the narrow end, and there is no position
            that works for all five at 343px. Centred is the one placement
            that is correct at every width, and dimming the ring behind it
            makes the swap read as focus rather than as an overlay. */}
        <div className={styles.detailAnchor} data-open={activeIndex === null ? undefined : ""}>
          <div id={detailId} className={styles.detail} data-panel="" aria-hidden={activeIndex === null}>
            {active && (
              <>
                <p className={styles.detailTitle}>{active.label[lang]}</p>
                <p className={styles.detailFocus}>{active.focus[lang]}</p>
                <ul className={styles.detailServices}>
                  {active.services[lang].map((service) => (
                    <li key={service}>{service}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <div ref={hubRef} className={styles.hubAnchor}>
          <div className={styles.hub} data-hub="">
            <span aria-hidden ref={hubGlowRef} className={styles.hubGlow} />
            <span className={styles.hubText}>{t.hub}</span>
          </div>
        </div>
      </div>
      {/* The nodes are real text inside real buttons, so a screen reader gets
          the five sector names in ring order and can expand any of them; this
          caption supplies the thing the layout carries that the text alone
          does not — that they all converge on one operation.

          The buttons were plain text until they had something to reveal. The
          earlier reasoning still holds for what it covered: five no-op tab
          stops buy a keyboard user nothing. What changed is that the panel
          carries copy found nowhere else on the page, and content reachable
          only by pointer is not content everyone has. */}
      <figcaption className={styles.beamCaption}>{t.caption(sectorList)}</figcaption>
    </figure>
  );
}
