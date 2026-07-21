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
import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import ServiceIcon from "@/components/services/ServiceIcon";
import { SERVICES } from "@/components/services/data";
import styles from "./bpo.module.css";

const BPO = SERVICES.find((service) => service.id === "bpo")!;

const MotionLink = motion.create(Link);

const CAPABILITY_DETAIL: Record<string, { includes: readonly string[]; benefit: string }> = {
  "Back Office Support": {
    includes: [
      "Document management, order processing and account maintenance handled end to end",
      "Runbooks that make every task repeatable, whoever executes it",
      "Volume absorbed without adding headcount on your side",
    ],
    benefit: "Your team stays focused on the core business while the repetitive load runs accurately in the background.",
  },
  "Data processing": {
    includes: [
      "Data entry, validation and cleansing at volume",
      "Double-verification protocols on accuracy-critical records",
      "Structured outputs delivered in your systems and formats",
    ],
    benefit: "Reliable information your operation can act on — without the error rates that manual overload produces.",
  },
  "Omnichannel support": {
    includes: [
      "One coordinated queue across phone, email, chat and messaging",
      "Consistent answers backed by a shared knowledge base",
      "Coverage schedules aligned to your operating hours",
    ],
    benefit: "Customers get the same answer on every channel, and nothing falls between the cracks.",
  },
  "Trust & Safety": {
    includes: [
      "Content and transaction review under clearly documented policies",
      "Proactive risk flagging with defined escalation paths",
      "Audit trails behind every decision taken",
    ],
    benefit: "Your platform and community stay protected without slowing the operation down.",
  },
  "Quality Assurance": {
    includes: [
      "Interaction sampling scored against your quality standards",
      "Calibration sessions that keep evaluators aligned",
      "Findings fed back into coaching and process fixes",
    ],
    benefit: "Quality stops being an opinion — it becomes a measured, improving number.",
  },
  "Consulting Services": {
    includes: [
      "Diagnosis of your current processes and cost structure",
      "Redesign proposals with measurable targets",
      "Implementation support alongside your team",
    ],
    benefit: "An outside operations lens that turns inefficiencies into a concrete improvement plan.",
  },
};

const PROCESS = [
  { title: "Discovery", description: "We study the process as it runs today — volumes, systems, exceptions, and the cost of getting it wrong." },
  { title: "Process mapping", description: "Every step is documented into a runbook: inputs, outputs, rules and edge cases, so the work is repeatable by design." },
  { title: "Pilot", description: "A controlled slice of real volume runs first, measured against the agreed SLAs before anything scales." },
  { title: "Scale-up", description: "Volume ramps in stages while accuracy and turnaround hold; staffing flexes with your demand curve." },
  { title: "Continuous improvement", description: "Audits, error analysis and process reviews keep tightening the operation long after launch." },
] as const;

const SLAS = [
  { label: "Accuracy target", value: "99%+", status: "Double-verification on critical records" },
  { label: "Turnaround", value: "Within SLA", status: "Agreed per process, measured daily" },
  { label: "Volume capacity", value: "Elastic", status: "Staffing flexes with your demand curve" },
  { label: "Coverage", value: "Up to 24/7", status: "Schedules aligned to your operation" },
  { label: "Reporting", value: "Continuous", status: "Production and quality always visible to you" },
] as const;

/* ── Motion language ──────────────────────────────────────
   Same vocabulary as the Call Center page — one ease-out-quint curve,
   focus-pull reveals out of blur, curtain-lifted hero lines — spoken in a
   different arrangement: the scroll-linked depth here is the media band's
   parallax drift and the method spine drawing itself downward. */
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

// Blur-only reveal for elements that own a CSS hover transform.
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
const nodeVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.55, ease: EASE_OUT } },
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
  { text: "The work", strong: false },
  { text: "behind your", strong: false },
  { text: "operation.", strong: true },
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

export default function BpoDetail() {
  const reduced = useReducedMotion() ?? false;
  const total = BPO.details.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const slatRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Arrow keys move between the discipline spines (APG accordion pattern:
  // Tab reaches each header, arrows travel the set, Home/End jump to ends).
  const handleSlatKey = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % total;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + total) % total;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = total - 1;
    if (next === null) return;
    event.preventDefault();
    setActiveIndex(next);
    slatRefs.current[next]?.focus();
  };

  // The media band drifts on its own axis as it crosses the viewport, so the
  // hero → content seam reads as depth rather than a stacked block.
  const bandRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: bandProgress } = useScroll({
    target: bandRef,
    offset: ["start end", "end start"],
  });
  const bandY = useTransform(bandProgress, [0, 1], reduced ? [0, 0] : [28, -28]);

  // The method spine draws itself downward, spring-smoothed so it trails the
  // scroll like a needle, not a scrubber.
  const spineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: spineProgress } = useScroll({
    target: spineRef,
    offset: ["start 78%", "end 55%"],
  });
  const spineScale = useSpring(
    useTransform(spineProgress, [0, 1], reduced ? [1, 1] : [0, 1]),
    { stiffness: 120, damping: 28, restDelta: 0.001 },
  );

  return (
    <article className={styles.page}>
      <header data-hero-boundary className={styles.hero}>
        <motion.div
          className={styles.heroInner}
          variants={heroCopyVariants}
          initial={reduced ? false : "hidden"}
          animate="visible"
        >
          <div className={styles.heroCopy}>
            <MotionLink href="/#services" className={styles.breadcrumb} variants={focusRiseVariants}>Services <span aria-hidden>/</span> BPO</MotionLink>
            <motion.div className={styles.liveLine} variants={focusRiseVariants}><span aria-hidden />Business Process Outsourcing under clear SLAs</motion.div>
            <motion.h1 className={styles.heroHeadline} variants={heroLinesVariants}>
              {HERO_LINES.map((line) => (
                <motion.span key={line.text} className={styles.heroLineMask} variants={passThroughVariants}>
                  <motion.span className={line.strong ? `${styles.heroLine} ${styles.heroHeadlineStrong}` : styles.heroLine} variants={heroCurtainVariants}>{line.text}</motion.span>
                </motion.span>
              ))}
            </motion.h1>
            <motion.p className={styles.heroLead} variants={focusRiseVariants}>Back office, data processing and omnichannel support — the repeatable work of your operation, run accurately at volume.</motion.p>
            <motion.div className={styles.heroActions} variants={focusRiseVariants}>
              <a href="#contact" className={styles.primaryCta}>Request a quote <Arrow /></a>
              <a href="#capabilities" className={styles.secondaryCta}>Explore capabilities <Arrow direction="down" /></a>
            </motion.div>
          </div>
          <motion.aside className={styles.heroMeta} variants={focusRiseVariants} aria-label="Operating scope">
            <span className={styles.heroMetaLabel}>Operating scope</span>
            <ul className={styles.heroMetaList}>
              <li>Back office</li>
              <li>Data processing</li>
              <li>Omnichannel</li>
              <li>Quality &amp; risk</li>
            </ul>
            <p className={styles.heroMetaNote}>Every engagement runs under a documented SLA — accuracy, turnaround and coverage, agreed before launch.</p>
          </motion.aside>
        </motion.div>
      </header>

      <div ref={bandRef} className={styles.bandWrap}>
        <motion.figure
          className={styles.band}
          style={{ y: bandY }}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={{ once: true, margin: "-40px" }}
          variants={softRiseVariants}
        >
          <FrameTicks />
          <figcaption className={styles.frameLabel}>
            <span>Image placeholder</span>
            <strong>BPO operations floor</strong>
            <small>Full-width band · 21:9 · real facility photo, WebP</small>
          </figcaption>
        </motion.figure>
      </div>

      <div>
        <section id="capabilities" className={styles.capabilitiesSection}>
          <div className={styles.contentShell}>
            <SectionIntro title={<>Six disciplines,<br />one standard</>} description="Every discipline meets the same operating standard. Open one to see exactly what it covers — and the benefit it hands back to you." reduced={reduced} />
            <motion.div
              className={styles.rack}
              role="group"
              aria-label="BPO disciplines"
              initial={reduced ? false : "hidden"}
              whileInView={reduced ? undefined : "visible"}
              viewport={VIEWPORT}
              variants={groupVariants}
            >
              {BPO.details.map((item, index) => {
                const detail = CAPABILITY_DETAIL[item.title];
                const active = index === activeIndex;
                return (
                  <motion.div
                    key={item.title}
                    className={styles.slat}
                    data-active={active || undefined}
                    variants={softRiseVariants}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <button
                      ref={(node) => { slatRefs.current[index] = node; }}
                      type="button"
                      id={`bpo-tab-${index}`}
                      className={styles.slatSpine}
                      aria-expanded={active}
                      aria-controls={`bpo-panel-${index}`}
                      onClick={() => setActiveIndex(index)}
                      onFocus={() => setActiveIndex(index)}
                      onKeyDown={(event) => handleSlatKey(event, index)}
                    >
                      <span className={styles.slatNumber} aria-hidden>0{index + 1}</span>
                      <span className={styles.slatIcon} aria-hidden><ServiceIcon name={item.icon} /></span>
                      <span className={styles.slatTitle}>{item.title}</span>
                      <svg className={styles.slatChevron} aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 5 5 5-5" /></svg>
                    </button>
                    <div
                      className={styles.slatDetail}
                      id={`bpo-panel-${index}`}
                      role="region"
                      aria-label={item.title}
                      aria-hidden={!active}
                    >
                      <div className={styles.slatDetailInner}>
                        <span className={styles.slatKicker}><span className={styles.slatKickerDot} aria-hidden />Held to one SLA</span>
                        <span className={styles.slatName}>{item.title}</span>
                        <p className={styles.slatLead}>{item.description}</p>
                        <div className={styles.slatPanels}>
                          <div className={styles.slatIncludes}>
                            <span className={styles.slatLabel}>What it includes</span>
                            <ul>{detail.includes.map((line) => (<li key={line}>{line}</li>))}</ul>
                          </div>
                          <div className={styles.slatBenefit}>
                            <span className={styles.slatLabel}>Client benefit</span>
                            <p>{detail.benefit}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
            <p className={styles.rackHint}><span aria-hidden>—</span> Select a discipline to open its full spec. Every one runs under the same SLA.</p>
          </div>
        </section>

        <section id="method" className={styles.methodSection}>
          <div className={styles.contentShell}>
            <div className={styles.methodGrid}>
              <motion.div
                className={styles.railIntro}
                initial={reduced ? false : "hidden"}
                whileInView={reduced ? undefined : "visible"}
                viewport={VIEWPORT}
                variants={groupVariants}
              >
                <motion.div variants={stepVariants} style={{ display: "flex", flexDirection: "column" }}>
                  <motion.span className={styles.railRule} aria-hidden variants={ruleYVariants} />
                  <motion.h2 variants={focusRiseVariants}>From handover to steady state</motion.h2>
                </motion.div>
                <motion.p variants={focusRiseVariants}>Taking over a process is a discipline in itself. The same sequence governs every engagement, so nothing depends on improvisation.</motion.p>
              </motion.div>
              <div ref={spineRef} className={styles.spine}>
                <span className={styles.spineTrack} aria-hidden />
                <motion.span className={styles.spineLine} aria-hidden style={{ scaleY: spineScale }} />
                <motion.ol
                  className={styles.spineList}
                  initial={reduced ? false : "hidden"}
                  whileInView={reduced ? undefined : "visible"}
                  viewport={{ once: true, margin: "-60px" }}
                  variants={groupVariants}
                >
                  {PROCESS.map((step, index) => (
                    <motion.li key={step.title} className={styles.spineStep} variants={stepVariants}>
                      <motion.span className={styles.spineNode} aria-hidden variants={nodeVariants} />
                      <motion.div variants={focusRiseVariants}>
                        <span className={styles.spineNumber}>0{index + 1}</span>
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                      </motion.div>
                    </motion.li>
                  ))}
                </motion.ol>
              </div>
            </div>
          </div>
        </section>

        <section id="slas" className={styles.slaSection}>
          <div className={styles.slaInner}>
            <motion.div
              className={styles.slaHeading}
              initial={reduced ? false : "hidden"}
              whileInView={reduced ? undefined : "visible"}
              viewport={VIEWPORT}
              variants={groupVariants}
            >
              <motion.div variants={stepVariants} style={{ display: "flex", flexDirection: "column" }}>
                <motion.span className={styles.slaRule} aria-hidden variants={ruleYVariants} />
                <motion.h2 variants={focusRiseVariants}>Accuracy is the product.</motion.h2>
              </motion.div>
              <motion.p variants={focusRiseVariants}>BPO is judged on what it delivers, day after day. These are the commitments every engagement is measured against.</motion.p>
            </motion.div>
            <motion.dl
              className={styles.slaList}
              initial={reduced ? false : "hidden"}
              whileInView={reduced ? undefined : "visible"}
              viewport={VIEWPORT}
              variants={groupVariants}
            >
              {SLAS.map((sla) => (
                <motion.div key={sla.label} variants={softRiseVariants}>
                  <dt>{sla.label}</dt>
                  <dd>{sla.value}</dd>
                  <span className={styles.slaStatus}><span className={styles.slaDot} aria-hidden />{sla.status}</span>
                </motion.div>
              ))}
            </motion.dl>
          </div>
        </section>

        <section className={styles.photosSection}>
          <div className={styles.contentShell}>
            <SectionIntro title="The operation up close" description="Real photos of the team and facilities will live here — evidence of the operation, not stock imagery." reduced={reduced} />
            <motion.div
              className={styles.photoGrid}
              initial={reduced ? false : "hidden"}
              whileInView={reduced ? undefined : "visible"}
              viewport={VIEWPORT}
              variants={groupVariants}
            >
              <motion.div className={styles.photoFrame} variants={softRiseVariants}>
                <FrameTicks />
                <div className={styles.frameLabel}>
                  <span>Image placeholder</span>
                  <strong>Back-office team at work</strong>
                  <small>4:3 · real team photo, WebP</small>
                </div>
              </motion.div>
              <motion.div className={styles.photoFrame} variants={softRiseVariants}>
                <FrameTicks />
                <div className={styles.frameLabel}>
                  <span>Image placeholder</span>
                  <strong>Process floor detail</strong>
                  <small>4:3 · real facility photo, WebP</small>
                </div>
              </motion.div>
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
            <motion.div variants={focusRiseVariants}><h2>Let&rsquo;s take the busywork off your plate.</h2><p>This section is prepared to connect with the smart quote form and direct contact channels in the next phase.</p></motion.div>
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
