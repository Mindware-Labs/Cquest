import {
  C,
  emailShell,
  escapeHtml,
  rowsTable,
  sectionLabel,
  type Row,
} from "@/lib/emails/shell";
import {
  AVAILABILITY_OPTIONS,
  ENGLISH_OPTIONS,
  EXPERIENCE_OPTIONS,
  optionLabel,
} from "../../data/application";
import type { StoredApplication } from "../store";

const ACCENT = C.celeste;

export function buildHrEmail(record: StoredApplication): {
  subject: string;
  html: string;
  text: string;
} {
  const candidate: Row[] = [
    { label: "Name", value: record.fullName || "—" },
    { label: "Email", value: record.email || "—" },
    { label: "Phone", value: record.phone || "—" },
    { label: "City", value: record.city || "—" },
  ];

  const profile: Row[] = [
    { label: "Experience", value: optionLabel(EXPERIENCE_OPTIONS, record.experience) },
    { label: "English level", value: optionLabel(ENGLISH_OPTIONS, record.english) },
    { label: "Availability", value: optionLabel(AVAILABILITY_OPTIONS, record.availability) },
    { label: "CV attached", value: record.cvFileName || "—" },
  ];

  const target = record.positionTitle;

  const messageBlock = record.message
    ? `
        <tr>
          <td style="padding:6px 32px 8px;">
            ${sectionLabel("Message from the candidate", ACCENT)}
            <div style="margin-top:10px;padding:14px 16px;background:${C.panel};border-left:3px solid ${ACCENT};font-size:13px;color:${C.body};line-height:1.6;white-space:pre-wrap;">${escapeHtml(record.message)}</div>
          </td>
        </tr>`
    : "";

  const body = `
        <tr>
          <td style="padding:28px 32px 6px;">
            ${sectionLabel("New application", ACCENT)}
            <div style="margin-top:10px;font-size:23px;font-weight:700;color:${C.strong};line-height:1.2;letter-spacing:-0.01em;">${escapeHtml(target)}</div>
            <div style="margin-top:5px;font-size:14px;color:${C.muted};">${escapeHtml(record.fullName || "—")}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 32px 6px;">
            ${sectionLabel("Candidate", ACCENT)}
            ${rowsTable(candidate)}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 8px;">
            ${sectionLabel("Profile", ACCENT)}
            ${rowsTable(profile)}
          </td>
        </tr>
        ${messageBlock}
        <tr>
          <td style="padding:10px 32px 28px;">
            <div style="padding:14px 16px;background:${C.panel};border-left:3px solid ${ACCENT};font-size:13px;color:${C.body};line-height:1.55;">Reply to this email to contact <strong style="color:${C.strong};">${escapeHtml(record.fullName || "the candidate")}</strong> directly. The CV is attached to this message.</div>
          </td>
        </tr>`;

  const line = (rows: Row[]) => rows.map((row) => `  ${row.label}: ${row.value}`).join("\n");
  const text = [
    `NEW APPLICATION — ${target}`,
    record.fullName,
    "",
    "CANDIDATE",
    line(candidate),
    "",
    "PROFILE",
    line(profile),
    record.message ? `\nMESSAGE\n  ${record.message}` : "",
  ]
    .filter((part) => part !== "")
    .join("\n");

  return {
    subject: `New application — ${target} · ${record.fullName || "candidate"}`,
    html: emailShell({
      preheader: `New application — ${target}${record.fullName ? ` from ${record.fullName}` : ""}`,
      accent: ACCENT,
      body,
    }),
    text,
  };
}
