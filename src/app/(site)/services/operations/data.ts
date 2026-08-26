import { SERVICES } from "@/components/services/data";

export const BPO = SERVICES.find((service) => service.id === "bpo")!;

export const CAPABILITY_DETAIL: Record<
  string,
  { includes: readonly string[]; benefit: string }
> = {
  "back-office-support": {
    includes: [
      "Document management, order processing and account maintenance handled end to end",
      "Runbooks that make every task repeatable, whoever executes it",
      "Volume absorbed without adding headcount on your side",
    ],
    benefit:
      "Your team stays focused on the core business while the repetitive load runs accurately in the background.",
  },
  "data-processing": {
    includes: [
      "Data entry, validation and cleansing at volume",
      "Double-verification protocols on accuracy-critical records",
      "Structured outputs delivered in your systems and formats",
    ],
    benefit:
      "Reliable information your operation can act on — without the error rates that manual overload produces.",
  },
  "omnichannel-support": {
    includes: [
      "One coordinated queue across phone, email, chat and messaging",
      "Consistent answers backed by a shared knowledge base",
      "Coverage schedules aligned to your operating hours",
    ],
    benefit:
      "Customers get the same answer on every channel, and nothing falls between the cracks.",
  },
  "trust-safety": {
    includes: [
      "Content and transaction review under clearly documented policies",
      "Proactive risk flagging with defined escalation paths",
      "Audit trails behind every decision taken",
    ],
    benefit:
      "Your platform and community stay protected without slowing the operation down.",
  },
  "quality-assurance": {
    includes: [
      "Interaction sampling scored against your quality standards",
      "Calibration sessions that keep evaluators aligned",
      "Findings fed back into coaching and process fixes",
    ],
    benefit:
      "Quality stops being an opinion — it becomes a measured, improving number.",
  },
  "consulting-services": {
    includes: [
      "Diagnosis of your current processes and cost structure",
      "Redesign proposals with measurable targets",
      "Implementation support alongside your team",
    ],
    benefit:
      "An outside operations lens that turns inefficiencies into a concrete improvement plan.",
  },
};

export const PROCESS: ReadonlyArray<{ title: string; description: string }> = [
  {
    title: "Discovery",
    description:
      "We study the process as it runs today — volumes, systems, exceptions, and the cost of getting it wrong.",
  },
  {
    title: "Process mapping",
    description:
      "Every step is documented into a runbook: inputs, outputs, rules and edge cases, so the work is repeatable by design.",
  },
  {
    title: "Pilot",
    description:
      "A controlled slice of real volume runs first, measured against the agreed SLAs before anything scales.",
  },
  {
    title: "Scale-up",
    description:
      "Volume ramps in stages while accuracy and turnaround hold; staffing flexes with your demand curve.",
  },
  {
    title: "Continuous improvement",
    description:
      "Audits, error analysis and process reviews keep tightening the operation long after launch.",
  },
];

export const SLAS: ReadonlyArray<{ label: string; value: string; status: string }> = [
  {
    label: "Accuracy target",
    value: "99%+",
    status: "Double-verification on critical records",
  },
  {
    label: "Turnaround",
    value: "Within SLA",
    status: "Agreed per process, measured daily",
  },
  {
    label: "Volume capacity",
    value: "Elastic",
    status: "Staffing flexes with your demand curve",
  },
  {
    label: "Coverage",
    value: "Up to 24/7",
    status: "Schedules aligned to your operation",
  },
  {
    label: "Reporting",
    value: "Continuous",
    status: "Production and quality always visible to you",
  },
];

export const PHOTOS: ReadonlyArray<{ title: string; src: string }> = [
  {
    title: "Back-office team at work",
    src: "/bpo-services/bpo-floor2.jpg",
  },
  {
    title: "Process floor detail",
    src: "/bpo-services/bpo-floor3.jpeg",
  },
];

export const HERO_LINES: ReadonlyArray<{ text: string; strong: boolean }> = [
  { text: "The work", strong: false },
  { text: "behind your", strong: false },
  { text: "operation.", strong: true },
];
