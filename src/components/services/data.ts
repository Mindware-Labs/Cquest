import type { Locale } from "@/i18n/config";

export type ServiceId = "call-center" | "bpo" | "systems";

export type ServiceIconName =
  | "headset"
  | "trend"
  | "banknote"
  | "gauge"
  | "userplus"
  | "shield"
  | "clipboard-check"
  | "wrench"
  | "settings"
  | "layers"
  | "database"
  | "messages"
  | "layout"
  | "chart"
  | "workflow"
  | "brain"
  | "code"
  | "phone"
  | "mail"
  | "share";

export type Service = {
  id: ServiceId;
  label: Record<Locale, string>;
  shortLabel: Record<Locale, string>;
  strapline: Record<Locale, string>;
  description: Record<Locale, string>;
  color: string;
  glow: string;
  href: string;
  details: ReadonlyArray<{
    id: string;
    title: Record<Locale, string>;
    description: Record<Locale, string>;
    icon: ServiceIconName;
  }>;
};

export const SERVICES: ReadonlyArray<Service> = [
  {
    id: "call-center",
    label: { en: "Call Center", es: "Call Center" },
    shortLabel: { en: "Every customer moment, covered", es: "Cada momento con tu cliente, cubierto" },
    strapline: {
      en: "Inbound and outbound contact-center operations across every channel.",
      es: "Operaciones de contact center inbound y outbound en todos los canales.",
    },
    description: {
      en: "Customer support, sales and follow-up designed around the moments that matter to your customers.",
      es: "Soporte al cliente, ventas y seguimiento diseñados alrededor de los momentos que más importan a tus clientes.",
    },
    color: "#3f738d",
    glow: "#74c3d5",
    href: "/services/call-center",
    details: [
      {
        id: "customer-service",
        icon: "headset",
        title: { en: "Customer service", es: "Servicio al cliente" },
        description: {
          en: "Inbound support across phone, email, chat and social media.",
          es: "Soporte inbound por teléfono, correo, chat y redes sociales.",
        },
      },
      {
        id: "sales",
        icon: "trend",
        title: { en: "Sales", es: "Ventas" },
        description: {
          en: "Outbound campaigns, telesales, lead generation and closing.",
          es: "Campañas outbound, telemercadeo, generación de leads y cierre de ventas.",
        },
      },
      {
        id: "collections",
        icon: "banknote",
        title: { en: "Collections", es: "Cobros" },
        description: {
          en: "Portfolio recovery and collections with professional protocols.",
          es: "Recuperación de cartera y cobros con protocolos profesionales.",
        },
      },
      {
        id: "surveys",
        icon: "gauge",
        title: { en: "Surveys", es: "Encuestas" },
        description: {
          en: "Satisfaction studies, market polls and NPS measurement.",
          es: "Estudios de satisfacción, encuestas de mercado y medición de NPS.",
        },
      },
      {
        id: "onboarding",
        icon: "userplus",
        title: { en: "Onboarding", es: "Onboarding" },
        description: {
          en: "Welcome, activation and early follow-up for new customers.",
          es: "Bienvenida, activación y seguimiento temprano para nuevos clientes.",
        },
      },
      {
        id: "tech-support",
        icon: "wrench",
        title: { en: "Tech Support", es: "Soporte Técnico" },
        description: {
          en: "Resolve issues fast and keep your customers moving forward.",
          es: "Resuelve problemas rápido y mantén a tus clientes avanzando.",
        },
      },
    ],
  },
  {
    id: "bpo",
    label: { en: "Operations", es: "Operaciones" },
    shortLabel: { en: "The work behind your operation", es: "El trabajo detrás de tu operación" },
    strapline: {
      en: "Repeatable work, run accurately at volume.",
      es: "Trabajo repetible, ejecutado con precisión a gran volumen.",
    },
    description: {
      en: "Back office, data processing and omnichannel support under clear SLAs.",
      es: "Back office, procesamiento de datos y soporte omnicanal bajo SLAs claros.",
    },
    color: "#176c79",
    glow: "#80bc00",
    href: "/services/bpo",
    details: [
      {
        id: "back-office-support",
        icon: "layers",
        title: { en: "Back Office Support", es: "Soporte de Back Office" },
        description: {
          en: "Streamline your operations and scale with ease behind the scenes.",
          es: "Optimiza tus operaciones y escala con facilidad detrás de escena.",
        },
      },
      {
        id: "data-processing",
        icon: "database",
        title: { en: "Data processing", es: "Procesamiento de datos" },
        description: {
          en: "Information handled accurately and consistently at scale.",
          es: "Información gestionada con precisión y consistencia a gran escala.",
        },
      },
      {
        id: "omnichannel-support",
        icon: "messages",
        title: { en: "Omnichannel support", es: "Soporte omnicanal" },
        description: {
          en: "Support coordinated across your operational channels.",
          es: "Soporte coordinado a través de tus canales operativos.",
        },
      },
      {
        id: "trust-safety",
        icon: "shield",
        title: { en: "Trust & Safety", es: "Trust & Safety" },
        description: {
          en: "Protect your platform and community with proactive risk management.",
          es: "Protege tu plataforma y comunidad con gestión proactiva de riesgos.",
        },
      },
      {
        id: "quality-assurance",
        icon: "clipboard-check",
        title: { en: "Quality Assurance", es: "Control de Calidad" },
        description: {
          en: "Ensure every interaction meets your highest standards.",
          es: "Garantiza que cada interacción cumpla tus estándares más altos.",
        },
      },
      {
        id: "consulting-services",
        icon: "settings",
        title: { en: "Consulting Services", es: "Servicios de Consultoría" },
        description: {
          en: "Get tailored strategies to optimize every part of your customer experience.",
          es: "Obtén estrategias a tu medida para optimizar cada parte de tu experiencia de cliente.",
        },
      },
    ],
  },
  {
    id: "systems",
    label: { en: "Systems Development", es: "Desarrollo de Sistemas" },
    shortLabel: { en: "Software shaped around how you work", es: "Software diseñado a partir de cómo trabajas" },
    strapline: { en: "Custom systems for operations.", es: "Sistemas a la medida para operaciones." },
    description: {
      en: "CRMs, dashboards and operations automation built around how your business actually works.",
      es: "CRMs, dashboards y automatización de operaciones construidos según cómo realmente funciona tu negocio.",
    },
    color: "#4b98b1",
    glow: "#d6d1ca",
    href: "/services/systems",
    details: [
      {
        id: "crms",
        icon: "layout",
        title: { en: "CRMs", es: "CRMs" },
        description: {
          en: "Custom systems for customer and operational relationships.",
          es: "Sistemas a la medida para relaciones con clientes y operaciones.",
        },
      },
      {
        id: "dashboards",
        icon: "chart",
        title: { en: "Dashboards", es: "Dashboards" },
        description: {
          en: "Operational visibility for better-informed decisions.",
          es: "Visibilidad operativa para decisiones mejor informadas.",
        },
      },
      {
        id: "operations-automation",
        icon: "workflow",
        title: { en: "Operations automation", es: "Automatización de operaciones" },
        description: {
          en: "Workflows designed around the way your operation runs.",
          es: "Flujos de trabajo diseñados según cómo funciona tu operación.",
        },
      },
      {
        id: "ai-implementation",
        icon: "brain",
        title: { en: "AI Implementation", es: "Implementación de IA" },
        description: {
          en: "Integrate AI that empowers your team and delights your customers.",
          es: "Integra IA que potencia a tu equipo y encanta a tus clientes.",
        },
      },
    ],
  },
];

// One representative icon per business line — for contexts that reference
// a whole service (nav menus, overview cards), distinct from the icons on
// each service's own detail items above.
export const SERVICE_ICON: Record<ServiceId, ServiceIconName> = {
  "call-center": "headset",
  bpo: "layers",
  systems: "code",
};
