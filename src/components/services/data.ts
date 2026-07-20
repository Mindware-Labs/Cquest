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
  label: string;
  shortLabel: string;
  strapline: string;
  description: string;
  color: string;
  glow: string;
  href: string;
  details: ReadonlyArray<{
    title: string;
    description: string;
    icon: ServiceIconName;
  }>;
};

export const SERVICES: ReadonlyArray<Service> = [
  {
    id: "call-center",
    label: "Call Center",
    shortLabel: "Every customer moment, covered",
    strapline: "Inbound and outbound contact-center operations across every channel.",
    description:
      "Customer support, sales and follow-up designed around the moments that matter to your customers.",
    color: "#3f738d",
    glow: "#74c3d5",
    href: "/services/call-center",
    details: [
      { title: "Customer service", icon: "headset", description: "Inbound support across phone, email, chat and social media." },
      { title: "Sales", icon: "trend", description: "Outbound campaigns, telesales, lead generation and closing." },
      { title: "Collections", icon: "banknote", description: "Portfolio recovery and collections with professional protocols." },
      { title: "Surveys", icon: "gauge", description: "Satisfaction studies, market polls and NPS measurement." },
      { title: "Onboarding", icon: "userplus", description: "Welcome, activation and early follow-up for new customers." },
      { title: "Tech Support", icon: "wrench", description: "Resolve issues fast and keep your customers moving forward." },
    ],
  },
  {
    id: "bpo",
    label: "BPO",
    shortLabel: "The work behind your operation",
    strapline: "Repeatable work, run accurately at volume.",
    description: "Back office, data processing and omnichannel support under clear SLAs.",
    color: "#176c79",
    glow: "#80bc00",
    href: "/services/bpo",
    details: [
      { title: "Back Office Support", icon: "layers", description: "Streamline your operations and scale with ease behind the scenes." },
      { title: "Data processing", icon: "database", description: "Information handled accurately and consistently at scale." },
      { title: "Omnichannel support", icon: "messages", description: "Support coordinated across your operational channels." },
      { title: "Trust & Safety", icon: "shield", description: "Protect your platform and community with proactive risk management." },
      { title: "Quality Assurance", icon: "clipboard-check", description: "Ensure every interaction meets your highest standards." },
      { title: "Consulting Services", icon: "settings", description: "Get tailored strategies to optimize every part of your customer experience." },
    ],
  },
  {
    id: "systems",
    label: "Systems Development",
    shortLabel: "Software shaped around how you work",
    strapline: "Custom systems for operations.",
    description:
      "CRMs, dashboards and operations automation built around how your business actually works.",
    color: "#4b98b1",
    glow: "#d6d1ca",
    href: "/services/systems",
    details: [
      { title: "CRMs", icon: "layout", description: "Custom systems for customer and operational relationships." },
      { title: "Dashboards", icon: "chart", description: "Operational visibility for better-informed decisions." },
      { title: "Operations automation", icon: "workflow", description: "Workflows designed around the way your operation runs." },
      { title: "AI Implementation", icon: "brain", description: "Integrate AI that empowers your team and delights your customers." },
    ],
  },
];
