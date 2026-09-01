"use client";

import { useCallback, useEffect, useId, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DateTimePicker from "@/components/admin/DateTimePicker";
import Modal from "@/components/admin/Modal";
import Select from "@/components/admin/Select";
import { useToast } from "@/components/admin/Toaster";
import { missingToPublishVacancy } from "@/lib/vacancyPublishRules";
import {
  publishVacancy,
  saveVacancy,
  setVacancyStatus,
  type VacancyDetail,
} from "@/server/vacancies";
import type { DepartmentRow } from "@/server/departments";
import ListField from "@/components/admin/ListField";
import styles from "./VacancyEditor.module.css";

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

// El input datetime-local trabaja en hora local del navegador, no en UTC.
function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function formatPublishDate(iso: string): string {
  const d = new Date(iso);
  const datePart = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
  const timePart = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).format(d);
  return `${datePart} · ${timePart}`;
}

// Crece con el texto en vez de scrollear adentro de una caja chica: se
// resetea a "auto" antes de medir para que también se achique al borrar.
function autosize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

function Icon({ name, size = 16 }: { name: string; size?: number }) {
  const c = { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.3 };
  switch (name) {
    case "back":
      return (
        <svg {...c} width={size} height={size} aria-hidden="true">
          <path d="M9.8 3.6 5.4 8l4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "plus":
      return (
        <svg {...c} width={14} height={14} aria-hidden="true">
          <path d="M8 3.4v9.2M3.4 8h9.2" strokeLinecap="round" />
        </svg>
      );
    case "trash":
      return (
        <svg {...c} width={14} height={14} aria-hidden="true">
          <path d="M2.8 4.4h10.4M6.4 4.4V2.8h3.2v1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m4.2 4.4.7 8.4h6.2l.7-8.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg {...c} width={14} height={14} aria-hidden="true">
          <path d="M8 2 14.6 13.4H1.4L8 2Z" strokeLinejoin="round" />
          <path d="M8 6.4v3.2M8 11.6v.6" strokeLinecap="round" />
        </svg>
      );
  }
}

export default function VacancyEditor({
  vacancy,
  departments,
}: {
  vacancy: VacancyDetail;
  departments: DepartmentRow[];
}) {
  const router = useRouter();
  const toast = useToast();
  const titleId = useId();
  const summaryId = useId();
  const locationId = useId();
  const scheduleId = useId();
  const blockedId = useId();

  const departmentOptions = [
    { value: "", label: "No department" },
    ...departments.map((d) => ({ value: d.id, label: d.shortLabel })),
  ];

  const [title, setTitle] = useState(vacancy.title === "Untitled position" ? "" : vacancy.title);
  const [summary, setSummary] = useState(vacancy.summary);
  const [departmentId, setDepartmentId] = useState(vacancy.departmentId ?? "");
  const [track, setTrack] = useState(vacancy.track ?? "");
  const [workMode, setWorkMode] = useState(vacancy.workMode ?? "");
  const [employmentType, setEmploymentType] = useState(vacancy.employmentType ?? "");
  const [location, setLocation] = useState(vacancy.location);
  const [schedule, setSchedule] = useState(vacancy.schedule);
  // Un horario ya guardado que no calza con ningún preset (dato histórico,
  // o texto libre de antes de este cambio) abre directo en modo "Custom…".
  const [scheduleChoice, setScheduleChoice] = useState(
    vacancy.schedule === "" || SCHEDULE_PRESETS.includes(vacancy.schedule) ? vacancy.schedule : CUSTOM_SCHEDULE,
  );
  const [responsibilities, setResponsibilities] = useState<string[]>(
    vacancy.responsibilities.length ? vacancy.responsibilities : [""],
  );
  const [requirements, setRequirements] = useState<string[]>(
    vacancy.requirements.length ? vacancy.requirements : [""],
  );
  const [niceToHave, setNiceToHave] = useState<string[]>(vacancy.niceToHave);
  const [scheduledAt, setScheduledAt] = useState(toLocalInputValue(vacancy.publishedAt));
  const [status, setStatus] = useState(vacancy.status);
  // Fijado una vez al montar: comparar contra el reloj en cada render es una
  // llamada impura durante el render (ver react-hooks/purity).
  const [now] = useState(() => Date.now());

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, startSaving] = useTransition();

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function touch<T>(setter: (v: T) => void) {
    return (value: T) => {
      setter(value);
      setDirty(true);
    };
  }

  // Remota sugiere "Remote — anywhere" en vez de exigir una ciudad, pero solo
  // si el campo está vacío: no pisa una ubicación que ya se haya escrito.
  function handleWorkModeChange(next: string) {
    setWorkMode(next);
    if (next === "remote" && location.trim() === "") setLocation(REMOTE_LOCATION);
    setDirty(true);
  }

  // Elegir un preset lo guarda tal cual; elegir "Custom…" solo cambia de
  // modo — deja el texto como esté, así el preset anterior sirve de punto de
  // partida en vez de forzar a escribir desde cero.
  function handleScheduleChange(next: string) {
    setScheduleChoice(next);
    if (next !== CUSTOM_SCHEDULE) setSchedule(next);
    setDirty(true);
  }

  const payload = useCallback(
    () => ({
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
    }),
    [title, summary, departmentId, track, workMode, employmentType, location, schedule, responsibilities, requirements, niceToHave],
  );

  function handleSave() {
    startSaving(async () => {
      const result = await saveVacancy(vacancy.id, payload());
      if (!result.ok) {
        setErrors(result.fields ?? {});
        toast.error("Could not save", result.message);
        return;
      }
      setErrors({});
      setDirty(false);
      toast.success("Draft saved");
      router.refresh();
    });
  }

  function handlePublish() {
    startSaving(async () => {
      const result = await publishVacancy(vacancy.id, payload(), fromLocalInputValue(scheduledAt));
      if (!result.ok) {
        setErrors(result.fields ?? {});
        const reasons = Object.values(result.fields ?? {});
        toast.error("Something is missing to publish", reasons.join(" ") || result.message);
        return;
      }
      setErrors({});
      setDirty(false);
      setStatus("published");
      const future = fromLocalInputValue(scheduledAt);
      toast.success(
        future && new Date(future).getTime() > Date.now() ? "Vacancy scheduled" : "Vacancy published",
        future && new Date(future).getTime() > Date.now() ? "It goes live on Join Us at the date you set." : "It is live on Join Us.",
      );
      router.refresh();
    });
  }

  function handleHide() {
    startSaving(async () => {
      const result = await setVacancyStatus(vacancy.id, "hidden");
      if (!result.ok) {
        toast.error("Could not hide it", result.message);
        return;
      }
      setStatus("hidden");
      toast.success("Vacancy hidden", "It no longer shows on Join Us.");
      router.refresh();
    });
  }

  const statusLabel = status === "published" ? "Published" : status === "hidden" ? "Hidden" : "Draft";

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
  const blocked = missing.length > 0 ? `Missing ${missing.map((rule) => rule.need).join(", ")}.` : undefined;

  const scheduledFuture = (() => {
    const iso = fromLocalInputValue(scheduledAt);
    return Boolean(iso && new Date(iso).getTime() > now);
  })();

  // A propósito lee vacancy.publishedAt (lo ya guardado), no scheduledAt (lo
  // que se esté editando sin guardar todavía): la nota de estado dice lo que
  // ES ahora mismo, no lo que va a pasar si tocan "Update publication".
  const publishedFuture = Boolean(vacancy.publishedAt && new Date(vacancy.publishedAt).getTime() > now);

  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <div className={styles.barLeft}>
          <Link className={styles.back} href="/admin/vacancies">
            <Icon name="back" size={15} />
            Vacancies
          </Link>
          <span className={styles.status} data-state={status} title={dirty ? "Unsaved changes" : undefined}>
            {statusLabel}
            {dirty && <span className={styles.dirty} aria-label="Unsaved changes" />}
          </span>
        </div>

        <div className={styles.barActions}>
          <Link className={styles.ghost} href={`/admin/applications?vacancy=${vacancy.id}`}>
            Applications · {vacancy.applications}
          </Link>
          {status === "published" && (
            <button className={styles.ghost} type="button" onClick={handleHide} disabled={saving}>
              Hide
            </button>
          )}
          <button className={styles.ghost} type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving" : "Save draft"}
          </button>
          <span className={styles.publishWrap}>
            <button
              className={styles.primary}
              type="button"
              onClick={() => {
                if (blocked) {
                  toast.error("Something is missing to publish", blocked);
                  return;
                }
                setConfirmOpen(true);
              }}
              disabled={saving}
              aria-disabled={blocked ? true : undefined}
              aria-describedby={blocked ? blockedId : undefined}
              data-blocked={blocked ? "" : undefined}
            >
              {status === "published" ? "Update publication" : scheduledFuture ? "Schedule" : "Publish"}
            </button>

            {missing.length > 0 && (
              <span className={styles.blockedPanel} id={blockedId} role="tooltip">
                <span className={styles.blockedTitle}>Missing to publish</span>
                <ul className={styles.blockedList}>
                  {missing.map((rule) => (
                    <li key={rule.field}>{rule.need}</li>
                  ))}
                </ul>
              </span>
            )}
          </span>
        </div>
      </header>

      <div className={styles.columns}>
        <div className={styles.main}>
          <label className={styles.srOnly} htmlFor={titleId}>
            Title
          </label>
          <input
            id={titleId}
            className={styles.title}
            value={title}
            onChange={(event) => touch(setTitle)(event.target.value)}
            placeholder="Position title"
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && (
            <span className={styles.fieldError} role="alert">
              <Icon name="alert" />
              {errors.title}
            </span>
          )}

          <label className={styles.label} htmlFor={summaryId}>
            Summary
          </label>
          <textarea
            id={summaryId}
            ref={autosize}
            className={styles.textarea}
            value={summary}
            onChange={(event) => {
              touch(setSummary)(event.target.value);
              autosize(event.target);
            }}
            rows={4}
            maxLength={600}
            placeholder="One or two sentences a candidate reads first — what the role does and who it serves."
            aria-invalid={Boolean(errors.summary)}
          />
          {errors.summary && (
            <span className={styles.fieldError} role="alert">
              <Icon name="alert" />
              {errors.summary}
            </span>
          )}

          <ListField
            label="Responsibilities"
            placeholder="What the person does day to day"
            items={responsibilities}
            onChange={touch(setResponsibilities)}
            error={errors.responsibilities}
          />

          <ListField
            label="Requirements"
            placeholder="What a candidate must already have"
            items={requirements}
            onChange={touch(setRequirements)}
            error={errors.requirements}
          />

          <ListField
            label="Nice to have"
            help="Optional — extras that strengthen an application without ruling anyone out."
            placeholder="A plus, not a requirement"
            items={niceToHave}
            onChange={touch(setNiceToHave)}
          />
        </div>

        <aside className={styles.side}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Details</h2>

            <span className={styles.label}>Department</span>
            <Select
              value={departmentId}
              options={departmentOptions}
              onChange={touch(setDepartmentId)}
              label="Department"
              width="100%"
            />
            {errors.departmentId && (
              <span className={styles.fieldError} role="alert">
                <Icon name="alert" />
                {errors.departmentId}
              </span>
            )}

            <span className={styles.label}>Track</span>
            <Select value={track} options={TRACK_OPTIONS} onChange={touch(setTrack)} label="Track" width="100%" />

            <span className={styles.label}>Work mode</span>
            <Select
              value={workMode}
              options={WORK_MODE_OPTIONS}
              onChange={handleWorkModeChange}
              label="Work mode"
              width="100%"
            />
            {errors.workMode && (
              <span className={styles.fieldError} role="alert">
                <Icon name="alert" />
                {errors.workMode}
              </span>
            )}

            <span className={styles.label}>Employment type</span>
            <Select
              value={employmentType}
              options={EMPLOYMENT_OPTIONS}
              onChange={touch(setEmploymentType)}
              label="Employment type"
              width="100%"
            />
            {errors.employmentType && (
              <span className={styles.fieldError} role="alert">
                <Icon name="alert" />
                {errors.employmentType}
              </span>
            )}

            <label className={styles.label} htmlFor={locationId}>
              Location
            </label>
            <input
              id={locationId}
              className={styles.input}
              value={location}
              onChange={(event) => touch(setLocation)(event.target.value)}
              placeholder={workMode === "remote" ? REMOTE_LOCATION : "Santo Domingo, DR"}
              aria-invalid={Boolean(errors.location)}
            />
            {workMode === "remote" && (
              <span className={styles.help}>No physical site needed — say where candidates can work from, or leave it as “{REMOTE_LOCATION}”.</span>
            )}
            {errors.location && (
              <span className={styles.fieldError} role="alert">
                <Icon name="alert" />
                {errors.location}
              </span>
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
                  onChange={(event) => touch(setSchedule)(event.target.value)}
                  placeholder="Describe the schedule for this role"
                  autoFocus
                />
              </>
            )}
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>Publishing</h2>

            {/* Dice lo que YA es cierto (guardado), no lo que el campo de
                abajo va a hacer si lo tocan — así queda claro si esto ya se
                publicó/agendó, no solo la fecha en un campo editable suelto. */}
            {status === "published" && vacancy.publishedAt && (
              <span className={styles.publishNote} data-scheduled={publishedFuture ? "" : undefined}>
                {publishedFuture
                  ? `Scheduled — goes live on Join Us on ${formatPublishDate(vacancy.publishedAt)}.`
                  : `Live on Join Us since ${formatPublishDate(vacancy.publishedAt)}.`}
              </span>
            )}

            <span className={styles.label}>
              Scheduled for <span className={styles.optional}>optional</span>
            </span>
            <DateTimePicker value={scheduledAt} onChange={touch(setScheduledAt)} label="Scheduled for" width="100%" />
            <span className={styles.help}>
              Leave empty to publish immediately. A future date keeps it off Join Us and shows it as
              “Scheduled” here until that moment.
            </span>
          </section>
        </aside>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        eyebrow="Confirm"
        title={
          status === "published"
            ? "Update the publication"
            : scheduledFuture
              ? "Schedule the vacancy"
              : "Publish the vacancy"
        }
      >
        <p className={styles.dialogText}>
          {status === "published"
            ? "The public version is rebuilt with the current changes. The URL stays the same."
            : scheduledFuture
              ? "The vacancy becomes visible on Join Us at the date you set. The URL is set now from the title and never changes again."
              : "The vacancy becomes visible on Join Us right away. The URL is set now from the title and never changes again."}
        </p>
        <div className={styles.dialogFoot}>
          <button className={styles.ghost} type="button" onClick={() => setConfirmOpen(false)}>
            Cancel
          </button>
          <button
            className={styles.primary}
            type="button"
            onClick={() => {
              setConfirmOpen(false);
              handlePublish();
            }}
            disabled={saving}
          >
            {status === "published" ? "Update" : scheduledFuture ? "Schedule" : "Publish"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
