"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Modal from "@/components/admin/Modal";
import Select from "@/components/admin/Select";
import { useToast } from "@/components/admin/Toaster";
import t from "@/components/admin/dataTable.module.css";
import { APPLICATION_STATUSES, APPLICATION_STATUS_META, type ApplicationStatus } from "@/lib/applicationStatus";
import { listApplications, setApplicationStatus, type ApplicationListRow } from "@/server/applications";
import { initials } from "../applications/ApplicationsTable";
import styles from "./VacancyApplicantsModal.module.css";

const STATUS_OPTIONS = APPLICATION_STATUSES.map((value) => ({ value, label: APPLICATION_STATUS_META[value].label }));
const PER_PAGE = 8;

const stamp = new Intl.DateTimeFormat("en-GB", {
  timeZone: "America/Santo_Domingo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatStamp(iso: string): string {
  const parts = stamp.formatToParts(new Date(iso));
  const get = (k: string) => parts.find((p) => p.type === k)?.value ?? "";
  return `${get("day")}/${get("month")}/${get("year")}`;
}

function Icon({ name }: { name: string }) {
  const c = { width: 14, height: 14, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.3 };
  switch (name) {
    case "eye":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M1.4 8s2.6-4.2 6.6-4.2S14.6 8 14.6 8s-2.6 4.2-6.6 4.2S1.4 8 1.4 8Z" strokeLinejoin="round" />
          <circle cx="8" cy="8" r="1.9" />
        </svg>
      );
    case "download":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M8 2.6v7.2M5.2 7l2.8 2.8L10.8 7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 11v2.4h10V11" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "prev":
      return (
        <svg {...c} aria-hidden="true">
          <path d="M9.8 3.6 5.4 8l4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg {...c} aria-hidden="true">
          <path d="M6.2 3.6 10.6 8l-4.4 4.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

type Props = {
  vacancyId: string;
  vacancyTitle: string;
  open: boolean;
  onClose: () => void;
};

/* Vista compacta de las postulaciones de UNA vacante, embebida en un modal:
   evita mandar al admin a /admin/applications (una vista aparte) solo para
   ver quién aplicó. El detalle completo de un candidato sigue siendo su
   propia página — eso no es "la lista de esta vacante", es el perfil. */
export default function VacancyApplicantsModal({ vacancyId, vacancyTitle, open, onClose }: Props) {
  const toast = useToast();
  const router = useRouter();
  const [rows, setRows] = useState<ApplicationListRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [requestedPage, setRequestedPage] = useState(1);

  // Ajuste de estado durante el render (no en un efecto): reabrir el modal
  // con otra vacante resetea la página sin arrastrar la paginación anterior.
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const openKey = open ? vacancyId : null;
  const [prevOpenKey, setPrevOpenKey] = useState(openKey);
  if (openKey !== prevOpenKey) {
    setPrevOpenKey(openKey);
    if (openKey !== null) {
      setRequestedPage(1);
      setLoading(true);
    }
  }

  useEffect(() => {
    if (!open) return;
    let ignore = false;
    listApplications({ scope: vacancyId, page: requestedPage, perPage: PER_PAGE, sortKey: "createdAt", sortDir: "desc" }).then(
      (result) => {
        if (ignore) return;
        setRows(result.rows);
        setTotal(result.total);
        setPage(result.page);
        setLoading(false);
      },
    );
    return () => {
      ignore = true;
    };
  }, [open, vacancyId, requestedPage]);

  const load = useCallback((nextPage: number) => {
    setLoading(true);
    setRequestedPage(nextPage);
  }, []);

  async function changeStatus(id: string, next: ApplicationStatus) {
    const result = await setApplicationStatus([id], next);
    if (!result.ok) {
      toast.error("Could not change the status", result.message);
      return;
    }
    toast.success(`Marked as ${APPLICATION_STATUS_META[next].label}`);
    load(page);
    router.refresh();
  }

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <Modal open={open} onClose={onClose} eyebrow="Applications" title={`Applicants for “${vacancyTitle}”`} width="44rem">
      {loading ? (
        <p className={styles.state}>Loading…</p>
      ) : rows.length === 0 ? (
        <p className={styles.state}>No applications yet for this vacancy.</p>
      ) : (
        <>
          <div className={t.scroller}>
            <table className={t.table}>
              <caption className={t.srOnly}>
                Applicants for {vacancyTitle}, {rows.length} on this page of {total}.
              </caption>
              <thead>
                <tr>
                  <th className={t.th}>Candidate</th>
                  <th className={t.th}>Status</th>
                  <th className={t.th}>Applied</th>
                  <th className={t.th}>
                    <span className={t.srOnly}>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const meta = APPLICATION_STATUS_META[row.status];
                  return (
                    <tr key={row.id} className={t.row}>
                      <td className={`${t.td} ${styles.candidateCell}`}>
                        <span className={t.person}>
                          <span className={t.avatar} aria-hidden="true">
                            {initials(row.fullName)}
                          </span>
                          <span className={styles.identity}>
                            <Link className={styles.candidateName} href={`/admin/applications/${row.id}`}>
                              {row.fullName}
                            </Link>
                            <span className={styles.contact}>
                              {row.email} · {row.city}
                            </span>
                          </span>
                        </span>
                      </td>

                      <td className={t.td}>
                        <span style={{ "--badge-ink": meta.ink } as React.CSSProperties}>
                          <Select
                            value={row.status}
                            options={STATUS_OPTIONS}
                            onChange={(next) => void changeStatus(row.id, next as ApplicationStatus)}
                            label={`Status for ${row.fullName}`}
                            width="9rem"
                          />
                        </span>
                      </td>

                      <td className={`${t.td} ${t.nowrap}`}>{formatStamp(row.createdAt)}</td>

                      <td className={`${t.td} ${t.actionsCell}`}>
                        <span className={t.actions}>
                          <Link
                            className={t.action}
                            href={`/admin/applications/${row.id}`}
                            title="View application"
                            aria-label={`View ${row.fullName}`}
                          >
                            <Icon name="eye" />
                          </Link>
                          <a
                            className={t.action}
                            href={`/api/admin/applications/${row.id}/resume?download=1`}
                            title={`Download ${row.resumeName}`}
                            aria-label={`Download resume of ${row.fullName}`}
                          >
                            <Icon name="download" />
                          </a>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.footer}>
              <span className={styles.pageInfo}>
                Page {page} of {totalPages}
              </span>
              <span className={styles.pager}>
                <button
                  className={t.pageButton}
                  type="button"
                  onClick={() => load(page - 1)}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <Icon name="prev" />
                </button>
                <button
                  className={t.pageButton}
                  type="button"
                  onClick={() => load(page + 1)}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <Icon name="next" />
                </button>
              </span>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
