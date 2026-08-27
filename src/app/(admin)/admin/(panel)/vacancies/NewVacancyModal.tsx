"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Modal from "@/components/admin/Modal";
import Select from "@/components/admin/Select";
import { useToast } from "@/components/admin/Toaster";
import { missingToPublishVacancy } from "@/lib/vacancyPublishRules";
import { createVacancyDraft, publishVacancy, type VacancyInput } from "@/server/vacancies";
import type { DepartmentRow } from "@/server/departments";
import ListField from "@/components/admin/ListField";
import styles from "./NewVacancyModal.module.css";

const TRACK_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "entry", label: "Entry · no experience needed" },
  { value: "professional", label: "Professional · experience required" },
];

const WORK_MODE_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "onsite", label: "On site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
];

const EMPLOYMENT_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "full-time", label: "Full time" },
  { value: "part-time", label: "Part time" },
];

const STEPS = [
  { key: "basics", label: "Basics" },
  { key: "position", label: "Position" },
  { key: "description", label: "Description" },
  { key: "review", label: "Review" },
] as const;

function fromLocalInputValue(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function Icon({ name }: { name: "back" | "forward" | "alert" }) {
  const c = { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.3, width: 14, height: 14 };
  if (name === "back")
    return (
      <svg {...c} aria-hidden="true">
        <path d="M9.8 3.6 5.4 8l4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (name === "forward")
    return (
      <svg {...c} aria-hidden="true">
        <path d="M6.2 3.6 10.6 8l-4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg {...c} aria-hidden="true">
      <path d="M8 2 14.6 13.4H1.4L8 2Z" strokeLinejoin="round" />
      <path d="M8 6.4v3.2M8 11.6v.6" strokeLinecap="round" />
    </svg>
  );
}

type Props = { open: boolean; onClose: () => void; departments: DepartmentRow[] };

/* Crear una vacante es un asistente, no un formulario largo: cuatro pasos
   cortos en vez de la página completa del editor (que sigue existiendo para
   pulir después — ver [id]/VacancyEditor.tsx). Cada paso valida solo lo suyo;
   la validación completa para publicar vive en vacancyPublishRules y se
   enseña recién en el paso de revisión, igual que en el editor. */
export default function NewVacancyModal({ open, onClose, departments }: Props) {
  const router = useRouter();
  const toast = useToast();
  const reduced = useReducedMotion() ?? false;
  const titleId = useId();
  const summaryId = useId();
  const locationId = useId();
  const scheduleId = useId();
  const scheduledAtId = useId();

  const departmentOptions = [
    { value: "", label: "No department" },
    ...departments.map((d) => ({ value: d.id, label: d.shortLabel })),
  ];

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [track, setTrack] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [location, setLocation] = useState("");
  const [schedule, setSchedule] = useState("");
  const [summary, setSummary] = useState("");
  const [responsibilities, setResponsibilities] = useState<string[]>([""]);
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [niceToHave, setNiceToHave] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [titleError, setTitleError] = useState<string | undefined>();
  const [saving, startSaving] = useTransition();
  // Fijado una vez al montar: comparar contra el reloj en cada render es una
  // llamada impura durante el render (ver react-hooks/purity).
  const [now] = useState(() => Date.now());

  function payload(): VacancyInput {
    return {
      title,
      summary,
      departmentId: departmentId || null,
      track: (track || null) as "entry" | "professional" | null,
      workMode: (workMode || null) as "onsite" | "hybrid" | "remote" | null,
      employmentType: (employmentType || null) as "full-time" | "part-time" | null,
      location,
      schedule,
      responsibilities,
      requirements,
      niceToHave,
    };
  }

  function goNext() {
    if (step === 0 && title.trim().length < 3) {
      setTitleError("The title needs at least 3 characters.");
      return;
    }
    setTitleError(undefined);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleCreate(action: "draft" | "publish") {
    startSaving(async () => {
      const created = await createVacancyDraft(payload());
      if (!created.ok) {
        toast.error("Could not create the vacancy", created.message);
        return;
      }
      const id = created.data!.id;

      if (action === "publish") {
        const published = await publishVacancy(id, payload(), fromLocalInputValue(scheduledAt));
        if (!published.ok) {
          toast.error("Saved as a draft", "Finish it from the editor: " + published.message);
          onClose();
          router.push(`/admin/vacancies/${id}`);
          return;
        }
        const future = fromLocalInputValue(scheduledAt);
        const isFuture = Boolean(future && new Date(future).getTime() > Date.now());
        toast.success(
          isFuture ? "Vacancy scheduled" : "Vacancy published",
          isFuture ? "It goes live on Join Us at the date you set." : "It is live on Join Us.",
        );
      } else {
        toast.success("Draft created", "Publish it whenever it’s ready.");
      }

      onClose();
      router.push(`/admin/vacancies/${id}`);
    });
  }

  const missing = missingToPublishVacancy({
    title,
    summary,
    departmentId: departmentId || null,
    workMode: workMode || null,
    employmentType: employmentType || null,
    location,
    responsibilities,
    requirements,
  });

  const scheduledFuture = (() => {
    const iso = fromLocalInputValue(scheduledAt);
    return Boolean(iso && new Date(iso).getTime() > now);
  })();

  return (
    <Modal open={open} onClose={onClose} eyebrow="New vacancy" title={STEPS[step].label} width="34rem">
      <ol className={styles.steps} aria-label="Steps">
        {STEPS.map((s, index) => (
          <li key={s.key} className={styles.step} data-state={index === step ? "current" : index < step ? "done" : "upcoming"}>
            <span className={styles.stepDot} aria-hidden="true">
              {index < step ? "✓" : index + 1}
            </span>
            {s.label}
          </li>
        ))}
      </ol>

      {/* mode="wait": el paso saliente termina de desvanecerse antes de que
          entre el siguiente, así el contenido nunca se apila mientras cambia
          de alto (un paso corto contra la lista larga de Description). */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          className={styles.stepBody}
          initial={reduced ? false : { opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, x: -14 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        >
        {step === 0 && (
          <>
            <label className={styles.label} htmlFor={titleId}>
              Title
            </label>
            <input
              id={titleId}
              className={styles.input}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setTitleError(undefined);
              }}
              placeholder="Customer Service Agent"
              aria-invalid={Boolean(titleError)}
              autoFocus
            />
            {titleError && (
              <span className={styles.fieldError} role="alert">
                <Icon name="alert" />
                {titleError}
              </span>
            )}

            <span className={styles.label}>Department</span>
            <Select value={departmentId} options={departmentOptions} onChange={setDepartmentId} label="Department" width="100%" />

            <span className={styles.label}>Track</span>
            <Select value={track} options={TRACK_OPTIONS} onChange={setTrack} label="Track" width="100%" />
          </>
        )}

        {step === 1 && (
          <>
            <span className={styles.label}>Work mode</span>
            <Select value={workMode} options={WORK_MODE_OPTIONS} onChange={setWorkMode} label="Work mode" width="100%" />

            <span className={styles.label}>Employment type</span>
            <Select
              value={employmentType}
              options={EMPLOYMENT_OPTIONS}
              onChange={setEmploymentType}
              label="Employment type"
              width="100%"
            />

            <label className={styles.label} htmlFor={locationId}>
              Location
            </label>
            <input
              id={locationId}
              className={styles.input}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Santo Domingo, DR"
            />

            <label className={styles.label} htmlFor={scheduleId}>
              Schedule <span className={styles.optional}>optional</span>
            </label>
            <input
              id={scheduleId}
              className={styles.input}
              value={schedule}
              onChange={(event) => setSchedule(event.target.value)}
              placeholder="Rotating shifts, 5 days a week"
            />
          </>
        )}

        {step === 2 && (
          <>
            <label className={styles.label} htmlFor={summaryId}>
              Summary
            </label>
            <textarea
              id={summaryId}
              className={styles.textarea}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={3}
              maxLength={600}
              placeholder="One or two sentences a candidate reads first."
            />

            <ListField
              label="Responsibilities"
              placeholder="What the person does day to day"
              items={responsibilities}
              onChange={setResponsibilities}
            />
            <ListField
              label="Requirements"
              placeholder="What a candidate must already have"
              items={requirements}
              onChange={setRequirements}
            />
            <ListField
              label="Nice to have"
              help="Optional — extras that strengthen an application."
              placeholder="A plus, not a requirement"
              items={niceToHave}
              onChange={setNiceToHave}
            />
          </>
        )}

        {step === 3 && (
          <>
            <dl className={styles.review}>
              <div className={styles.reviewRow}>
                <dt>Title</dt>
                <dd>{title || "—"}</dd>
              </div>
              <div className={styles.reviewRow}>
                <dt>Department</dt>
                <dd>{departmentOptions.find((o) => o.value === departmentId)?.label ?? "—"}</dd>
              </div>
              <div className={styles.reviewRow}>
                <dt>Work mode</dt>
                <dd>{WORK_MODE_OPTIONS.find((o) => o.value === workMode)?.label ?? "—"}</dd>
              </div>
              <div className={styles.reviewRow}>
                <dt>Employment</dt>
                <dd>{EMPLOYMENT_OPTIONS.find((o) => o.value === employmentType)?.label ?? "—"}</dd>
              </div>
              <div className={styles.reviewRow}>
                <dt>Location</dt>
                <dd>{location || "—"}</dd>
              </div>
              <div className={styles.reviewRow}>
                <dt>Responsibilities</dt>
                <dd>{responsibilities.filter(Boolean).length || 0}</dd>
              </div>
              <div className={styles.reviewRow}>
                <dt>Requirements</dt>
                <dd>{requirements.filter(Boolean).length || 0}</dd>
              </div>
            </dl>

            <label className={styles.label} htmlFor={scheduledAtId}>
              Scheduled for <span className={styles.optional}>optional</span>
            </label>
            <input
              id={scheduledAtId}
              className={styles.input}
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
            />
            <span className={styles.help}>
              Leave empty to publish immediately when you hit Publish below. A future date schedules it instead.
            </span>

            {missing.length > 0 && (
              <div className={styles.missing}>
                <span className={styles.missingTitle}>Still needed to publish</span>
                <ul className={styles.missingList}>
                  {missing.map((rule) => (
                    <li key={rule.field}>{rule.need}</li>
                  ))}
                </ul>
                <span className={styles.help}>You can still save it as a draft and finish it later.</span>
              </div>
            )}
          </>
        )}
        </motion.div>
      </AnimatePresence>

      <div className={styles.foot}>
        <button className={styles.ghost} type="button" onClick={goBack} disabled={step === 0 || saving}>
          <Icon name="back" />
          Back
        </button>

        {step < STEPS.length - 1 ? (
          <button className={styles.primary} type="button" onClick={goNext}>
            Next
            <Icon name="forward" />
          </button>
        ) : (
          <span className={styles.footRight}>
            <button className={styles.ghost} type="button" onClick={() => handleCreate("draft")} disabled={saving}>
              {saving ? "Saving" : "Save as draft"}
            </button>
            <button
              className={styles.primary}
              type="button"
              onClick={() => handleCreate("publish")}
              disabled={saving || missing.length > 0}
              title={missing.length > 0 ? "Fill in what’s missing above, or save it as a draft." : undefined}
            >
              {saving ? "Publishing" : scheduledFuture ? "Schedule" : "Publish"}
            </button>
          </span>
        )}
      </div>
    </Modal>
  );
}
