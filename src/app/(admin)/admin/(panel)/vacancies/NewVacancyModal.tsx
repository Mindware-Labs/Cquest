"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import DateTimePicker from "@/components/admin/DateTimePicker";
import Modal from "@/components/admin/Modal";
import Select from "@/components/admin/Select";
import { useToast } from "@/components/admin/Toaster";
import { missingToPublishVacancy, type VacancyPublishRule } from "@/lib/vacancyPublishRules";
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

// Sugerido, no forzado: una vacante remota puede seguir acotada a un país o
// huso horario, así que el campo sigue siendo de texto libre.
const REMOTE_LOCATION = "Remote — anywhere";

const EMPLOYMENT_OPTIONS = [
  { value: "", label: "Not set" },
  { value: "full-time", label: "Full time" },
  { value: "part-time", label: "Part time" },
];

const SCHEDULE_PRESETS = [
  "Mon–Fri, business hours",
  "Rotating shifts, 5 days a week",
  "Rotating shifts, 6 days a week",
  "24/7 coverage, rotating shifts",
  "Weekends included",
];

// Sentinel, no un horario real: separa "no encontré el mío" de un valor que
// termine guardándose tal cual en el campo de texto libre.
const CUSTOM_SCHEDULE = "__custom__";

const SCHEDULE_OPTIONS = [
  { value: "", label: "Not set" },
  ...SCHEDULE_PRESETS.map((s) => ({ value: s, label: s })),
  { value: CUSTOM_SCHEDULE, label: "Custom…" },
];

const STEPS = [
  { key: "basics", label: "Basics" },
  { key: "position", label: "Position" },
  { key: "summary", label: "Summary" },
  { key: "description", label: "Description" },
  { key: "review", label: "Review" },
] as const;

// Qué regla de vacancyPublishRules le toca a cada paso — así "Next" valida
// solo lo que ese paso pidió, en vez de descargar la lista entera recién en
// Review. El paso de Review no tiene las suyas: para llegar ahí ya se pasó
// por las demás.
const STEP_FIELDS: Array<Array<VacancyPublishRule["field"]>> = [
  ["title", "departmentId"],
  ["workMode", "employmentType", "location"],
  ["summary"],
  ["responsibilities", "requirements"],
  [],
];

function fromLocalInputValue(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// Crece con el texto en vez de scrollear adentro de una caja chica: se
// resetea a "auto" antes de medir para que también se achique al borrar.
function autosize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

function Icon({ name }: { name: "back" | "forward" }) {
  const c = { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.3, width: 14, height: 14 };
  if (name === "back")
    return (
      <svg {...c} aria-hidden="true">
        <path d="M9.8 3.6 5.4 8l4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg {...c} aria-hidden="true">
      <path d="M6.2 3.6 10.6 8l-4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Compartido entre cada paso (bloquea "Next") y Review (bloquea "Publish"):
// misma caja, la lista de reglas que trae varía.
function MissingBox({ heading, rules, footer }: { heading: string; rules: VacancyPublishRule[]; footer?: string }) {
  if (rules.length === 0) return null;
  return (
    <div className={styles.missing}>
      <span className={styles.missingTitle}>{heading}</span>
      <ul className={styles.missingList}>
        {rules.map((rule) => (
          <li key={rule.field}>{rule.need}</li>
        ))}
      </ul>
      {footer && <span className={styles.help}>{footer}</span>}
    </div>
  );
}

type Props = { open: boolean; onClose: () => void; departments: DepartmentRow[] };

/* Crear una vacante es un asistente, no un formulario largo: pasos cortos en
   vez de la página completa del editor (que sigue existiendo para pulir
   después — ver [id]/VacancyEditor.tsx). Las reglas de publicación viven en
   vacancyPublishRules (una sola fuente, compartida con el editor); acá
   "Next" solo exige las que le tocan a STEP_FIELDS[step], así el aviso sale
   en el paso donde falta el dato, no amontonado recién en Review. "Save as
   draft" no pasa por esa validación en ningún paso — un borrador se puede
   guardar con lo que haya. */
export default function NewVacancyModal({ open, onClose, departments }: Props) {
  const router = useRouter();
  const toast = useToast();
  const reduced = useReducedMotion() ?? false;
  const titleId = useId();
  const summaryId = useId();
  const locationId = useId();
  const scheduleId = useId();

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
  const [scheduleChoice, setScheduleChoice] = useState("");
  const [summary, setSummary] = useState("");
  const [responsibilities, setResponsibilities] = useState<string[]>([""]);
  const [requirements, setRequirements] = useState<string[]>([""]);
  const [niceToHave, setNiceToHave] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  // Recién se muestra después de un intento de "Next" fallido en este paso;
  // se apaga al cambiar de paso. Qué reglas mostrar sale de `missing`
  // (recalculado cada render), así la lista se achica sola a medida que se
  // completan los campos, sin tocar este flag por cada input.
  const [showStepErrors, setShowStepErrors] = useState(false);
  // Cuál de los tres botones del pie está en curso, para que solo ESE
  // cambie su texto a "Saving"/"Publishing"/"Scheduling" — los otros dos
  // solo se deshabilitan mientras tanto.
  const [pendingAction, setPendingAction] = useState<"draft" | "publish" | "schedule" | null>(null);
  // El selector de fecha no vive siempre visible: se abre solo al pedir
  // "Schedule", en vez de ocupar espacio para una acción que la mayoría de
  // las veces no se usa (la mayoría de las vacantes se publican ya mismo).
  const [scheduling, setScheduling] = useState(false);
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

  // Remota sugiere "Remote — anywhere" en vez de exigir una ciudad, pero solo
  // si el campo está vacío: no pisa una ubicación que ya se haya escrito.
  function handleWorkModeChange(next: string) {
    setWorkMode(next);
    if (next === "remote" && location.trim() === "") setLocation(REMOTE_LOCATION);
  }

  // Elegir un preset lo guarda tal cual; elegir "Custom…" solo cambia de
  // modo — deja el texto como esté, así el preset anterior sirve de punto de
  // partida en vez de forzar a escribir desde cero.
  function handleScheduleChange(next: string) {
    setScheduleChoice(next);
    if (next !== CUSTOM_SCHEDULE) setSchedule(next);
  }

  function goNext() {
    const blocking = missing.filter((rule) => STEP_FIELDS[step].includes(rule.field));
    if (blocking.length > 0) {
      setShowStepErrors(true);
      return;
    }
    setShowStepErrors(false);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setShowStepErrors(false);
    setScheduling(false);
    setStep((s) => Math.max(s - 1, 0));
  }

  // Tres botones, tres intenciones separadas — nada de inferir de la fecha
  // cuál quiso el usuario. Publish siempre publica ya mismo, ignore lo que
  // haya en "Scheduled for"; Schedule es la única acción que lo usa.
  async function handleCreate(action: "draft" | "publish" | "schedule") {
    setPendingAction(action);
    startSaving(async () => {
      const created = await createVacancyDraft(payload());
      if (!created.ok) {
        toast.error("Could not create the vacancy", created.message);
        return;
      }
      const id = created.data!.id;

      if (action === "publish" || action === "schedule") {
        const scheduleIso = action === "schedule" ? fromLocalInputValue(scheduledAt) : null;
        const published = await publishVacancy(id, payload(), scheduleIso);
        if (!published.ok) {
          toast.error("Saved as a draft", "Finish it from the editor: " + published.message);
          onClose();
          router.push(`/admin/vacancies/${id}`);
          return;
        }
        toast.success(
          action === "schedule" ? "Vacancy scheduled" : "Vacancy published",
          action === "schedule" ? "It goes live on Join Us at the date you set." : "It is live on Join Us.",
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

  const stepErrors = showStepErrors ? missing.filter((rule) => STEP_FIELDS[step].includes(rule.field)) : [];

  const scheduledFuture = (() => {
    const iso = fromLocalInputValue(scheduledAt);
    return Boolean(iso && new Date(iso).getTime() > now);
  })();

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="New vacancy"
      title={
        <span className={styles.titleRow}>
          <button className={styles.backIcon} type="button" onClick={goBack} disabled={step === 0 || saving} aria-label="Back" title="Back">
            <Icon name="back" />
          </button>
          {STEPS[step].label}
        </span>
      }
      width="34rem"
    >
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
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Customer Service Agent"
              autoFocus
            />

            <span className={styles.label}>Department</span>
            <Select value={departmentId} options={departmentOptions} onChange={setDepartmentId} label="Department" width="100%" />

            <span className={styles.label}>Track</span>
            <Select value={track} options={TRACK_OPTIONS} onChange={setTrack} label="Track" width="100%" />

            <MissingBox heading="Needed to continue" rules={stepErrors} />
          </>
        )}

        {step === 1 && (
          <>
            <span className={styles.label}>Work mode</span>
            <Select value={workMode} options={WORK_MODE_OPTIONS} onChange={handleWorkModeChange} label="Work mode" width="100%" />

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
              placeholder={workMode === "remote" ? REMOTE_LOCATION : "Santo Domingo, DR"}
            />
            {workMode === "remote" && (
              <span className={styles.help}>No physical site needed — say where candidates can work from, or leave it as “{REMOTE_LOCATION}”.</span>
            )}

            <span className={styles.label}>
              Schedule <span className={styles.optional}>optional</span>
            </span>
            <Select value={scheduleChoice} options={SCHEDULE_OPTIONS} onChange={handleScheduleChange} label="Schedule" width="100%" />
            {scheduleChoice === CUSTOM_SCHEDULE && (
              <>
                <label className={styles.label} htmlFor={scheduleId}>
                  Custom schedule
                </label>
                <input
                  id={scheduleId}
                  className={styles.input}
                  value={schedule}
                  onChange={(event) => setSchedule(event.target.value)}
                  placeholder="Describe the schedule for this role"
                  autoFocus
                />
              </>
            )}

            <MissingBox heading="Needed to continue" rules={stepErrors} />
          </>
        )}

        {step === 2 && (
          <>
            <label className={styles.label} htmlFor={summaryId}>
              Summary
            </label>
            <textarea
              id={summaryId}
              ref={autosize}
              className={styles.textarea}
              value={summary}
              onChange={(event) => {
                setSummary(event.target.value);
                autosize(event.target);
              }}
              rows={4}
              maxLength={600}
              placeholder="One or two sentences a candidate reads first."
              autoFocus
            />

            <MissingBox heading="Needed to continue" rules={stepErrors} />
          </>
        )}

        {step === 3 && (
          <>
            {/* "capped": pasadas ~5 líneas cada lista scrollea en su propio
                rectángulo en vez de seguir estirando el formulario hacia
                abajo a medida que se agregan más. */}
            <ListField
              label="Responsibilities"
              placeholder="What the person does day to day"
              items={responsibilities}
              onChange={setResponsibilities}
              capped
            />
            <ListField
              label="Requirements"
              placeholder="What a candidate must already have"
              items={requirements}
              onChange={setRequirements}
              capped
            />
            <ListField
              label="Nice to have"
              help="Optional — extras that strengthen an application."
              placeholder="A plus, not a requirement"
              items={niceToHave}
              onChange={setNiceToHave}
              capped
            />

            <MissingBox heading="Needed to continue" rules={stepErrors} />
          </>
        )}

        {step === 4 && (
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

            {scheduling ? (
              <>
                <span className={styles.label}>Publish date</span>
                <DateTimePicker value={scheduledAt} onChange={setScheduledAt} label="Publish date" width="100%" autoFocus />
                <span className={styles.help}>Pick when this vacancy should go live.</span>
              </>
            ) : (
              <MissingBox heading="Still needed to publish" rules={missing} footer="You can still save it as a draft and finish it later." />
            )}
          </>
        )}
        </motion.div>
      </AnimatePresence>

      {/* Back vive arriba, junto al título del paso (ver title de Modal) —
          este pie queda solo para las acciones que avanzan, sin competir
          por espacio con ella. En Review, mientras se está fijando la fecha
          (scheduling), se reemplaza por Cancel/Confirm schedule: enfoca esa
          única decisión en vez de dejar Draft y Publish sueltos de fondo. */}
      {/* data-variant="final": las tres acciones de Review (Draft/Schedule/
          Publish) reparten todo el ancho por igual en vez de agruparse a la
          derecha — es la decisión real del asistente, así que pesan como
          tal. Los demás pasos (y el propio Cancel/Confirm schedule) siguen
          agrupados a la derecha, más discretos. */}
      <div className={styles.foot} data-variant={step === STEPS.length - 1 && !scheduling ? "final" : undefined}>
        {step === STEPS.length - 1 && scheduling ? (
          <>
            <button className={styles.ghost} type="button" onClick={() => setScheduling(false)} disabled={saving}>
              Cancel
            </button>
            <button
              className={styles.primary}
              type="button"
              onClick={() => handleCreate("schedule")}
              disabled={saving || !scheduledFuture}
              title={!scheduledFuture ? "Pick a future date above first." : undefined}
            >
              {saving && pendingAction === "schedule" ? "Scheduling" : "Confirm schedule"}
            </button>
          </>
        ) : (
          <>
            {/* Disponible desde cualquier paso: "Next"/"Publish" exigen
                completar lo suyo para avanzar, pero un borrador se puede
                guardar con lo que haya hasta ahora, aunque falte todo lo
                demás — así lo promete el tooltip de ayuda de la página. */}
            <button className={styles.ghost} type="button" onClick={() => handleCreate("draft")} disabled={saving}>
              {saving && pendingAction === "draft" ? "Saving" : "Save as draft"}
            </button>

            {step < STEPS.length - 1 ? (
              <button className={styles.primary} type="button" onClick={goNext}>
                Next
                <Icon name="forward" />
              </button>
            ) : (
              <>
                <button
                  className={styles.secondary}
                  type="button"
                  onClick={() => setScheduling(true)}
                  disabled={saving || missing.length > 0}
                  title={missing.length > 0 ? "Fill in what’s missing above, or save it as a draft." : undefined}
                >
                  Schedule
                </button>
                <button
                  className={styles.primary}
                  type="button"
                  onClick={() => handleCreate("publish")}
                  disabled={saving || missing.length > 0}
                  title={missing.length > 0 ? "Fill in what’s missing above, or save it as a draft." : undefined}
                >
                  {saving && pendingAction === "publish" ? "Publishing" : "Publish"}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
