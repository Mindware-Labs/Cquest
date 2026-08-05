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
import Image from "next/image";
import ServiceIcon from "@/components/services/ServiceIcon";
import { useI18n } from "@/i18n/I18nProvider";
import { CQ_EASE, gsap } from "@/lib/gsap";
import ParticleLogo from "@/components/ui/ParticleLogo";
import AnimatedBeam from "./AnimatedBeam";
import { ABOUT_SECTORS } from "./data";
import { REVEAL_START, useIsomorphicLayoutEffect } from "./motion";
import styles from "./SectorsBeam.module.css";

const COPY = {
  en: {
    hub: "Center Quest",
    /* The resting panel. `standing` is the pull quote that used to sit in a
       box beside this figure as a conclusion drawn from prose nobody had to
       read; here it is what the operation answers before you ask about any
       one sector, which is both truer and gives the panel content at rest. */
    standing: "People who know the rules. Process that gets measured. Reporting that hides nothing.",
    prompt: "Select a sector to see what it demands",
    servicesLabel: "Services that answer it",
    caption: (sectors: string) =>
      `Diagram: the five sectors Center Quest specializes in — ${sectors} — each running into one shared operation.`,
  },
  es: {
    hub: "Center Quest",
    standing: "Gente que conoce las reglas. Procesos que se miden. Reportes que no esconden nada.",
    prompt: "Selecciona un sector para ver qué exige",
    servicesLabel: "Servicios que lo atienden",
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
  /* Takes `null` as well: closing a sector is a content swap, not a
     disappearance — the panel returns to its standing statement and that
     arrives on the same iris, struck from the centre instead of from a node. */
  const revealRef = useRef<(index: number | null) => void>(() => {});

  /* ── Click, not hover ────────────────────────────────────────────────
     This was open-on-mouseenter, close-on-mouseleave, and that could work
     only while the panel sat directly under the ring: the pointer never had
     to leave the diagram to read the answer. With the panel beside the
     figure, hover-to-open is unusable — the moment you move toward what you
     opened, it shuts. A click selects and the selection stays until you pick
     another or press the same one again.

     Focus no longer opens either. Keyboard reaches these through Enter or
     Space, which fire click; auto-opening on focus would mean tabbing across
     the ring flicks five different answers through the panel on the way to
     whatever the visitor was actually heading for. */
  const toggle = useCallback((index: number) => {
    setActiveIndex((current) => (current === index ? null : index));
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
      revealRef.current = (index: number | null) => {
        const panel = document.getElementById(detailId);
        if (!panel) return;

        /* Origin on the panel's own box, aimed at the node that opened it.
           The panel now sits BESIDE the ring, not under it, so the axes swap
           from the previous version: every node is to the panel's left, which
           pins the horizontal component to the leading edge and leaves the
           vertical one tracking the ring. Feeding `cos` into x here — as the
           under-the-stage version had to — would strike every iris from the
           same point and throw away the one thing the geometry is carrying.

           Closing strikes from the centre: nothing on the ring sent it, so
           there is no side for it to arrive from. */
        const originX = index === null ? 50 : 0;
        const originY = index === null ? 50 : 50 + RING[index].sin * 42;
        const parts = gsap.utils.toArray<HTMLElement>(":scope > *", panel);
        /* Held back so the iris opens as the pulse ARRIVES, not before it has
           left the node. Closing sends no pulse, so it waits for nothing. */
        const lead = index === null ? 0 : PULSE_DURATION * 0.45;

        gsap.killTweensOf([panel, ...parts]);
        gsap.fromTo(
          panel,
          { clipPath: `circle(0% at ${originX}% ${originY}%)`, scale: 0.985 },
          {
            clipPath: `circle(150% at ${originX}% ${originY}%)`,
            scale: 1,
            duration: 0.52,
            ease: "power3.out",
            delay: lead,
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
            delay: lead + 0.14,
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
        // The panel lives outside `stage` now — it is the other half of the
        // split — so it is reached by id rather than by querying the stage.
        const panel = document.getElementById(detailId);
        gsap.killTweensOf([...lights, hubGlow, ...(panel ? [panel, ...panel.children] : [])]);
      };
    }, containerRef);

    return () => ctx.revert();
  }, [reduced, measured, detailId]);

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

  /* ── The handover ────────────────────────────────────────────────────
     Timed off `fieldActive`, not off mount: the cloud only starts gathering
     when the figure is on screen, so an image faded in on a page-load clock
     would already be sitting there by the time anyone scrolled down to watch
     it assemble. Latched — once the mark is up it stays up, however the gate
     moves afterwards. Reduced motion skips straight to it; there is no
     assembly for that reader to wait out. */
  const [settled, setSettled] = useState(false);
  /* Derived, not stored: reduced motion has no assembly to wait out, so the
     mark is simply up from the first render — putting that through state
     would be a second render to say something the first render already
     knew. Only the timer needs state, and only ever once. */
  const markShown = reduced || settled;
  useEffect(() => {
    if (reduced || settled || !fieldActive) return;
    const timer = window.setTimeout(() => setSettled(true), 1450);
    return () => window.clearTimeout(timer);
  }, [reduced, settled, fieldActive]);

  /* Deliberately a passive effect, not a call inside `toggle`: the panel's
     content is rendered from `activeIndex`, so it only exists to be animated
     after React has committed that render — and a state updater is not a
     place to fire side effects from, since React is free to run it twice.
     Closing runs through here too: the panel is never empty now, it falls
     back to its standing statement, so the close is a content swap like any
     other rather than a disappearance. */
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (activeIndex !== null) pulseRef.current(activeIndex);
    revealRef.current(activeIndex);
  }, [activeIndex]);

  const sectorList = ABOUT_SECTORS.map((sector) => sector.label[lang]).join(", ");

  return (
    /* ── The split ────────────────────────────────────────────────────────
       Map left, answer right. The panel used to open in a 10.5rem band
       reserved below the stage, which meant the section had to be tall
       enough for a figure AND its detail stacked — and on a laptop that put
       the answer under the fold, so clicking a sector scrolled you away from
       the thing you had just clicked. Side by side, the whole exchange fits
       in one view: you point at a sector and read what it demands without
       the page moving at all. */
    <figure
      className={styles.beamFigure}
      onKeyDown={(event) => {
        if (event.key === "Escape") setActiveIndex(null);
      }}
    >
      <div ref={containerRef} className={styles.beamStage}>
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
            desktop box that is ~18.4px per unit, so 11 draws a circle of
            about 202px: still outside the top and bottom nodes, passing
            behind the wide side labels, and reaching only ~12px past the
            stage — which is what keeps it out of the paragraph above. The
            phone box is shorter, so the same job needs a larger number.

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
            /* ── One number, both breakpoints ──────────────────────────
               This was `ringRadius={fieldCompact ? 14.7 : 11}` in world
               units, and world units cannot survive a layout change: the
               camera is fixed, so the canvas always shows ~31.5 units of
               height however many pixels tall it is. 11 drew a 202px circle
               in the old 578px-tall box and something else entirely in every
               box since — which is exactly what happened when this figure
               moved into a column and the ring came apart into a scatter.

               `ringScale` is a fraction of the canvas's own half-height, so
               the formation is proportional by construction. 0.7 reproduces
               the circle these radii were originally tuned to — just outside
               the top and bottom sectors, passing behind the wide side
               labels — and now keeps reproducing it at any width, on either
               stage aspect, which is why the phone no longer needs a number
               of its own. */
            ringScale={0.7}
            /* Reach is what makes this read, and the first two attempts got
               it wrong. A `pullRadius` close to the ring's own radius only
               ever claims particles that were already beside the pointer, so
               local density barely moved — measurable, but not visible. At 24
               world units the reach covers most of the field, so magnetic
               particles cross the circle to get there and the arc they leave
               visibly thins. `pullOrbit` is the size of the knot they gather
               into; too tight and they stack into a blob instead of orbiting.
               Half stay behind, which is what keeps a circle to come back to. */
            pullShare={0.45}
            pullStrength={0.95}
            pullRadius={45}
            pullOrbit={5}
            waveSpeed={0.4}
            waveAmplitude={1}
            particleSize={1.2}
            lerpSpeed={0.05}
            color="#74c3d5"
            particleVariance={1}
            /* ── Why the band was reaching the top of the section ────────
               The ring's own radius is right — it passes through the side
               sectors, which is where it was designed to sit. What overshot
               was the SPREAD around it, and it came from two places that
               compound:

                 • `fieldStrength` sets the radial scatter (5 / strength), so
                   3 was throwing particles ±36px off the ring;
                 • `depthFactor` 1 gave them ±10 world units of z, and a
                   perspective camera turns that into a ±25% swing in
                   apparent radius — on a 251px ring, another ±60px.

               Together the cloud ran to ~360px where the ring is at 251, and
               the top of that reached out of the figure and into the heading
               above it. 4.5 and 0.55 halve both terms: the band still has
               real thickness — it must, or it reads as a drawn circle rather
               than a field — but it now stays inside the figure's own box. */
            // A slow turn is what keeps a fixed ring alive; without it the
            // only motion left is the wave breathing in place.
            rotationSpeed={0.05}
            depthFactor={0.55}
            pulseSpeed={3}
            particleShape="capsule"
            // Still looser than upstream's default — the ring has to read as
            // a band, not as a drawn circle — but no longer loose enough to
            // throw its outer edge out of the figure. See the note above.
            fieldStrength={4.5}
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
                reach it — and a click, unlike the hover this used to run on,
                is an interaction every input method already has. */}
            <button
              type="button"
              className={styles.node}
              data-node=""
              aria-expanded={activeIndex === index}
              aria-controls={detailId}
              onClick={() => toggle(index)}
            >
              <span aria-hidden className={styles.nodeIcon}>
                <ServiceIcon name={sector.icon} />
              </span>
              <span className={styles.nodeLabel}>{sector.label[lang]}</span>
            </button>
          </div>
        ))}

        <div ref={hubRef} className={styles.hubAnchor}>
          <div className={styles.hub} data-hub="">
            <span aria-hidden ref={hubGlowRef} className={styles.hubGlow} />
            {/* ── The mark, in two layers ──────────────────────────────
                The cloud gathers the lockup out of the same celeste the ring
                outside is made of, and the real asset resolves on top of it
                as it settles — the operation condensing from the industries
                around it, and then being itself.

                They are the same shape in the same box, so the handover
                reads as the mark coming into focus rather than as one thing
                being swapped for another. `resolved` retires the cloud once
                that happens — its loop stops and it fades out in step with
                the real asset fading in — rather than leaving it idling
                underneath forever, which used to read as a permanent, faint
                grain around the mark instead of a settled logo.

                `alt` carries the name, which is why there is no separate
                visually-hidden label. The canvas is decoration by then. */}
            <ParticleLogo
              active={fieldActive}
              reduced={reduced}
              resolved={markShown}
              className={styles.hubCloud}
            />
            <Image
              src="/logo.png"
              alt={t.hub}
              width={692}
              height={512}
              className={styles.hubMark}
              data-shown={markShown ? "" : undefined}
            />
          </div>
        </div>
      </div>

      {/* ── The answer ─────────────────────────────────────────────────────
          One panel, and it is never empty. A detail surface that only exists
          once you have interacted is a hole in the composition for as long
          as nobody has — and this one is half the row, so the hole would be
          the first thing anyone sees. At rest it carries the operation's own
          standing statement; selecting a sector replaces it with what that
          sector demands and which of our lines answer it.

          No `aria-hidden` any more, and no `visibility` gate: the panel is
          always meaningful content, so it belongs in the accessibility tree
          whether or not a sector is open. */}
      <div className={styles.detailColumn}>
        <div
          id={detailId}
          className={styles.detail}
          data-panel=""
          data-resting={active ? undefined : ""}
          aria-live="polite"
        >
          {active ? (
            <>
              <span aria-hidden className={styles.detailIcon}>
                <ServiceIcon name={active.icon} />
              </span>
              <p className={styles.detailTitle}>{active.label[lang]}</p>
              <p className={styles.detailFocus}>{active.focus[lang]}</p>
              <p className={styles.detailServicesLabel}>{t.servicesLabel}</p>
              <ul className={styles.detailServices}>
                {active.services[lang].map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <span aria-hidden className={styles.detailQuoteMark}>
                &ldquo;
              </span>
              <p className={styles.detailStanding}>{t.standing}</p>
              <p className={styles.detailPrompt}>{t.prompt}</p>
            </>
          )}
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
