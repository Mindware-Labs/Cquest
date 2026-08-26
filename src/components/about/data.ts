import type { ServiceIconName } from "@/components/services/data";

export const ABOUT_METRICS: ReadonlyArray<{
  id: string;
  value: number;
  suffix: string;
  label: string;
}> = [
  { id: "agents", value: 200, suffix: "+", label: "Call center operators" },
  { id: "developers", value: 10, suffix: "", label: "Specialized developers" },
  { id: "languages", value: 5, suffix: "+", label: "Languages" },
  { id: "years", value: 8, suffix: "+", label: "Years of experience" },
];

export const TEAM_SPECIALTIES: readonly string[] = [
  "Quality",
  "Sales",
  "Finance",
  "Process automation",
  "SEO",
  "Marketing",
];

export const TEAM_DEVELOPER_FOCUS =
  "10 specialized developers covering security, systems development, apps and web platforms.";

export const TEAM_HR_NOTE =
  "A dedicated HR department focused on sourcing and recruiting the people behind every operation.";

export const ABOUT_SECTORS: ReadonlyArray<{
  id: string;
  icon: ServiceIconName;
  label: string;
  focus: string;
  services: readonly string[];
}> = [
  {
    id: "health",
    icon: "clipboard-check",
    label: "Health",
    focus:
      "Appointments, patient records and enquiries, where a mistyped detail is not an administrative slip.",
    services: ["Customer service", "Onboarding", "Back office"],
  },
  {
    id: "banking",
    icon: "banknote",
    label: "Banking & Finance",
    focus:
      "Recovery, verification and support run under compliance protocols that leave no room for improvisation.",
    services: ["Collections", "Customer service", "Surveys"],
  },
  {
    id: "retail",
    icon: "layout",
    label: "Retail & E-Commerce",
    focus: "Seasonal peaks, after-sales and order tracking across several channels at once.",
    services: ["Customer service", "Sales", "Data processing"],
  },
  {
    id: "telecom",
    icon: "phone",
    label: "Telecommunications",
    focus: "High volume, first-line technical support and keeping a subscriber base from walking.",
    services: ["Customer service", "Sales", "Collections"],
  },
  {
    id: "tourism",
    icon: "userplus",
    label: "Tourism & Hospitality",
    focus: "Bookings, changes and assistance across time zones, with the sale open the whole time.",
    services: ["Customer service", "Sales", "Onboarding"],
  },
];
