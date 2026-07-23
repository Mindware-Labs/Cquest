import { SERVICES, type ServiceIconName } from "@/components/services/data";
import type { Locale } from "@/i18n/config";

export const CALL_CENTER = SERVICES.find(
  (service) => service.id === "call-center",
)!;

export const CAPABILITY_META: Record<
  string,
  { icon: ServiceIconName; channels: ReadonlyArray<{ id: string; label: Record<Locale, string> }> }
> = {
  "customer-service": {
    icon: "headset",
    channels: [
      { id: "phone", label: { en: "Phone", es: "Teléfono" } },
      { id: "email", label: { en: "Email", es: "Correo" } },
      { id: "chat", label: { en: "Chat", es: "Chat" } },
      { id: "social", label: { en: "Social media", es: "Redes sociales" } },
    ],
  },
  sales: {
    icon: "trend",
    channels: [
      { id: "outbound", label: { en: "Outbound", es: "Outbound" } },
      { id: "telesales", label: { en: "Telesales", es: "Telemercadeo" } },
      { id: "lead-follow-up", label: { en: "Lead follow-up", es: "Seguimiento de leads" } },
    ],
  },
  collections: {
    icon: "banknote",
    channels: [
      { id: "phone", label: { en: "Phone", es: "Teléfono" } },
      { id: "email", label: { en: "Email", es: "Correo" } },
      { id: "messaging", label: { en: "Messaging", es: "Mensajería" } },
    ],
  },
  surveys: {
    icon: "gauge",
    channels: [
      { id: "phone", label: { en: "Phone", es: "Teléfono" } },
      { id: "digital", label: { en: "Digital", es: "Digital" } },
      { id: "nps", label: { en: "NPS", es: "NPS" } },
    ],
  },
  onboarding: {
    icon: "userplus",
    channels: [
      { id: "welcome", label: { en: "Welcome", es: "Bienvenida" } },
      { id: "activation", label: { en: "Activation", es: "Activación" } },
      { id: "follow-up", label: { en: "Follow-up", es: "Seguimiento" } },
    ],
  },
  "tech-support": {
    icon: "wrench",
    channels: [
      { id: "phone", label: { en: "Phone", es: "Teléfono" } },
      { id: "chat", label: { en: "Chat", es: "Chat" } },
      { id: "email", label: { en: "Email", es: "Correo" } },
    ],
  },
};

export const CHANNEL_ICON: Record<string, ServiceIconName> = {
  phone: "phone",
  outbound: "phone",
  telesales: "phone",
  email: "mail",
  chat: "messages",
  messaging: "messages",
  digital: "layout",
  nps: "gauge",
  social: "share",
  "lead-follow-up": "share",
  welcome: "userplus",
  activation: "trend",
  "follow-up": "share",
};

export const CAPABILITY_DETAIL: Record<
  string,
  { includes: Record<Locale, readonly string[]>; benefit: Record<Locale, string> }
> = {
  "customer-service": {
    includes: {
      en: [
        "Inbound support across phone, email, chat and social media",
        "Agents trained on your brand voice, product and escalation protocols",
        "Real-time monitoring against documented quality standards",
      ],
      es: [
        "Soporte inbound por teléfono, correo, chat y redes sociales",
        "Agentes capacitados en la voz de tu marca, el producto y protocolos de escalamiento",
        "Monitoreo en tiempo real contra estándares de calidad documentados",
      ],
    },
    benefit: {
      en: "Faster resolutions and consistent, on-brand interactions that keep customers loyal — without the overhead of building an in-house support team.",
      es: "Resoluciones más rápidas e interacciones consistentes y alineadas a tu marca que fidelizan a tus clientes — sin la carga de construir un equipo de soporte interno.",
    },
  },
  sales: {
    includes: {
      en: [
        "Outbound campaigns built around your target segments",
        "Telesales scripts refined against real conversion data",
        "Lead generation, qualification and closing in one continuous flow",
      ],
      es: [
        "Campañas outbound diseñadas alrededor de tus segmentos objetivo",
        "Guiones de telemercadeo refinados con datos reales de conversión",
        "Generación, calificación y cierre de leads en un solo flujo continuo",
      ],
    },
    benefit: {
      en: "A dedicated sales engine that turns outreach into revenue, scaled up or down as your campaign calendar demands.",
      es: "Un motor de ventas dedicado que convierte el alcance en ingresos, escalando según lo exija tu calendario de campañas.",
    },
  },
  collections: {
    includes: {
      en: [
        "Portfolio segmentation by risk and recovery likelihood",
        "Compliant, professional contact protocols at every stage",
        "Negotiated payment plans documented for auditability",
      ],
      es: [
        "Segmentación de cartera por riesgo y probabilidad de recuperación",
        "Protocolos de contacto profesionales y conformes en cada etapa",
        "Planes de pago negociados y documentados para auditoría",
      ],
    },
    benefit: {
      en: "Higher recovery rates protected by protocols that preserve the customer relationship and your brand's reputation.",
      es: "Mayores tasas de recuperación protegidas por protocolos que preservan la relación con el cliente y la reputación de tu marca.",
    },
  },
  surveys: {
    includes: {
      en: [
        "Satisfaction studies and market polls across phone and digital channels",
        "NPS measurement with segment-level breakdowns",
        "Structured reporting delivered on your schedule",
      ],
      es: [
        "Estudios de satisfacción y encuestas de mercado por teléfono y canales digitales",
        "Medición de NPS con desglose por segmento",
        "Reportes estructurados entregados según tu calendario",
      ],
    },
    benefit: {
      en: "Clear, actionable insight into what your customers think — used to guide product, service and retention decisions.",
      es: "Información clara y accionable sobre lo que piensan tus clientes — usada para guiar decisiones de producto, servicio y retención.",
    },
  },
  onboarding: {
    includes: {
      en: [
        "Welcome contact within your defined SLA",
        "Guided activation of the product or service",
        "Early follow-up that catches friction before it becomes churn",
      ],
      es: [
        "Contacto de bienvenida dentro del SLA definido",
        "Activación guiada del producto o servicio",
        "Seguimiento temprano que detecta fricciones antes de que se conviertan en cancelaciones",
      ],
    },
    benefit: {
      en: "New customers reach their first value moment faster, with fewer early-stage drop-offs.",
      es: "Los nuevos clientes llegan más rápido a su primer momento de valor, con menos abandono en las primeras etapas.",
    },
  },
  "tech-support": {
    includes: {
      en: [
        "First-line troubleshooting across phone, chat and email",
        "Documented resolution paths with escalation to specialist tiers",
        "Issue tracking that feeds back into product and process improvement",
      ],
      es: [
        "Solución de problemas de primera línea por teléfono, chat y correo",
        "Rutas de resolución documentadas con escalamiento a niveles especializados",
        "Seguimiento de incidencias que retroalimenta la mejora de producto y proceso",
      ],
    },
    benefit: {
      en: "Customers stay productive and confident in your product, while your specialist teams stay focused on what only they can solve.",
      es: "Tus clientes se mantienen productivos y confiados en tu producto, mientras tus equipos especializados se enfocan en lo que solo ellos pueden resolver.",
    },
  },
};

export const PROCESS: ReadonlyArray<{ title: Record<Locale, string>; description: Record<Locale, string> }> = [
  {
    title: { en: "Discovery", es: "Descubrimiento" },
    description: {
      en: "We study your current operation, volumes, channels and goals to understand exactly what the engagement needs to deliver.",
      es: "Estudiamos tu operación actual, volúmenes, canales y objetivos para entender exactamente qué debe entregar el proyecto.",
    },
  },
  {
    title: { en: "Operation design", es: "Diseño de la operación" },
    description: {
      en: "We define the process, staffing model, protocols and technology that will run the operation, sized to your volume and SLAs.",
      es: "Definimos el proceso, el modelo de dotación de personal, los protocolos y la tecnología que operarán, dimensionados a tu volumen y SLAs.",
    },
  },
  {
    title: { en: "Team preparation", es: "Preparación del equipo" },
    description: {
      en: "Agents are recruited, trained on your product and brand voice, and certified before they take a single live interaction.",
      es: "Reclutamos, capacitamos en tu producto y voz de marca, y certificamos a los agentes antes de su primera interacción real.",
    },
  },
  {
    title: { en: "Launch", es: "Lanzamiento" },
    description: {
      en: "The operation goes live under close supervision, with daily monitoring and rapid feedback loops during ramp-up.",
      es: "La operación sale en vivo bajo supervisión cercana, con monitoreo diario y ciclos rápidos de retroalimentación durante el arranque.",
    },
  },
  {
    title: { en: "Continuous improvement", es: "Mejora continua" },
    description: {
      en: "Ongoing coaching, quality audits and performance reviews keep the operation improving after launch, not just at the start.",
      es: "Coaching continuo, auditorías de calidad y revisiones de desempeño mantienen la operación mejorando después del lanzamiento, no solo al inicio.",
    },
  },
];

export const CLIENT_LOGOS = [
  {
    name: "Altice",
    src: "/brands/altice.png",
    about: {
      en: "Altice, listed on Euronext Amsterdam, is a global converged leader in telecommunications, content, media, entertainment and advertising.\n\nAltice offers innovative, customer-centric products and solutions that unlock the unlimited potential of its more than 50 million customers worldwide, through best-in-class connectivity powered by its fiber-optic and mobile broadband network infrastructure.",
      es: "Altice, que cotiza en Euronext Ámsterdam, es un líder global convergente en telecomunicaciones, contenido, medios, entretenimiento y publicidad.\n\nAltice ofrece productos y soluciones innovadoras centradas en el cliente que desbloquean el potencial ilimitado de sus más de 50 millones de clientes en todo el mundo, a través de conectividad de primer nivel impulsada por su infraestructura de red de fibra óptica y banda ancha móvil.",
    },
    source: "https://altice.com.do/personal/nosotros/institucional/nosotros/grupo-altice",
    provides: {
      en: "We run Altice's customer service and manage the nationwide distribution and sale of Altice SIM chips. Every chip sold is logged and time-stamped, feeding the KPI metrics and sales follow-up the account runs on.",
      es: "Gestionamos el servicio al cliente de Altice y administramos la distribución y venta a nivel nacional de chips SIM de Altice. Cada chip vendido queda registrado con fecha y hora, alimentando las métricas de KPI y el seguimiento de ventas sobre los que opera la cuenta.",
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
      en: "We built their internal operations system, connecting every department through internal notes so processes keep moving and every case or complaint that comes in by email gets tracked through to resolution. We also run Customer Support when needed, assisting clients with requests and complaints and coordinating with the internal team until each case is solved.",
      es: "Construimos su sistema interno de operaciones, conectando cada departamento mediante notas internas para que los procesos sigan avanzando y cada caso o queja que llega por correo se dé seguimiento hasta su resolución. También gestionamos el Servicio al Cliente cuando se requiere, atendiendo solicitudes y quejas y coordinando con el equipo interno hasta resolver cada caso.",
    },
  },
  {
    name: "Rig Hut",
    src: "/brands/righut.jpeg",
    about: {
      en: "Rig Hut is a provider of parking management software purpose built for industrial parking applications. Truck parking facilities utilize Rig Hut to manage their inventory, accurately represent vacancies to the market, process payments and generate comprehensive reports for their yards.\n\nUtilizing a powerful suite of management tools, rest assured knowing your customer database, payments and communications are all processed and stored securely within the Rig Hut environment.",
      es: "Rig Hut es un proveedor de software de gestión de estacionamientos diseñado específicamente para aplicaciones de parqueo industrial. Instalaciones de estacionamiento para camiones utilizan Rig Hut para gestionar su inventario, representar con precisión los espacios disponibles ante el mercado, procesar pagos y generar reportes completos de sus patios.\n\nCon un potente conjunto de herramientas de gestión, ten la tranquilidad de saber que la base de datos de clientes, los pagos y las comunicaciones se procesan y almacenan de forma segura dentro del entorno de Rig Hut.",
    },
    source: "https://www.linkedin.com/company/rig-hut/",
    provides: {
      en: "We run Rig Hut's Customer Support, handling client requests and complaints and coordinating directly with their internal team until every case is resolved. Beyond support, we designed and built their internal Operations platform end to end — tracking outbound campaigns like accounts receivable and onboarding, with every case followable from first contact to close. We also integrated Aircall's cloud telephony directly into that platform, so agents place and answer calls from the very screen where the case lives — collapsing three separate tools the team used to juggle into one connected system.",
      es: "Gestionamos el Servicio al Cliente de Rig Hut, atendiendo solicitudes y quejas de clientes y coordinando directamente con su equipo interno hasta resolver cada caso. Más allá del soporte, diseñamos y construimos de principio a fin su plataforma interna de Operaciones — dando seguimiento a campañas outbound como cuentas por cobrar y onboarding, con cada caso rastreable desde el primer contacto hasta el cierre. También integramos la telefonía en la nube de Aircall directamente en esa plataforma, para que los agentes hagan y reciban llamadas desde la misma pantalla donde vive el caso — consolidando en un solo sistema conectado tres herramientas separadas que el equipo antes tenía que alternar.",
    },
  },
  {
    name: "Cell Phone",
    src: "/brands/cellphone.jpg",
    about: {
      en: "Cellphone SRL is an authorized distributor of Altice Dominicana, specialized in offering high-quality telecommunications solutions for residential and business customers across the Dominican Republic.\n\nFounded in June 2000, the company has more than two decades of experience in the sector, with branches strategically located in Santo Domingo and other provinces. It stands out for personalized attention, efficient technical support, and access to the latest generation of technology products and services.",
      es: "Cellphone SRL es un distribuidor autorizado de Altice Dominicana, especializado en ofrecer soluciones de telecomunicaciones de alta calidad para clientes residenciales y empresariales en toda República Dominicana.\n\nFundada en junio de 2000, la empresa cuenta con más de dos décadas de experiencia en el sector, con sucursales ubicadas estratégicamente en Santo Domingo y otras provincias. Se destaca por su atención personalizada, soporte técnico eficiente y acceso a productos y servicios tecnológicos de última generación.",
    },
    source: "https://www.linkedin.com/company/cellphone-s-r-l",
    provides: {
      en: "We run Cell Phone's call center operation in full — customer service for their subscribers, outbound sales, and a dedicated quality assurance layer that keeps every interaction on standard.",
      es: "Gestionamos por completo la operación de call center de Cell Phone — servicio al cliente para sus suscriptores, ventas outbound y una capa dedicada de control de calidad que mantiene cada interacción dentro del estándar.",
    },
  },
] as const;

export type ClientLogo = (typeof CLIENT_LOGOS)[number];

export const METRICS: ReadonlyArray<{ label: Record<Locale, string>; value: Record<Locale, string>; status: Record<Locale, string> }> = [
  {
    label: { en: "Interactions handled", es: "Interacciones gestionadas" },
    value: { en: "Built for scale", es: "Diseñado para escalar" },
    status: { en: "Staffing flexes with your interaction volume", es: "La dotación de personal se ajusta a tu volumen de interacciones" },
  },
  {
    label: { en: "Average response time", es: "Tiempo de respuesta promedio" },
    value: { en: "< 20 sec", es: "< 20 seg" },
    status: { en: "Average phone queue time", es: "Tiempo promedio en cola telefónica" },
  },
  {
    label: { en: "Service level", es: "Nivel de servicio" },
    value: { en: "80/20", es: "80/20" },
    status: { en: "80% of calls answered within 20 seconds", es: "80% de llamadas respondidas en 20 segundos" },
  },
  {
    label: { en: "First-contact resolution", es: "Resolución en el primer contacto" },
    value: { en: "90%+", es: "90%+" },
    status: { en: "Resolution target per account", es: "Meta de resolución por cuenta" },
  },
  {
    label: { en: "Quality score", es: "Puntaje de calidad" },
    value: { en: "95%+", es: "95%+" },
    status: { en: "QA scorecard standard", es: "Estándar de scorecard de calidad" },
  },
];

export const HERO_LINES: Record<Locale, ReadonlyArray<{ text: string; strong: boolean }>> = {
  en: [
    { text: "Every", strong: false },
    { text: "customer", strong: false },
    { text: "moment,", strong: false },
    { text: "covered.", strong: true },
  ],
  es: [
    { text: "Cada", strong: false },
    { text: "momento", strong: false },
    { text: "de tu cliente,", strong: false },
    { text: "cubierto.", strong: true },
  ],
};
