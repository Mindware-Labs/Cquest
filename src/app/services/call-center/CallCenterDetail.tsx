"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import ServiceIcon from "@/components/services/ServiceIcon";
import { SERVICES, type ServiceIconName } from "@/components/services/data";
import styles from "./call-center.module.css";

const CALL_CENTER = SERVICES.find((service) => service.id === "call-center")!;

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

const PROCESS = ["Discovery", "Operation design", "Team preparation", "Launch", "Continuous improvement"] as const;
const METRICS = ["Interactions handled", "Average response time", "Service level", "First-contact resolution", "Quality score"] as const;

const processContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};

const processItemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const processLineVariants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

function Arrow({ direction = "right" }: { direction?: "right" | "down" }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className={direction === "down" ? styles.arrowDown : styles.arrow} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h12M11.5 5.5 16 10l-4.5 4.5" />
    </svg>
  );
}

function MediaPlaceholder({ label, ratio, className = "" }: { label: string; ratio: string; className?: string }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div
      className={`${styles.mediaPlaceholder} ${className}`}
      initial={reduced ? false : { opacity: 0, scale: 0.98 }}
      whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className={styles.mediaCross} aria-hidden />
      <div>
        <span className={styles.mediaLabel}>{label}</span>
        <span className={styles.mediaRatio}>Replaceable media · {ratio}</span>
      </div>
    </motion.div>
  );
}

function HeroMedia() {
  return (
    <div className={styles.heroMedia}>
      <Image
        src="/hero-callcenter.jpg"
        alt="Call center workstations with headsets and keyboards ready for agents"
        fill
        priority
        sizes="(min-width: 64rem) 55vw, 100vw"
        className={styles.heroMediaImg}
      />
      <span className={styles.heroMediaTint} aria-hidden />
      <span className={styles.heroMediaScrim} aria-hidden />
    </div>
  );
}

function SectionIntro({ title, description, compact = false }: { title: ReactNode; description: string; compact?: boolean }) {
  return (
    <div className={styles.sectionIntro} data-compact={compact || undefined}>
      <div className={styles.sectionIntroHeading}>
        <span className={styles.sectionIntroRule} aria-hidden />
        <h2>{title}</h2>
      </div>
      <p>{description}</p>
    </div>
  );
}

export default function CallCenterDetail() {
  const reduced = useReducedMotion() ?? false;
  const [activeCapability, setActiveCapability] = useState(CALL_CENTER.details[0].title);
  const active = CALL_CENTER.details.find((item) => item.title === activeCapability)!;
  const activeMeta = CAPABILITY_META[active.title];

  return (
    <article className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <Link href="/#services" className={styles.breadcrumb}>Services <span aria-hidden>/</span> Call Center</Link>
            <div className={styles.liveLine}><span aria-hidden />Operational coverage across every customer channel</div>
            <h1 className={styles.heroHeadline}>
              <span>Every</span>
              <span>customer</span>
              <span>moment,</span>
              <span className={styles.heroHeadlineStrong}>covered.</span>
            </h1>
            <p className={styles.heroLead}>Inbound and outbound contact-center operations designed around the moments that matter to your customers.</p>
            <div className={styles.heroActions}>
              <a href="#contact" className={styles.primaryCta}>Request a quote <Arrow /></a>
              <a href="#capabilities" className={styles.secondaryCta}>Explore capabilities <Arrow direction="down" /></a>
            </div>
            <div className={styles.heroSignal} aria-label="Page highlights">
              <span>People</span><span>Process</span><span>Technology</span>
            </div>
          </div>
          <HeroMedia />
        </div>
      </header>

      <div>
        <section id="capabilities" className={styles.capabilitiesSection}>
          <div className={styles.contentShell}>
            <SectionIntro title={<>Capabilities built around<br />the conversation</>} description="A clear structure for presenting what each service includes, how it works, and the benefit it creates for the client." />
            <div className={styles.capabilityLayout}>
              <div className={styles.capabilityIndex} role="tablist" aria-label="Call Center capabilities">
                {CALL_CENTER.details.map((item, index) => {
                  const selected = item.title === activeCapability;
                  return (
                    <button key={item.title} type="button" role="tab" aria-selected={selected} aria-controls="capability-panel" className={styles.capabilityTab} data-active={selected || undefined} onClick={() => setActiveCapability(item.title)}>
                      <span className={styles.tabNumber}>0{index + 1}</span><span>{item.title}</span><Arrow />
                    </button>
                  );
                })}
              </div>

              <div id="capability-panel" role="tabpanel" className={styles.capabilityPanel}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={active.title} initial={reduced ? false : { opacity: 0, x: 18, filter: "blur(4px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={reduced ? undefined : { opacity: 0, x: -12, filter: "blur(3px)" }} transition={{ duration: reduced ? 0 : 0.36, ease: [0.22, 1, 0.36, 1] }}>
                    <div className={styles.capabilityHeading}>
                      <span className={styles.capabilityIcon}><ServiceIcon name={activeMeta.icon} /></span>
                      <div><p>Selected capability</p><h3>{active.title}</h3></div>
                    </div>
                    <p className={styles.capabilityDescription}>{active.description}</p>
                    <div className={styles.detailGrid}>
                      <div>
                        <h4>What it includes</h4>
                        <ul><li>Service detail to be defined</li><li>Operational scope to be defined</li><li>Delivery standard to be defined</li></ul>
                      </div>
                      <div className={styles.clientBenefit}>
                        <h4>Client benefit</h4>
                        <p>Space reserved for the concrete business benefit and the outcome this capability is expected to support.</p>
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
              </div>
            </div>
          </div>
        </section>

        <section id="method" className={styles.processSection}>
          <div className={styles.contentShell}>
            <SectionIntro title={<>A method the client<br />can understand</>} description="This sequence is ready to document Center Quest's actual operating method once the final process is supplied." />
            <div className={styles.processTrack}>
              <motion.span
                className={styles.processLine}
                aria-hidden
                initial={reduced ? false : "hidden"}
                whileInView={reduced ? undefined : "visible"}
                viewport={{ once: true, margin: "-100px" }}
                variants={processLineVariants}
              />
              <motion.ol
                className={styles.processList}
                initial={reduced ? false : "hidden"}
                whileInView={reduced ? undefined : "visible"}
                viewport={{ once: true, margin: "-100px" }}
                variants={processContainerVariants}
              >
                {PROCESS.map((step, index) => (
                  <motion.li key={step} variants={processItemVariants}>
                    <span className={styles.processNumber}>0{index + 1}</span><h3>{step}</h3><p>Stage description and responsibilities to be defined.</p>
                  </motion.li>
                ))}
              </motion.ol>
            </div>
          </div>
        </section>

        <section id="metrics" className={styles.metricsSection}>
          <div className={styles.contentShell}>
            <div className={styles.metricsHeading}>
              <div className={styles.metricsHeadingCopy}>
                <span className={styles.metricsRule} aria-hidden />
                <h2>Performance that can be demonstrated.</h2>
              </div>
              <p>Editable fields prepared for verified operational indicators. No figures are published until Center Quest supplies them.</p>
            </div>
            <motion.dl
              className={styles.metricList}
              initial={reduced ? false : "hidden"}
              whileInView={reduced ? undefined : "visible"}
              viewport={{ once: true, margin: "-100px" }}
              variants={processContainerVariants}
            >
              {METRICS.map((metric) => (
                <motion.div key={metric} variants={processItemVariants}>
                  <dt>{metric}</dt>
                  <dd>—</dd>
                  <span className={styles.metricStatus}><span className={styles.metricDot} aria-hidden />Verified value pending</span>
                </motion.div>
              ))}
            </motion.dl>
          </div>
        </section>

        <section id="clients" className={styles.clientsSection}>
          <div className={styles.contentShell}>
            <SectionIntro title="Clients who trust the operation" description="A flexible logo wall for the brands Center Quest is authorized to feature." />
            <motion.ul
              className={styles.logoWall}
              aria-label="Client logo placeholders"
              initial={reduced ? false : "hidden"}
              whileInView={reduced ? undefined : "visible"}
              viewport={{ once: true, margin: "-100px" }}
              variants={processContainerVariants}
            >
              {Array.from({ length: 6 }, (_, index) => (
                <motion.li key={index} variants={processItemVariants}>
                  <span className={styles.logoMark}><ServiceIcon name="layout" /></span>
                  <span className={styles.logoSlot}><span className={styles.logoDot} aria-hidden />Slot {String(index + 1).padStart(2, "0")}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </section>

        <section id="case-study" className={styles.caseSection}>
          <div className={styles.contentShell}>
            <SectionIntro title="A result worth examining" description="One featured engagement can explain the challenge, the operating response, and the verified result in depth." />
            <div className={styles.caseGrid}>
              <MediaPlaceholder label="Featured case photo or video" ratio="16:9" />
              <motion.div
                className={styles.caseNarrative}
                initial={reduced ? false : "hidden"}
                whileInView={reduced ? undefined : "visible"}
                viewport={{ once: true, margin: "-100px" }}
                variants={processContainerVariants}
              >
                {[["Challenge", "Client context and operational challenge pending."], ["Solution", "Scope, service model, and implementation details pending."], ["Results", "Verified outcomes and approved metrics pending."]].map(([title, copy], index) => (
                  <motion.div key={title} variants={processItemVariants}>
                    <span className={styles.caseNumber}>0{index + 1}</span>
                    <span>{title}</span>
                    <p>{copy}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <section id="facilities" className={styles.gallerySection}>
          <div className={styles.contentShell}>
            <SectionIntro title="The people and place behind the service" description="Real photography can turn operating capacity into visible evidence. These frames preserve the intended composition." />
            <div className={styles.galleryGrid}>
              <MediaPlaceholder label="Facilities" ratio="4:3" /><MediaPlaceholder label="Operations floor" ratio="4:3" /><MediaPlaceholder label="Team" ratio="4:3" />
            </div>
          </div>
        </section>

        <section className={styles.testimonialSection}>
          <div className={styles.testimonialInner}>
            <span className={styles.quoteMark} aria-hidden>“</span>
            <blockquote><p>Approved client testimonial will appear in this space.</p><footer><span>Client name</span><small>Role · Company</small></footer></blockquote>
            <div className={styles.portraitPlaceholder}>Portrait<br />1:1</div>
          </div>
        </section>

        <section id="contact" className={styles.contactSection}>
          <div className={styles.contactInner}>
            <div><h2>Let’s design the right operation.</h2><p>This section is prepared to connect with the smart quote form and direct contact channels in the next phase.</p></div>
            <div className={styles.contactPlaceholder}><span>Quote form integration</span><strong>Pending connection</strong></div>
          </div>
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
