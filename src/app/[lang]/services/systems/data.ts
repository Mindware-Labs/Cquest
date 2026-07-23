import { SERVICES, type ServiceIconName } from "@/components/services/data";
import type { Locale } from "@/i18n/config";

export const SYSTEMS = SERVICES.find((service) => service.id === "systems")!;

export const CAPABILITY_DETAIL: Record<
  string,
  { includes: Record<Locale, readonly string[]>; benefit: Record<Locale, string> }
> = {
  crms: {
    includes: {
      en: [
        "Customer and case management shaped to your actual workflow",
        "Views and permissions per role — not one-size-fits-all",
        "Integrations with the channels and tools you already use",
      ],
      es: [
        "Gestión de clientes y casos diseñada según tu flujo de trabajo real",
        "Vistas y permisos por rol — nada de talla única",
        "Integraciones con los canales y herramientas que ya usas",
      ],
    },
    benefit: {
      en: "One system of record your team actually wants to use, because it works the way they do.",
      es: "Un sistema central que tu equipo realmente quiere usar, porque funciona como ellos trabajan.",
    },
  },
  dashboards: {
    includes: {
      en: [
        "Operational KPIs consolidated from your real data sources",
        "Live views for the floor, summaries for management",
        "Alerts when a number leaves its acceptable range",
      ],
      es: [
        "KPIs operativos consolidados desde tus fuentes de datos reales",
        "Vistas en vivo para el piso operativo, resúmenes para la gerencia",
        "Alertas cuando un número sale de su rango aceptable",
      ],
    },
    benefit: {
      en: "Decisions made on today's numbers, not last month's report.",
      es: "Decisiones tomadas con los números de hoy, no con el reporte del mes pasado.",
    },
  },
  "operations-automation": {
    includes: {
      en: [
        "Repetitive workflows automated end to end",
        "Rules and exceptions encoded, so edge cases are handled — not dropped",
        "Human handoff points exactly where judgment is needed",
      ],
      es: [
        "Flujos de trabajo repetitivos automatizados de principio a fin",
        "Reglas y excepciones codificadas, para que los casos límite se manejen — no se pierdan",
        "Puntos de traspaso humano justo donde se necesita criterio",
      ],
    },
    benefit: {
      en: "Hours of manual work become minutes, with fewer errors along the way.",
      es: "Horas de trabajo manual se convierten en minutos, con menos errores en el camino.",
    },
  },
  "ai-implementation": {
    includes: {
      en: [
        "Use cases selected for measurable operational impact",
        "AI assistants and automation integrated into existing workflows",
        "Guardrails, evaluation and monitoring from day one",
      ],
      es: [
        "Casos de uso seleccionados por su impacto operativo medible",
        "Asistentes de IA y automatización integrados en los flujos de trabajo existentes",
        "Salvaguardas, evaluación y monitoreo desde el primer día",
      ],
    },
    benefit: {
      en: "AI that empowers your team and delights your customers — deployed responsibly.",
      es: "IA que potencia a tu equipo y encanta a tus clientes — implementada de forma responsable.",
    },
  },
};

export const PROCESS: ReadonlyArray<{ title: Record<Locale, string>; description: Record<Locale, string> }> = [
  {
    title: { en: "Discovery", es: "Descubrimiento" },
    description: {
      en: "We sit with the people who do the work and map how the operation actually runs — not how the org chart says it does.",
      es: "Nos sentamos con quienes hacen el trabajo y mapeamos cómo funciona realmente la operación — no cómo dice el organigrama.",
    },
  },
  {
    title: { en: "Blueprint", es: "Plano" },
    description: {
      en: "Screens, data model and integrations are designed and validated with your team before a single line of code is written.",
      es: "Diseñamos y validamos pantallas, modelo de datos e integraciones junto a tu equipo antes de escribir una sola línea de código.",
    },
  },
  {
    title: { en: "Build", es: "Construcción" },
    description: {
      en: "Short cycles with working software at every step, so you see progress instead of waiting for a big reveal.",
      es: "Ciclos cortos con software funcional en cada paso, para que veas avances en lugar de esperar una gran revelación final.",
    },
  },
  {
    title: { en: "Launch", es: "Lanzamiento" },
    description: {
      en: "Deployment, data migration and training handled with the operation running — the business never stops.",
      es: "Despliegue, migración de datos y capacitación gestionados con la operación en marcha — el negocio nunca se detiene.",
    },
  },
  {
    title: { en: "Iterate", es: "Iteración" },
    description: {
      en: "The system keeps evolving with your operation: new modules, refinements and support after go-live.",
      es: "El sistema sigue evolucionando junto a tu operación: nuevos módulos, ajustes y soporte después del lanzamiento.",
    },
  },
];

export const COMMITMENTS: ReadonlyArray<{ title: Record<Locale, string>; description: Record<Locale, string> }> = [
  {
    title: { en: "Working software every cycle", es: "Software funcional en cada ciclo" },
    description: {
      en: "Progress you can click, in weekly builds — not a final reveal months later.",
      es: "Avances que puedes probar, en builds semanales — no una revelación final meses después.",
    },
  },
  {
    title: { en: "The license is yours to keep", es: "La licencia es tuya para siempre" },
    description: {
      en: "We sell you the full license to the code we build — nothing retained on our end, nothing to license back later.",
      es: "Te vendemos la licencia completa del código que construimos — no retenemos nada de nuestro lado, nada que licenciar de vuelta después.",
    },
  },
  {
    title: { en: "Support after go-live", es: "Soporte después del lanzamiento" },
    description: {
      en: "Launch is the midpoint, not the end — the system keeps evolving with the operation it serves.",
      es: "El lanzamiento es el punto medio, no el final — el sistema sigue evolucionando junto a la operación a la que sirve.",
    },
  },
];

/* ── Selected work ─────────────────────────────────────────
   The proof gallery. Each slot is a clickable plate that opens its own case-
   study subpage (`href`). Only `build` / `icon` / `href` are required: an entry
   with no `image`/`title` renders as a labeled, reserved slot. To publish a
   real case study, fill its fields, drop a WebP in `public/apps/`, and flesh
   out its subpage — the same slot becomes a live card, no layout change. Add
   more entries and the gallery reflows on its own; the first `featured` entry
   is the flagship plate. */
export type Work = {
  build: Record<Locale, string>;               // system-type tag, e.g. "CRM"
  icon: ServiceIconName;                        // mirrors the capability icons
  href: string;                                 // its case-study subpage
  featured?: boolean;
  title?: Record<Locale, string>;               // published: the system's name
  sector?: Record<Locale, string>;              // published: the sector it serves
  summary?: Record<Locale, string>;             // published: challenge → system, one line
  outcome?: { value: Record<Locale, string>; label: Record<Locale, string> }; // published: the number it moved
  image?: string;                               // published: "/apps/<file>.webp"
  alt?: Record<Locale, string>;                 // published: describe the screenshot
};

export const WORKS: readonly Work[] = [
  {
    build: { en: "Platform", es: "Plataforma" },
    icon: "layout",
    featured: true,
    href: "/services/systems/work",
    title: {
      en: "Contact-center operations platform",
      es: "Plataforma de operaciones para contact center",
    },
    sector: { en: "Contact center · Support operations", es: "Contact center · Operaciones de soporte" },
    summary: {
      en: "One system of record for a whole phone operation — calls captured automatically from cloud telephony, worked as tickets and campaigns, and rolled up into live dashboards and per-site reporting.",
      es: "Un sistema central para toda una operación telefónica — llamadas capturadas automáticamente desde telefonía en la nube, gestionadas como tickets y campañas, y consolidadas en dashboards en vivo y reportes por sede.",
    },
    outcome: {
      value: { en: "Real-time", es: "Tiempo real" },
      label: { en: "call-to-report visibility", es: "visibilidad de llamada a reporte" },
    },
    image: "/rig-hut/system-015-cropped.png",
    alt: {
      en: "Aircall integration screen inside the platform, showing the softphone sign-in prompt and AI call summary, key topics and transcript panels.",
      es: "Pantalla de integración de Aircall dentro de la plataforma, mostrando el inicio de sesión del softphone y los paneles de resumen de llamada con IA, temas clave y transcripción.",
    },
  },
];

export const HERO_LINES: Record<Locale, ReadonlyArray<{ text: string; strong: boolean }>> = {
  en: [
    { text: "Software shaped", strong: false },
    { text: "around how", strong: false },
    { text: "you work.", strong: true },
  ],
  es: [
    { text: "Software diseñado", strong: false },
    { text: "a partir de", strong: false },
    { text: "cómo trabajas.", strong: true },
  ],
};

/* ── Clients we've built for ───────────────────────────────
   Real operations running a system we designed and built — the systems-
   specific slice of what each account gets from Center Quest. Some of these
   clients also appear on the Call Center clients page with a different
   `provides` write-up (their call-center scope, not their systems scope). */
export const CLIENT_LOGOS = [
  {
    name: "Rig Hut",
    src: "/brands/righut.jpeg",
    about: {
      en: "Rig Hut is a provider of parking management software purpose built for industrial parking applications. Truck parking facilities utilize Rig Hut to manage their inventory, accurately represent vacancies to the market, process payments and generate comprehensive reports for their yards.\n\nUtilizing a powerful suite of management tools, rest assured knowing your customer database, payments and communications are all processed and stored securely within the Rig Hut environment.",
      es: "Rig Hut es un proveedor de software de gestión de estacionamientos diseñado específicamente para aplicaciones de parqueo industrial. Instalaciones de estacionamiento para camiones utilizan Rig Hut para gestionar su inventario, representar con precisión los espacios disponibles ante el mercado, procesar pagos y generar reportes completos de sus patios.\n\nCon un potente conjunto de herramientas de gestión, ten la tranquilidad de saber que la base de datos de clientes, los pagos y las comunicaciones se procesan y almacenan de forma segura dentro del entorno de Rig Hut.",
    },
    source: "https://www.linkedin.com/company/rig-hut/",
    provides: {
      en: "We designed and built Rig Hut's internal Operations platform end to end — tracking outbound campaigns like accounts receivable and onboarding, with every case followable from first contact to close. We also integrated Aircall's cloud telephony directly into that platform, so agents place and answer calls from the very screen where the case lives — collapsing three separate tools their team used to juggle into one connected system.",
      es: "Diseñamos y construimos de principio a fin la plataforma interna de Operaciones de Rig Hut — dando seguimiento a campañas outbound como cuentas por cobrar y onboarding, con cada caso rastreable desde el primer contacto hasta el cierre. También integramos la telefonía en la nube de Aircall directamente en esa plataforma, para que los agentes hagan y reciban llamadas desde la misma pantalla donde vive el caso — consolidando en un solo sistema conectado tres herramientas separadas que su equipo antes tenía que alternar.",
    },
  },
  {
    name: "Paso Rápido",
    src: "/brands/pasoRapido.png",
    size: "large",
    about: {
      en: "It is the first public trust created by the Dominican State, through Fiduciaria Reservas, S.A., under Trust Agreement number one (01), signed on October 18, 2013. Represented by the Ministry of Public Works and Communications (MOPC), ratified by resolution number 156-13 issued by the National Congress on 11/25/2013 and published in Official Gazette 10735.",
      es: "Es el primer fideicomiso público creado por el Estado dominicano, a través de Fiduciaria Reservas, S.A., bajo el Contrato de Fideicomiso número uno (01), firmado el 18 de octubre de 2013. Representado por el Ministerio de Obras Públicas y Comunicaciones (MOPC), ratificado mediante la resolución número 156-13 emitida por el Congreso Nacional el 25/11/2013 y publicada en la Gaceta Oficial 10735.",
    },
    source: "https://rdvial.gob.do/quienes-somos/",
    provides: {
      en: "We built their internal operations system, connecting every department through internal notes so processes keep moving and every case or complaint that comes in by email gets tracked through to resolution.",
      es: "Construimos su sistema interno de operaciones, conectando cada departamento mediante notas internas para que los procesos sigan avanzando y cada caso o queja que llega por correo se dé seguimiento hasta su resolución.",
    },
  },
  {
    name: "Plastifar",
    src: "/brands/plastifar.png",
    size: "compact",
    about: {
      en: "Plastifar S.A. was founded on July 20, 1992, by Engineer Alejandro Farach Cruz. It was created to meet the packaging needs of the pharmaceutical industry, with a commitment to the highest standards of hygiene and quality in the production of its containers.",
      es: "Plastifar S.A. fue fundada el 20 de julio de 1992 por el Ingeniero Alejandro Farach Cruz. Fue creada para atender las necesidades de envasado de la industria farmacéutica, con un compromiso con los más altos estándares de higiene y calidad en la producción de sus envases.",
    },
    source: "https://plastifar.com/es/?page_id=11194",
    provides: {
      en: "We built their internal operations system — every department connected through internal notes, so processes keep moving and every case or complaint that comes in gets constant follow-up.",
      es: "Construimos su sistema interno de operaciones — cada departamento conectado mediante notas internas, para que los procesos sigan avanzando y cada caso o queja reciba seguimiento constante.",
    },
  },
  {
    name: "Fiduciaria Reservas",
    src: "/brands/fiduciariaReservas.jpg",
    about: {
      en: "A trust is a contract through which one or more persons transfer assets or rights to a trustee entity to create a separate estate, administered by that entity for the benefit of another person or of the person who transferred the assets.",
      es: "Un fideicomiso es un contrato mediante el cual una o más personas transfieren bienes o derechos a una entidad fiduciaria para crear un patrimonio separado, administrado por dicha entidad en beneficio de otra persona o de quien transfirió los bienes.",
    },
    source: "https://www.fiduciariareservas.com/",
    provides: {
      en: "We built the system behind fdi.com.do — a self-service admin panel where their team uploads new property listings themselves. No manual back-and-forth: what needs to go up gets added directly, with no developer in the loop.",
      es: "Construimos el sistema detrás de fdi.com.do — un panel de administración de autoservicio donde su equipo sube directamente los nuevos listados de propiedades. Sin idas y vueltas manuales: lo que necesita publicarse se agrega directamente, sin un desarrollador de por medio.",
    },
  },
  {
    name: "Astur Caribe",
    src: "/brands/astur.jpg",
    about: {
      en: "Astur Caribe has 33 years of experience in the market, offering bathroom furniture, shower enclosures and hardware.",
      es: "Astur Caribe cuenta con 33 años de experiencia en el mercado, ofreciendo muebles de baño, mamparas de ducha y herrajes.",
    },
    provides: {
      en: "We implemented a WhatsApp-based sales system for their team, giving customers a direct channel to inquire and buy.",
      es: "Implementamos un sistema de ventas basado en WhatsApp para su equipo, dando a los clientes un canal directo para consultar y comprar.",
    },
  },
] as const;

export type ClientLogo = (typeof CLIENT_LOGOS)[number];
