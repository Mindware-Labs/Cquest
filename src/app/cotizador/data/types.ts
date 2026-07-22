import type { ServiceId, ServiceIconName } from "@/components/services/data";

/* ── The smart quote form model ───────────────────────────
   Requirements §3.2 asks for a step-by-step assistant: Step 1 picks a
   business line, Step 2 asks questions SPECIFIC to that line, Step 3 takes
   contact details. Step 2 is therefore data-driven — one questionnaire per
   service — so the form's shape is content, not code, and the marketing team
   (or a later admin panel) can reshape it without touching the wizard.

   English first; a bilingual (ES/EN) pass comes later, so every user-facing
   string lives in the data/ modules rather than scattered through JSX. */

export type FieldKind = "single" | "multi" | "text" | "email" | "tel" | "textarea";

export type Choice = {
  value: string;
  label: string;
  hint?: string;
  icon?: ServiceIconName;
};

export type Question = {
  id: string;
  kind: FieldKind;
  label: string;
  help?: string;
  required?: boolean;
  choices?: readonly Choice[];
  placeholder?: string;
};

export type Questionnaire = {
  serviceId: ServiceId;
  /** One line of framing shown atop step 2, in the service's own voice. */
  lead: string;
  questions: readonly Question[];
};

/* ── Wizard answer shape ────────────────────────────────── */

export type Answers = Record<string, string | string[]>;

export type QuoteSubmission = {
  service: ServiceId;
  details: Answers;
  contact: Answers;
};
