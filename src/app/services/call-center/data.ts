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
      "Service scope pending confirmation with the account team — replace with the capabilities Center Quest delivers for Altice.",
  },
  {
    name: "Paso Rápido",
    src: "/brands/pasoRapido.png",
    size: "large",
    about:
      "It is the first public trust created by the Dominican State, through Fiduciaria Reservas, S.A., under Trust Agreement number one (01), signed on October 18, 2013. Represented by the Ministry of Public Works and Communications (MOPC), ratified by resolution number 156-13 issued by the National Congress on 11/25/2013 and published in Official Gazette 10735.",
    source: "https://rdvial.gob.do/quienes-somos/",
    provides:
      "Service scope pending confirmation with the account team — replace with the capabilities Center Quest delivers for Paso Rápido.",
  },
  {
    name: "Rig Hut",
    src: "/brands/righut.jpeg",
    about:
      "Rig Hut is a provider of parking management software purpose built for industrial parking applications. Truck parking facilities utilize Rig Hut to manage their inventory, accurately represent vacancies to the market, process payments and generate comprehensive reports for their yards.\n\nUtilizing a powerful suite of management tools, rest assured knowing your customer database, payments and communications are all processed and stored securely within the Rig Hut environment.",
    source: "https://www.linkedin.com/company/rig-hut/",
    provides:
      "Service scope pending confirmation with the account team — replace with the capabilities Center Quest delivers for Rig Hut.",
  },
  {
    name: "Cell Phone",
    src: "/brands/cellphone.jpg",
    about:
      "Company profile pending — replace with an approved description of Cell Phone's business and industry.",
    provides:
      "Service scope pending confirmation with the account team — replace with the capabilities Center Quest delivers for Cell Phone.",
  },
  {
    name: "Plastifar",
    src: "/brands/plastifar.png",
    size: "compact",
    about:
      "Plastifar S.A. was founded on July 20, 1992, by Engineer Alejandro Farach Cruz. It was created to meet the packaging needs of the pharmaceutical industry, with a commitment to the highest standards of hygiene and quality in the production of its containers.",
    source: "https://plastifar.com/es/?page_id=11194",
    provides:
      "Service scope pending confirmation with the account team — replace with the capabilities Center Quest delivers for Plastifar.",
  },
  {
    name: "Fiduciaria Reservas",
    src: "/brands/fiduciariaReservas.jpg",
    about:
      "A trust is a contract through which one or more persons transfer assets or rights to a trustee entity to create a separate estate, administered by that entity for the benefit of another person or of the person who transferred the assets.",
    source: "https://www.fiduciariareservas.com/",
    provides:
      "Service scope pending confirmation with the account team — replace with the capabilities Center Quest delivers for Fiduciaria Reservas.",
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
