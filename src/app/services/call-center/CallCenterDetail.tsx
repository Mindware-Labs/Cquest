"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import ServiceIcon from "@/components/services/ServiceIcon";
import { SERVICES, type ServiceIconName } from "@/components/services/data";
import styles from "./call-center.module.css";

const CALL_CENTER = SERVICES.find((service) => service.id === "call-center")!;

const MotionLink = motion.create(Link);

const CAPABILITY_META: Record<string, { icon: ServiceIconName; channels: readonly string[] }> = {
  "Customer service": { icon: "headset", channels: ["Phone", "Email", "Chat", "Social media"] },
  Sales: { icon: "trend", channels: ["Outbound", "Telesales", "Lead follow-up"] },
  Collections: { icon: "banknote", channels: ["Phone", "Email", "Messaging"] },
  Surveys: { icon: "gauge", channels: ["Phone", "Digital", "NPS"] },
  Onboarding: { icon: "userplus", channels: ["Welcome", "Activation", "Follow-up"] },
  "Tech Support": { icon: "wrench", channels: ["Phone", "Chat", "Email"] },
};

const CHANNEL_ICON: Record<string, ServiceIconName> = {
  Phone: "phone",
  Outbound: "phone",
  Telesales: "phone",
  Email: "mail",
  Chat: "messages",
  Messaging: "messages",
  Digital: "layout",
  NPS: "gauge",
  "Social media": "share",
  "Lead follow-up": "share",
  Welcome: "userplus",
  Activation: "trend",
  "Follow-up": "share",
};

const CAPABILITY_DETAIL: Record<string, { includes: readonly string[]; benefit: string }> = {
  "Customer service": {
    includes: [
      "Inbound support across phone, email, chat and social media",
      "Agents trained on your brand voice, product and escalation protocols",
      "Real-time monitoring against documented quality standards",
    ],
    benefit: "Faster resolutions and consistent, on-brand interactions that keep customers loyal — without the overhead of building an in-house support team.",
  },
  Sales: {
    includes: [
      "Outbound campaigns built around your target segments",
      "Telesales scripts refined against real conversion data",
      "Lead generation, qualification and closing in one continuous flow",
    ],
    benefit: "A dedicated sales engine that turns outreach into revenue, scaled up or down as your campaign calendar demands.",
  },
  Collections: {
    includes: [
      "Portfolio segmentation by risk and recovery likelihood",
      "Compliant, professional contact protocols at every stage",
      "Negotiated payment plans documented for auditability",
    ],
    benefit: "Higher recovery rates protected by protocols that preserve the customer relationship and your brand's reputation.",
  },
  Surveys: {
    includes: [
      "Satisfaction studies and market polls across phone and digital channels",
      "NPS measurement with segment-level breakdowns",
      "Structured reporting delivered on your schedule",
    ],
    benefit: "Clear, actionable insight into what your customers think — used to guide product, service and retention decisions.",
  },
  Onboarding: {
    includes: [
      "Welcome contact within your defined SLA",
      "Guided activation of the product or service",
      "Early follow-up that catches friction before it becomes churn",
    ],
    benefit: "New customers reach their first value moment faster, with fewer early-stage drop-offs.",
  },
  "Tech Support": {
    includes: [
      "First-line troubleshooting across phone, chat and email",
      "Documented resolution paths with escalation to specialist tiers",
      "Issue tracking that feeds back into product and process improvement",
    ],
    benefit: "Customers stay productive and confident in your product, while your specialist teams stay focused on what only they can solve.",
  },
};

const PROCESS = [
  { title: "Discovery", description: "We study your current operation, volumes, channels and goals to understand exactly what the engagement needs to deliver." },
  { title: "Operation design", description: "We define the process, staffing model, protocols and technology that will run the operation, sized to your volume and SLAs." },
  { title: "Team preparation", description: "Agents are recruited, trained on your product and brand voice, and certified before they take a single live interaction." },
  { title: "Launch", description: "The operation goes live under close supervision, with daily monitoring and rapid feedback loops during ramp-up." },
  { title: "Continuous improvement", description: "Ongoing coaching, quality audits and performance reviews keep the operation improving after launch, not just at the start." },
] as const;
const CLIENT_LOGOS = [
  { name: "Altice", src: "/brands/altice.jpg" },
  { name: "Paso Rápido", src: "/brands/pasoRapido.png", size: "large" },
  { name: "Rig Hut", src: "/brands/righut.jpg" },
  { name: "Cell Phone", src: "/brands/cellphone.jpg" },
  { name: "Plastifar", src: "/brands/plastifar.png", size: "compact" },
  { name: "Fiduciaria Reservas", src: "/brands/fiduciariaReservas.jpg" },
] as const;

const METRICS = [
  { label: "Interactions handled", value: "Built for scale", status: "Staffing flexes with your interaction volume" },
  { label: "Average response time", value: "< 20 sec", status: "Average phone queue time" },
  { label: "Service level", value: "80/20", status: "80% of calls answered within 20 seconds" },
  { label: "First-contact resolution", value: "90%+", status: "Resolution target per account" },
  { label: "Quality score", value: "95%+", status: "QA scorecard standard" },
] as const;

/* ── Motion language ──────────────────────────────────────
   One curve carries the whole page (ease-out-quint, the site-wide EASE_OUT),
   and two gestures do the talking: content sharpens up out of a soft blur
   (presence, never a flat fade), and hero lines rise from behind a clipped
   edge like a curtain lifting. Scroll-linked depth (hero parallax, the
   process line drawing itself) is what makes the page feel tied to the
   scroll rather than merely decorated by it. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, margin: "-80px" } as const;

// Stagger container — reveals its children in sequence, not all at once.
const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

// The premium replacement for a flat fade: y-rise + focus-pull out of blur.
const focusRiseVariants: Variants = {
  hidden: { opacity: 0, y: 26, filter: "blur(10px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE_OUT } },
};

// Blur-only reveal for elements that own a CSS hover transform — animating a
// transform here would leave a lingering inline value that blocks the hover.
const softRiseVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.85, ease: EASE_OUT } },
};

// Hairline rules draw along their length, a beat before the heading lifts.
const ruleXVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.7, ease: EASE_OUT } },
};
const ruleYVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.7, ease: EASE_OUT } },
};

// Timeline: the socket lights up, then its label sharpens in just behind it.
const stepVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const nodeVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.55, ease: EASE_OUT } },
};

// Hero: word lines lift in sequence on load, from behind their own clip edge.
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

// Pass-through container: consumes a stagger slot and forwards the label to a
// nested motion child without adding a transform of its own.
const passThroughVariants: Variants = { hidden: {}, visible: {} };

const HERO_LINES = [
  { text: "Every", strong: false },
  { text: "customer", strong: false },
  { text: "moment,", strong: false },
  { text: "covered.", strong: true },
] as const;

function Arrow({ direction = "right" }: { direction?: "right" | "down" }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={direction === "down" ? styles.arrowDown : styles.arrow} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h12M11.5 5.5 16 10l-4.5 4.5" />
    </svg>
  );
}

function HeroMedia({ mediaY, mediaScale }: { mediaY: MotionValue<string>; mediaScale: MotionValue<number> }) {
  return (
    <div className={styles.heroMedia}>
      <motion.div className={styles.heroMediaParallax} style={{ y: mediaY, scale: mediaScale }} aria-hidden>
        <Image
          src="/hero-callcenter.jpg"
          alt="Call center workstations with headsets and keyboards ready for agents"
          fill
          priority
          sizes="(min-width: 64rem) 55vw, 100vw"
          className={styles.heroMediaImg}
        />
      </motion.div>
      <span className={styles.heroMediaTint} aria-hidden />
      <span className={styles.heroMediaScrim} aria-hidden />
    </div>
  );
}

function SectionIntro({ title, description, compact = false, reduced }: { title: ReactNode; description?: string; compact?: boolean; reduced: boolean }) {
  return (
    <motion.div
      className={styles.sectionIntro}
      data-compact={compact || undefined}
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "visible"}
      viewport={VIEWPORT}
      variants={groupVariants}
    >
      <motion.div className={styles.sectionIntroHeading} variants={stepVariants}>
        <motion.span className={styles.sectionIntroRule} aria-hidden variants={compact ? ruleYVariants : ruleXVariants} />
        <motion.h2 variants={focusRiseVariants}>{title}</motion.h2>
      </motion.div>
      {description && <motion.p variants={focusRiseVariants}>{description}</motion.p>}
    </motion.div>
  );
}

export default function CallCenterDetail() {
  const reduced = useReducedMotion() ?? false;
  const [activeCapability, setActiveCapability] = useState(CALL_CENTER.details[0].title);
  const active = CALL_CENTER.details.find((item) => item.title === activeCapability)!;
  const activeMeta = CAPABILITY_META[active.title];

  // Hero parallax departure — the media zooms and drifts on its own axis while
  // the copy lifts away and dissolves, so leaving the hero reads as depth, not
  // a scroll past a static banner.
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(heroProgress, [0, 1], reduced ? ["0%", "0%"] : ["0%", "8%"]);
  const mediaScale = useTransform(heroProgress, [0, 1], reduced ? [1, 1] : [1, 1.12]);
  const copyY = useTransform(heroProgress, [0, 1], reduced ? [0, 0] : [0, -60]);
  const copyOpacity = useTransform(heroProgress, [0, 0.85], reduced ? [1, 1] : [1, 0]);

  // The process connecting line draws itself as the timeline scrolls through —
  // spring-smoothed so it trails the scroll like a needle, not a scrubber.
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: lineProgress } = useScroll({
    target: trackRef,
    offset: ["start 82%", "end 60%"],
  });
  const lineScale = useSpring(
    useTransform(lineProgress, [0, 1], reduced ? [1, 1] : [0, 1]),
    { stiffness: 120, damping: 28, restDelta: 0.001 },
  );

  return (
    <article className={styles.page}>
      <header ref={heroRef} className={styles.hero}>
        <div className={styles.heroGrid}>
          <motion.div
            className={styles.heroCopy}
            style={{ y: copyY, opacity: copyOpacity }}
            variants={heroCopyVariants}
            initial={reduced ? false : "hidden"}
            animate="visible"
          >
            <MotionLink href="/#services" className={styles.breadcrumb} variants={focusRiseVariants}>Services <span aria-hidden>/</span> Call Center</MotionLink>
            <motion.div className={styles.liveLine} variants={focusRiseVariants}><span aria-hidden />Operational coverage across every customer channel</motion.div>
            <motion.h1 className={styles.heroHeadline} variants={heroLinesVariants}>
              {HERO_LINES.map((line) => (
                <motion.span key={line.text} className={styles.heroLineMask} variants={passThroughVariants}>
                  <motion.span className={line.strong ? `${styles.heroLine} ${styles.heroHeadlineStrong}` : styles.heroLine} variants={heroCurtainVariants}>{line.text}</motion.span>
                </motion.span>
              ))}
            </motion.h1>
            <motion.p className={styles.heroLead} variants={focusRiseVariants}>Inbound and outbound contact-center operations designed around the moments that matter to your customers.</motion.p>
            <motion.div className={styles.heroActions} variants={focusRiseVariants}>
              <a href="#contact" className={styles.primaryCta}>Request a quote <Arrow /></a>
              <a href="#capabilities" className={styles.secondaryCta}>Explore capabilities <Arrow direction="down" /></a>
            </motion.div>
            <motion.div className={styles.heroSignal} aria-label="Page highlights" variants={focusRiseVariants}>
              <span>People</span><span>Process</span><span>Technology</span>
            </motion.div>
          </motion.div>
          <HeroMedia mediaY={mediaY} mediaScale={mediaScale} />
        </div>
      </header>

      <div>
        <section id="capabilities" className={styles.capabilitiesSection}>
          <div className={styles.contentShell}>
            <SectionIntro title={<>Capabilities built around<br />the conversation</>} description="A clear structure for presenting what each service includes, how it works, and the benefit it creates for the client." reduced={reduced} />
            <motion.div
              className={styles.capabilityLayout}
              initial={reduced ? false : "hidden"}
              whileInView={reduced ? undefined : "visible"}
              viewport={VIEWPORT}
              variants={groupVariants}
            >
              <motion.div className={styles.capabilityIndex} role="tablist" aria-label="Call Center capabilities" variants={focusRiseVariants}>
                {CALL_CENTER.details.map((item, index) => {
                  const selected = item.title === activeCapability;
                  return (
                    <button key={item.title} type="button" role="tab" aria-selected={selected} aria-controls="capability-panel" className={styles.capabilityTab} data-active={selected || undefined} onClick={() => setActiveCapability(item.title)}>
                      <span className={styles.tabNumber}>0{index + 1}</span><span>{item.title}</span><Arrow />
                    </button>
                  );
                })}
              </motion.div>

              <motion.div id="capability-panel" role="tabpanel" className={styles.capabilityPanel} variants={focusRiseVariants}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={active.title} initial={reduced ? false : { opacity: 0, x: 18, filter: "blur(4px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={reduced ? undefined : { opacity: 0, x: -12, filter: "blur(3px)" }} transition={{ duration: reduced ? 0 : 0.36, ease: EASE_OUT }}>
                    <div className={styles.capabilityHeading}>
                      <span className={styles.capabilityIcon}><ServiceIcon name={activeMeta.icon} /></span>
                      <div><p>Selected capability</p><h3>{active.title}</h3></div>
                    </div>
                    <p className={styles.capabilityDescription}>{active.description}</p>
                    <div className={styles.detailGrid}>
                      <div>
                        <h4>What it includes</h4>
                        <ul>{CAPABILITY_DETAIL[active.title].includes.map((item) => (<li key={item}>{item}</li>))}</ul>
                      </div>
                      <div className={styles.clientBenefit}>
                        <h4>Client benefit</h4>
                        <p>{CAPABILITY_DETAIL[active.title].benefit}</p>
                      </div>
                    </div>
                    <div className={styles.channelRow}>
                      <span>Channels / touchpoints</span>
                      <ul>{activeMeta.channels.map((channel) => (
                        <li key={channel}>
                          <span className={styles.channelIcon}><ServiceIcon name={CHANNEL_ICON[channel] ?? "messages"} /></span>
                          {channel}
                        </li>
                      ))}</ul>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section id="method" className={styles.processSection}>
          <div className={styles.contentShell}>
            <SectionIntro title={<>A method the client<br />can understand</>} description="Every engagement follows the same disciplined sequence, from first discovery call to the ongoing work of getting better." reduced={reduced} />
            <div ref={trackRef} className={styles.processTrack}>
              <motion.span
                className={styles.processLine}
                aria-hidden
                style={{ scaleX: lineScale }}
              />
              <motion.ol
                className={styles.processList}
                initial={reduced ? false : "hidden"}
                whileInView={reduced ? undefined : "visible"}
                viewport={{ once: true, margin: "-60px" }}
                variants={groupVariants}
              >
                {PROCESS.map((step, index) => (
                  <motion.li key={step.title} className={styles.processStep} variants={stepVariants}>
                    <motion.span className={styles.processNode} aria-hidden variants={nodeVariants} />
                    <motion.div className={styles.processBody} variants={focusRiseVariants}>
                      <span className={styles.processNumber}>0{index + 1}</span><h3>{step.title}</h3><p>{step.description}</p>
                    </motion.div>
                  </motion.li>
                ))}
              </motion.ol>
            </div>
          </div>
        </section>

        <section id="metrics" className={styles.metricsSection}>
          <div className={styles.contentShell}>
            <motion.div
              className={styles.metricsHeading}
              initial={reduced ? false : "hidden"}
              whileInView={reduced ? undefined : "visible"}
              viewport={VIEWPORT}
              variants={groupVariants}
            >
              <motion.div className={styles.metricsHeadingCopy} variants={stepVariants}>
                <motion.span className={styles.metricsRule} aria-hidden variants={ruleYVariants} />
                <motion.h2 variants={focusRiseVariants}>Performance that can be demonstrated.</motion.h2>
              </motion.div>
            </motion.div>
            <motion.dl
              className={styles.metricList}
              initial={reduced ? false : "hidden"}
              whileInView={reduced ? undefined : "visible"}
              viewport={VIEWPORT}
              variants={groupVariants}
            >
              {METRICS.map((metric) => (
                <motion.div key={metric.label} variants={softRiseVariants}>
                  <dt>{metric.label}</dt>
                  <dd>{metric.value}</dd>
                  <span className={styles.metricStatus}><span className={styles.metricDot} aria-hidden />{metric.status}</span>
                </motion.div>
              ))}
            </motion.dl>
          </div>
        </section>

        <section id="clients" className={styles.clientsSection}>
          <div className={styles.contentShell}>
            <SectionIntro title="Clients who trust the operation" reduced={reduced} />
            <motion.ul
              className={styles.logoWall}
              aria-label="Client logos"
              initial={reduced ? false : "hidden"}
              whileInView={reduced ? undefined : "visible"}
              viewport={VIEWPORT}
              variants={groupVariants}
            >
              {CLIENT_LOGOS.map((brand) => (
                <motion.li key={brand.name} variants={softRiseVariants}>
                  <span className={styles.logoImageWrap} data-size={"size" in brand ? brand.size : undefined}>
                    <Image src={brand.src} alt={`${brand.name} logo`} fill sizes="(min-width: 64rem) 12vw, 30vw" className={styles.logoImage} />
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </section>

        <section className={styles.testimonialSection}>
          <motion.div
            className={styles.testimonialInner}
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "visible"}
            viewport={VIEWPORT}
            variants={groupVariants}
          >
            <motion.span className={styles.quoteMark} aria-hidden variants={focusRiseVariants}>“</motion.span>
            <motion.blockquote variants={focusRiseVariants}><p>Approved client testimonial will appear in this space.</p><footer><span>Client name</span><small>Role · Company</small></footer></motion.blockquote>
            <motion.div className={styles.portraitPlaceholder} variants={focusRiseVariants}>Portrait<br />1:1</motion.div>
          </motion.div>
        </section>

        <section id="contact" className={styles.contactSection}>
          <motion.div
            className={styles.contactInner}
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "visible"}
            viewport={VIEWPORT}
            variants={groupVariants}
          >
            <motion.div variants={focusRiseVariants}><h2>Let’s design the right operation.</h2><p>This section is prepared to connect with the smart quote form and direct contact channels in the next phase.</p></motion.div>
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
