"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Modal from "@/components/admin/Modal";
import Select from "@/components/admin/Select";
import { useToast } from "@/components/admin/Toaster";
import { APPLICATION_STATUSES, APPLICATION_STATUS_META, type ApplicationStatus } from "@/lib/applicationStatus";
import {
  deleteApplications,
  saveApplicationNotes,
  setApplicationStatus,
  type ApplicationDetail as Detail,
} from "@/server/applications";
import { AVAILABILITY_OPTIONS, ENGLISH_OPTIONS, EXPERIENCE_OPTIONS, formatBytes, optionLabel } from "@/app/(site)/join-us/apply/data";
import { initials } from "../ApplicationsTable";
import styles from "./ApplicationDetail.module.css";

const STATUS_OPTIONS = APPLICATION_STATUSES.map((value) => ({ value, label: APPLICATION_STATUS_META[value].label }));

const stamp = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Santo_Domingo",
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

function Icon({ name }: { name: string }) {
  const c = { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.3 };
  switch (name) {
    case "back":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M9.8 3.6 5.4 8l4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "mail":
      return (
        <svg {...c} aria-hidden="true">
          <rect x="2.2" y="3.6" width="11.6" height="8.8" rx="1.2" />
          <path d="m2.6 4.6 5.4 4.2 5.4-4.2" strokeLinejoin="round" />
        </svg>
      );
    case "phone":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M4.4 2.6h2.2l1.1 2.8-1.4 1a7.4 7.4 0 0 0 3.3 3.3l1-1.4 2.8 1.1v2.2c0 .6-.5 1.1-1.1 1.1A9.7 9.7 0 0 1 3.3 3.7c0-.6.5-1.1 1.1-1.1Z" strokeLinejoin="round" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M8 2.6a5.4 5.4 0 0 0-4.7 8.1L2.6 13.4l2.8-.7A5.4 5.4 0 1 0 8 2.6Z" strokeLinejoin="round" />
          <path d="M6.2 6.2c.2 1.7 1.9 3.4 3.6 3.6l.6-.9-1.2-.5-.5.4c-.5-.2-1.2-.9-1.4-1.4l.4-.5-.5-1.2-1 .5Z" strokeLinejoin="round" />
        </svg>
      );
    case "pin":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M8 13.6s3.8-3.6 3.8-6.4a3.8 3.8 0 0 0-7.6 0c0 2.8 3.8 6.4 3.8 6.4Z" strokeLinejoin="round" />
          <circle cx="8" cy="7.2" r="1.3" />
        </svg>
      );
    case "download":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M8 2.6v7.2M5.2 7l2.8 2.8L10.8 7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 11v2.4h10V11" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "external":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M6.4 3.4H3.2v9.4h9.4V9.6M9.2 3.2h3.6v3.6M12.6 3.4 7.4 8.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "trash":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M2.8 4.4h10.4M6.4 4.4V2.8h3.2v1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m4.2 4.4.7 8.4h6.2l.7-8.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

function StatusDot({ shape }: { shape: "full" | "half" | "ring" }) {
  return (
    <svg width="7" height="7" viewBox="0 0 8 8" aria-hidden="true">
      <circle cx="4" cy="4" r="3.2" fill={shape === "ring" ? "none" : "currentColor"} stroke="currentColor" strokeWidth="1.2" />
      {shape === "half" && <path d="M4 0.8a3.2 3.2 0 0 0 0 6.4Z" fill="var(--surface-raised)" />}
    </svg>
  );
}

export default function ApplicationDetail({ application }: { application: Detail }) {
  const toast = useToast();
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [notes, setNotes] = useState(application.notes);
  const [savedNotes, setSavedNotes] = useState(application.notes);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const meta = APPLICATION_STATUS_META[status];
  const resumeHref = `/api/admin/applications/${application.id}/resume`;
  const isPdf = application.resumeType === "application/pdf";
  const phoneDigits = application.phone.replace(/\D/g, "");
  const dirty = notes !== savedNotes;

  async function changeStatus(next: ApplicationStatus) {
    const previous = status;
    setStatus(next);
    const result = await setApplicationStatus([application.id], next);
    if (!result.ok) {
      setStatus(previous);
      toast.error("Could not change the status", result.message);
      return;
    }
    toast.success(`Marked as ${APPLICATION_STATUS_META[next].label}`);
    router.refresh();
  }

  async function saveNotes() {
    setBusy(true);
    const result = await saveApplicationNotes(application.id, notes);
    setBusy(false);
    if (!result.ok) {
      toast.error("Could not save the notes", result.message);
      return;
    }
    setSavedNotes(notes);
    toast.success("Notes saved");
  }

  async function confirmDelete() {
    setBusy(true);
    const result = await deleteApplications([application.id]);
    setBusy(false);
    setConfirmOpen(false);
    if (!result.ok) {
      toast.error("Could not delete", result.message);
      return;
    }
    toast.success("Application deleted", application.fullName);
    router.push("/admin/applications");
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <div className={styles.bar}>
        <div className={styles.barLeft}>
          <Link className={styles.back} href="/admin/applications">
            <Icon name="back" />
            Applications
          </Link>
          <span className={styles.status} style={{ "--badge-ink": meta.ink } as React.CSSProperties}>
            <StatusDot shape={meta.dot} />
            {meta.label}
          </span>
        </div>
        <div className={styles.barActions}>
          <a className={styles.ghost} href={`${resumeHref}?download=1`}>
            <Icon name="download" />
            Download resume
          </a>
          <button className={styles.ghost} type="button" data-tone="danger" onClick={() => setConfirmOpen(true)} disabled={busy}>
            <Icon name="trash" />
            Delete
          </button>
        </div>
      </div>

      <div className={styles.columns}>
        <div className={styles.main}>
          <header className={styles.candidate}>
            <span className={styles.avatar} aria-hidden="true">
              {initials(application.fullName)}
            </span>
            <div className={styles.candidateText}>
              <span className={styles.eyebrow}>{application.vacancyId ? "Applied for" : "Open application"}</span>
              <h1 className={styles.name}>{application.fullName}</h1>
              <div className={styles.contacts}>
                <a className={styles.contactChip} href={`mailto:${application.email}`}>
                  <Icon name="mail" />
                  {application.email}
                </a>
                <a className={styles.contactChip} href={`tel:${phoneDigits}`}>
                  <Icon name="phone" />
                  {application.phone}
                </a>
                {phoneDigits && (
                  <a className={styles.contactChip} href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer">
                    <Icon name="whatsapp" />
                    WhatsApp
                  </a>
                )}
                <span className={styles.contactChip} data-static="">
                  <Icon name="pin" />
                  {application.city}
                </span>
              </div>
            </div>
          </header>

          <section className={styles.panel}>
            <span className={styles.panelTitle}>{application.vacancyId ? "Position" : "Talent pool"}</span>
            {application.vacancyId ? (
              <div className={styles.position}>
                <div>
                  <span className={styles.positionTitle}>{application.vacancyTitle ?? "Untitled position"}</span>
                  <span className={styles.positionSub}>
                    {application.departmentLabel ?? "No department"}
                    {!application.vacancyLive && " · this vacancy was removed"}
                  </span>
                </div>
                {application.vacancyLive && (
                  <Link className={styles.positionLink} href={`/admin/vacancies/${application.vacancyId}`}>
                    Open vacancy
                    <Icon name="external" />
                  </Link>
                )}
              </div>
            ) : (
              <p className={styles.positionNote}>
                Sent as an open application, not tied to a specific vacancy.
                {application.departmentLabel && ` Interested in ${application.departmentLabel}.`}
              </p>
            )}
          </section>

          <section className={styles.panel}>
            <span className={styles.panelTitle}>Profile</span>
            <dl className={styles.stats}>
              <div className={styles.stat}>
                <dt>Experience</dt>
                <dd>{optionLabel(EXPERIENCE_OPTIONS, application.experience)}</dd>
              </div>
              <div className={styles.stat}>
                <dt>English</dt>
                <dd>{optionLabel(ENGLISH_OPTIONS, application.english)}</dd>
              </div>
              <div className={styles.stat}>
                <dt>Availability</dt>
                <dd>{optionLabel(AVAILABILITY_OPTIONS, application.availability)}</dd>
              </div>
            </dl>
          </section>

          {application.message && (
            <section className={styles.panel}>
              <span className={styles.panelTitle}>Message from the candidate</span>
              <p className={styles.message}>{application.message}</p>
            </section>
          )}

          <section className={styles.panel}>
            <div className={styles.resumeHead}>
              <div className={styles.resumeInfo}>
                <span className={styles.panelTitle}>Resume</span>
                <span className={styles.resumeName}>{application.resumeName}</span>
                <span className={styles.resumeMeta}>{formatBytes(application.resumeSize)}</span>
              </div>
              <div className={styles.resumeActions}>
                <a className={styles.ghost} href={resumeHref} target="_blank" rel="noopener noreferrer">
                  <Icon name="external" />
                  Open
                </a>
                <a className={styles.ghost} href={`${resumeHref}?download=1`}>
                  <Icon name="download" />
                  Download
                </a>
              </div>
            </div>
            {isPdf ? (
              <iframe className={styles.preview} src={resumeHref} title={`Resume of ${application.fullName}`} />
            ) : (
              <p className={styles.resumeNote}>Word documents have no inline preview. Open or download the file to read it.</p>
            )}
          </section>
        </div>

        <aside className={styles.side}>
          <div className={styles.panel}>
            <span className={styles.panelTitle}>Status</span>
            <Select value={status} options={STATUS_OPTIONS} onChange={(next) => void changeStatus(next as ApplicationStatus)} label="Status" width="100%" />
            <p className={styles.help}>Changes save right away and show up in the applications list.</p>
          </div>

          <div className={styles.panel}>
            <span className={styles.panelTitle}>Internal notes</span>
            <textarea
              className={styles.textarea}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={6}
              maxLength={4000}
              placeholder="Call outcome, interview date, anything the team should know."
              aria-label="Internal notes"
            />
            <div className={styles.notesFoot}>
              <span className={styles.help}>Only visible in the panel.</span>
              <button className={styles.primary} type="button" onClick={() => void saveNotes()} disabled={!dirty || busy}>
                Save notes
              </button>
            </div>
          </div>

          <div className={styles.panel}>
            <span className={styles.panelTitle}>Timeline</span>
            <dl className={styles.timeline}>
              <div>
                <dt>Received</dt>
                <dd>{stamp.format(new Date(application.createdAt))}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{stamp.format(new Date(application.updatedAt))}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} eyebrow="Confirm" title="Delete the application">
        <p className={styles.dialogText}>
          The application from {application.fullName} and its resume are deleted. This cannot be undone.
        </p>
        <div className={styles.dialogFoot}>
          <button className={styles.ghost} type="button" onClick={() => setConfirmOpen(false)}>
            Cancel
          </button>
          <button className={styles.confirm} type="button" onClick={() => void confirmDelete()} disabled={busy}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
