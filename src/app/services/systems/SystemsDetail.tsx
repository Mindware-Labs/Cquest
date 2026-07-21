"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { useRef, type ReactNode } from "react";
import ServiceIcon from "@/components/services/ServiceIcon";
import { SERVICES } from "@/components/services/data";
import styles from "./systems.module.css";

const SYSTEMS = SERVICES.find((service) => service.id === "systems")!;

const MotionLink = motion.create(Link);

const CAPABILITY_DETAIL: Record<string, { includes: readonly string[]; benefit: string; shot: string }> = {
  CRMs: {
    includes: [
      "Customer and case management shaped to your actual workflow",
      "Views and permissions per role — not one-size-fits-all",
      "Integrations with the channels and tools you already use",
    ],
    benefit: "One system of record your team actually wants to use, because it works the way they do.",
    shot: "Custom CRM — case view",
  },
  Dashboards: {
    includes: [
      "Operational KPIs consolidated from your real data sources",
      "Live views for the floor, summaries for management",
      "Alerts when a number leaves its acceptable range",
    ],
    benefit: "Decisions made on today's numbers, not last month's report.",
    shot: "Operations dashboard — live KPIs",
  },
  "Operations automation": {
    includes: [
      "Repetitive workflows automated end to end",
      "Rules and exceptions encoded, so edge cases are handled — not dropped",
      "Human handoff points exactly where judgment is needed",
    ],
    benefit: "Hours of manual work become minutes, with fewer errors along the way.",
    shot: "Workflow builder — automation rules",
  },
  "AI Implementation": {
    includes: [
      "Use cases selected for measurable operational impact",
      "AI assistants and automation integrated into existing workflows",
      "Guardrails, evaluation and monitoring from day one",
    ],
    benefit: "AI that empowers your team and delights your customers — deployed responsibly.",
    shot: "AI assistant — agent console",
  },
};

const PROCESS = [
  { title: "Discovery", description: "We sit with the people who do the work and map how the operation actually runs — not how the org chart says it does." },
  { title: "Blueprint", description: "Screens, data model and integrations are designed and validated with your team before a single line of code is written." },
  { title: "Build", description: "Short cycles with working software at every step, so you see progress instead of waiting for a big reveal." },
  { title: "Launch", description: "Deployment, data migration and training handled with the operation running — the business never stops." },
  { title: "Iterate", description: "The system keeps evolving with your operation: new modules, refinements and support after go-live." },
] as const;

const COMMITMENTS = [
  { title: "Working software every cycle", description: "Progress you can click, in weekly builds — not a final reveal months later." },
  { title: "Code and data are yours", description: "Full ownership, documentation and handover. No lock-in to us or to anyone." },
  { title: "Support after go-live", description: "Launch is the midpoint, not the end — the system keeps evolving with the operation it serves." },
] as const;

/* ── Motion language ──────────────────────────────────────
   Same vocabulary as the other service pages — ease-out-quint, focus-pull
   reveals out of blur, curtain-lifted hero lines — arranged around this
   page's own scroll gesture: the product window tilts in perspective and
   flattens as you scroll, the deliverable settling onto the desk. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, margin: "-80px" } as const;

const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const focusRiseVariants: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE_OUT } },
};

// Blur-only reveal for elements owning a CSS hover transform, and for the
// window (whose transforms belong to the scroll-linked MotionValues).
const softRiseVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.85, ease: EASE_OUT } },
};

const ruleXVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.7, ease: EASE_OUT } },
};
const ruleYVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.7, ease: EASE_OUT } },
};

const stepVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const heroCopyVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const heroLinesVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11 } },
};
const heroCurtainVariants: Variants = {
  hidden: { y: "120%" },
  visible: { y: "0%", transition: { duration: 1.05, ease: EASE_OUT } },
};

const passThroughVariants: Variants = { hidden: {}, visible: {} };

const HERO_LINES = [
  { text: "Software shaped", strong: false },
  { text: "around how", strong: false },
  { text: "you work.", strong: true },
] as const;

function Arrow({ direction = "right" }: { direction?: "right" | "down" }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={direction === "down" ? styles.arrowDown : styles.arrow} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h12M11.5 5.5 16 10l-4.5 4.5" />
    </svg>
  );
}

function FrameTicks() {
  return (
    <>
      <span className={styles.tick} data-pos="tl" aria-hidden />
      <span className={styles.tick} data-pos="tr" aria-hidden />
      <span className={styles.tick} data-pos="bl" aria-hidden />
      <span className={styles.tick} data-pos="br" aria-hidden />
    </>
  );
}

function WindowDots() {
  return (
    <span className={styles.windowDots} aria-hidden>
      <span /><span /><span />
    </span>
  );
}

function SectionIntro({ title, description, reduced }: { title: ReactNode; description?: string; reduced: boolean }) {
  return (
    <motion.div
      className={styles.sectionIntro}
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "visible"}
      viewport={VIEWPORT}
      variants={groupVariants}
    >
      <motion.div className={styles.sectionIntroHeading} variants={stepVariants}>
        <motion.span className={styles.sectionIntroRule} aria-hidden variants={ruleXVariants} />
        <motion.h2 variants={focusRiseVariants}>{title}</motion.h2>
      </motion.div>
      {description && <motion.p variants={focusRiseVariants}>{description}</motion.p>}
    </motion.div>
  );
}

export default function SystemsDetail() {
  const reduced = useReducedMotion() ?? false;

  // The product window arrives tilted in perspective and flattens as the
  // page scrolls — the deliverable settling onto the desk. Transforms are
  // owned by these MotionValues; the entrance variants only touch
  // opacity/filter so the two never fight over the same channel.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end 30%"],
  });
  const smoothProgress = useSpring(heroProgress, { stiffness: 90, damping: 24, restDelta: 0.001 });
  const windowRotateX = useTransform(smoothProgress, [0, 0.7], reduced ? [0, 0] : [9, 0]);
  const windowY = useTransform(smoothProgress, [0, 0.7], reduced ? [0, 0] : [0, -26]);
  const windowScale = useTransform(smoothProgress, [0, 0.7], reduced ? [1, 1] : [1, 1.025]);

  return (
    <article className={styles.page}>
      <header ref={heroRef} className={styles.hero}>
        <div className={styles.heroInner}>
          <motion.div
            className={styles.heroCopy}
            variants={heroCopyVariants}
            initial={reduced ? false : "hidden"}
            animate="visible"
          >
            <MotionLink href="/#services" className={styles.breadcrumb} variants={focusRiseVariants}>Services <span aria-hidden>/</span> Systems Development</MotionLink>
            <motion.div className={styles.liveLine} variants={focusRiseVariants}><span aria-hidden />Custom systems for operations</motion.div>
            <motion.h1 className={styles.heroHeadline} variants={heroLinesVariants}>
              {HERO_LINES.map((line) => (
                <motion.span key={line.text} className={styles.heroLineMask} variants={passThroughVariants}>
                  <motion.span className={line.strong ? `${styles.heroLine} ${styles.heroHeadlineStrong}` : styles.heroLine} variants={heroCurtainVariants}>{line.text}</motion.span>
                </motion.span>
              ))}
            </motion.h1>
            <motion.p className={styles.heroLead} variants={focusRiseVariants}>CRMs, dashboards and operations automation built around how your business actually works — not the other way around.</motion.p>
            <motion.div className={styles.heroActions} variants={focusRiseVariants}>
              <a href="#contact" className={styles.primaryCta}>Request a quote <Arrow /></a>
              <a href="#capabilities" className={styles.secondaryCta}>See what we build <Arrow direction="down" /></a>
            </motion.div>
            <motion.div className={styles.heroSignal} aria-label="Page highlights" variants={focusRiseVariants}>
              <span>CRMs</span><span>Dashboards</span><span>Automation</span><span>AI</span>
            </motion.div>
          </motion.div>
        </div>
        <div className={styles.windowStage}>
          <motion.div
            className={styles.window}
            style={{ rotateX: windowRotateX, y: windowY, scale: windowScale }}
            initial={reduced ? false : "hidden"}
            animate="visible"
            variants={softRiseVariants}
            transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.55 }}
          >
            <div className={styles.windowBar}>
              <WindowDots />
              <span className={styles.windowAddress}>app.centerquest.com.do/operations</span>
            </div>
            <div className={styles.windowBody}>
              <FrameTicks />
              <div className={styles.frameLabel}>
                <span>Image placeholder</span>
                <strong>Flagship product screenshot</strong>
                <small>Hero window · 16:9 · real system capture, WebP</small>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <div>
        <section id="capabilities" className={styles.capabilitiesSection}>
          <div className={styles.contentShell}>
            <SectionIntro title={<>Built for the operation,<br />shown as the product</>} description="Four kinds of systems, each presented with what it includes, the benefit it creates, and a real capture of the software itself." reduced={reduced} />
            <div className={styles.capRows}>
              {SYSTEMS.details.map((item, index) => {
                const detail = CAPABILITY_DETAIL[item.title];
                return (
                  <motion.div
                    key={item.title}
                    className={styles.capRow}
                    data-flip={index % 2 === 1 || undefined}
                    initial={reduced ? false : "hidden"}
                    whileInView={reduced ? undefined : "visible"}
                    viewport={VIEWPORT}
                    variants={groupVariants}
                  >
                    <motion.div className={styles.capCopy} variants={focusRiseVariants}>
                      <p className={styles.capKicker}><ServiceIcon name={item.icon} />Capability 0{index + 1}</p>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <ul className={styles.capIncludes}>
                        {detail.includes.map((line) => (<li key={line}>{line}</li>))}
                      </ul>
                      <div className={styles.capBenefit}>
                        <h4>Client benefit</h4>
                        <p>{detail.benefit}</p>
                      </div>
                    </motion.div>
                    <motion.div className={styles.capMedia} variants={softRiseVariants}>
                      <div className={styles.capMediaBar}>
                        <WindowDots />
                      </div>
                      <div className={styles.capMediaBody}>
                        <FrameTicks />
                        <div className={`${styles.frameLabel} ${styles.frameLabelLight}`}>
                          <span>Image placeholder</span>
                          <strong>{detail.shot}</strong>
                          <small>16:10 · real product capture, WebP</small>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="method" className={styles.methodSection}>
          <div className={styles.contentShell}>
            <SectionIntro title={<>A build method the<br />operation can feel</>} description="No black boxes and no big reveals — every engagement moves through the same five steps, with working software visible along the way." reduced={reduced} />
            <ol className={styles.methodList}>
              {PROCESS.map((step, index) => (
                <motion.li
                  key={step.title}
                  className={styles.methodStep}
                  initial={reduced ? false : "hidden"}
                  whileInView={reduced ? undefined : "visible"}
                  viewport={{ once: true, margin: "-60px" }}
                  variants={stepVariants}
                >
                  <motion.span className={styles.methodRule} aria-hidden variants={ruleXVariants} />
                  <motion.span className={styles.methodNumber} aria-hidden variants={focusRiseVariants}>0{index + 1}</motion.span>
                  <motion.h3 variants={focusRiseVariants}>{step.title}</motion.h3>
                  <motion.p variants={focusRiseVariants}>{step.description}</motion.p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        <section id="commitments" className={styles.pactSection}>
          <div className={styles.pactInner}>
            <motion.div
              className={styles.pactHeading}
              initial={reduced ? false : "hidden"}
              whileInView={reduced ? undefined : "visible"}
              viewport={VIEWPORT}
              variants={groupVariants}
            >
              <motion.div variants={stepVariants} style={{ display: "flex", flexDirection: "column" }}>
                <motion.span className={styles.pactRule} aria-hidden variants={ruleYVariants} />
                <motion.h2 variants={focusRiseVariants}>Built like a product. Delivered like a partner.</motion.h2>
              </motion.div>
            </motion.div>
            <motion.div
              className={styles.pactGrid}
              initial={reduced ? false : "hidden"}
              whileInView={reduced ? undefined : "visible"}
              viewport={VIEWPORT}
              variants={groupVariants}
            >
              {COMMITMENTS.map((item) => (
                <motion.div key={item.title} variants={softRiseVariants}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="contact" className={styles.contactSection}>
          <motion.div
            className={styles.contactInner}
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "visible"}
            viewport={VIEWPORT}
            variants={groupVariants}
          >
            <motion.div variants={focusRiseVariants}><h2>Let&rsquo;s build the system your operation deserves.</h2><p>This section is prepared to connect with the smart quote form and direct contact channels in the next phase.</p></motion.div>
            <motion.div className={styles.contactPlaceholder} variants={focusRiseVariants}><span>Quote form integration</span><strong>Pending connection</strong></motion.div>
          </motion.div>
        </section>
      </div>

      <footer className={styles.footer}>
        <Link href="/" aria-label="Center Quest home"><Image src="/logo.png" alt="Center Quest" width={206} height={152} className={styles.footerLogo} /></Link>
        <p>Call Center · BPO · Systems Development</p>
        <Link href="/#services">Back to all services</Link>
      </footer>
    </article>
  );
}
