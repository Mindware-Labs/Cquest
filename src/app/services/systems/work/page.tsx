import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { ServiceIconName } from "@/components/services/data";
import styles from "./work.module.css";

export const metadata: Metadata = {
  title: "Contact-center operations platform · Case study | Center Quest",
  description:
    "How we designed and built a custom platform that runs an entire call-center operation — automatic call capture, ticketing, real-time dashboards and per-site reporting.",
};

/* ── Case-study content ───────────────────────────────────
   A published Systems case study, presented generically (no client brand).
   Every claim maps to what the system actually does — nothing invented. Media
   is left as clearly-labeled, reserved slots for real screenshots to drop into. */

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

const SYSTEMS_BLOCKS: {
  icon: ServiceIconName;
  title: string;
  text: string;
}[] = [
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
    items: [
      "Next.js 16 (App Router)",
      "React 19 + React Compiler",
      "TypeScript",
      "Tailwind CSS v4",
      "shadcn/ui + Radix",
      "SWR",
      "Socket.IO client",
      "Recharts",
    ],
  },
  {
    group: "Backend",
    items: [
      "NestJS 11",
      "Node + Express",
      "TypeScript",
      "TypeORM",
      "class-validator",
      "Swagger / OpenAPI",
    ],
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

const SECURITY: { title: string; text: string }[] = [
  {
    title: "HttpOnly BFF session",
    text: "The auth token lives in an HttpOnly, Secure cookie the browser's JavaScript can never read; a backend-for-frontend attaches it server-to-server on every request.",
  },
  {
    title: "JWT + bcrypt",
    text: "Stateless JWT authentication with bcrypt-hashed passwords. The API refuses to start without its signing secret.",
  },
  {
    title: "Role-based access",
    text: "Three roles — agent, admin, dev — enforced both at the API with guards and at the edge with route gates.",
  },
  {
    title: "Scoped socket tokens",
    text: "WebSockets use a separate ~2-minute token the REST API explicitly rejects, so a leaked socket token can never reach your data.",
  },
  {
    title: "Distributed rate limiting",
    text: "A Redis-backed limiter shared across server replicas, keyed per user, with tighter limits on login and password reset.",
  },
  {
    title: "Constant-time webhooks",
    text: "Inbound telephony webhooks are authenticated with a constant-time token comparison that resists timing attacks.",
  },
  {
    title: "Strict input validation",
    text: "Every request body is validated and stripped to an allow-list before it reaches any business logic.",
  },
  {
    title: "Hardened transport",
    text: "Helmet security headers with a content-security policy, CORS locked to the frontend origin, and per-request timeouts.",
  },
  {
    title: "Safe file handling",
    text: "Uploads are size-capped and stored privately; files are served only through short-lived presigned URLs — never public objects.",
  },
  {
    title: "Careful secrets & data",
    text: "Secrets read from the environment and masked in logs, destructive schema sync disabled by default, sensitive fields excluded from responses, and soft deletes throughout.",
  },
  {
    title: "Scoped API keys",
    text: "Programmatic access uses hashed API keys with explicit scopes, expiry and last-used tracking.",
  },
];

const MANAGES = [
  "Calls",
  "Tickets",
  "Manual records",
  "Scheduled calls",
  "Customers",
  "Campaigns",
  "Sites",
  "Owners",
  "Phone lines",
  "SMS analytics",
  "Notifications",
  "Users & agents",
  "Reports & exports",
  "API keys",
  "Configurable dictionaries",
];

/* A reserved screenshot slot — the same recessed frame with registration ticks
   the Selected work gallery uses. Drop a real capture in later; the layout holds. */
function Shot({
  label,
  meta = "16 : 9 · WebP",
  ratio = "16 / 9",
  icon = "layout",
}: {
  label: string;
  meta?: string;
  ratio?: string;
  icon?: ServiceIconName;
}) {
  return (
    <div
      className={styles.shot}
      style={{ "--shot-ratio": ratio } as CSSProperties}
    >
      <div className={styles.shotInner}>
        <span className={styles.shotIcon}>
          <ServiceIcon name={icon} />
        </span>
        <span className={styles.shotLabel}>{label}</span>
        <span className={styles.shotMeta}>{meta}</span>
      </div>
      <span className={styles.tick} data-c="tl" aria-hidden />
      <span className={styles.tick} data-c="tr" aria-hidden />
      <span className={styles.tick} data-c="bl" aria-hidden />
      <span className={styles.tick} data-c="br" aria-hidden />
    </div>
  );
}

export default function WorkCaseStudyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/services/systems#work" className={styles.back}>
          <svg aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 10H4M8.5 5.5 4 10l4.5 4.5" />
          </svg>
          Back to Systems
        </Link>

        {/* ── Header ── */}
        <header className={styles.head}>
          <span className={styles.chip}>
            <ServiceIcon name="layout" />
            Case study · Platform
          </span>
          <h1 className={styles.title}>
            A contact-center operations platform
          </h1>
          <p className={styles.lede}>
            A custom platform that runs an entire call-center operation from one
            place — automatically capturing every call from cloud telephony,
            turning it into a trackable record, and rolling calls, tickets,
            campaigns and follow-ups into real-time dashboards and reporting.
          </p>
          <dl className={styles.meta}>
            {META.map((item) => (
              <div key={item.label} className={styles.metaItem}>
                <dt className={styles.metaLabel}>{item.label}</dt>
                <dd className={styles.metaValue}>{item.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <Shot label="Contact Center — the unified calls, tickets & records view" />

        {/* ── Challenge / solution ── */}
        <section className={styles.section}>
          <div className={styles.split}>
            <div className={styles.splitCol}>
              <p className={styles.sectionLabel}>The challenge</p>
              <p className={styles.prose}>
                The operation ran inbound and outbound phone campaigns —
                onboarding and collections — across dozens of client sites on
                behalf of their owners. Calls, SMS, support tickets, manual notes
                and follow-ups lived in different places. Phone activity was
                logged by hand, there was no single record of a customer, and no
                live view of what the floor was doing right now.
              </p>
            </div>
            <div className={styles.splitCol}>
              <p className={styles.sectionLabel}>The solution</p>
              <p className={styles.prose}>
                We designed and built one system of record for the whole phone
                operation. Cloud telephony feeds calls in automatically; each
                interaction becomes a record an agent can classify and follow up;
                and everything the operation touches — customers, campaigns,
                sites, tickets — rolls up into real-time dashboards and per-site
                reporting the team can export on demand.
              </p>
            </div>
          </div>
        </section>

        <div className={styles.divider} />

        {/* ── How it works, step by step ── */}
        <section className={styles.section}>
          <p className={styles.sectionLabel}>How it works</p>
          <h2 className={styles.sectionTitle}>From a ringing phone to a report</h2>
          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.stepNum} aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <Shot
          label="Agent dashboard — live call, ticket & callback status"
          icon="gauge"
        />

        <div className={styles.divider} />

        {/* ── Architecture ── */}
        <section className={styles.section}>
          <p className={styles.sectionLabel}>Architecture</p>
          <h2 className={styles.sectionTitle}>Two services, one front door</h2>
          <p className={styles.prose}>
            The browser only ever talks to a Next.js{" "}
            <strong>backend-for-frontend (BFF)</strong>, which holds the session
            and forwards every request, server-to-server, to a NestJS API. That
            API owns the data in PostgreSQL, with Redis for queues and rate
            limiting and object storage for call recordings and attachments. One
            proxy sits in front of the whole backend — the browser never holds a
            token, and every call passes through a single, hardened path.
          </p>
          <div className={styles.flow} aria-hidden>
            <span className={styles.flowNode}>Browser</span>
            <span className={styles.flowArrow}>→</span>
            <span className={styles.flowNode} data-accent>Next.js BFF</span>
            <span className={styles.flowArrow}>→</span>
            <span className={styles.flowNode} data-accent>NestJS API</span>
            <span className={styles.flowArrow}>→</span>
            <span className={styles.flowNode}>PostgreSQL · Redis · S3</span>
          </div>
        </section>

        <div className={styles.divider} />

        {/* ── Real-time & integrations ── */}
        <section className={styles.section}>
          <p className={styles.sectionLabel}>Real-time & integrations</p>
          <h2 className={styles.sectionTitle}>Built to stay live</h2>
          <div className={styles.blocks}>
            {SYSTEMS_BLOCKS.map((block) => (
              <div key={block.title} className={styles.block}>
                <span className={styles.blockIcon}>
                  <ServiceIcon name={block.icon} />
                </span>
                <h3 className={styles.blockTitle}>{block.title}</h3>
                <p className={styles.blockText}>{block.text}</p>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.divider} />

        {/* ── Technology ── */}
        <section className={styles.section}>
          <p className={styles.sectionLabel}>Technology</p>
          <h2 className={styles.sectionTitle}>The full stack</h2>
          <div className={styles.stack}>
            {TECH.map((group) => (
              <div key={group.group} className={styles.stackGroup}>
                <p className={styles.stackLabel}>{group.group}</p>
                <ul className={styles.chips}>
                  {group.items.map((item) => (
                    <li key={item} className={styles.techChip}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.divider} />

        {/* ── Security ── */}
        <section className={styles.section}>
          <p className={styles.sectionLabel}>Security</p>
          <h2 className={styles.sectionTitle}>
            Hardened at every layer
          </h2>
          <div className={styles.security}>
            {SECURITY.map((item) => (
              <div key={item.title} className={styles.secItem}>
                <span className={styles.secIcon}>
                  <ServiceIcon name="shield" />
                </span>
                <div>
                  <h3 className={styles.secTitle}>{item.title}</h3>
                  <p className={styles.secText}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.divider} />

        {/* ── Scope ── */}
        <section className={styles.section}>
          <p className={styles.sectionLabel}>What it manages</p>
          <h2 className={styles.sectionTitle}>One system, the whole operation</h2>
          <ul className={styles.manages}>
            {MANAGES.map((item) => (
              <li key={item} className={styles.manageChip}>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Screenshot gallery ── */}
        <section className={styles.section}>
          <p className={styles.sectionLabel}>The system</p>
          <div className={styles.gallery}>
            <Shot label="Analytics dashboard" ratio="16 / 10" meta="16 : 10 · WebP" icon="chart" />
            <Shot label="Per-site reporting & exports" ratio="16 / 10" meta="16 : 10 · WebP" icon="clipboard-check" />
          </div>
        </section>

        {/* ── CTA ── */}
        <div className={styles.actions}>
          <Link href="/services/systems#contact" className={styles.primary}>
            Request a quote
            <svg aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10h12M11.5 5.5 16 10l-4.5 4.5" />
            </svg>
          </Link>
          <Link href="/services/systems#work" className={styles.secondary}>
            Back to Systems
          </Link>
        </div>
      </div>
    </main>
  );
}
