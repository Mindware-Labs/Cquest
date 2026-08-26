import {
  C,
  emailShell,
  escapeHtml,
  rowsTable,
  sectionLabel,
  type Row,
} from "../../../quote/emails/shared";
import {
  AVAILABILITY_OPTIONS,
  ENGLISH_OPTIONS,
  EXPERIENCE_OPTIONS,
  optionLabel,
} from "../../data/application";
import type { StoredApplication } from "../store";

/* El correo interno se escribe siempre en español: lo lee Recursos Humanos, no
   el candidato. Misma decisión que EMAIL_LANG en /quote. */
const LANG = "es" as const;

const ACCENT = C.celeste;

export function buildHrEmail(record: StoredApplication): {
  subject: string;
  html: string;
  text: string;
} {
  const candidate: Row[] = [
    { label: "Nombre", value: record.fullName || "—" },
    { label: "Correo", value: record.email || "—" },
    { label: "Teléfono", value: record.phone || "—" },
    { label: "Ciudad", value: record.city || "—" },
  ];

  const profile: Row[] = [
    { label: "Experiencia", value: optionLabel(EXPERIENCE_OPTIONS, record.experience, LANG) },
    { label: "Nivel de inglés", value: optionLabel(ENGLISH_OPTIONS, record.english, LANG) },
    { label: "Disponibilidad", value: optionLabel(AVAILABILITY_OPTIONS, record.availability, LANG) },
    { label: "CV adjunto", value: record.cvFileName || "—" },
  ];

  const target = record.positionTitle;

  const messageBlock = record.message
    ? `
        <tr>
          <td style="padding:6px 32px 8px;">
            ${sectionLabel("Mensaje del candidato", ACCENT)}
            <div style="margin-top:10px;padding:14px 16px;background:${C.panel};border-left:3px solid ${ACCENT};font-size:13px;color:${C.body};line-height:1.6;white-space:pre-wrap;">${escapeHtml(record.message)}</div>
          </td>
        </tr>`
    : "";

  const body = `
        <tr>
          <td style="padding:28px 32px 6px;">
            ${sectionLabel("Nueva postulación", ACCENT)}
            <div style="margin-top:10px;font-size:23px;font-weight:700;color:${C.strong};line-height:1.2;letter-spacing:-0.01em;">${escapeHtml(target)}</div>
            <div style="margin-top:5px;font-size:14px;color:${C.muted};">${escapeHtml(record.fullName || "—")}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px 6px;">
            ${sectionLabel("Candidato", ACCENT)}
            ${rowsTable(candidate)}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 8px;">
            ${sectionLabel("Perfil", ACCENT)}
            ${rowsTable(profile)}
          </td>
        </tr>
        ${messageBlock}
        <tr>
          <td style="padding:10px 32px 28px;">
            <div style="padding:14px 16px;background:${C.panel};border-left:3px solid ${ACCENT};font-size:13px;color:${C.body};line-height:1.55;">Responde este correo para contactar directamente a <strong style="color:${C.strong};">${escapeHtml(record.fullName || "el candidato")}</strong>. El CV va adjunto a este mensaje.</div>
          </td>
        </tr>`;

  const line = (rows: Row[]) => rows.map((row) => `  ${row.label}: ${row.value}`).join("\n");
  const text = [
    `NUEVA POSTULACIÓN — ${target}`,
    record.fullName,
    "",
    "CANDIDATO",
    line(candidate),
    "",
    "PERFIL",
    line(profile),
    record.message ? `\nMENSAJE\n  ${record.message}` : "",
  ]
    .filter((part) => part !== "")
    .join("\n");

  return {
    subject: `Nueva postulación — ${target} · ${record.fullName || "candidato"}`,
    html: emailShell({
      preheader: `Nueva postulación — ${target}${record.fullName ? ` de ${record.fullName}` : ""}`,
      accent: ACCENT,
      body,
    }),
    text,
  };
}
