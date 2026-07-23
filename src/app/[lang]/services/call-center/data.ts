import { SERVICES, type ServiceIconName } from "@/components/services/data";

export const CALL_CENTER = SERVICES.find(
  (service) => service.id === "call-center",
)!;

export const CAPABILITY_META: Record<
  string,
  { icon: ServiceIconName; channels: readonly string[] }
> = {
  "Customer service": {
    icon: "headset",
    channels: ["Phone", "Email", "Chat", "Social media"],
  },
  Sales: {
    icon: "trend",
    channels: ["Outbound", "Telesales", "Lead follow-up"],
  },
  Collections: { icon: "banknote", channels: ["Phone", "Email", "Messaging"] },
  Surveys: { icon: "gauge", channels: ["Phone", "Digital", "NPS"] },
  Onboarding: {
    icon: "userplus",
    channels: ["Welcome", "Activation", "Follow-up"],
  },
  "Tech Support": { icon: "wrench", channels: ["Phone", "Chat", "Email"] },
};

export const CHANNEL_ICON: Record<string, ServiceIconName> = {
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

export const CAPABILITY_DETAIL: Record<
  string,
  { includes: readonly string[]; benefit: string }
> = {
  "Customer service": {
    includes: [
      "Inbound support across phone, email, chat and social media",
      "Agents trained on your brand voice, product and escalation protocols",
      "Real-time monitoring against documented quality standards",
    ],
    benefit:
      "Faster resolutions and consistent, on-brand interactions that keep customers loyal — without the overhead of building an in-house support team.",
  },
  Sales: {
    includes: [
      "Outbound campaigns built around your target segments",
      "Telesales scripts refined against real conversion data",
      "Lead generation, qualification and closing in one continuous flow",
    ],
    benefit:
      "A dedicated sales engine that turns outreach into revenue, scaled up or down as your campaign calendar demands.",
  },
  Collections: {
    includes: [
      "Portfolio segmentation by risk and recovery likelihood",
      "Compliant, professional contact protocols at every stage",
      "Negotiated payment plans documented for auditability",
    ],
    benefit:
      "Higher recovery rates protected by protocols that preserve the customer relationship and your brand's reputation.",
  },
  Surveys: {
    includes: [
      "Satisfaction studies and market polls across phone and digital channels",
      "NPS measurement with segment-level breakdowns",
      "Structured reporting delivered on your schedule",
    ],
    benefit:
      "Clear, actionable insight into what your customers think — used to guide product, service and retention decisions.",
  },
  Onboarding: {
    includes: [
      "Welcome contact within your defined SLA",
      "Guided activation of the product or service",
      "Early follow-up that catches friction before it becomes churn",
    ],
    benefit:
      "New customers reach their first value moment faster, with fewer early-stage drop-offs.",
  },
  "Tech Support": {
    includes: [
      "First-line troubleshooting across phone, chat and email",
      "Documented resolution paths with escalation to specialist tiers",
      "Issue tracking that feeds back into product and process improvement",
    ],
    benefit:
      "Customers stay productive and confident in your product, while your specialist teams stay focused on what only they can solve.",
  },
};

export const PROCESS = [
  {
    title: "Discovery",
    description:
      "We study your current operation, volumes, channels and goals to understand exactly what the engagement needs to deliver.",
  },
  {
    title: "Operation design",
    description:
      "We define the process, staffing model, protocols and technology that will run the operation, sized to your volume and SLAs.",
  },
  {
    title: "Team preparation",
    description:
      "Agents are recruited, trained on your product and brand voice, and certified before they take a single live interaction.",
  },
  {
    title: "Launch",
    description:
      "The operation goes live under close supervision, with daily monitoring and rapid feedback loops during ramp-up.",
  },
  {
    title: "Continuous improvement",
    description:
      "Ongoing coaching, quality audits and performance reviews keep the operation improving after launch, not just at the start.",
  },
] as const;

export const CLIENT_LOGOS = [
  {
    name: "Altice",
    src: "/brands/altice.png",
    about:
      "Altice, listed on Euronext Amsterdam, is a global converged leader in telecommunications, content, media, entertainment and advertising.\n\nAltice offers innovative, customer-centric products and solutions that unlock the unlimited potential of its more than 50 million customers worldwide, through best-in-class connectivity powered by its fiber-optic and mobile broadband network infrastructure.",
    source:
      "https://altice.com.do/personal/nosotros/institucional/nosotros/grupo-altice",
    provides:
      "We run Altice's customer service and manage the nationwide distribution and sale of Altice SIM chips. Every chip sold is logged and time-stamped, feeding the KPI metrics and sales follow-up the account runs on.",
  },
  {
    name: "Paso Rápido",
    src: "/brands/pasoRapido.png",
    size: "large",
    about:
      "It is the first public trust created by the Dominican State, through Fiduciaria Reservas, S.A., under Trust Agreement number one (01), signed on October 18, 2013. Represented by the Ministry of Public Works and Communications (MOPC), ratified by resolution number 156-13 issued by the National Congress on 11/25/2013 and published in Official Gazette 10735.",
    source: "https://rdvial.gob.do/quienes-somos/",
    provides:
      "We built their internal operations system, connecting every department through internal notes so processes keep moving and every case or complaint that comes in by email gets tracked through to resolution. We also run Customer Support when needed, assisting clients with requests and complaints and coordinating with the internal team until each case is solved.",
  },
  {
    name: "Rig Hut",
    src: "/brands/righut.jpeg",
    about:
      "Rig Hut is a provider of parking management software purpose built for industrial parking applications. Truck parking facilities utilize Rig Hut to manage their inventory, accurately represent vacancies to the market, process payments and generate comprehensive reports for their yards.\n\nUtilizing a powerful suite of management tools, rest assured knowing your customer database, payments and communications are all processed and stored securely within the Rig Hut environment.",
    source: "https://www.linkedin.com/company/rig-hut/",
    provides:
      "We run Rig Hut's Customer Support, handling client requests and complaints and coordinating directly with their internal team until every case is resolved. Beyond support, we designed and built their internal Operations platform end to end — tracking outbound campaigns like accounts receivable and onboarding, with every case followable from first contact to close. We also integrated Aircall's cloud telephony directly into that platform, so agents place and answer calls from the very screen where the case lives — collapsing three separate tools the team used to juggle into one connected system.",
  },
  {
    name: "Cell Phone",
    src: "/brands/cellphone.jpg",
    about:
      "Cellphone SRL is an authorized distributor of Altice Dominicana, specialized in offering high-quality telecommunications solutions for residential and business customers across the Dominican Republic.\n\nFounded in June 2000, the company has more than two decades of experience in the sector, with branches strategically located in Santo Domingo and other provinces. It stands out for personalized attention, efficient technical support, and access to the latest generation of technology products and services.",
    source: "https://www.linkedin.com/company/cellphone-s-r-l",
    provides:
      "We run Cell Phone's call center operation in full — customer service for their subscribers, outbound sales, and a dedicated quality assurance layer that keeps every interaction on standard.",
  },
] as const;

export type ClientLogo = (typeof CLIENT_LOGOS)[number];

export const METRICS = [
  {
    label: "Interactions handled",
    value: "Built for scale",
    status: "Staffing flexes with your interaction volume",
  },
  {
    label: "Average response time",
    value: "< 20 sec",
    status: "Average phone queue time",
  },
  {
    label: "Service level",
    value: "80/20",
    status: "80% of calls answered within 20 seconds",
  },
  {
    label: "First-contact resolution",
    value: "90%+",
    status: "Resolution target per account",
  },
  { label: "Quality score", value: "95%+", status: "QA scorecard standard" },
] as const;

export const HERO_LINES = [
  { text: "Every", strong: false },
  { text: "customer", strong: false },
  { text: "moment,", strong: false },
  { text: "covered.", strong: true },
] as const;
