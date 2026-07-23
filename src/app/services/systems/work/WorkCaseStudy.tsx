"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { ServiceIconName } from "@/components/services/data";
import Footer from "../components/Footer";
import {
  focusRiseVariants,
  groupVariants,
  ruleXVariants,
  softRiseVariants,
  stepVariants,
  VIEWPORT,
} from "@/components/services/motion";
import {
  AgentDashboardScreen,
  AnalyticsScreen,
  ContactCenterScreen,
  ReportingScreen,
} from "./components/ScreenPreview";
import styles from "./work.module.css";

/* ── Case-study content ───────────────────────────────────
   A published Systems case study, presented generically (no client brand).
   Every claim maps to what the system actually does — nothing invented. */

const META: { label: string; value: string }[] = [
  { label: "Discipline", value: "Design & engineering" },
  { label: "Sector", value: "Contact center · Support operations" },
  { label: "Type", value: "Custom platform" },
  { label: "Core stack", value: "Next.js · NestJS · PostgreSQL" },
];

const STEPS: { title: string; text: string }[] = [
  {
    title: "A call happens",
    text: "Inbound or outbound, every call is placed through cloud telephony — agents dial and answer from an embedded softphone right inside the platform.",
  },
  {
    title: "The platform captures it automatically",
    text: "Telephony posts each event to a verified webhook. The system turns it into a call record, matches or creates the customer, and provisions the agent — with no manual data entry.",
  },
  {
    title: "The agent works it in one view",
    text: "In the Contact Center, calls, tickets and manual records share a single list. The agent sets a disposition, a campaign outcome, notes and a follow-up.",
  },
  {
    title: "Everyone sees it live",
    text: "Changes push to every screen over WebSockets — live-call indicators, ticket assignments, due callbacks — with no page refresh and no polling.",
  },
  {
    title: "Nothing falls through",
    text: "Background jobs and schedulers watch for overdue callbacks, follow-ups and scheduled calls, and notify the right agent the moment something comes due.",
  },
  {
    title: "It all rolls up",
    text: "Calls, tickets and outcomes consolidate into per-site and per-campaign dashboards — and into PDF and Excel exports generated on demand.",
  },
];

const SYSTEMS_BLOCKS: { icon: ServiceIconName; title: string; text: string }[] = [
  {
    icon: "messages",
    title: "Real-time over WebSockets",
    text: "A Socket.IO channel pushes live-call changes, ticket assignments and due callbacks to the exact agent who needs them. The client collapses bursts of events into a single debounced refresh, so the UI stays current without polling the server.",
  },
  {
    icon: "share",
    title: "Verified telephony webhooks",
    text: "Every telephony event arrives on a webhook authenticated with a constant-time token check. An idempotent ingestion engine absorbs the messiness of real phone traffic — duplicate events, transfers, voicemail vs. missed, bridge legs — and normalizes numbers so a customer is never duplicated.",
  },
  {
    icon: "workflow",
    title: "Background jobs & scheduling",
    text: "A Redis-backed job queue (BullMQ) and cron safety-nets flip overdue items, deduplicate notifications at the database level, and reach the right agent — so a promised callback is never quietly missed.",
  },
  {
    icon: "layers",
    title: "Integrations",
    text: "Cloud telephony for calls and SMS with an embedded softphone; a transactional email service for account and reset messages; and object storage for recordings and attachments, served through short-lived presigned URLs.",
  },
];

const TECH: { group: string; items: string[] }[] = [
  {
    group: "Frontend",
    items: ["Next.js 16 (App Router)", "React 19 + React Compiler", "TypeScript", "Tailwind CSS v4", "shadcn/ui + Radix", "SWR", "Socket.IO client", "Recharts"],
  },
  {
    group: "Backend",
    items: ["NestJS 11", "Node + Express", "TypeScript", "TypeORM", "class-validator", "Swagger / OpenAPI"],
  },
  {
    group: "Data & real-time",
    items: ["PostgreSQL", "Redis", "Socket.IO", "BullMQ"],
  },
  {
    group: "Infrastructure",
    items: ["Railway (API)", "Vercel (web)", "S3 object storage", "Brevo email"],
  },
  {
    group: "Quality",
    items: ["Jest + Supertest", "ESLint + Prettier", "Unlighthouse"],
  },
];

const SECURITY: { title: string; tag: string; text: string }[] = [
  {
    title: "HttpOnly BFF session",
    tag: "Session",
    text: "The auth token lives in an HttpOnly, Secure cookie the browser's JavaScript can never read; a backend-for-frontend attaches it server-to-server on every request.",
  },
  {
    title: "JWT + bcrypt",
    tag: "Auth",
    text: "Stateless JWT authentication with bcrypt-hashed passwords. The API refuses to start without its signing secret.",
  },
  {
    title: "Role-based access",
    tag: "Access",
    text: "Three roles — agent, admin, dev — enforced both at the API with guards and at the edge with route gates.",
  },
  {
    title: "Scoped socket tokens",
    tag: "Access",
    text: "WebSockets use a separate ~2-minute token the REST API explicitly rejects, so a leaked socket token can never reach your data.",
  },
  {
    title: "Distributed rate limiting",
    tag: "Rate limits",
    text: "A Redis-backed limiter shared across server replicas, keyed per user, with tighter limits on login and password reset.",
  },
  {
    title: "Constant-time webhooks",
    tag: "Webhooks",
    text: "Inbound telephony webhooks are authenticated with a constant-time token comparison that resists timing attacks.",
  },
  {
    title: "Strict input validation",
    tag: "Validation",
    text: "Every request body is validated and stripped to an allow-list before it reaches any business logic.",
  },
  {
    title: "Hardened transport",
    tag: "Transport",
    text: "Helmet security headers with a content-security policy, CORS locked to the frontend origin, and per-request timeouts.",
  },
  {
    title: "Safe file handling",
    tag: "Storage",
    text: "Uploads are size-capped and stored privately; files are served only through short-lived presigned URLs — never public objects.",
  },
  {
    title: "Careful secrets & data",
    tag: "Secrets",
    text: "Secrets read from the environment and masked in logs, destructive schema sync disabled by default, sensitive fields excluded from responses, and soft deletes throughout.",
  },
  {
    title: "Scoped API keys",
    tag: "API keys",
    text: "Programmatic access uses hashed API keys with explicit scopes, expiry and last-used tracking.",
  },
];

const MANAGES = [
  "Calls", "Tickets", "Manual records", "Scheduled calls", "Customers", "Campaigns",
  "Sites", "Owners", "Phone lines", "SMS analytics", "Notifications", "Users & agents",
  "Reports & exports", "API keys", "Configurable dictionaries",
];

type FlowIconName = "browser" | "gateway" | "api" | "database";

const FLOW: { name: string; role: string; icon: FlowIconName; accent?: boolean }[] = [
  { name: "Browser", role: "Client", icon: "browser" },
  { name: "Next.js BFF", role: "Session · proxy", icon: "gateway", accent: true },
  { name: "NestJS API", role: "Domain · data", icon: "api", accent: true },
  { name: "PostgreSQL · Redis · S3", role: "Data stores", icon: "database" },
];

/* Monoline glyphs for the architecture nodes (viewBox 0 0 24 24, currentColor
   stroke) — a window, a proxy relay, API braces, a datastore cylinder. */
const FLOW_ICON: Record<FlowIconName, ReactNode> = {
  browser: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9.5h18M6.5 7.3h.01M9 7.3h.01" />
    </>
  ),
  gateway: (
    <>
      <path d="M4 9h13M14 6l3 3-3 3" />
      <path d="M20 15H7M10 12l-3 3 3 3" />
    </>
  ),
  api: (
    <>
      <path d="M8.5 4C6.8 4 6.8 6 6.8 8c0 1.4-.9 2-1.8 2 .9 0 1.8.6 1.8 2 0 2 0 4 1.7 4" />
      <path d="M15.5 4c1.7 0 1.7 2 1.7 4 0 1.4.9 2 1.8 2-.9 0-1.8.6-1.8 2 0 2 0 4-1.7 4" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="2.6" />
      <path d="M5 6v12c0 1.44 3.13 2.6 7 2.6s7-1.16 7-2.6V6" />
      <path d="M5 12c0 1.44 3.13 2.6 7 2.6s7-1.16 7-2.6" />
    </>
  ),
};

function FlowGlyph({ name }: { name: FlowIconName }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {FLOW_ICON[name]}
    </svg>
  );
}

/* Small accent rule + kicker + heading — the section-opening beat every
   block below shares, echoing SectionIntro's rule-then-title grammar at a
   narrower, single-column scale suited to a long-form case study. */
function SectionHead({ label, title, reduced }: { label: string; title: string; reduced: boolean }) {
  return (
    <motion.div
      className={styles.sectionHead}
      initial={reduced ? false : "hidden"}
      whileInView={reduced ? undefined : "visible"}
      viewport={VIEWPORT}
      variants={groupVariants}
    >
      <motion.span className={styles.sectionRule} aria-hidden variants={ruleXVariants} />
      <motion.p className={styles.sectionLabel} variants={focusRiseVariants}>{label}</motion.p>
      <motion.h2 className={styles.sectionTitle} variants={focusRiseVariants}>{title}</motion.h2>
    </motion.div>
  );
}

export default function WorkCaseStudy() {
  const reduced = useReducedMotion() ?? false;

  return (
    <article className={styles.page}>
      <div className={styles.shell}>
        <Link href="/services/systems#work" className={styles.back}>
          <svg aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 10H4M8.5 5.5 4 10l4.5 4.5" />
          </svg>
          Back to Systems
        </Link>

        {/* ── Header — editorial masthead: title block + spec sheet ── */}
        <motion.header
          className={styles.head}
          initial={reduced ? false : "hidden"}
          animate="visible"
          variants={groupVariants}
        >
          <motion.div className={styles.headMain} variants={groupVariants}>
            <motion.span className={styles.chip} variants={focusRiseVariants}>
              <ServiceIcon name="layout" />
              Case study · Platform
            </motion.span>
            <motion.h1 className={styles.title} variants={focusRiseVariants}>
              A contact-center operations platform
            </motion.h1>
            <motion.p className={styles.lede} variants={focusRiseVariants}>
              A custom platform that runs an entire call-center operation from one
              place — automatically capturing every call from cloud telephony,
              turning it into a trackable record, and rolling calls, tickets,
              campaigns and follow-ups into real-time dashboards and reporting.
            </motion.p>
          </motion.div>
          <motion.dl className={styles.spec} variants={focusRiseVariants}>
            {META.map((item) => (
              <div key={item.label} className={styles.specRow}>
                <dt className={styles.specLabel}>{item.label}</dt>
                <dd className={styles.specValue}>{item.value}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.header>

        <ContactCenterScreen reduced={reduced} />

        {/* ── Challenge / solution ── */}
        <motion.section
          className={styles.section}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          <div className={styles.split}>
            <motion.div className={styles.splitCol} variants={focusRiseVariants}>
              <p className={styles.sectionLabel}>The challenge</p>
              <p className={styles.prose}>
                The operation ran inbound and outbound phone campaigns —
                onboarding and collections — across dozens of client sites on
                behalf of their owners. Calls, SMS, support tickets, manual notes
                and follow-ups lived in different places. Phone activity was
                logged by hand, there was no single record of a customer, and no
                live view of what the floor was doing right now.
              </p>
            </motion.div>
            <motion.div className={styles.splitCol} variants={focusRiseVariants}>
              <p className={styles.sectionLabel}>The solution</p>
              <p className={styles.prose}>
                We designed and built one system of record for the whole phone
                operation. Cloud telephony feeds calls in automatically; each
                interaction becomes a record an agent can classify and follow up;
                and everything the operation touches — customers, campaigns,
                sites, tickets — rolls up into real-time dashboards and per-site
                reporting the team can export on demand.
              </p>
            </motion.div>
          </div>
        </motion.section>

        <div className={styles.divider} />

        {/* ── How it works, step by step ── */}
        <section className={styles.section}>
          <SectionHead label="How it works" title="From a ringing phone to a report" reduced={reduced} />
          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <motion.li
                key={step.title}
                className={styles.step}
                initial={reduced ? false : "hidden"}
                whileInView={reduced ? undefined : "visible"}
                viewport={VIEWPORT}
                variants={stepVariants}
              >
                <motion.span className={styles.stepRule} aria-hidden variants={ruleXVariants} />
                <motion.span className={styles.stepNum} aria-hidden variants={focusRiseVariants}>
                  {String(index + 1).padStart(2, "0")}
                </motion.span>
                <motion.h3 className={styles.stepTitle} variants={focusRiseVariants}>{step.title}</motion.h3>
                <motion.p className={styles.stepText} variants={focusRiseVariants}>{step.text}</motion.p>
              </motion.li>
            ))}
          </ol>
        </section>

        <AgentDashboardScreen reduced={reduced} />

        <div className={styles.divider} />

        {/* ── Architecture ── */}
        <section className={styles.section}>
          <SectionHead label="Architecture" title="Two services, one front door" reduced={reduced} />
          <motion.div
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "visible"}
            viewport={VIEWPORT}
            variants={groupVariants}
          >
            <motion.p className={styles.prose} variants={focusRiseVariants}>
              The browser only ever talks to a Next.js <strong>backend-for-frontend (BFF)</strong>,
              which holds the session and forwards every request, server-to-server, to a NestJS API.
              That API owns the data in PostgreSQL, with Redis for queues and rate limiting and
              object storage for call recordings and attachments. One proxy sits in front of the
              whole backend — the browser never holds a token, and every call passes through a
              single, hardened path.
            </motion.p>
            <motion.div
              className={styles.flow}
              role="img"
              aria-label="Request path: Browser to Next.js BFF to NestJS API to PostgreSQL, Redis and S3."
              variants={focusRiseVariants}
            >
              {FLOW.map((node, index) => (
                <Fragment key={node.name}>
                  <span className={styles.flowNode} data-accent={node.accent || undefined} aria-hidden>
                    <span className={styles.flowIcon}><FlowGlyph name={node.icon} /></span>
                    <span className={styles.flowText}>
                      <span className={styles.flowName}>{node.name}</span>
                      <span className={styles.flowRole}>{node.role}</span>
                    </span>
                  </span>
                  {index < FLOW.length - 1 && (
                    <span className={styles.flowArrow} aria-hidden>
                      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m4.5 2.5 4 3.5-4 3.5" />
                      </svg>
                    </span>
                  )}
                </Fragment>
              ))}
            </motion.div>
          </motion.div>
        </section>

        <div className={styles.divider} />

        {/* ── Real-time & integrations ── */}
        <section className={styles.section}>
          <SectionHead label="Real-time & integrations" title="Built to stay live" reduced={reduced} />
          <motion.div
            className={styles.blocks}
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "visible"}
            viewport={VIEWPORT}
            variants={groupVariants}
          >
            {SYSTEMS_BLOCKS.map((block) => (
              <motion.div key={block.title} className={styles.block} variants={softRiseVariants}>
                <span className={styles.blockIcon}><ServiceIcon name={block.icon} /></span>
                <h3 className={styles.blockTitle}>{block.title}</h3>
                <p className={styles.blockText}>{block.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <div className={styles.divider} />

        {/* ── Technology ── */}
        <section className={styles.section}>
          <SectionHead label="Technology" title="The full stack" reduced={reduced} />
          <motion.table
            className={`${styles.table} ${styles.techTable}`}
            role="table"
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "visible"}
            viewport={VIEWPORT}
            variants={groupVariants}
          >
            <thead role="rowgroup">
              <tr className={styles.tableHeadRow} role="row">
                <th role="columnheader" scope="col">Layer</th>
                <th role="columnheader" scope="col">Technologies</th>
              </tr>
            </thead>
            <motion.tbody role="rowgroup" variants={groupVariants}>
              {TECH.map((group, index) => (
                <motion.tr key={group.group} className={styles.techRow} role="row" variants={focusRiseVariants}>
                  <th className={styles.techLayer} role="rowheader" scope="row">
                    <span className={styles.rowIndex} aria-hidden>{String(index + 1).padStart(2, "0")}</span>
                    <span className={styles.techLayerName}>{group.group}</span>
                  </th>
                  <td role="cell">
                    <ul className={styles.chips}>
                      {group.items.map((item) => (
                        <li key={item} className={styles.techChip}>{item}</li>
                      ))}
                    </ul>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </motion.table>
        </section>

        <div className={styles.divider} />

        {/* ── Security ── */}
        <section className={styles.section}>
          <SectionHead label="Security" title="Hardened at every layer" reduced={reduced} />
          <motion.table
            className={`${styles.table} ${styles.secTable}`}
            role="table"
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "visible"}
            viewport={VIEWPORT}
            variants={groupVariants}
          >
            <thead role="rowgroup">
              <tr className={styles.tableHeadRow} role="row">
                <th role="columnheader" scope="col">Control</th>
                <th role="columnheader" scope="col">Layer</th>
                <th role="columnheader" scope="col">What it protects</th>
              </tr>
            </thead>
            <motion.tbody role="rowgroup" variants={groupVariants}>
              {SECURITY.map((item, index) => (
                <motion.tr key={item.title} className={styles.secRow} role="row" variants={focusRiseVariants}>
                  <th className={styles.secControl} role="rowheader" scope="row">
                    <span className={styles.rowIndex} aria-hidden>{String(index + 1).padStart(2, "0")}</span>
                    {item.title}
                  </th>
                  <td role="cell"><span className={styles.tag}>{item.tag}</span></td>
                  <td className={styles.secText} role="cell">{item.text}</td>
                </motion.tr>
              ))}
            </motion.tbody>
          </motion.table>
        </section>

        <div className={styles.divider} />

        {/* ── Scope ── */}
        <section className={styles.section}>
          <SectionHead label="What it manages" title="One system, the whole operation" reduced={reduced} />
          <motion.ul
            className={styles.manages}
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "visible"}
            viewport={VIEWPORT}
            variants={groupVariants}
          >
            {MANAGES.map((item) => (
              <motion.li key={item} className={styles.manageChip} variants={focusRiseVariants}>{item}</motion.li>
            ))}
          </motion.ul>
        </section>

        {/* ── Screenshot gallery ── */}
        <section className={styles.section}>
          <SectionHead label="The system" title="More of the platform" reduced={reduced} />
          <div className={styles.gallery}>
            <AnalyticsScreen reduced={reduced} />
            <ReportingScreen reduced={reduced} />
          </div>
        </section>

        {/* ── CTA ── */}
        <motion.section
          className={styles.closing}
          initial={reduced ? false : "hidden"}
          whileInView={reduced ? undefined : "visible"}
          viewport={VIEWPORT}
          variants={groupVariants}
        >
          <motion.h2 className={styles.closingTitle} variants={focusRiseVariants}>
            Thinking about a system like this?
          </motion.h2>
          <motion.p className={styles.closingLede} variants={focusRiseVariants}>
            Every build starts with a conversation about how your operation
            actually runs — not a template.
          </motion.p>
          <motion.div className={styles.actions} variants={focusRiseVariants}>
            <Link href="/cotizador?servicio=systems" className={styles.primary}>
              Give us a quest <Arrow />
            </Link>
            <Link href="/services/systems#work" className={styles.secondary}>
              Back to Systems
            </Link>
          </motion.div>
        </motion.section>
      </div>
      <Footer />
    </article>
  );
}
