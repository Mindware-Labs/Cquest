import type { ServiceIconName } from "@/components/services/data";

/* Entry level vs. professional. La separación viene de Horatio y es la decisión
   de contenido que más importa en una página de empleos de call center: los
   puestos de agente son alto volumen y se buscan de otra forma que un puesto
   profesional, así que enterrarlos en una lista alfabética los esconde. */
export type Track = "entry" | "professional";

export type WorkMode = "onsite" | "hybrid" | "remote";

export type EmploymentType = "full-time" | "part-time";

export type Position = {
  slug: string;
  /* Id de departamento en src/app/(site)/team/data.ts. Un solo vocabulario de
     áreas para toda la casa: si RRHH abre una vacante, ya sabe a qué área va. */
  department: string;
  track: Track;
  icon: ServiceIconName;
  title: string;
  summary: string;
  location: string;
  mode: WorkMode;
  employmentType: EmploymentType;
  schedule: string;
  /* ISO 8601. Sale tal cual en el JSON-LD JobPosting (datePosted). */
  postedAt: string;
  active: boolean;
  responsibilities: readonly string[];
  requirements: readonly string[];
  niceToHave: readonly string[];
};

/* El nivel es un FILTRO y una etiqueta de tarjeta, no un encabezado que parta
   el listado en dos bloques. Por eso las dos etiquetas nombran el requisito
   ("sin experiencia" / "con experiencia"), que es lo que el candidato compara
   contra sí mismo, y no una categoría interna de reclutamiento. */
export const TRACK_LABEL: Record<Track, string> = {
  entry: "No experience needed",
  professional: "Experience required",
};

export const MODE_LABEL: Record<WorkMode, string> = {
  onsite: "On site",
  hybrid: "Hybrid",
  remote: "Remote",
};

export const EMPLOYMENT_LABEL: Record<EmploymentType, string> = {
  "full-time": "Full time",
  "part-time": "Part time",
};

/* schema.org employmentType — vocabulario cerrado de Google for Jobs, distinto
   del que se muestra en pantalla. */
export const SCHEMA_EMPLOYMENT: Record<EmploymentType, string> = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
};

export type Facet = {
  value: string;
  label: string;
  count: number;
};

export function resolvePosition(
  positions: readonly Position[],
  slug: string | undefined,
): Position | undefined {
  if (!slug) return undefined;
  return positions.find((position) => position.slug === slug && position.active);
}
