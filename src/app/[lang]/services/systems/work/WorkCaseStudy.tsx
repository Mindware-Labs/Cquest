"use client";

import { Fragment, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import Arrow from "@/components/services/Arrow";
import ServiceIcon from "@/components/services/ServiceIcon";
import type { ServiceIconName } from "@/components/services/data";
import { LocalizedLink } from "@/i18n/LocalizedLink";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/config";
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

type Bi = Record<Locale, string>;

const META: { label: Bi; value: Bi }[] = [
  { label: { en: "Discipline", es: "Disciplina" }, value: { en: "Design & engineering", es: "Diseño e ingeniería" } },
  { label: { en: "Sector", es: "Sector" }, value: { en: "Contact center · Support operations", es: "Contact center · Operaciones de soporte" } },
  { label: { en: "Type", es: "Tipo" }, value: { en: "Custom platform", es: "Plataforma a la medida" } },
  { label: { en: "Core stack", es: "Stack principal" }, value: { en: "Next.js · NestJS · PostgreSQL", es: "Next.js · NestJS · PostgreSQL" } },
];

const STEPS: { title: Bi; text: Bi }[] = [
  {
    title: { en: "A call happens", es: "Ocurre una llamada" },
    text: {
      en: "Inbound or outbound, every call is placed through cloud telephony — agents dial and answer from an embedded softphone right inside the platform.",
      es: "Entrante o saliente, cada llamada se realiza a través de telefonía en la nube — los agentes marcan y responden desde un softphone integrado directamente en la plataforma.",
    },
  },
  {
    title: { en: "The platform captures it automatically", es: "La plataforma la captura automáticamente" },
    text: {
      en: "Telephony posts each event to a verified webhook. The system turns it into a call record, matches or creates the customer, and provisions the agent — with no manual data entry.",
      es: "La telefonía envía cada evento a un webhook verificado. El sistema lo convierte en un registro de llamada, encuentra o crea al cliente, y asigna al agente — sin captura manual de datos.",
    },
  },
  {
    title: { en: "The agent works it in one view", es: "El agente lo gestiona en una sola vista" },
    text: {
      en: "In the Contact Center, calls, tickets and manual records share a single list. The agent sets a disposition, a campaign outcome, notes and a follow-up.",
      es: "En el Contact Center, llamadas, tickets y registros manuales comparten una sola lista. El agente define una disposición, un resultado de campaña, notas y un seguimiento.",
    },
  },
  {
    title: { en: "Everyone sees it live", es: "Todos lo ven en vivo" },
    text: {
      en: "Changes push to every screen over WebSockets — live-call indicators, ticket assignments, due callbacks — with no page refresh and no polling.",
      es: "Los cambios se transmiten a cada pantalla mediante WebSockets — indicadores de llamada en vivo, asignaciones de tickets, devoluciones de llamada pendientes — sin recargar la página ni hacer polling.",
    },
  },
  {
    title: { en: "Nothing falls through", es: "Nada se pierde" },
    text: {
      en: "Background jobs and schedulers watch for overdue callbacks, follow-ups and scheduled calls, and notify the right agent the moment something comes due.",
      es: "Tareas en segundo plano y programadores vigilan devoluciones de llamada, seguimientos y llamadas programadas vencidas, y notifican al agente correcto en el momento en que algo vence.",
    },
  },
  {
    title: { en: "It all rolls up", es: "Todo se consolida" },
    text: {
      en: "Calls, tickets and outcomes consolidate into per-site and per-campaign dashboards — and into PDF and Excel exports generated on demand.",
      es: "Llamadas, tickets y resultados se consolidan en dashboards por sede y por campaña — y en exportaciones a PDF y Excel generadas bajo demanda.",
    },
  },
];

const SYSTEMS_BLOCKS: { icon: ServiceIconName; title: Bi; text: Bi }[] = [
  {
    icon: "messages",
    title: { en: "Real-time over WebSockets", es: "Tiempo real sobre WebSockets" },
    text: {
      en: "A Socket.IO channel pushes live-call changes, ticket assignments and due callbacks to the exact agent who needs them. The client collapses bursts of events into a single debounced refresh, so the UI stays current without polling the server.",
      es: "Un canal de Socket.IO envía cambios de llamadas en vivo, asignaciones de tickets y devoluciones de llamada pendientes exactamente al agente que las necesita. El cliente agrupa ráfagas de eventos en una sola actualización con debounce, para que la interfaz se mantenga al día sin hacer polling al servidor.",
    },
  },
  {
    icon: "share",
    title: { en: "Verified telephony webhooks", es: "Webhooks de telefonía verificados" },
    text: {
      en: "Every telephony event arrives on a webhook authenticated with a constant-time token check. An idempotent ingestion engine absorbs the messiness of real phone traffic — duplicate events, transfers, voicemail vs. missed, bridge legs — and normalizes numbers so a customer is never duplicated.",
      es: "Cada evento de telefonía llega a un webhook autenticado con una verificación de token de tiempo constante. Un motor de ingesta idempotente absorbe el desorden del tráfico telefónico real — eventos duplicados, transferencias, buzón de voz vs. llamada perdida, tramos de puente — y normaliza los números para que un cliente nunca se duplique.",
    },
  },
  {
    icon: "workflow",
    title: { en: "Background jobs & scheduling", es: "Tareas en segundo plano y programación" },
    text: {
      en: "A Redis-backed job queue (BullMQ) and cron safety-nets flip overdue items, deduplicate notifications at the database level, and reach the right agent — so a promised callback is never quietly missed.",
      es: "Una cola de tareas respaldada por Redis (BullMQ) y redes de seguridad con cron marcan los elementos vencidos, deduplican notificaciones a nivel de base de datos, y llegan al agente correcto — para que una devolución de llamada prometida nunca se pierda silenciosamente.",
    },
  },
  {
    icon: "layers",
    title: { en: "Integrations", es: "Integraciones" },
    text: {
      en: "Cloud telephony for calls and SMS with an embedded softphone; a transactional email service for account and reset messages; and object storage for recordings and attachments, served through short-lived presigned URLs.",
      es: "Telefonía en la nube para llamadas y SMS con un softphone integrado; un servicio de correo transaccional para mensajes de cuenta y restablecimiento; y almacenamiento de objetos para grabaciones y adjuntos, servidos mediante URLs firmadas de corta duración.",
    },
  },
];

const TECH: { group: Bi; items: string[] }[] = [
  {
    group: { en: "Frontend", es: "Frontend" },
    items: ["Next.js 16 (App Router)", "React 19 + React Compiler", "TypeScript", "Tailwind CSS v4", "shadcn/ui + Radix", "SWR", "Socket.IO client", "Recharts"],
  },
  {
    group: { en: "Backend", es: "Backend" },
    items: ["NestJS 11", "Node + Express", "TypeScript", "TypeORM", "class-validator", "Swagger / OpenAPI"],
  },
  {
    group: { en: "Data & real-time", es: "Datos y tiempo real" },
    items: ["PostgreSQL", "Redis", "Socket.IO", "BullMQ"],
  },
  {
    group: { en: "Infrastructure", es: "Infraestructura" },
    items: ["Railway (API)", "Vercel (web)", "S3 object storage", "Brevo email"],
  },
  {
    group: { en: "Quality", es: "Calidad" },
    items: ["Jest + Supertest", "ESLint + Prettier", "Unlighthouse"],
  },
];

const SECURITY: { title: Bi; tag: Bi; text: Bi }[] = [
  {
    title: { en: "HttpOnly BFF session", es: "Sesión BFF HttpOnly" },
    tag: { en: "Session", es: "Sesión" },
    text: {
      en: "The auth token lives in an HttpOnly, Secure cookie the browser’s JavaScript can never read; a backend-for-frontend attaches it server-to-server on every request.",
      es: "El token de autenticación vive en una cookie HttpOnly y Secure que el JavaScript del navegador nunca puede leer; un backend-for-frontend la adjunta servidor a servidor en cada solicitud.",
    },
  },
  {
    title: { en: "JWT + bcrypt", es: "JWT + bcrypt" },
    tag: { en: "Auth", es: "Autenticación" },
    text: {
      en: "Stateless JWT authentication with bcrypt-hashed passwords. The API refuses to start without its signing secret.",
      es: "Autenticación JWT sin estado con contraseñas hasheadas con bcrypt. La API se niega a iniciar sin su clave secreta de firma.",
    },
  },
  {
    title: { en: "Role-based access", es: "Acceso basado en roles" },
    tag: { en: "Access", es: "Acceso" },
    text: {
      en: "Three roles — agent, admin, dev — enforced both at the API with guards and at the edge with route gates.",
      es: "Tres roles — agente, admin, dev — aplicados tanto en la API con guards como en el edge con controles de ruta.",
    },
  },
  {
    title: { en: "Scoped socket tokens", es: "Tokens de socket con alcance limitado" },
    tag: { en: "Access", es: "Acceso" },
    text: {
      en: "WebSockets use a separate ~2-minute token the REST API explicitly rejects, so a leaked socket token can never reach your data.",
      es: "Los WebSockets usan un token separado de ~2 minutos que la API REST rechaza explícitamente, para que un token de socket filtrado nunca pueda alcanzar tus datos.",
    },
  },
  {
    title: { en: "Distributed rate limiting", es: "Limitación de tasa distribuida" },
    tag: { en: "Rate limits", es: "Límites de tasa" },
    text: {
      en: "A Redis-backed limiter shared across server replicas, keyed per user, with tighter limits on login and password reset.",
      es: "Un limitador respaldado por Redis compartido entre réplicas del servidor, con clave por usuario, con límites más estrictos en el inicio de sesión y el restablecimiento de contraseña.",
    },
  },
  {
    title: { en: "Constant-time webhooks", es: "Webhooks de tiempo constante" },
    tag: { en: "Webhooks", es: "Webhooks" },
    text: {
      en: "Inbound telephony webhooks are authenticated with a constant-time token comparison that resists timing attacks.",
      es: "Los webhooks entrantes de telefonía se autentican con una comparación de tokens de tiempo constante que resiste ataques de temporización.",
    },
  },
  {
    title: { en: "Strict input validation", es: "Validación estricta de entradas" },
    tag: { en: "Validation", es: "Validación" },
    text: {
      en: "Every request body is validated and stripped to an allow-list before it reaches any business logic.",
      es: "Cada cuerpo de solicitud se valida y se reduce a una lista de campos permitidos antes de llegar a cualquier lógica de negocio.",
    },
  },
  {
    title: { en: "Hardened transport", es: "Transporte reforzado" },
    tag: { en: "Transport", es: "Transporte" },
    text: {
      en: "Helmet security headers with a content-security policy, CORS locked to the frontend origin, and per-request timeouts.",
      es: "Cabeceras de seguridad Helmet con una política de seguridad de contenido, CORS restringido al origen del frontend, y timeouts por solicitud.",
    },
  },
  {
    title: { en: "Safe file handling", es: "Manejo seguro de archivos" },
    tag: { en: "Storage", es: "Almacenamiento" },
    text: {
      en: "Uploads are size-capped and stored privately; files are served only through short-lived presigned URLs — never public objects.",
      es: "Las subidas tienen un límite de tamaño y se almacenan de forma privada; los archivos se sirven solo mediante URLs firmadas de corta duración — nunca como objetos públicos.",
    },
  },
  {
    title: { en: "Careful secrets & data", es: "Manejo cuidadoso de secretos y datos" },
    tag: { en: "Secrets", es: "Secretos" },
    text: {
      en: "Secrets read from the environment and masked in logs, destructive schema sync disabled by default, sensitive fields excluded from responses, and soft deletes throughout.",
      es: "Los secretos se leen del entorno y se enmascaran en los logs, la sincronización destructiva del esquema está deshabilitada por defecto, los campos sensibles se excluyen de las respuestas, y se usan borrados suaves en todo el sistema.",
    },
  },
  {
    title: { en: "Scoped API keys", es: "Claves de API con alcance limitado" },
    tag: { en: "API keys", es: "Claves de API" },
    text: {
      en: "Programmatic access uses hashed API keys with explicit scopes, expiry and last-used tracking.",
      es: "El acceso programático usa claves de API hasheadas con alcances explícitos, expiración y seguimiento de último uso.",
    },
  },
];

const MANAGES: Bi[] = [
  { en: "Calls", es: "Llamadas" },
  { en: "Tickets", es: "Tickets" },
  { en: "Manual records", es: "Registros manuales" },
  { en: "Scheduled calls", es: "Llamadas programadas" },
  { en: "Customers", es: "Clientes" },
  { en: "Campaigns", es: "Campañas" },
  { en: "Sites", es: "Sedes" },
  { en: "Owners", es: "Propietarios" },
  { en: "Phone lines", es: "Líneas telefónicas" },
  { en: "SMS analytics", es: "Analítica de SMS" },
  { en: "Notifications", es: "Notificaciones" },
  { en: "Users & agents", es: "Usuarios y agentes" },
  { en: "Reports & exports", es: "Reportes y exportaciones" },
  { en: "API keys", es: "Claves de API" },
  { en: "Configurable dictionaries", es: "Diccionarios configurables" },
];

type FlowIconName = "browser" | "gateway" | "api" | "database";

const FLOW: { name: Bi; role: Bi; icon: FlowIconName; accent?: boolean }[] = [
  { name: { en: "Browser", es: "Navegador" }, role: { en: "Client", es: "Cliente" }, icon: "browser" },
  { name: { en: "Next.js BFF", es: "Next.js BFF" }, role: { en: "Session · proxy", es: "Sesión · proxy" }, icon: "gateway", accent: true },
  { name: { en: "NestJS API", es: "NestJS API" }, role: { en: "Domain · data", es: "Dominio · datos" }, icon: "api", accent: true },
  { name: { en: "PostgreSQL · Redis · S3", es: "PostgreSQL · Redis · S3" }, role: { en: "Data stores", es: "Almacenes de datos" }, icon: "database" },
];

const PAGE_COPY = {
  en: {
    back: "Back to Systems",
    chip: "Case study · Platform",
    title: "A contact-center operations platform",
    lede: "A custom platform that runs an entire call-center operation from one place — automatically capturing every call from cloud telephony, turning it into a trackable record, and rolling calls, tickets, campaigns and follow-ups into real-time dashboards and reporting.",
    challenge: "The challenge",
    challengeText: "The operation ran inbound and outbound phone campaigns — onboarding and collections — across dozens of client sites on behalf of their owners. Calls, SMS, support tickets, manual notes and follow-ups lived in different places. Phone activity was logged by hand, there was no single record of a customer, and no live view of what the floor was doing right now.",
    solution: "The solution",
    solutionText: "We designed and built one system of record for the whole phone operation. Cloud telephony feeds calls in automatically; each interaction becomes a record an agent can classify and follow up; and everything the operation touches — customers, campaigns, sites, tickets — rolls up into real-time dashboards and per-site reporting the team can export on demand.",
    howItWorksLabel: "How it works",
    howItWorksTitle: "From a ringing phone to a report",
    architectureLabel: "Architecture",
    architectureTitle: "Two services, one front door",
    architectureProse: "The browser only ever talks to a Next.js backend-for-frontend (BFF), which holds the session and forwards every request, server-to-server, to a NestJS API. That API owns the data in PostgreSQL, with Redis for queues and rate limiting and object storage for call recordings and attachments. One proxy sits in front of the whole backend — the browser never holds a token, and every call passes through a single, hardened path.",
    flowAriaLabel: "Request path: Browser to Next.js BFF to NestJS API to PostgreSQL, Redis and S3.",
    realtimeLabel: "Real-time & integrations",
    realtimeTitle: "Built to stay live",
    technologyLabel: "Technology",
    technologyTitle: "The full stack",
    layer: "Layer",
    technologies: "Technologies",
    securityLabel: "Security",
    securityTitle: "Hardened at every layer",
    control: "Control",
    whatItProtects: "What it protects",
    managesLabel: "What it manages",
    managesTitle: "One system, the whole operation",
    systemLabel: "The system",
    systemTitle: "More of the platform",
    closingTitle: "Thinking about a system like this?",
    closingLede: "Every build starts with a conversation about how your operation actually runs — not a template.",
  },
  es: {
    back: "Volver a Systems",
    chip: "Caso de éxito · Plataforma",
    title: "Una plataforma de operaciones para contact center",
    lede: "Una plataforma a la medida que gestiona toda una operación de call center desde un solo lugar — capturando automáticamente cada llamada desde telefonía en la nube, convirtiéndola en un registro rastreable, y consolidando llamadas, tickets, campañas y seguimientos en dashboards y reportes en tiempo real.",
    challenge: "El reto",
    challengeText: "La operación gestionaba campañas telefónicas entrantes y salientes — onboarding y cobros — en docenas de sedes de clientes en representación de sus propietarios. Llamadas, SMS, tickets de soporte, notas manuales y seguimientos vivían en lugares distintos. La actividad telefónica se registraba a mano, no existía un registro único del cliente, ni una vista en vivo de lo que estaba haciendo el piso en ese momento.",
    solution: "La solución",
    solutionText: "Diseñamos y construimos un único sistema central para toda la operación telefónica. La telefonía en la nube alimenta las llamadas automáticamente; cada interacción se convierte en un registro que un agente puede clasificar y dar seguimiento; y todo lo que la operación toca — clientes, campañas, sedes, tickets — se consolida en dashboards en tiempo real y reportes por sede que el equipo puede exportar bajo demanda.",
    howItWorksLabel: "Cómo funciona",
    howItWorksTitle: "De un teléfono sonando a un reporte",
    architectureLabel: "Arquitectura",
    architectureTitle: "Dos servicios, una sola puerta de entrada",
    architectureProse: "El navegador solo se comunica con un backend-for-frontend (BFF) de Next.js, que mantiene la sesión y reenvía cada solicitud, servidor a servidor, a una API de NestJS. Esa API es dueña de los datos en PostgreSQL, con Redis para colas y limitación de tasa, y almacenamiento de objetos para grabaciones de llamadas y adjuntos. Un solo proxy se ubica frente a todo el backend — el navegador nunca guarda un token, y cada llamada pasa por un único camino reforzado.",
    flowAriaLabel: "Ruta de la solicitud: navegador a Next.js BFF a API de NestJS a PostgreSQL, Redis y S3.",
    realtimeLabel: "Tiempo real e integraciones",
    realtimeTitle: "Construido para mantenerse en vivo",
    technologyLabel: "Tecnología",
    technologyTitle: "El stack completo",
    layer: "Capa",
    technologies: "Tecnologías",
    securityLabel: "Seguridad",
    securityTitle: "Reforzado en cada capa",
    control: "Control",
    whatItProtects: "Qué protege",
    managesLabel: "Qué gestiona",
    managesTitle: "Un solo sistema, toda la operación",
    systemLabel: "El sistema",
    systemTitle: "Más de la plataforma",
    closingTitle: "¿Piensas en un sistema como este?",
    closingLede: "Cada proyecto empieza con una conversación sobre cómo funciona realmente tu operación — no con una plantilla.",
  },
};

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
  const { dict, lang } = useI18n();
  const t = PAGE_COPY[lang];
  const reduced = useReducedMotion() ?? false;

  return (
    <article className={styles.page}>
      <div className={styles.shell}>
        <LocalizedLink href="/services/systems#work" className={styles.back}>
          <svg aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 10H4M8.5 5.5 4 10l4.5 4.5" />
          </svg>
          {t.back}
        </LocalizedLink>

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
              {t.chip}
            </motion.span>
            <motion.h1 className={styles.title} variants={focusRiseVariants}>
              {t.title}
            </motion.h1>
            <motion.p className={styles.lede} variants={focusRiseVariants}>
              {t.lede}
            </motion.p>
          </motion.div>
          <motion.dl className={styles.spec} variants={focusRiseVariants}>
            {META.map((item) => (
              <div key={item.label[lang]} className={styles.specRow}>
                <dt className={styles.specLabel}>{item.label[lang]}</dt>
                <dd className={styles.specValue}>{item.value[lang]}</dd>
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
              <p className={styles.sectionLabel}>{t.challenge}</p>
              <p className={styles.prose}>
                {t.challengeText}
              </p>
            </motion.div>
            <motion.div className={styles.splitCol} variants={focusRiseVariants}>
              <p className={styles.sectionLabel}>{t.solution}</p>
              <p className={styles.prose}>
                {t.solutionText}
              </p>
            </motion.div>
          </div>
        </motion.section>

        <div className={styles.divider} />

        {/* ── How it works, step by step ── */}
        <section className={styles.section}>
          <SectionHead label={t.howItWorksLabel} title={t.howItWorksTitle} reduced={reduced} />
          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <motion.li
                key={step.title[lang]}
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
                <motion.h3 className={styles.stepTitle} variants={focusRiseVariants}>{step.title[lang]}</motion.h3>
                <motion.p className={styles.stepText} variants={focusRiseVariants}>{step.text[lang]}</motion.p>
              </motion.li>
            ))}
          </ol>
        </section>

        <AgentDashboardScreen reduced={reduced} />

        <div className={styles.divider} />

        {/* ── Architecture ── */}
        <section className={styles.section}>
          <SectionHead label={t.architectureLabel} title={t.architectureTitle} reduced={reduced} />
          <motion.div
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "visible"}
            viewport={VIEWPORT}
            variants={groupVariants}
          >
            <motion.p className={styles.prose} variants={focusRiseVariants}>
              {t.architectureProse}
            </motion.p>
            <motion.div
              className={styles.flow}
              role="img"
              aria-label={t.flowAriaLabel}
              variants={focusRiseVariants}
            >
              {FLOW.map((node, index) => (
                <Fragment key={node.name[lang]}>
                  <span className={styles.flowNode} data-accent={node.accent || undefined} aria-hidden>
                    <span className={styles.flowIcon}><FlowGlyph name={node.icon} /></span>
                    <span className={styles.flowText}>
                      <span className={styles.flowName}>{node.name[lang]}</span>
                      <span className={styles.flowRole}>{node.role[lang]}</span>
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
          <SectionHead label={t.realtimeLabel} title={t.realtimeTitle} reduced={reduced} />
          <motion.div
            className={styles.blocks}
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "visible"}
            viewport={VIEWPORT}
            variants={groupVariants}
          >
            {SYSTEMS_BLOCKS.map((block) => (
              <motion.div key={block.title[lang]} className={styles.block} variants={softRiseVariants}>
                <span className={styles.blockIcon}><ServiceIcon name={block.icon} /></span>
                <h3 className={styles.blockTitle}>{block.title[lang]}</h3>
                <p className={styles.blockText}>{block.text[lang]}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <div className={styles.divider} />

        {/* ── Technology ── */}
        <section className={styles.section}>
          <SectionHead label={t.technologyLabel} title={t.technologyTitle} reduced={reduced} />
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
                <th role="columnheader" scope="col">{t.layer}</th>
                <th role="columnheader" scope="col">{t.technologies}</th>
              </tr>
            </thead>
            <motion.tbody role="rowgroup" variants={groupVariants}>
              {TECH.map((group, index) => (
                <motion.tr key={group.group[lang]} className={styles.techRow} role="row" variants={focusRiseVariants}>
                  <th className={styles.techLayer} role="rowheader" scope="row">
                    <span className={styles.rowIndex} aria-hidden>{String(index + 1).padStart(2, "0")}</span>
                    <span className={styles.techLayerName}>{group.group[lang]}</span>
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
          <SectionHead label={t.securityLabel} title={t.securityTitle} reduced={reduced} />
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
                <th role="columnheader" scope="col">{t.control}</th>
                <th role="columnheader" scope="col">{t.layer}</th>
                <th role="columnheader" scope="col">{t.whatItProtects}</th>
              </tr>
            </thead>
            <motion.tbody role="rowgroup" variants={groupVariants}>
              {SECURITY.map((item, index) => (
                <motion.tr key={item.title[lang]} className={styles.secRow} role="row" variants={focusRiseVariants}>
                  <th className={styles.secControl} role="rowheader" scope="row">
                    <span className={styles.rowIndex} aria-hidden>{String(index + 1).padStart(2, "0")}</span>
                    {item.title[lang]}
                  </th>
                  <td role="cell"><span className={styles.tag}>{item.tag[lang]}</span></td>
                  <td className={styles.secText} role="cell">{item.text[lang]}</td>
                </motion.tr>
              ))}
            </motion.tbody>
          </motion.table>
        </section>

        <div className={styles.divider} />

        {/* ── Scope ── */}
        <section className={styles.section}>
          <SectionHead label={t.managesLabel} title={t.managesTitle} reduced={reduced} />
          <motion.ul
            className={styles.manages}
            initial={reduced ? false : "hidden"}
            whileInView={reduced ? undefined : "visible"}
            viewport={VIEWPORT}
            variants={groupVariants}
          >
            {MANAGES.map((item) => (
              <motion.li key={item[lang]} className={styles.manageChip} variants={focusRiseVariants}>{item[lang]}</motion.li>
            ))}
          </motion.ul>
        </section>

        {/* ── Screenshot gallery ── */}
        <section className={styles.section}>
          <SectionHead label={t.systemLabel} title={t.systemTitle} reduced={reduced} />
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
            {t.closingTitle}
          </motion.h2>
          <motion.p className={styles.closingLede} variants={focusRiseVariants}>
            {t.closingLede}
          </motion.p>
          <motion.div className={styles.actions} variants={focusRiseVariants}>
            <LocalizedLink href="/quote?servicio=systems" className={styles.primary}>
              {dict.hero.primaryCta} <Arrow />
            </LocalizedLink>
            <LocalizedLink href="/services/systems#work" className={styles.secondary}>
              {t.back}
            </LocalizedLink>
          </motion.div>
        </motion.section>
      </div>
      <Footer />
    </article>
  );
}
