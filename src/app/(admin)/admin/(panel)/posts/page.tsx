import type { Metadata } from "next";
import PostsTable, { type PostRow } from "./PostsTable";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Artículos · Panel Center Quest",
  robots: { index: false, follow: false },
};

/* Datos de muestra: la tabla `post` llega en la fase de base de datos del plan.
   Sirven para fijar la disposición; el componente ya recibe la forma final. */
const SAMPLE: PostRow[] = [
  {
    id: "1",
    title: "Cómo medimos el nivel de servicio en una operación de cobranzas",
    slug: "nivel-de-servicio-cobranzas",
    cover: null,
    category: "Call Center",
    locale: "es",
    status: "published",
    scheduledFor: null,
    editedAt: "2026-08-24T14:32:00-04:00",
    author: "Sebastián Herrera",
  },
  {
    id: "2",
    title: "Qué mirar antes de tercerizar tu back office",
    slug: "antes-de-tercerizar-back-office",
    cover: null,
    category: "Operaciones",
    locale: "es",
    status: "draft",
    scheduledFor: null,
    editedAt: "2026-08-25T09:05:00-04:00",
    author: "Sebastián Herrera",
  },
  {
    id: "3",
    title: "What to check before outsourcing your back office",
    slug: "before-outsourcing-back-office",
    cover: null,
    category: "Operaciones",
    locale: "en",
    status: "draft",
    scheduledFor: null,
    editedAt: "2026-08-25T09:12:00-04:00",
    author: null,
  },
  {
    id: "4",
    title: "Tres señales de que tu CRM está frenando al equipo",
    slug: "senales-crm-frenando-equipo",
    cover: null,
    category: "Sistemas",
    locale: "es",
    status: "scheduled",
    scheduledFor: "2026-09-02T08:00:00-04:00",
    editedAt: "2026-08-22T17:48:00-04:00",
    author: "Sebastián Herrera",
  },
  {
    id: "5",
    title: "Turnos nocturnos: cómo sostener la calidad a las 3 de la mañana",
    slug: "turnos-nocturnos-calidad",
    cover: null,
    category: "Call Center",
    locale: "es",
    status: "hidden",
    scheduledFor: null,
    editedAt: "2026-07-30T11:20:00-04:00",
    author: "Sebastián Herrera",
  },
];

export default function PostsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <span className={styles.eyebrow}>Artículos</span>
          <h1 className={styles.title}>Artículos del blog</h1>
        </div>
        <button className={styles.primary} type="button">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
            <path d="M8 3.4v9.2M3.4 8h9.2" strokeLinecap="round" />
          </svg>
          Nuevo artículo
        </button>
      </div>

      <p className={styles.lead}>
        Cada artículo se escribe en un idioma y la versión del otro se genera con IA para que la
        revises antes de publicarla.
      </p>

      <p className={styles.notice}>
        Los artículos de abajo son de muestra: la tabla ya está construida, pero la base de datos
        del blog llega en la siguiente fase.
      </p>

      <PostsTable rows={SAMPLE} />
    </div>
  );
}
