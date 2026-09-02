"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/admin/Toaster";
import { assignToVacancy, type TalentPoolCandidate } from "@/server/applications";
import { AVAILABILITY_OPTIONS, ENGLISH_OPTIONS, EXPERIENCE_OPTIONS, optionLabel } from "@/app/(site)/join-us/apply/data";
import styles from "./TalentPoolReview.module.css";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}

const stamp = new Intl.DateTimeFormat("en-GB", {
  timeZone: "America/Santo_Domingo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

type Vacancy = { id: string; title: string; departmentId: string | null; departmentLabel: string | null };

/* Cola de revisión, no una tabla de gestión: guardar mueve al candidato del
   banco a esta vacante (assignToVacancy); descartar solo lo saca de ESTA
   sesión de revisión — no hay "estado descartado" en el esquema, así que
   sigue apareciendo si se vuelve a abrir el banco más adelante. */
export default function TalentPoolReview({ vacancy, candidates }: { vacancy: Vacancy; candidates: TalentPoolCandidate[] }) {
  const toast = useToast();
  const router = useRouter();
  const [queue, setQueue] = useState(() =>
    [...candidates].sort((a, b) => {
      const aMatch = vacancy.departmentId && a.departmentId === vacancy.departmentId ? 1 : 0;
      const bMatch = vacancy.departmentId && b.departmentId === vacancy.departmentId ? 1 : 0;
      return bMatch - aMatch;
    }),
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  function discard(id: string) {
    setQueue((prev) => prev.filter((c) => c.id !== id));
  }

  async function save(id: string) {
    setBusyId(id);
    const result = await assignToVacancy(id, vacancy.id);
    setBusyId(null);
    if (!result.ok) {
      toast.error("Could not save", result.message);
      return;
    }
    toast.success("Added to this vacancy");
    setQueue((prev) => prev.filter((c) => c.id !== id));
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <Link className={styles.back} href={`/admin/vacancies/${vacancy.id}`}>
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
          <path d="M9.8 3.6 5.4 8l4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to vacancy
      </Link>

      <div className={styles.head}>
        <span className={styles.eyebrow}>Talent pool</span>
        <h1 className={styles.title}>Candidates for “{vacancy.title}”</h1>
        <p className={styles.lead}>
          Open applications — not tied to any vacancy — that could fit this role. Save the ones worth considering; they
          move into this vacancy’s applicants. Discard just skips them for this review.
        </p>
      </div>

      {queue.length === 0 ? (
        <p className={styles.empty}>
          {candidates.length === 0 ? "The talent pool is empty right now." : "You’ve been through everyone in the pool."}
        </p>
      ) : (
        <ul className={styles.list}>
          {queue.map((candidate) => {
            const matches = Boolean(vacancy.departmentId && candidate.departmentId === vacancy.departmentId);
            const busy = busyId === candidate.id;
            return (
              <li key={candidate.id} className={styles.card}>
                <div className={styles.cardMain}>
                  <span className={styles.avatar} aria-hidden="true">
                    {initials(candidate.fullName)}
                  </span>
                  <div className={styles.identity}>
                    <span className={styles.nameRow}>
                      <span className={styles.name}>{candidate.fullName}</span>
                      {matches && <span className={styles.matchBadge}>Interested in {vacancy.departmentLabel}</span>}
                    </span>
                    <span className={styles.contact}>
                      {candidate.email} · {candidate.phone} · {candidate.city}
                    </span>
                    <span className={styles.tags}>
                      <span className={styles.tag}>{optionLabel(EXPERIENCE_OPTIONS, candidate.experience)}</span>
                      <span className={styles.tag}>{optionLabel(ENGLISH_OPTIONS, candidate.english)} English</span>
                      <span className={styles.tag}>{optionLabel(AVAILABILITY_OPTIONS, candidate.availability)}</span>
                      {candidate.departmentLabel && !matches && <span className={styles.tag}>Interested in {candidate.departmentLabel}</span>}
                    </span>
                    {candidate.message && <p className={styles.message}>{candidate.message}</p>}
                    <span className={styles.meta}>Applied {stamp.format(new Date(candidate.createdAt))}</span>
                  </div>
                </div>

                <div className={styles.actions}>
                  <a
                    className={styles.ghost}
                    href={`/api/admin/applications/${candidate.id}/resume`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View resume
                  </a>
                  <span className={styles.decision}>
                    <button className={styles.discard} type="button" onClick={() => discard(candidate.id)} disabled={busy}>
                      Discard
                    </button>
                    <button className={styles.save} type="button" onClick={() => void save(candidate.id)} disabled={busy}>
                      {busy ? "Saving…" : "Save for this vacancy"}
                    </button>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
