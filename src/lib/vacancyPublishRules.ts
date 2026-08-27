/* Igual que src/lib/publishRules.ts para el blog: una sola lista que usan el
   servidor (rechaza) y el editor (deshabilita el botón), para que nunca se
   desincronicen. */

export type VacancyPublishDraft = {
  title: string;
  summary: string;
  departmentId: string | null;
  workMode: string | null;
  employmentType: string | null;
  location: string;
  responsibilities: readonly string[];
  requirements: readonly string[];
};

export type VacancyPublishRule = {
  field: keyof VacancyPublishDraft;
  message: string;
  need: string;
  ok: (draft: VacancyPublishDraft) => boolean;
};

export const VACANCY_PUBLISH_RULES: VacancyPublishRule[] = [
  {
    field: "title",
    message: "The title needs at least 3 characters.",
    need: "the title",
    ok: (draft) => draft.title.trim().length >= 3,
  },
  {
    field: "summary",
    message: "The summary needs at least 20 characters.",
    need: "the summary (at least 20 characters)",
    ok: (draft) => draft.summary.trim().length >= 20,
  },
  {
    field: "departmentId",
    message: "Pick a department before publishing.",
    need: "the department",
    ok: (draft) => Boolean(draft.departmentId),
  },
  {
    field: "workMode",
    message: "Pick a work mode before publishing.",
    need: "the work mode",
    ok: (draft) => Boolean(draft.workMode),
  },
  {
    field: "employmentType",
    message: "Pick an employment type before publishing.",
    need: "the employment type",
    ok: (draft) => Boolean(draft.employmentType),
  },
  {
    field: "location",
    message: "The location is required.",
    need: "the location",
    ok: (draft) => draft.location.trim().length > 0,
  },
  {
    field: "responsibilities",
    message: "Add at least one responsibility.",
    need: "at least one responsibility",
    ok: (draft) => draft.responsibilities.some((line) => line.trim().length > 0),
  },
  {
    field: "requirements",
    message: "Add at least one requirement.",
    need: "at least one requirement",
    ok: (draft) => draft.requirements.some((line) => line.trim().length > 0),
  },
];

export function missingToPublishVacancy(draft: VacancyPublishDraft): VacancyPublishRule[] {
  return VACANCY_PUBLISH_RULES.filter((rule) => !rule.ok(draft));
}
