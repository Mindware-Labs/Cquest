"use client";

import { useState } from "react";
import InfoHint from "@/components/admin/InfoHint";
import type { DepartmentRow } from "@/server/departments";
import NewVacancyModal from "./NewVacancyModal";
import styles from "./page.module.css";

/* Crear abre un asistente por pasos (ver NewVacancyModal), a diferencia de
   /admin/posts que va directo al editor de página completa: una vacante tiene
   más campos de clasificación (departamento, modalidad, tipo de empleo) que
   conviene juntar en pasos cortos antes de llegar al editor completo. */
export default function VacanciesHeader({ departments }: { departments: DepartmentRow[] }) {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className={styles.head}>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>Vacancies</h1>
        <InfoHint label="How publishing works">
          A draft saves with nothing filled in. Publishing needs a summary, a department, a
          work mode, an employment type, a location, and at least one responsibility and one
          requirement. The URL is set when you publish and never changes after that. Set a
          future date to schedule it — it stays hidden until then and shows as “Scheduled”.
        </InfoHint>
      </div>

      <button className={styles.primary} type="button" onClick={() => setWizardOpen(true)}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
          <path d="M8 3.4v9.2M3.4 8h9.2" strokeLinecap="round" />
        </svg>
        New vacancy
      </button>

      <NewVacancyModal open={wizardOpen} onClose={() => setWizardOpen(false)} departments={departments} />
    </div>
  );
}
